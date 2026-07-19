import { describe, it, expect } from 'vitest';
const graph = require('../KnowledgeGraph');

describe('KnowledgeGraph', () => {
  it('finds existing node', () => {
    const result = graph.getSemanticLinks('P0420');
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns empty array for missing node', () => {
    const result = graph.getSemanticLinks('UNKNOWN_CODE');
    expect(result).toEqual([]);
  });

  it('sorts related nodes by weight correctly', () => {
    // Assuming P0420 has multiple weights, check if it's sorted descending
    const result = graph.getSemanticLinks('P0420');
    if (result.length > 1) {
      expect(result[0].weight).toBeGreaterThanOrEqual(result[1].weight);
    }
  });

  it('prevents duplicates when building links', () => {
    const result = graph.getSemanticLinks('P0420');
    const targetSet = new Set(result.map(r => r.target));
    expect(targetSet.size).toBe(result.length);
  });
});
