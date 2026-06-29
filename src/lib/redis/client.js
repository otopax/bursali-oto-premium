// 🚀 V5.0 FIX: Tek bir Redis bağlantısı (Connection Pooling) - Kaynak sızıntısını önler.
const IORedis = require('ioredis');

class RedisClient {
  constructor() {
    if (!RedisClient.instance) {
      RedisClient.instance = new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
        retryStrategy(times) {
          if (times > 10) return null; // 10 denemeden sonra vazgeç
          return Math.min(times * 100, 3000);
        }
      });
      RedisClient.instance.on('error', (err) => {
        console.error('[Redis] ❌ Global Client Error:', err.message);
      });
    }
    return RedisClient.instance;
  }
}

module.exports = new RedisClient();
