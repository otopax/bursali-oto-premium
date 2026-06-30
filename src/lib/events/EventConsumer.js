const IORedis = require('ioredis');

// Prevent multiple connections in Next.js/dev by using a global or standardizing
const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * Ensures a specific event is processed only once (Idempotency).
 * @param {string} eventId - Unique identifier for the event
 * @param {object} payload - The event payload
 * @param {function} handlePayload - The actual business logic function
 */
async function processEvent(eventId, payload, handlePayload) {
  const key = `processed_events:${eventId}`;
  
  // Check if we already processed this
  const alreadyProcessed = await redis.get(key);

  if (alreadyProcessed) {
    console.log(`[Idempotency] Skipping duplicate event: ${eventId}`);
    return;
  }

  // Mark as processed (Expire in 24 hours to keep Redis clean)
  await redis.set(key, 'true', 'EX', 24 * 60 * 60);

  try {
    // Execute actual business logic
    await handlePayload(payload);
  } catch (error) {
    // If business logic fails, we might want to un-mark it so it can be retried,
    // depending on the retry policy. For strictly at-most-once, keep it marked.
    // await redis.del(key); 
    throw error;
  }
}

module.exports = {
  processEvent,
  redis
};
