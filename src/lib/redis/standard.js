import { getRedisClient } from './client';

export class StandardRedisAdapter {
  constructor() {
    this.client = getRedisClient();
  }

  async get(key) {
    if (!this.client) return null;
    return this.client.get(key);
  }

  async set(key, value, options = {}) {
    if (!this.client) return null;
    if (options.ex) {
      return this.client.set(key, value, 'EX', options.ex);
    }
    return this.client.set(key, value);
  }

  async del(key) {
    if (!this.client) return 0;
    return this.client.del(key);
  }

  async incr(key) {
    if (!this.client) return 1;
    return this.client.incr(key);
  }

  async expire(key, seconds) {
    if (!this.client) return 0;
    return this.client.expire(key, seconds);
  }

  async ping() {
    if (!this.client) return 'PONG';
    return this.client.ping();
  }
}
