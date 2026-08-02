import { describe, it, expect, vi, beforeEach } from 'vitest';

const { AIOrchestrator } = require('../AIOrchestrator');

describe('AIOrchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (AIOrchestrator.chain) {
      AIOrchestrator.chain.forEach(provider => {
        provider.generateText = vi.fn().mockResolvedValue('success');
      });
    }
  });

  it('classifies simple prompt correctly', () => {
    const complexity = AIOrchestrator.classifyPromptComplexity('Merhaba nasılsınız?');
    expect(complexity).toBe('SIMPLE');
  });

  it('classifies complex prompt correctly', () => {
    const complexity = AIOrchestrator.classifyPromptComplexity('Verileri analiz et ve sistematik bir karşılaştırma yap.');
    expect(complexity).toBe('COMPLEX');
  });

  it('executes fallback correctly on timeout', async () => {
    AIOrchestrator.chain[0].generateText = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 5000)));
    AIOrchestrator.withTimeout = vi.fn().mockRejectedValueOnce(new Error('Timeout')).mockResolvedValueOnce('success2');
    
    const result = await AIOrchestrator.executeWithFallback('test prompt');
    expect(result).toBe('success2');
    expect(AIOrchestrator.withTimeout).toHaveBeenCalledTimes(2);
  });
});
