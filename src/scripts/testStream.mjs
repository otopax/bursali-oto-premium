import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

async function main() {
  const result = streamText({
    model: google('gemini-2.5-flash'),
    prompt: 'hello'
  });
  console.log('Keys on result object:');
  console.log(Object.keys(result));
  
  // also check prototype
  const proto = Object.getPrototypeOf(result);
  console.log('Keys on prototype:');
  console.log(Object.getOwnPropertyNames(proto));
}

main().catch(console.error);
