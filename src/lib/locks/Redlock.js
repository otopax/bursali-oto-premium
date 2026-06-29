// 🚀 V5.0 FEATURE 2: Redis Distributed Lock (Redlock) - Lider seçimi.
const redisClient = require('../redis/client');
const crypto = require('crypto');

class Redlock {
  constructor() {
    this.lockKeyPrefix = 'lock:';
    this.defaultTTL = 30000; // 30 saniye
  }

  async acquireLock(resource, ttl = this.defaultTTL) {
    const key = this.lockKeyPrefix + resource;
    const token = crypto.randomUUID();
    // SET NX PX => Sadece yoksa ekle, milisaniye cinsinden expire
    const result = await redisClient.set(key, token, 'NX', 'PX', ttl);
    if (result === 'OK') {
      console.log(`[Redlock] 🔒 Liderlik kazanıldı: ${resource} (Token: ${token})`);
      return token;
    }
    console.log(`[Redlock] 🔓 Liderlik başkasında: ${resource}`);
    return null;
  }

  async releaseLock(resource, token) {
    const key = this.lockKeyPrefix + resource;
    // Lua script ile token kontrolü yaparak sil (Atomic)
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await redisClient.eval(script, 1, key, token);
    if (result === 1) {
      console.log(`[Redlock] 🔓 Liderlik bırakıldı: ${resource}`);
      return true;
    }
    return false;
  }

  async withLock(resource, callback, ttl = 30000) {
    const token = await this.acquireLock(resource, ttl);
    if (!token) return null; // Lider değil, sessizce geç

    try {
      const result = await callback();
      return result;
    } finally {
      await this.releaseLock(resource, token);
    }
  }
}

module.exports = new Redlock();
