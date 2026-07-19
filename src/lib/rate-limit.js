import { redis } from '@/lib/cache';

/**
 * Basic Token Bucket Rate Limiter using Redis
 * @param {string} ip - The IP address of the client
 * @param {number} limit - Max requests
 * @param {number} windowSec - Time window in seconds
 * @param {Object} opts
 * @param {boolean} [opts.failClosed=false] - Redis düştüğünde istekleri REDDET (AI/pahalı endpoint için).
 *   Varsayılan false (fail-open) — kullanıcı deneyimi kritik olan public endpoint'ler için.
 *   AI endpoint'lerinde true kullan → bot saldırısında Gemini kotasının patlamasını engeller.
 * @returns {Promise<{success: boolean, limit: number, remaining: number, degraded?: boolean}>}
 */
export async function rateLimit(ip, limit = 60, windowSec = 60, opts = {}) {
  const { failClosed = false } = opts;
  const key = `rate-limit:${ip}`;

  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowSec);
    }

    const ttl = await redis.ttl(key);

    return {
      success: current <= limit,
      limit,
      remaining: Math.max(0, limit - current),
      resetIn: ttl
    };
  } catch (error) {
    console.error('[Rate Limit] Redis hatası:', error.message);
    if (failClosed) {
      // Pahalı endpoint (AI) — Redis yoksa REDDET
      return { success: false, limit, remaining: 0, resetIn: windowSec, degraded: true };
    }
    // Public endpoint — Redis yoksa AÇ (kullanıcıyı engelleme)
    return { success: true, limit, remaining: limit, resetIn: windowSec, degraded: true };
  }
}
