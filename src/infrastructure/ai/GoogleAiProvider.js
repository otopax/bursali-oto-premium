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
      onFinish: onFinish
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
