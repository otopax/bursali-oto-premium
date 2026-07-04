import IORedis from 'ioredis';

// Redis bağlantısı — REDIS_URL env'i kullanılır (prod'da doğru host; C5).
// enableOfflineQueue:false → Redis düştüğünde komut hemen reddedilir, aşağıdaki
// try/catch'e düşüp graceful null döner (istek asılı kalmaz). Cache best-effort
// olduğu için bu güvenlidir — Redis-siz sistem çalışmaya devam eder (R2).
const redis = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: 2,
  enableOfflineQueue: false,
});

// Handle edilmeyen 'error' event'i Node process'ini çökertir — log'a çevir (R2 SPOF).
redis.on('error', (err) => {
  console.error('[Redis cache] bağlantı hatası (degrade → no-cache):', err.message);
});

/**
 * Cache'den veri getirir
 * @param {string} key - Benzersiz önbellek anahtarı
 * @returns {Promise<any>} Önbellekteki veri veya null
 */
export async function getCache(key) {
  try {
    const data = await redis.get(key);
    if (data) {
      console.log(`[REDIS CACHE HIT] Veri bellekten getirildi: ${key}`);
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error(`[REDIS HATA] Cache okunamadı:`, error);
    return null;
  }
}

/**
 * Cache'e veri yazar
 * @param {string} key - Benzersiz önbellek anahtarı
 * @param {any} value - Saklanacak veri
 * @param {number} ttlSeconds - Yaşam süresi (Saniye). Örn: 3600 (1 saat)
 */
export async function setCache(key, value, ttlSeconds = 3600) {
  try {
    const stringValue = JSON.stringify(value);
    await redis.set(key, stringValue, 'EX', ttlSeconds);
    console.log(`[REDIS CACHE SET] Veri belleğe yazıldı: ${key} (TTL: ${ttlSeconds}s)`);
  } catch (error) {
    console.error(`[REDIS HATA] Cache yazılamadı:`, error);
  }
}
