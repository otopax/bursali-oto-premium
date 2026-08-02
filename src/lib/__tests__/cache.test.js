import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCache, setCache, CACHE_TTL } from '../cache';

describe('Cache Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles getCache fallback when cache disabled or mock', async () => {
    const result = await getCache('vin', '12345');
    expect(result).toBeNull();
  });

  it('handles setCache safely', async () => {
    const result = await setCache('vin', '12345', { data: 'test' }, CACHE_TTL.VIN);
    expect(result).toBeNull();
  });

  it('returns null on cache miss or expired key', async () => {
    const result = await getCache('vin', 'expired_key');
    expect(result).toBeNull();
  });
});
