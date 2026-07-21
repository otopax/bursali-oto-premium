import crypto from 'crypto';
import { redis } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';

/**
 * Enterprise Semantic Cache
 * Faz 2.5: Redis Exact Match + Prisma Vector Semantic Match
 */

function generateHash(messages) {
  const content = JSON.stringify(messages);
  return crypto.createHash('sha256').update(content).digest('hex');
}

export async function getAiCache(messages) {
  try {
    const hash = generateHash(messages);
    
    // 1. Exact Match (Redis) - O(1)
    const cached = await redis.get(`ai:chat:${hash}`);
    if (cached) return JSON.parse(cached);

    // 2. Semantic Vector Match (Prisma/pgvector veya Redis Vector) - O(N)
    // Son kullanici mesajini vectorize et
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMsg) return null;

    // Gercek uygulamada buraya embeddings eklenecek:
    // const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
    // const embedRes = await ai.models.embedContent({ model: 'gemini-embedding-001', contents: lastUserMsg.content });
    // const vectorStr = `[${embedRes.embeddings[0].values.join(',')}]`;
    // const semanticMatches = await prisma.$queryRawUnsafe(`SELECT response, 1 - (embedding <=> $1::vector) as sim FROM SemanticCache WHERE 1 - (embedding <=> $1::vector) > 0.95 LIMIT 1`, vectorStr);
    
    // if (semanticMatches.length > 0) return semanticMatches[0].response;

    return null;
  } catch (error) {
    console.error('Semantic Cache Get Error:', error);
    return null;
  }
}

export async function setAiCache(messages, responseText, ttlSeconds = 86400) {
  try {
    const hash = generateHash(messages);
    await redis.set(`ai:chat:${hash}`, JSON.stringify(responseText), 'EX', ttlSeconds);
    
    // Vector db'ye asenkron kayit:
    // const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    // await prisma.semanticCache.create({ data: { query: lastUserMsg.content, response: responseText, embedding: [...] } });
  } catch (error) {
    console.error('Semantic Cache Set Error:', error);
  }
}
