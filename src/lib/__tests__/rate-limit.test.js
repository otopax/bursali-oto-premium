import { describe, it, expect, vi, beforeEach } from 'vitest';
const { checkRateLimit } = require('../rate-limit');
const { redis } = require('../cache');

vi.mock('../cache', () => ({
  redis: {
    incr: vi.fn(),
    expire: vi.fn()
  }
}));

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows request on first attempt', async () => {
    redis.incr.mockResolvedValue(1);
    redis.expire.mockResolvedValue(1);

    const result = await checkRateLimit('test_ip', 'ai');
    expect(result.allowed).toBe(true);
    expect(redis.expire).toHaveBeenCalledWith('rl:ai:test_ip', 60);
  });

  it('blocks request when limit exceeded', async () => {
    redis.incr.mockResolvedValue(11); // Max is 10 for AI
    const result = await checkRateLimit('test_ip', 'ai');
    expect(result.allowed).toBe(false);
  });

  it('differentiates namespaces correctly', async () => {
    redis.incr.mockResolvedValue(1);
    await checkRateLimit('test_ip', 'erp');
    expect(redis.incr).toHaveBeenCalledWith('rl:erp:test_ip');
  });
});
