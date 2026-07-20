import { UpstashRedisAdapter } from './upstash';
import { MemoryRedisAdapter } from './memory';

class RedisFactory {
  constructor() {
    this.adapter = null;
    this.init();
  }

  init() {
    try {
      // Check if Upstash is configured properly
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        this.adapter = new UpstashRedisAdapter();
        this.isMemory = false;
      } else {
        console.warn("[RedisFactory] Upstash credentials not found. Falling back to Memory Adapter.");
        this.adapter = new MemoryRedisAdapter();
        this.isMemory = true;
      }
    } catch (error) {
      console.warn("[RedisFactory] Failed to init Upstash, falling back to Memory Adapter.", error.message);
      this.adapter = new MemoryRedisAdapter();
      this.isMemory = true;
    }
  }

  // Common Redis methods exposed
  async get(key) { return this.adapter.get(key); }
  async set(key, value, options) { return this.adapter.set(key, value, options); }
  async del(key) { return this.adapter.del(key); }
  async incr(key) { return this.adapter.incr(key); }
  async expire(key, seconds) { return this.adapter.expire(key, seconds); }
  async ping() { return this.adapter.ping(); }
}

// Export a singleton instance of the selected adapter
export const redis = new RedisFactory();
