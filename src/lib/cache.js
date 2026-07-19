import { cacheRepository } from './cache/CacheRepository';

/**
 * Cache'den veri getirir
 * @param {string} key - Benzersiz önbellek anahtarı
 * @returns {Promise<any>} Önbellekteki veri veya null
 */
export async function getCache(key) {
  return await cacheRepository.get(key);
}

/**
 * Cache'e veri yazar
 * @param {string} key - Benzersiz önbellek anahtarı
 * @param {any} value - Saklanacak veri
 * @param {number} ttlSeconds - Yaşam süresi (Saniye). Örn: 3600 (1 saat)
 */
export async function setCache(key, value, ttlSeconds = 3600) {
  return await cacheRepository.set(key, value, ttlSeconds);
}
