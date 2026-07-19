import { UpstashRedisAdapter } from './UpstashRedisAdapter';

/**
 * Repository pattern for caching.
 * Abstracts away the underlying cache provider (Redis, Memory, etc.)
 */
class CacheRepository {
  constructor() {
    this.adapter = new UpstashRedisAdapter();
  }

  /**
   * Get a value from the cache
   * @param {string} key 
   * @returns {Promise<any>}
   */
  async get(key) {
    return await this.adapter.get(key);
  }

  /**
   * Set a value in the cache
   * @param {string} key 
   * @param {any} value 
   * @param {number|null} ttlSeconds Time to live in seconds
   */
  async set(key, value, ttlSeconds = null) {
    return await this.adapter.set(key, value, ttlSeconds);
  }
}

// Export as singleton
export const cacheRepository = new CacheRepository();
