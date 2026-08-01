const Redlock = require('redlock').default;
const { default: RedlockDefault } = require('redlock');
const _Redlock = Redlock || RedlockDefault || require('redlock');
const IORedis = require('ioredis');

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.BUILDING === 'true';

let redis = null;
let redlock = null;

if (!isBuildPhase && process.env.REDIS_URL && !process.env.REDIS_URL.includes('localhost') && !process.env.REDIS_URL.includes('127.0.0.1')) {
  try {
    redis = new IORedis(process.env.REDIS_URL, { lazyConnect: true });
    redis.on('error', (err) => console.error('[LeaderElection] Redis Error:', err.message));
    
    redlock = new _Redlock(
      [redis],
      {
        driftFactor: 0.01,
        retryCount: 3,
        retryDelay: 200,
        retryJitter: 200,
        automaticExtensionThreshold: 500,
      }
    );

    redlock.on('error', (error) => {
      if (error instanceof _Redlock.ResourceLockedError) return;
      console.error('[LeaderElection] Redlock error:', error);
    });
  } catch (e) {
    console.warn('[LeaderElection] Bypassed lock init:', e.message);
  }
}

async function runLeaderTask(lockKey, ttl, executeTask) {
  if (!redlock) {
    // If no lock system during build or single instance, execute directly
    await executeTask();
    return;
  }
  try {
    const lock = await redlock.acquire([lockKey], ttl);
    console.log(`✅ [LeaderElection] Acquired lock for ${lockKey}. Executing task...`);
    
    try {
      await executeTask();
    } finally {
      await lock.release();
      console.log(`🔓 [LeaderElection] Released lock for ${lockKey}.`);
    }
  } catch (err) {
    if (err.name === 'ExecutionError' || (err.message && err.message.includes('attempts to lock'))) {
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
