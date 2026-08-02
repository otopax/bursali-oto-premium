import { describe, it, expect, vi, beforeEach } from 'vitest';
import { singleFlight, getInFlightCount } from '../singleFlight.js';

describe('SingleFlight Cache Stampede Defense', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('coalesces 100 concurrent requests into a single execution', async () => {
    const fetchFn = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return { data: 'heavy_data' };
    });

    const requests = Array.from({ length: 100 }, () => singleFlight('test_key', fetchFn));
    const results = await Promise.all(requests);

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(results.length).toBe(100);
    expect(results[0]).toEqual({ data: 'heavy_data' });
    expect(getInFlightCount()).toBe(0);
  });

  it('cleans up in-flight map even if fetchFn throws', async () => {
    const fetchFn = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      throw new Error('Fetch Error');
    });

    const requests = Array.from({ length: 10 }, () => singleFlight('error_key', fetchFn).catch(e => e.message));
    const results = await Promise.all(requests);

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(results[0]).toBe('Fetch Error');
    expect(getInFlightCount()).toBe(0);
  });
});
