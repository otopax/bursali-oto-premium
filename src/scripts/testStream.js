import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

async function test() {
  const result = streamText({
    model: google('gemini-2.5-flash'),
    prompt: 'Hello'
  });
  console.log(Object.keys(result));
  console.log(typeof result.toDataStreamResponse);
  console.log(typeof result.toAIStreamResponse);
  console.log(typeof result.toTextStreamResponse);
}

test().catch(console.error);
