import { UpstashRedisAdapter } from './upstash';
import { MemoryRedisAdapter } from './memory';
import { StandardRedisAdapter } from './standard';

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
      } else if (process.env.REDIS_URL) {
        this.adapter = new StandardRedisAdapter();
        this.isMemory = false;
      } else {
        console.warn("[RedisFactory] Redis credentials not found. Falling back to Memory Adapter.");
        this.adapter = new MemoryRedisAdapter();
        this.isMemory = true;
        this.initError = "No credentials found";
      }
    } catch (error) {
      console.warn("[RedisFactory] Failed to init Redis, falling back to Memory Adapter.", error.message);
      this.adapter = new MemoryRedisAdapter();
      this.isMemory = true;
      this.initError = error.message;
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
