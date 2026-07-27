import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { GoogleGenAI } from '@google/genai';
import { IAiProvider } from '@/application/interfaces/IAiProvider';

export class GoogleAiProvider extends IAiProvider {
  constructor() {
    super();
    this.modelName = 'gemini-2.5-flash';
    this.embeddingModelName = 'gemini-embedding-001';
  }

  getProvider() {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!key) throw new Error('API key not valid. Please pass a valid API key.');
    return createGoogleGenerativeAI({ apiKey: key });
  }

  streamResponse({ systemPrompt, messages, tools, onFinish }) {
    const google = this.getProvider();
    return streamText({
      model: google(this.modelName),
      system: systemPrompt,
      messages: messages,
      tools: tools,
      onFinish: onFinish
    });
  }

  async generateEmbedding(text) {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!key) throw new Error('API key not valid. Please pass a valid API key.');
    const ai = new GoogleGenAI({ apiKey: key });
    const embedRes = await ai.models.embedContent({ 
      model: this.embeddingModelName, 
      contents: text 
    });
    return embedRes.embeddings[0].values;
  }
}
