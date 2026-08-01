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
      const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.BUILDING === 'true';
      
      // Build aşamasında asla dış Redis bağlantısı kurulmasın (ECONNREFUSED 127.0.0.1:6379 önlemek için)
      if (isBuildPhase) {
        console.log("[RedisFactory] Running in build phase. Using Memory Adapter.");
        this.adapter = new MemoryRedisAdapter();
        this.isMemory = true;
        return;
      }

      // Check if Upstash is configured properly
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN && !process.env.UPSTASH_REDIS_REST_URL.includes('mock')) {
        this.adapter = new UpstashRedisAdapter();
        this.isMemory = false;
      } else if (process.env.REDIS_URL && !process.env.REDIS_URL.includes('localhost') && !process.env.REDIS_URL.includes('127.0.0.1')) {
        this.adapter = new StandardRedisAdapter();
        this.isMemory = false;
      } else {
        console.warn("[RedisFactory] Redis credentials not found or local. Falling back to Memory Adapter.");
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
