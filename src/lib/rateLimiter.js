const IORedis = require('ioredis');
const redisClient = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

// 🚀 V4.0 SECURITY: Redis Lua Token Bucket Rate Limiter
// Atomic operation to prevent IP abuse and DDoS attacks without race conditions.
redisClient.defineCommand('atomicRateLimit', {
  numberOfKeys: 1,
  lua: `
    local current = redis.call('incr', KEYS[1])
    if current == 1 then
      redis.call('expire', KEYS[1], tonumber(ARGV[1]))
    end
    if current > tonumber(ARGV[2]) then
      return 0 -- Rate limit exceeded
    end
    return 1 -- Allowed
  `
});

class RateLimiter {
  /**
   * @param {string} ipAddress - The IP of the requester
   * @param {string} endpoint - The route/endpoint being accessed
   * @param {number} limit - Max requests allowed
   * @param {number} windowSeconds - Time window in seconds
   */
  static async check(ipAddress, endpoint = 'global', limit = 100, windowSeconds = 60) {
    if (!ipAddress) return true; // Fallback if IP is unknown
    const key = `ratelimit:${endpoint}:${ipAddress}`;
    
    // Atomic execution ensures exact limits even under heavy concurrent attacks
    const allowed = await redisClient.atomicRateLimit(key, windowSeconds, limit);
    return allowed === 1;
  }
}

module.exports = { RateLimiter };
