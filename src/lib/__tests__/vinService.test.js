import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCache, setCache } from '../cache.js';

vi.mock('../cache.js', () => ({
  getCache: vi.fn(),
  setCache: vi.fn(),
  CACHE_TTL: { VIN: 2592000 }
}));

import { decodeVin } from '../vinService';

global.fetch = vi.fn();

describe('VIN Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid VIN length', async () => {
    const result = await decodeVin('SHORTVIN');
    expect(result.success).toBe(false);
  });

  it('returns cached data on cache hit', async () => {
    vi.mocked(getCache).mockResolvedValue({ Make: 'BMW', Model: '320i' });
    const result = await decodeVin('WBA12345678901234');
    expect(result.success).toBe(true);
    expect(result.data.Make).toBe('BMW');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches from API on cache miss and caches result', async () => {
    vi.mocked(getCache).mockResolvedValue(null);
    vi.mocked(setCache).mockResolvedValue(true);

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        Results: [
          { Variable: 'Make', Value: 'MERCEDES' },
          { Variable: 'Model', Value: 'C200' },
          { Variable: 'Model Year', Value: '2020' }
        ]
      })
    });
    
    const result = await decodeVin('WDB12345678901234');
    expect(result.success).toBe(true);
    expect(result.data.Make).toBe('MERCEDES');
  });

  it('handles API timeout or failure gracefully', async () => {
    vi.mocked(getCache).mockResolvedValue(null);
    global.fetch.mockRejectedValue(new Error('Network error'));
    
    const result = await decodeVin('WBA12345678901234');
    expect(result.success).toBe(false);
  });
});
