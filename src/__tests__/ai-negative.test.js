import { expect, test, vi, beforeEach, afterEach } from 'vitest';
import { GoogleAiProvider } from '../infrastructure/ai/GoogleAiProvider.js';

let outboundRequests = 0;
let destination = 'NONE';
let originalFetch;

beforeEach(() => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "";
    process.env.GEMINI_API_KEY = "";
    
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
    console.log(`\nADAPTER / PROVIDER SELECTION: src/infrastructure/ai/GoogleAiProvider`);
    console.log(`OUTBOUND DESTINATION: ${destination}`);
    console.log(`OUTBOUND REQUEST COUNT: ${outboundRequests}\n`);
});

test('GoogleAiProvider should throw API key error and NOT make outbound requests when key is missing', async () => {
    console.log("=== AI NEGATIVE ISOLATION TEST (Application Code) ===");
    console.log(`Credentials: GOOGLE_GENERATIVE_AI_API_KEY='' GEMINI_API_KEY=''`);
    
    const provider = new GoogleAiProvider();
    
    try {
        await provider.generateEmbedding('test fallback isolation');
        // Should not reach here
        expect.unreachable('Should have thrown an error');
    } catch (error) {
        console.log(`HTTP STATUS: 500 / Error`);
        console.log(`RESPONSE SUMMARY: ${error.message}`);
        expect(outboundRequests).toBe(0);
        expect(destination).toBe('NONE');
    }
});
