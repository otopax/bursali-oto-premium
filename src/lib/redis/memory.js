export class MemoryRedisAdapter {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiry && item.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key, value, options = {}) {
    const expiry = options.ex ? Date.now() + (options.ex * 1000) : null;
    this.store.set(key, { value, expiry });
    return "OK";
  }

  async del(key) {
    this.store.delete(key);
    return 1;
  }

  async incr(key) {
    const item = this.store.get(key);
    let value = 1;
    if (item && (!item.expiry || item.expiry >= Date.now())) {
      value = (parseInt(item.value, 10) || 0) + 1;
    }
    this.store.set(key, { value, expiry: item?.expiry || null });
    return value;
  }

  async expire(key, seconds) {
    const item = this.store.get(key);
    if (!item) return 0;
    this.store.set(key, { ...item, expiry: Date.now() + (seconds * 1000) });
    return 1;
  }

  async ping() {
    return "PONG";
  }
}
