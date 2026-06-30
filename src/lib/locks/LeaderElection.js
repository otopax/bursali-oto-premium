const Redlock = require('redlock').default; // Redlock 5.x uses default export sometimes, checking for it
const { default: RedlockDefault } = require('redlock');
const _Redlock = Redlock || RedlockDefault || require('redlock');

const IORedis = require('ioredis');

// Ensure we have a single connection for locks
const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

const redlock = new _Redlock(
  [redis],
  {
    driftFactor: 0.01, // time in ms
    retryCount:  3,
    retryDelay:  200, // time in ms
    retryJitter:  200, // time in ms
    automaticExtensionThreshold: 500, // time in ms
  }
);

redlock.on('error', (error) => {
  // Ignore cases where a resource is explicitly marked as locked on a client.
  if (error instanceof _Redlock.ResourceLockedError) {
    return;
  }
  // Log all other errors.
  console.error('[LeaderElection] Redlock error:', error);
});

/**
 * Attempts to acquire a distributed lock. If successful, executes the task.
 * If another pod holds the lock, it skips execution silently.
 * 
 * @param {string} lockKey - Unique identifier for the lock (e.g. 'locks:outboxRelay')
 * @param {number} ttl - Time to live for the lock in milliseconds
 * @param {function} executeTask - Async function to run if leader
 */
async function runLeaderTask(lockKey, ttl, executeTask) {
  try {
    const lock = await redlock.acquire([lockKey], ttl);
    console.log(`✅ [LeaderElection] Acquired lock for ${lockKey}. Executing task...`);
    
    try {
      await executeTask();
    } finally {
      // Ensure the lock is released after execution
      await lock.release();
      console.log(`🔓 [LeaderElection] Released lock for ${lockKey}.`);
    }
  } catch (err) {
    if (err.name === 'ExecutionError' || err.message.includes('attempts to lock')) {
      console.log(`⏳ [LeaderElection] Another pod is leader for ${lockKey}. Skipping...`);
    } else {
      console.error(`🚨 [LeaderElection] Failed to acquire lock ${lockKey}:`, err);
    }
  }
}

module.exports = {
  runLeaderTask,
  redlock
};
