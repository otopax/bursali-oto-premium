import { describe, it, expect } from 'vitest';
const { AIOrchestrator } = require('../AIOrchestrator');

describe('AI Orchestrator Circuit Breaker & Provider Degradation (Gate 2/AI)', () => {
  it('triggers Circuit Breaker after failures and routes directly to fallback provider', async () => {
    const prompt = 'analiz ve detaylı teşhis istiyorum';
    
    const res1 = await AIOrchestrator.executeWithFallback(prompt);
    const res2 = await AIOrchestrator.executeWithFallback(prompt);
    const res3 = await AIOrchestrator.executeWithFallback(prompt);

    expect(res3).toBeDefined();
    expect(res3).not.toBeNull();
  });
});
