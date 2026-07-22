// 🚀 V5.0 FIX: Tek bir Redis bağlantısı (Connection Pooling) - Kaynak sızıntısını önler.
const IORedis = require('ioredis');

class RedisClient {
  constructor() {
    this.instance = null;
  }

  getInstance() {
    if (!this.instance && process.env.REDIS_URL) {
      this.instance = new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
        retryStrategy(times) {
          if (times > 10) return null; // 10 denemeden sonra vazgeç
          return Math.min(times * 100, 3000);
        }
      });
      this.instance.on('error', (err) => {
        // Build ortamında (Prerender) ECONNREFUSED hatasını yoksay veya sustur
        if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
           console.error('[Redis] ❌ Global Client Error:', err.message);
        }
      });
    }
    return this.instance;
  }
}

module.exports = new RedisClient();
