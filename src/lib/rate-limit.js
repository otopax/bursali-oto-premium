import { redis } from '@/lib/redis';

const RATE_LIMIT_WINDOW = 60; // 60 saniye
const MAX_REQUESTS = 50; // IP başına max istek

export async function rateLimit(namespace, identifier, limit = MAX_REQUESTS, windowSec = RATE_LIMIT_WINDOW) {
  // FAIL-CLOSED: Redis yoksa veya bağlanamıyorsa direkt hata fırlat (Memory fallback iptal)
  if (!redis || redis.isMemory) {
    throw new Error('REDIS_UNAVAILABLE: Rate limiting disabled, blocking request.');
  }

  const key = `rl:${namespace}:${identifier}`;
  
  try {
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, windowSec);
    }

    if (current > limit) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }

    return { remaining: limit - current, limit: limit };
  } catch (error) {
    if (error.message === 'RATE_LIMIT_EXCEEDED') throw error;
    // Bağlantı kopması vs. durumlarda da fail-closed
    console.error('[Rate Limit] Redis error, fail-closed triggered:', error.message);
    throw new Error('REDIS_UNAVAILABLE: Rate limiting failed, blocking request.');
  }
}
