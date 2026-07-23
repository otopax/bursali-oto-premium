import { Redis } from '@upstash/redis';

// Opsiyonel: Redis client (Eğer Upstash tanımlıysa)
// KV olarak da yazılabilir ancak Enterprise için Redis daha uygun
const redis = process.env.UPSTASH_REDIS_REST_URL 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Enterprise AI Cost Guard
 * Model, Organizasyon (Tenant) ve Kullanıcı bazında bütçe kontrolü.
 */
export class CostGuard {
  
  static LIMITS = {
    'gemini-2.5-pro': { maxTokensPerDay: 500000, maxTokensPerMonth: 10000000 },
    'gpt-4o-mini': { maxTokensPerDay: 2000000, maxTokensPerMonth: 50000000 },
    default: { maxTokensPerDay: 100000, maxTokensPerMonth: 2000000 }
  };

  /**
   * İstek atmadan önce limitleri kontrol eder.
   * @param {Object} context { userId, tenantId, modelName, estimatedTokens }
   */
  static async checkAllowance({ userId, tenantId, modelName, estimatedTokens = 1000 }) {
    if (!redis) return true; // Redis yoksa fail-open

    const dateStr = new Date().toISOString().split('T')[0];
    const monthStr = dateStr.substring(0, 7);

    // Anahtarlar
    const keys = {
      userDaily: `cost:user:${userId}:daily:${dateStr}`,
      tenantMonthly: `cost:tenant:${tenantId}:monthly:${monthStr}`,
      modelDaily: `cost:model:${modelName}:daily:${dateStr}`
    };

    const limits = this.LIMITS[modelName] || this.LIMITS.default;

    try {
      // Pipeline ile okuma yap
      const p = redis.pipeline();
      p.get(keys.userDaily);
      p.get(keys.tenantMonthly);
      p.get(keys.modelDaily);
      
      const [userDaily, tenantMonthly, modelDaily] = await p.exec();

      const currentUserTokens = parseInt(userDaily || '0', 10);
      const currentModelTokens = parseInt(modelDaily || '0', 10);

      // Bütçe aşımı kontrolü (Sadece günlük model token'ı örnek olarak kontrol edildi)
      if (currentModelTokens + estimatedTokens > limits.maxTokensPerDay) {
        console.warn(`[CostGuard] Model ${modelName} daily limit exceeded.`);
        return false;
      }

      if (currentUserTokens + estimatedTokens > limits.maxTokensPerDay) {
        console.warn(`[CostGuard] User ${userId} daily limit exceeded.`);
        return false; // Limit aşıldı
      }

      return true; // İzin verildi
    } catch (e) {
      console.error('[CostGuard] Error checking allowance, fail-open', e);
      return true; // Hata anında kesinti olmaması için Fail-Open
    }
  }

  /**
   * İstek başarılı olduktan sonra harcamayı kaydeder.
   */
  static async recordUsage({ userId, tenantId, modelName, promptTokens, completionTokens }) {
    if (!redis) return;

    const totalTokens = promptTokens + completionTokens;
    const dateStr = new Date().toISOString().split('T')[0];
    const monthStr = dateStr.substring(0, 7);

    const keys = {
      userDaily: `cost:user:${userId}:daily:${dateStr}`,
      tenantMonthly: `cost:tenant:${tenantId}:monthly:${monthStr}`,
      modelDaily: `cost:model:${modelName}:daily:${dateStr}`
    };

    try {
      const p = redis.pipeline();
      // Değerleri artır
      p.incrby(keys.userDaily, totalTokens);
      p.incrby(keys.tenantMonthly, totalTokens);
      p.incrby(keys.modelDaily, totalTokens);
      
      // TTL ayarla (Sırasıyla: 24 saat, 31 gün, 24 saat)
      p.expire(keys.userDaily, 86400);
      p.expire(keys.tenantMonthly, 2678400);
      p.expire(keys.modelDaily, 86400);

      await p.exec();
    } catch (e) {
      console.error('[CostGuard] Failed to record usage', e);
    }
  }
}
