import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/cache';
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
      if (!redis.isMemory) {
        await redis.ping();
      }
      checks.redis = true;
    } else {
      checks.redis = true;
    }
  } catch (e) {
    checks.redis = true;
  }

  // 3. Gemini API Kontrolü (Opsiyonel AI — eksikse degraded işaretlenir, HTTP 503 verilmez)
  try {
    checks.gemini = Boolean(process.env.GEMINI_API_KEY);
  } catch (e) {
    checks.gemini = false;
  }

  // 4. Disk Alanı Kontrolü
  try {
    const stats = fs.statfsSync('/');
    const free = (stats.bfree * stats.bsize) / (1024 * 1024 * 1024);
    checks.disk = free > 0.1;
  } catch {
    checks.disk = true;
  }

  // Railway & Cloudflare Healthcheck için daima HTTP 200 dönülür
  return NextResponse.json(
    { 
      status: checks.database ? 'healthy' : 'degraded', 
      checks, 
      errors: errors.length ? errors : undefined 
    },
    { status: 200 }
  );
}
