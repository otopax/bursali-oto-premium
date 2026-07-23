/**
 * Cloudflare KV REST API Adapter
 * Next.js içinden (Node.js/Edge Runtime) Cloudflare KV okuma/yazma işlemleri için.
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

async function fetchKV(namespaceId, key, options = {}) {
  const { method = 'GET', body } = options;
  if (!ACCOUNT_ID || !API_TOKEN || !namespaceId) {
    // Development ortamında credentials yoksa silent fail.
    return null;
  }
  
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${namespaceId}/values/${key}`;
  
  const headers = {
    'Authorization': `Bearer ${API_TOKEN}`,
  };

  const reqOptions = { method, headers };
  if (body) {
    reqOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const res = await fetch(url, reqOptions);
    if (!res.ok) {
      if (res.status === 404 && method === 'GET') return null; // Key not found
      throw new Error(`KV API Error: ${res.statusText}`);
    }
    
    if (method === 'GET') {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        return text;
      }
    }
    
    return await res.json();
  } catch (error) {
    console.error(`[KV Adapter] ${method} error for key ${key}:`, error.message);
    return null;
  }
}

export const CloudflareKV = {
  async getVinCache(vin) {
    return fetchKV(process.env.CLOUDFLARE_KV_VIN_ID, `cache:vin:${vin}`);
  },
  async setVinCache(vin, data) {
    return fetchKV(process.env.CLOUDFLARE_KV_VIN_ID, `cache:vin:${vin}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async getAiCache(promptHash, modelVersion = 'gemini-2.5') {
    return fetchKV(process.env.CLOUDFLARE_KV_AI_ID, `cache:ai:${modelVersion}:${promptHash}`);
  },
  async setAiCache(promptHash, data, modelVersion = 'gemini-2.5') {
    return fetchKV(process.env.CLOUDFLARE_KV_AI_ID, `cache:ai:${modelVersion}:${promptHash}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  // Additional Namespaces for Enterprise taxonomy
  async getCache(type, key) {
    // type: seo, faq, parts
    return fetchKV(process.env.CLOUDFLARE_KV_GENERAL_ID, `cache:${type}:${key}`);
  },
  async setCache(type, key, data) {
    return fetchKV(process.env.CLOUDFLARE_KV_GENERAL_ID, `cache:${type}:${key}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async getConfig(key) {
    return fetchKV(process.env.CLOUDFLARE_KV_GENERAL_ID, `config:${key}`);
  },
  async setConfig(key, data) {
    return fetchKV(process.env.CLOUDFLARE_KV_GENERAL_ID, `config:${key}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async getSession(key) {
    return fetchKV(process.env.CLOUDFLARE_KV_GENERAL_ID, `session:${key}`);
  },
  async setSession(key, data) {
    return fetchKV(process.env.CLOUDFLARE_KV_GENERAL_ID, `session:${key}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async getRateLimit(key) {
    return fetchKV(process.env.CLOUDFLARE_KV_GENERAL_ID, `ratelimit:${key}`);
  },
  async setRateLimit(key, data) {
    return fetchKV(process.env.CLOUDFLARE_KV_GENERAL_ID, `ratelimit:${key}`, { method: 'PUT', body: JSON.stringify(data) });
  }
};
