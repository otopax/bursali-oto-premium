import { redis } from './redis';

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
  const key = `cache:${namespace}:${identifier}`;
  return await redis.get(key);
}

/**
 * Cache'e veri yazar
 * @param {string} namespace - 'vin', 'obd', 'page' vb.
 * @param {string} identifier - Benzersiz değer
 * @param {any} value - Saklanacak veri
 * @param {number} ttlSeconds - Yaşam süresi (CAHCE_TTL sabiti kullanın)
 */
export async function setCache(namespace, identifier, value, ttlSeconds = 3600) {
  const key = `cache:${namespace}:${identifier}`;
  return await redis.set(key, value, { ex: ttlSeconds });
}

export { redis };
