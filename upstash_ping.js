const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
  retry: {
    retries: 0 // Do not retry, we want raw fetch latency
  }
});

async function run() {
  console.log('Testing Upstash Latency...');
  const latencies = [];
  const errors = [];
  
  for (let i = 0; i < 20; i++) {
    const start = process.hrtime.bigint();
    try {
      const p = redis.pipeline();
      p.ping();
      await p.exec();
      const end = process.hrtime.bigint();
      latencies.push(Number(end - start) / 1e6);
    } catch (e) {
      errors.push(e);
    }
    // sleep 50ms between pings
    await new Promise(r => setTimeout(r, 50));
  }
  
  if (latencies.length > 0) {
    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.5)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const p99 = latencies[Math.floor(latencies.length * 0.99)];
    const max = latencies[latencies.length - 1];
    const min = latencies[0];
    
    console.log(`Success: ${latencies.length}/20`);
    console.log(`Min: ${min.toFixed(2)}ms`);
    console.log(`P50: ${p50.toFixed(2)}ms`);
    console.log(`P95: ${p95.toFixed(2)}ms`);
    console.log(`P99: ${p99.toFixed(2)}ms`);
    console.log(`Max: ${max.toFixed(2)}ms`);
  }
  
  if (errors.length > 0) {
    console.log(`\nErrors: ${errors.length}/20`);
    console.log(`Sample error: ${errors[0]}`);
    console.dir(errors[0]);
  }
}

run();
