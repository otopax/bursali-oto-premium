import { Redis } from '@upstash/redis';

const RATE_LIMIT_WINDOW = 60; // 60 saniye
const MAX_REQUESTS = 50; // IP başına max istek

export async function rateLimit(namespace, identifier, limit = MAX_REQUESTS, windowSec = RATE_LIMIT_WINDOW) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('REDIS_UNAVAILABLE: Rate limiting disabled, failing open.');
    return { remaining: limit - 1, limit };
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
      throw new Error('RATE_LIMIT_EXCEEDED');
    }

    return { remaining: limit - current, limit: limit };
  } catch (error) {
    if (error.message === 'RATE_LIMIT_EXCEEDED') throw error;
    // Bağlantı kopması vs. durumlarda da fail-closed yerine fail-open
    console.error('[Rate Limit] Redis error, fail-open triggered:', error.message);
    return { remaining: limit - 1, limit };
  }
}
