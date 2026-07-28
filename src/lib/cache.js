import { Redis } from '@upstash/redis';

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || 'https://mock-upstash-url.upstash.io';
const isMock = REDIS_URL.includes('mock') || process.env.NEXT_PHASE === 'phase-production-build';

export const redis = new Redis({
  url: REDIS_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'mock-token',
});

export const CACHE_TTL = {
  VIN: 30 * 24 * 60 * 60, // 30 Gün
  OBD: 7 * 24 * 60 * 60, // 7 Gün
  PAGE: 24 * 60 * 60, // 1 Gün
  FAQ: 7 * 24 * 60 * 60, // 7 Gün
};

/**
 * Cache'den veri getirir
 * @param {string} namespace - 'vin', 'obd', 'page' vb.
 * @param {string} identifier - Benzersiz değer (vin numarası, slug vb.)
 */
export async function getCache(namespace, identifier) {
  if (isMock) return null;
  try {
    const key = `cache:${namespace}:${identifier}`;
    const result = await redis.get(key);
    if (result) {
      console.log(`[Cache HIT] ${key}`);
    } else {
      console.log(`[Cache MISS] ${key}`);
    }
    return result;
  } catch (error) {
    console.warn(`[Cache ERROR] Redis GET Error for ${namespace}:${identifier} - Failing Open`, error.message);
    return null; // Return null so application continues without cache
  }
}

/**
 * Cache'e veri yazar
 * @param {string} namespace - 'vin', 'obd', 'page' vb.
 * @param {string} identifier - Benzersiz değer
 * @param {any} value - Saklanacak veri
 * @param {number} ttlSeconds - Yaşam süresi (CAHCE_TTL sabiti kullanın)
 */
export async function setCache(namespace, identifier, value, ttlSeconds = 3600) {
  if (isMock) return;
  try {
    const key = `cache:${namespace}:${identifier}`;
    return await redis.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    console.warn(`[Cache] Redis SET Error for ${namespace}:${identifier} - Ignoring`, error.message);
    return null;
  }
}

