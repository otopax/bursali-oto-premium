import crypto from 'crypto';
import { redis } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';

/**
 * Enterprise Semantic Cache
 * Faz 2.5: Redis Exact Match + Prisma Vector Semantic Match
 */

function generateHash(messages) {
  // Sadece son kullanici sorusunu hashle (baglam degisimini cosine similarity ile yakalariz)
  const lastUserMsg = messages.filter(m => m.role === 'user').pop();
  const content = lastUserMsg ? lastUserMsg.content : JSON.stringify(messages);
  return crypto.createHash('sha256').update(content).digest('hex');
}

export async function getAiCache(messages) {
  try {
    const hash = generateHash(messages);
    
    // 1. Exact Match (Redis) - O(1)
    const cached = await redis.get(`ai:chat:${hash}`);
    if (cached) return JSON.parse(cached);

    // 2. Semantic Vector Match (Prisma/pgvector) - O(N)
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMsg) return null;

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return null;

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
    const embedRes = await ai.models.embedContent({ model: 'text-embedding-004', contents: lastUserMsg.content });
    const vectorStr = `[${embedRes.embeddings[0].values.join(',')}]`;
    
    // pgvector <=> operator is cosine distance. 0 is identical, 1 is orthogonal, 2 is opposite.
    // ASC ordering is crucial (as fixed in P0). We require distance < 0.08 (similarity > 92%)
    const semanticMatches = await prisma.$queryRawUnsafe(`
      SELECT response, (embedding <=> $1::vector) as distance 
      FROM "SemanticCache" 
      WHERE (embedding <=> $1::vector) < 0.08 
      ORDER BY (embedding <=> $1::vector) ASC 
      LIMIT 1
    `, vectorStr);
    
    if (semanticMatches && semanticMatches.length > 0) {
      return semanticMatches[0].response;
    }

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
    
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    if (lastUserMsg && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      // Vector db'ye asenkron kayit:
      const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
      const embedRes = await ai.models.embedContent({ model: 'text-embedding-004', contents: lastUserMsg.content });
      const vectorStr = `[${embedRes.embeddings[0].values.join(',')}]`;
      
      await prisma.$executeRawUnsafe(`
        INSERT INTO "SemanticCache" ("id", "queryHash", "query", "response", "embedding", "createdAt", "updatedAt") 
        VALUES (gen_random_uuid(), $1, $2, $3, $4::vector, NOW(), NOW())
        ON CONFLICT ("queryHash") DO NOTHING
      `, hash, lastUserMsg.content, responseText, vectorStr);
    }
  } catch (error) {
    console.error('Semantic Cache Set Error:', error);
  }
}
