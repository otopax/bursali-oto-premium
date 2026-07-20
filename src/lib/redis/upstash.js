import { Redis } from '@upstash/redis';

export class UpstashRedisAdapter {
  constructor() {
    this.client = Redis.fromEnv();
  }

  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`[Redis] Error getting key ${key}:`, error);
      throw error;
    }
  }

  async set(key, value, options = {}) {
    try {
      if (options.ex) {
        await this.client.set(key, value, { ex: options.ex });
      } else {
        await this.client.set(key, value);
      }
      return "OK";
    } catch (error) {
      console.error(`[Redis] Error setting key ${key}:`, error);
      throw error;
    }
  }

  async del(key) {
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error(`[Redis] Error deleting key ${key}:`, error);
      throw error;
    }
  }

  async incr(key) {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error(`[Redis] Error incrementing key ${key}:`, error);
      throw error;
    }
  }

  async expire(key, seconds) {
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      console.error(`[Redis] Error expiring key ${key}:`, error);
      throw error;
    }
  }

  async ping() {
    try {
      return await this.client.ping();
    } catch (error) {
      throw error;
    }
  }
}
