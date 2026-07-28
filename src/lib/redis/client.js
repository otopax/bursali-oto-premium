// src/lib/redis/client.js
import Redis from 'ioredis';

let redisClient = null;
let bullRedisClient = null;

export function getRedisClient() {
  if (!redisClient) {
    const url = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
    if (!url) {
      console.warn('[Redis] No REDIS_URL found. Running in mock mode.');
      return null;
    }
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
    redisClient.on('error', (err) => console.error('[Redis Client Error]', err.message));
  }
  return redisClient;
}

// BullMQ özel bağlantısı (QueueFactory ve EventConsumer bunu kullanacak)
export function getBullRedisClient() {
  if (!bullRedisClient) {
    const url = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
    if (!url) return null;
    bullRedisClient = new Redis(url, {
      maxRetriesPerRequest: null, // BullMQ için özel
      enableReadyCheck: false,
      lazyConnect: true,
    });
  }
  return bullRedisClient;
}
