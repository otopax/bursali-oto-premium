import { Redis } from '@upstash/redis'

/**
 * Upstash Redis Adapter for Distributed Caching
 */
export class UpstashRedisAdapter {
  constructor() {
    try {
      // UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN required in env
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        this.client = Redis.fromEnv()
        this.enabled = true
      } else {
        this.enabled = false
        this.memoryFallback = new Map()
      }
    } catch (error) {
      console.warn("Upstash Redis is not configured properly. Falling back to memory cache.", error.message)
      this.enabled = false
      this.memoryFallback = new Map()
    }
  }

  async get(key) {
    if (!this.enabled) {
      const item = this.memoryFallback.get(key)
      if (!item) return null
      if (item.expiry && item.expiry < Date.now()) {
        this.memoryFallback.delete(key)
        return null
      }
      return item.value
    }
    
    try {
      return await this.client.get(key)
    } catch (error) {
      console.error(`[Redis] Error getting key ${key}:`, error)
      return null
    }
  }

  async set(key, value, ttlSeconds = null) {
    if (!this.enabled) {
      this.memoryFallback.set(key, {
        value,
        expiry: ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null
      })
      return
    }

    try {
      if (ttlSeconds) {
        await this.client.set(key, value, { ex: ttlSeconds })
      } else {
        await this.client.set(key, value)
      }
    } catch (error) {
      console.error(`[Redis] Error setting key ${key}:`, error)
    }
  }
}
