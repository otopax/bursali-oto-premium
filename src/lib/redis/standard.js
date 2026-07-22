import client from './client';

export class StandardRedisAdapter {
  constructor() {
    this.client = client.getInstance();
  }

  async get(key) {
    return this.client.get(key);
  }

  async set(key, value, options = {}) {
    if (options.ex) {
      return this.client.set(key, value, 'EX', options.ex);
    }
    return this.client.set(key, value);
  }

  async del(key) {
    return this.client.del(key);
  }

  async incr(key) {
    return this.client.incr(key);
  }

  async expire(key, seconds) {
    return this.client.expire(key, seconds);
  }

  async ping() {
    return this.client.ping();
  }
}
