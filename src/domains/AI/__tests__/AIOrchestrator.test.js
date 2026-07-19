import { describe, it, expect, vi, beforeEach } from 'vitest';
const orchestrator = require('../AIOrchestrator');

vi.mock('../../lib/redis/client', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    hincrby: vi.fn(),
    pipeline: vi.fn(() => ({
      hincrby: vi.fn(),
      hset: vi.fn(),
      exec: vi.fn()
    }))
  }
}));

describe('AIOrchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock providers
    orchestrator.chain.forEach(provider => {
      provider.generateText = vi.fn().mockResolvedValue('success');
    });
  });

  it('classifies simple prompt correctly', () => {
    const complexity = orchestrator.classifyPromptComplexity('Merhaba nasılsınız?');
    expect(complexity).toBe('SIMPLE');
  });

  it('classifies complex prompt correctly', () => {
    const complexity = orchestrator.classifyPromptComplexity('Verileri analiz et ve sistematik bir karşılaştırma yap.');
    expect(complexity).toBe('COMPLEX');
  });

  it('executes fallback correctly on timeout', async () => {
    const redisClient = require('../../lib/redis/client').default;
    redisClient.get.mockResolvedValue(JSON.stringify({ failures: 0, isOpen: false, lastFailureAt: 0, avgLatency: 0 }));
    
    // First provider times out
    orchestrator.chain[0].generateText = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 5000)));
    
    // Using a tiny timeout to force failure
    orchestrator.withTimeout = vi.fn().mockRejectedValueOnce(new Error('Timeout')).mockResolvedValueOnce('success2');
    
    const result = await orchestrator.executeWithFallback('test prompt');
    expect(result).toBe('success2');
    expect(orchestrator.withTimeout).toHaveBeenCalledTimes(2);
  });
});
