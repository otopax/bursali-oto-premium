import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { GoogleGenAI } from '@google/genai';
import { IAiProvider } from '@/application/interfaces/IAiProvider';

export class GoogleAiProvider extends IAiProvider {
  constructor() {
    super();
    // Default model initializations
    this.modelName = 'gemini-2.5-flash';
    this.embeddingModelName = 'gemini-embedding-001';
  }

  streamResponse({ systemPrompt, messages, tools, onFinish }) {
    return streamText({
      model: google(this.modelName),
      system: systemPrompt,
      messages: messages,
      tools: tools,
      onFinish: onFinish,
      // GEÇİCİ TEŞHİS: stream içi gerçek hatayı deploy log'una yaz (AI SDK "An error occurred" ile maskeliyor).
      onError: (e) => {
        const err = (e && e.error) ? e.error : e;
        console.error('[streamText onError]', JSON.stringify({
          message: err && err.message ? String(err.message) : String(err),
          name: err && err.name,
          stack: err && err.stack ? String(err.stack).split('\n').slice(0, 4).join(' | ') : undefined,
        }));
      }
    });
  }

  async generateEmbedding(text) {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
    const embedRes = await ai.models.embedContent({ 
      model: this.embeddingModelName, 
      contents: text 
    });
    return embedRes.embeddings[0].values;
  }
}
