import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: 1,
  connectTimeout: 2000,
});

/**
 * Basic Token Bucket Rate Limiter using Redis
 * @param {string} ip - The IP address of the client
 * @param {number} limit - Max requests
 * @param {number} windowSec - Time window in seconds
 * @returns {Promise<{success: boolean, limit: number, remaining: number}>}
 */
export async function rateLimit(ip, limit = 60, windowSec = 60) {
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
    // Fail open if Redis is down
    console.error('Rate Limit Error:', error);
    return { success: true, limit, remaining: limit, resetIn: windowSec };
  }
}
