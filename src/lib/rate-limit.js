import { redis } from '@/lib/redis';

// Lokal bellek (In-Memory) fallback rate limiter
const localStore = new Map();

/**
 * Basic Token Bucket Rate Limiter using Redis
 * @param {string} namespace - 'ai', 'seo', vb.
 * @param {string} identifier - The IP address or user ID
 * @param {number} limit - Max requests
 * @param {number} windowSec - Time window in seconds
 * @param {Object} opts
 * @param {boolean} [opts.failClosed=false] - Redis düştüğünde istekleri REDDET (AI/pahalı endpoint için).
 *   Varsayılan false (fail-open) — kullanıcı deneyimi kritik olan public endpoint'ler için.
 *   AI endpoint'lerinde true kullan → bot saldırısında Gemini kotasının patlamasını engeller.
 * @returns {Promise<{success: boolean, limit: number, remaining: number, degraded?: boolean}>}
 */
export async function rateLimit(namespace, identifier, limit = 60, windowSec = 60, opts = {}) {
  const { failClosed = false } = opts;
  const key = `rl:${namespace}:${identifier}`;

  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowSec);
    }

    // TTL is not always implemented in memory adapter, so we use windowSec
    const ttl = redis.isMemory ? windowSec : await redis.adapter.client.ttl?.(key).catch(() => windowSec) || windowSec;

    return {
      success: current <= limit,
      limit,
      remaining: Math.max(0, limit - current),
      resetIn: ttl
    };
  } catch (error) {
    console.error('[Rate Limit] Redis hatası:', error.message);
    
    if (failClosed) {
      // In-Memory Fallback for AI/Expensive endpoints
      const now = Date.now();
      const item = localStore.get(key) || { count: 0, expiry: now + windowSec * 1000 };
      
      if (now > item.expiry) {
        item.count = 0;
        item.expiry = now + windowSec * 1000;
      }
      
      item.count += 1;
      localStore.set(key, item);
      
      return { 
        success: item.count <= limit, 
        limit, 
        remaining: Math.max(0, limit - item.count), 
        resetIn: Math.ceil((item.expiry - now) / 1000), 
        degraded: true 
      };
    }
    
    // Public endpoint — Redis yoksa AÇ (kullanıcıyı engelleme)
    return { success: true, limit, remaining: limit, resetIn: windowSec, degraded: true };
  }
}

