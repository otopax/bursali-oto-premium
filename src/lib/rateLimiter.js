const IORedis = require('ioredis');

let redisClient = null;

function getLimiterClient() {
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.BUILDING === 'true';
  if (isBuildPhase) return null;

  if (!redisClient) {
    const url = process.env.REDIS_URL;
    if (!url || url.includes('localhost') || url.includes('127.0.0.1')) {
      return null;
    }
    try {
      redisClient = new IORedis(url, {
        lazyConnect: true,
        enableReadyCheck: false,
        maxRetriesPerRequest: 1
      });
      redisClient.on('error', (err) => console.error('[Redis rateLimiter] bağlantı hatası:', err.message));
      redisClient.defineCommand('atomicRateLimit', {
        numberOfKeys: 1,
        lua: `
          local current = redis.call('incr', KEYS[1])
          if current == 1 then
            redis.call('expire', KEYS[1], tonumber(ARGV[1]))
          end
          if current > tonumber(ARGV[2]) then
            return 0
          end
          return 1
        `
      });
    } catch (e) {
      return null;
    }
  }
  return redisClient;
}

class RateLimiter {
  static async check(ipAddress, endpoint = 'global', limit = 100, windowSeconds = 60) {
    if (!ipAddress) return true;
    const client = getLimiterClient();
    if (!client) return true; // Fail-open during build or when Redis is unavailable

    try {
      const key = `ratelimit:${endpoint}:${ipAddress}`;
      const allowed = await client.atomicRateLimit(key, windowSeconds, limit);
      return allowed === 1;
    } catch (e) {
      return true; // Fail-open on Redis error
    }
  }
}

module.exports = { RateLimiter };
