import Redis from 'ioredis';

let redisClient = null;
let bullRedisClient = null;

export function getRedisClient() {
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.BUILDING === 'true' || process.env.IS_BUILD === 'true';
  if (isBuildPhase) return null;

  if (!redisClient) {
    const url = process.env.REDIS_URL;
    if (!url || url.includes('localhost') || url.includes('127.0.0.1')) {
      console.warn('[Redis] No valid remote REDIS_URL found. Running in mock mode.');
      return null;
    }
    try {
      redisClient = new Redis(url, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        lazyConnect: true,
        retryStrategy: (times) => Math.min(times * 50, 2000),
      });
      redisClient.on('error', (err) => console.error('[Redis Client Error]', err.message));
    } catch (e) {
      console.warn('[Redis] Connection failed, falling back:', e.message);
      return null;
    }
  }
  return redisClient;
}

export function getBullRedisClient() {
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.BUILDING === 'true' || process.env.IS_BUILD === 'true';
  if (isBuildPhase) return null;

  if (!bullRedisClient) {
    const url = process.env.REDIS_URL;
    if (!url || url.includes('localhost') || url.includes('127.0.0.1')) return null;
    try {
      bullRedisClient = new Redis(url, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
      });
    } catch (e) {
      return null;
    }
  }
  return bullRedisClient;
}
