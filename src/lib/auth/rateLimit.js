import Redis from 'ioredis';

// Singleton Redis Instance for Rate Limiting
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

/**
 * Global IP Rate Limiter using Redis.
 * Implements a simple Fixed Window Counter to prevent DDoS and Brute Force attacks.
 * 
 * @param {string} ip - IP address of the requester
 * @param {number} limit - Maximum allowed requests per window
 * @param {number} windowSec - Time window in seconds (default: 60s)
 * @returns {Promise<{ allowed: boolean, remaining: number }>}
 */
export async function rateLimit(ip, limit = 10, windowSec = 60) {
  const key = `ratelimit:${ip}`;
  
  try {
    const currentRequests = await redis.incr(key);
    
    if (currentRequests === 1) {
      // First request in the window, set expiration
      await redis.expire(key, windowSec);
    }
    
    if (currentRequests > limit) {
      return { allowed: false, remaining: 0 };
    }
    
    return { allowed: true, remaining: limit - currentRequests };
  } catch (error) {
    console.error("Rate Limiter Error:", error);
    // Fail open in case Redis is down (to not break the app for legitimate users)
    return { allowed: true, remaining: 1 };
  }
}
