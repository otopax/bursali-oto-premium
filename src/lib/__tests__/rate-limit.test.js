import { describe, it, expect, vi, beforeEach } from 'vitest';
const { rateLimit } = require('../rate-limit');

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fails open gracefully when env is missing or Redis is mock', async () => {
    const result = await rateLimit('test_ip', 'ai');
    expect(result.success).toBe(true);
  });
});
