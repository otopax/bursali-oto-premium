import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/cache';
import { GoogleGenerativeAI } from '@google/genai';
import fs from 'fs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const checks = {
    database: false,
    redis: false,
    gemini: false,
    disk: false,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  const errors = [];

  // 1. Veritabanı Kontrolü
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (e) {
    errors.push(`DB: ${e.message}`);
  }

  // 2. Redis Kontrolü
  try {
    if (redis) {
      await redis.ping();
      checks.redis = true;
    } else {
      throw new Error('Redis client not initialized');
    }
  } catch (e) {
    errors.push(`Redis: ${e.message}`);
  }

  // 3. Gemini API Kontrolü
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing');
    const genAI = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
    // Light test: check if library loads and key exists. Not executing generateContent to save quota.
    checks.gemini = true;
  } catch (e) {
    errors.push(`Gemini: ${e.message}`);
  }

  // 4. Disk Alanı Kontrolü
  try {
    const stats = fs.statfsSync('/');
    const free = (stats.bfree * stats.bsize) / (1024 * 1024 * 1024);
    checks.disk = free > 1; // 1GB'dan azsa problem
    if (!checks.disk) errors.push(`Disk: Low space (${free.toFixed(2)} GB)`);
  } catch {
    checks.disk = true; // Windows veya farklı ortamda pas geç
  }

  const isHealthy = Object.values(checks).every(v => v === true) || errors.length === 0;

  return NextResponse.json(
    { 
      status: isHealthy ? 'healthy' : 'unhealthy', 
      checks, 
      errors: errors.length ? errors : undefined 
    },
    { status: isHealthy ? 200 : 503 }
  );
}
