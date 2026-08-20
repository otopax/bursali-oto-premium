import { GoogleGenAI } from '@google/genai';
import { createServer } from 'http';

// 1. Force the missing credential scenario
process.env.GOOGLE_GENERATIVE_AI_API_KEY = "";
process.env.GEMINI_API_KEY = "";

// 2. Wrap global fetch to intercept and log ALL outbound network requests
const originalFetch = global.fetch;
let outboundRequests = 0;
let destination = 'NONE';

global.fetch = async (...args) => {
    outboundRequests++;
    destination = args[0] instanceof Request ? args[0].url : args[0];
    console.log(`[NETWORK INTERCEPT] Outbound request to: ${destination}`);
    // Block the request to prove it doesn't leak or hit dummy
    throw new Error('INTERCEPTED: Network request blocked by test harness');
};

console.log("=== AI NEGATIVE ISOLATION TEST ===");
console.log(`Timestamp: ${new Date().toISOString()}`);
console.log(`Environment: Isolated Node Script`);
console.log(`Credentials: GOOGLE_GENERATIVE_AI_API_KEY='' GEMINI_API_KEY=''`);

async function runTest() {
    try {
        console.log("\n[1] Initializing AI Wrapper...");
        // Emulating how the app initializes GoogleGenAI
        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
        
        console.log("[2] Triggering an AI request (embedContent)...");
        // This should either fail immediately, or try to use a fallback key.
        const result = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: 'test fallback isolation'
        });
        
        console.log(`HTTP STATUS: 200 OK (Unexpected)`);
        console.log(`RESPONSE SUMMARY: ${JSON.stringify(result)}`);
        
    } catch (error) {
        console.log(`HTTP STATUS: 500 / Error`);
        console.log(`RESPONSE SUMMARY: ${error.message}`);
    } finally {
        console.log(`\nADAPTER / PROVIDER SELECTION: @google/genai`);
        console.log(`OUTBOUND DESTINATION: ${destination}`);
        console.log(`OUTBOUND REQUEST COUNT: ${outboundRequests}`);
        
        // Restore fetch just in case
        global.fetch = originalFetch;
    }
}

runTest();
