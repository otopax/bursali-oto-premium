import { Redis } from '@upstash/redis';

const RATE_LIMIT_WINDOW = 60; // 60 saniye
const MAX_REQUESTS = 50; // IP başına max istek

/**
 * Edge/route seviyesi rate limit.
 * DÖNÜŞ SÖZLEŞMESİ: her zaman { success, remaining, limit } döner (asla throw etmez).
 * Çağıranlar `if (!limitStatus.success) return 429` kontrolüne güvenir.
 *
 * - Upstash env yoksa VEYA Redis erişilemezse → fail-OPEN ({ success: true }).
 *   (Chat / VIP giriş gibi kritik akışları Redis yok diye kilitlememek için.)
 * - Limit aşılırsa → { success: false }.
 */
export async function rateLimit(namespace, identifier, limits = { burstLimit: 10, burstWindow: 60, sustainedLimit: 60, sustainedWindow: 3600 }) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { success: true, remaining: 1, limit: limits.burstLimit };
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const burstKey = `rl:burst:${namespace}:${identifier}`;
  const sustainedKey = `rl:sustained:${namespace}:${identifier}`;

  try {
    const p = redis.pipeline();
    p.incr(burstKey);
    p.incr(sustainedKey);
    const [burstCount, sustainedCount] = await p.exec();

    const pExpire = redis.pipeline();
    if (burstCount === 1) pExpire.expire(burstKey, limits.burstWindow);
    if (sustainedCount === 1) pExpire.expire(sustainedKey, limits.sustainedWindow);
    if (burstCount === 1 || sustainedCount === 1) await pExpire.exec();

    if (burstCount > limits.burstLimit) {
      return { success: false, reason: 'burst' };
    }
    if (sustainedCount > limits.sustainedLimit) {
      return { success: false, reason: 'sustained' };
    }

    return { success: true, remainingBurst: limits.burstLimit - burstCount };
  } catch (error) {
    console.error('[Rate Limit] Redis error, fail-open:', error.message);
    return { success: true, remaining: 1 };
  }
}
