import fs from 'fs/promises';

const CACHE = new Map();
const TTL_MS = 1000 * 60 * 60; // 1 saat

export async function readJsonCached(path) {
  const now = Date.now();
  const entry = CACHE.get(path);
  
  if (entry && (now - entry.ts) < TTL_MS) {
    return entry.data;
  }
  
  try {
    const raw = await fs.readFile(path, 'utf8');
    const data = JSON.parse(raw);
    CACHE.set(path, { data, ts: now });
    return data;
  } catch (error) {
    console.error(`[CacheFile] Error reading or parsing file at ${path}:`, error.message);
    throw error;
  }
}
