import Redis from 'ioredis';

let redis = null;

if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true
    });
  } catch (e) {}
}

const memoryRateLimit = new Map();

/**
 * Rate Limiter and Anti-bot protection using Redis sliding window with memory fallback
 * @param {string} identifier - Unique client ID (IP address or API key)
 * @param {number} [limit=60] - Max requests allowed per window
 * @param {number} [windowSeconds=60] - Window size in seconds
 * @returns {Promise<{ success: boolean, remaining: number, resetSeconds: number }>}
 */
export async function checkRateLimit(identifier, limit = 60, windowSeconds = 60) {
  const key = `ratelimit:${identifier}`;
  const now = Math.floor(Date.now() / 1000);

  // 1. Try Redis Sliding Window Rate Limit
  if (redis && redis.status === 'ready') {
    try {
      const tx = redis.multi();
      tx.incr(key);
      tx.ttl(key);
      const results = await tx.exec();

      const count = results[0][1];
      const ttl = results[1][1];

      if (count === 1 || ttl === -1) {
        await redis.expire(key, windowSeconds);
      }

      const remaining = Math.max(0, limit - count);
      const success = count <= limit;

      return {
        success,
        remaining,
        resetSeconds: ttl > 0 ? ttl : windowSeconds
      };
    } catch (e) {
      console.warn('Redis rate limit error, falling back to memory:', e.message);
    }
  }

  // 2. Memory Fallback Rate Limiter
  let record = memoryRateLimit.get(key);
  if (!record || now > record.resetAt) {
    record = {
      count: 1,
      resetAt: now + windowSeconds
    };
  } else {
    record.count++;
  }

  memoryRateLimit.set(key, record);

  const remaining = Math.max(0, limit - record.count);
  const success = record.count <= limit;

  return {
    success,
    remaining,
    resetSeconds: Math.max(0, record.resetAt - now)
  };
}
