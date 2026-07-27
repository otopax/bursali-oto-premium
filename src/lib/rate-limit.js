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
export async function rateLimit(namespace, identifier, limit = MAX_REQUESTS, windowSec = RATE_LIMIT_WINDOW) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Redis yapılandırılmamış → engelleme yapma (fail-open)
    return { success: true, remaining: limit - 1, limit };
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const key = `rl:${namespace}:${identifier}`;

  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowSec);
    }

    if (current > limit) {
      return { success: false, remaining: 0, limit };
    }

    return { success: true, remaining: limit - current, limit };
  } catch (error) {
    // Bağlantı kopması vb. → fail-OPEN (isteği bloklama)
    console.error('[Rate Limit] Redis error, fail-open:', error.message);
    return { success: true, remaining: limit - 1, limit };
  }
}
