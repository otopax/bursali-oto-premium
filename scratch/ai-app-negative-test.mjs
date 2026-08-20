import { GoogleAiProvider } from '../src/infrastructure/ai/GoogleAiProvider.js';

// 1. Force the missing credential scenario
process.env.GOOGLE_GENERATIVE_AI_API_KEY = "";
process.env.GEMINI_API_KEY = "";

// 2. Wrap global fetch to intercept and log ALL outbound network requests
const originalFetch = global.fetch;
let outboundRequests = 0;
let destination = 'NONE';
let headersUsed = null;

global.fetch = async (...args) => {
    outboundRequests++;
    destination = args[0] instanceof Request ? args[0].url : args[0];
    const opts = args[1] || {};
    headersUsed = opts.headers || (args[0] instanceof Request ? args[0].headers : null);
    
    console.log(`[NETWORK INTERCEPT] Outbound request to: ${destination}`);
    if (headersUsed) console.log(`[NETWORK INTERCEPT] Headers: ${JSON.stringify(headersUsed)}`);
    
    throw new Error('INTERCEPTED: Network request blocked by test harness');
};

console.log("=== AI NEGATIVE ISOLATION TEST (Application Code) ===");
console.log(`Timestamp: ${new Date().toISOString()}`);
console.log(`Environment: Isolated Node Script (App Context)`);
console.log(`Credentials: GOOGLE_GENERATIVE_AI_API_KEY='' GEMINI_API_KEY=''`);

async function runTest() {
    try {
        console.log("\n[1] Initializing AI Wrapper...");
        const provider = new GoogleAiProvider();
        
        console.log("[2] Triggering an AI request (generateChatResponse)...");
        const result = await provider.generateChatResponse([{ role: 'user', content: 'test' }], 'test-session');
        
        console.log(`HTTP STATUS: 200 OK (Unexpected)`);
        console.log(`RESPONSE SUMMARY: ${JSON.stringify(result)}`);
        
    } catch (error) {
        console.log(`HTTP STATUS: 500 / Error`);
        console.log(`RESPONSE SUMMARY: ${error.message}`);
    } finally {
        console.log(`\nADAPTER / PROVIDER SELECTION: src/infrastructure/ai/GoogleAiProvider`);
        console.log(`OUTBOUND DESTINATION: ${destination}`);
        console.log(`OUTBOUND REQUEST COUNT: ${outboundRequests}`);
        
        global.fetch = originalFetch;
    }
}

runTest();
