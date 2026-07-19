import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCache, setCache, CACHE_TTL } from '../cache';
import { cacheRepository } from '../cache/CacheRepository';

vi.mock('../cache/CacheRepository', () => ({
  cacheRepository: {
    get: vi.fn(),
    set: vi.fn(),
    adapter: { client: {} }
  }
}));

describe('Cache Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('constructs correct namespace and identifier for getCache', async () => {
    cacheRepository.get.mockResolvedValue('testData');
    const result = await getCache('vin', '12345');
    expect(cacheRepository.get).toHaveBeenCalledWith('cache:vin:12345');
    expect(result).toBe('testData');
  });

  it('constructs correct namespace and TTL for setCache', async () => {
    cacheRepository.set.mockResolvedValue(true);
    const result = await setCache('vin', '12345', { data: 'test' }, CACHE_TTL.VIN);
    expect(cacheRepository.set).toHaveBeenCalledWith('cache:vin:12345', { data: 'test' }, 2592000);
    expect(result).toBe(true);
  });

  it('returns null on cache miss or expired key', async () => {
    cacheRepository.get.mockResolvedValue(null);
    const result = await getCache('vin', 'expired_key');
    expect(result).toBeNull();
  });
});
