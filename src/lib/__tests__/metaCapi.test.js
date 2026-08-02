import { describe, it, expect } from 'vitest';
import { generateEventId, sendMetaCapiEvent } from '../metaCapi.js';

describe('Meta Ads CAPI Event Deduplication (Gate 8)', () => {
  it('generates a unique sha256 event_id for deduplication matching browser pixel', () => {
    const eventId1 = generateEventId('Lead', 'user_123');
    const eventId2 = generateEventId('Lead', 'user_123');

    expect(eventId1).toBeDefined();
    expect(eventId1.length).toBe(64); // SHA-256 hex string length
    expect(eventId1).not.toBe(eventId2); // Unique due to timestamp
  });

  it('skips dispatch gracefully when environment tokens are unconfigured', async () => {
    const res = await sendMetaCapiEvent({
      eventName: 'Lead',
      eventId: 'test_event_id_123',
      userEmail: 'test@example.com',
    });

    expect(res.success).toBe(false);
    expect(res.reason).toBe('unconfigured');
  });
});
