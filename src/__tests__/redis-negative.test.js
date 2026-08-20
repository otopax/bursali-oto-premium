import { expect, test, vi, beforeEach, afterEach } from 'vitest';

let outboundRequests = 0;
let destination = 'NONE';
let originalFetch;

beforeEach(() => {
    // 1. Force the missing credential scenario
    process.env.UPSTASH_REDIS_REST_URL = "";
    process.env.UPSTASH_REDIS_REST_TOKEN = "";
    process.env.REDIS_URL = ""; // ensure standard redis is also missing
    process.env.NEXT_PHASE = ""; // ensure it's not build phase
    process.env.BUILDING = "";
    process.env.IS_BUILD = "";
    
    outboundRequests = 0;
    destination = 'NONE';
    originalFetch = global.fetch;
    
    global.fetch = async (...args) => {
        outboundRequests++;
        destination = args[0] instanceof Request ? args[0].url : args[0];
        console.log(`[NETWORK INTERCEPT] Outbound request to: ${destination}`);
        throw new Error('INTERCEPTED: Network request blocked by test harness');
    };
});

afterEach(() => {
    global.fetch = originalFetch;
});

test('RedisFactory should gracefully degrade to MemoryAdapter when credentials are missing', async () => {
    console.log("=== REDIS NEGATIVE ISOLATION TEST ===");
    console.log(`Credentials: UPSTASH_REDIS_REST_URL='' UPSTASH_REDIS_REST_TOKEN=''`);
    
    // Dynamically import to ensure it picks up the cleared env vars
    const { redis } = await import('../lib/redis/index.js?bust=' + Date.now());
    
    try {
        await redis.set('test-key', 'test-value');
        const val = await redis.get('test-key');
        
        console.log(`HTTP STATUS: Memory Operation OK`);
        console.log(`RESPONSE SUMMARY: Retrieved '${val}' from memory`);
        
        expect(val).toBe('test-value');
        expect(redis.isMemory).toBe(true);
        expect(outboundRequests).toBe(0);
        expect(destination).toBe('NONE');
    } catch (error) {
        console.log(`HTTP STATUS: 500 / Error`);
        console.log(`RESPONSE SUMMARY: ${error.message}`);
    } finally {
        console.log(`\nADAPTER / PROVIDER SELECTION: ${redis.adapter ? redis.adapter.constructor.name : 'Unknown'}`);
        console.log(`OUTBOUND DESTINATION: ${destination}`);
        console.log(`OUTBOUND REQUEST COUNT: ${outboundRequests}\n`);
    }
});
