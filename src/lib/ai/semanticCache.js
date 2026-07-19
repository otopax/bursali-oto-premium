import crypto from 'crypto';
import { redis } from '@/lib/cache';

/**
 * Enterprise Semantic / Hash Cache
 * Caches AI responses based on exact message history hash to save API costs.
 */

function generateHash(messages) {
  // Sadece son kullanici mesajini veya tum gecmisi hashleyebiliriz.
  // Tum gecmisi hashlarsak baglami da cachelemis oluruz.
  const content = JSON.stringify(messages);
  return crypto.createHash('sha256').update(content).digest('hex');
}

export async function getAiCache(messages) {
  try {
    const hash = generateHash(messages);
    const cached = await redis.get(`ai:chat:${hash}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Redis Cache Get Error:', error);
    return null;
  }
}

export async function setAiCache(messages, responseText, ttlSeconds = 86400) {
  try {
    const hash = generateHash(messages);
    await redis.set(`ai:chat:${hash}`, JSON.stringify(responseText), 'EX', ttlSeconds);
  } catch (error) {
    console.error('Redis Cache Set Error:', error);
  }
}
