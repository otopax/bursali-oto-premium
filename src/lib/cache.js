import { Redis } from '@upstash/redis';
import * as Sentry from "@sentry/nextjs";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || 'https://mock-upstash-url.upstash.io';
const isMock = !process.env.UPSTASH_REDIS_REST_URL || REDIS_URL.includes('mock') || process.env.NEXT_PHASE === 'phase-production-build' || process.env.BUILDING === 'true' || process.env.IS_BUILD === 'true';

let redisInstance = null;
if (!isMock) {
  try {
    redisInstance = new Redis({
      url: REDIS_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || 'mock-token',
    });
  } catch (e) {
    redisInstance = null;
  }
}

export const redis = redisInstance;

export const CACHE_TTL = {
  VIN: 30 * 24 * 60 * 60, // 30 Gün
  OBD: 7 * 24 * 60 * 60, // 7 Gün
  PAGE: 24 * 60 * 60, // 1 Gün
  FAQ: 7 * 24 * 60 * 60, // 7 Gün
};

// Helper: Wrap promise with timeout
function withTimeout(promise, ms = 500) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Cache timeout')), ms))
  ]);
}

/**
 * Cache'den veri getirir
 */
export async function getCache(namespace, identifier) {
  if (isMock || !redisInstance) return null;
  try {
    const key = `cache:${namespace}:${identifier}`;
    const result = await withTimeout(redisInstance.get(key), 500);
    return result;
  } catch (error) {
    return null; // Return null fast without blocking page rendering
  }
}

/**
 * Cache'e veri yazar
 */
export async function setCache(namespace, identifier, value, ttlSeconds = 3600) {
  if (isMock || !redisInstance) return null;
  try {
    const key = `cache:${namespace}:${identifier}`;
    return await withTimeout(redisInstance.set(key, value, { ex: ttlSeconds }), 500);
  } catch (error) {
    return null;
  }
}
