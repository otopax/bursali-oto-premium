import { describe, it, expect, vi, beforeEach } from 'vitest';
const { decodeVIN } = require('../vinService');
const { getCache, setCache } = require('../cache');

vi.mock('../cache', () => ({
  getCache: vi.fn(),
  setCache: vi.fn()
}));

// Mocking fetch for API tests
global.fetch = vi.fn();

describe('VIN Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid VIN length', async () => {
    await expect(decodeVIN('SHORTVIN')).rejects.toThrow();
  });

  it('returns cached data on cache hit', async () => {
    getCache.mockResolvedValue({ make: 'BMW', model: '320i' });
    const result = await decodeVIN('WBA12345678901234');
    expect(result.make).toBe('BMW');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches from API on cache miss and caches result', async () => {
    getCache.mockResolvedValue(null);
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ Results: [{ Variable: 'Make', Value: 'MERCEDES' }] })
    });
    
    const result = await decodeVIN('WDB12345678901234');
    expect(result.Results[0].Value).toBe('MERCEDES');
    expect(setCache).toHaveBeenCalled();
  });

  it('throws on API timeout or failure', async () => {
    getCache.mockResolvedValue(null);
    global.fetch.mockRejectedValue(new Error('Network error'));
    
    await expect(decodeVIN('WBA12345678901234')).rejects.toThrow('VIN decoding failed');
  });
});
