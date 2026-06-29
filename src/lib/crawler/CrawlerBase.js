const axios = require('axios');
const { ProxyManager } = require('./ProxyManager');
// const { logAudit } = require('../audit');

/**
 * Base abstract class for all Crawlers in the Ecosystem.
 * Ensures standardization, logging, and stealth mechanisms.
 */
class CrawlerBase {
  constructor(name) {
    this.name = name;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchHtml(url) {
    try {
      const proxy = ProxyManager.getProxy();
      const options = {
        headers: ProxyManager.getStealthHeaders(),
        timeout: 10000,
      };

      if (proxy) {
        const urlObj = new URL(proxy);
        options.proxy = {
          protocol: urlObj.protocol.replace(':', ''),
          host: urlObj.hostname,
          port: parseInt(urlObj.port),
        };
      }

      const response = await axios.get(url, options);
      return response.data;
    } catch (error) {
      console.error(`[${this.name}] Fetch Error for ${url}:`, error.message);
      throw error;
    }
  }

  async run(jobData) {
    throw new Error(`[${this.name}] 'run' method must be implemented by subclass.`);
  }
}

module.exports = { CrawlerBase };
