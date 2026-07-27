import crypto from 'crypto';
import { redis } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';
import { Logger } from '@/lib/observability/Logger';

/**
 * Enterprise Semantic Cache
 * Faz 2 (P1): Hash(MODEL + SYSTEM_PROMPT_VERSION + LOCALE + VEHICLE_CONTEXT + NORMALIZED_PROMPT)
 */

function normalizePrompt(text) {
  if (!text) return '';
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

function generateHash(messages, context = {}) {
  const lastUserMsg = messages.filter(m => m.role === 'user').pop();
  const rawPrompt = lastUserMsg ? lastUserMsg.content : JSON.stringify(messages);
  const normalizedPrompt = normalizePrompt(rawPrompt);
  
  const aiModel = context.aiModel || 'gemini-2.5-flash';
  const systemPromptVersion = context.systemPromptVersion || 'v2';
  const locale = context.locale || 'tr';
  const vehicleCtx = context.vehicleContext ? JSON.stringify({
    brand: context.vehicleContext.brand,
    model: context.vehicleContext.model,
    year: context.vehicleContext.year
  }) : 'none';

  const payload = `${aiModel}|${systemPromptVersion}|${locale}|${vehicleCtx}|${normalizedPrompt}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

export async function getAiCache(messages, context = {}) {
  try {
    const hash = generateHash(messages, context);
    
    // 1. Exact Match (Redis) - O(1)
    const cached = await redis.get(`ai:chat:${hash}`);
    if (cached) {
      Logger.info(`[Semantic Cache HIT] ${hash}`);
      return JSON.parse(cached);
    }
    
    Logger.info(`[Semantic Cache MISS] ${hash}`);
    return null;
  } catch (error) {
    Logger.warn('[Semantic Cache Error]', { error: error.message });
    return null;
  }
}

export async function setAiCache(messages, responseText, ttlSeconds = 86400, context = {}) {
  try {
    if (!responseText || responseText.length < 10) return; // Boş veya anlamsız kısa cevapları cache'leme
    if (responseText.includes('Internal Error') || responseText.includes('üzgünüm') || responseText.includes('anlayamadım')) {
      return; // Başarısız / Hata içeren cevapları cache'e yazma
    }

    const hash = generateHash(messages, context);
    await redis.set(`ai:chat:${hash}`, JSON.stringify(responseText), 'EX', ttlSeconds);
    
  } catch (error) {
    Logger.warn('[Semantic Cache Set Error]', { error: error.message });
  }
}
