// Health-check endpoint (Faz A / Görev 6)
// UptimeRobot her 5 dk çağırır — <2sn yanıt garantisi kritik.
// Yapı: { status, version, uptime, timestamp, env, db, redis, latency, os? }
// - status: "ok" | "degraded"
// - HTTP: 200 | 503 (503 → UptimeRobot alarm gönderir)
import { NextResponse } from 'next/server';
import os from 'os';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/cache';


export const dynamic = 'force-dynamic';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';
const CHECK_TIMEOUT_MS = 1500; // Her check için üst sınır

/**
 * Verilen promise'ı max ms süresince bekle; aşarsa reject.
 */
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timeout ${ms}ms`)), ms)
    ),
  ]);
}

async function checkDb() {
  const started = Date.now();
  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`, CHECK_TIMEOUT_MS, 'db');
    return { status: 'ok', latency: Date.now() - started };
  } catch (error) {
    return { status: 'down', latency: Date.now() - started, error: error.message };
  }
}

async function checkRedis() {
  const started = Date.now();
  try {
    // ioredis lazyConnect: ping tetiklerse connect denenir
    await withTimeout(redis.ping(), CHECK_TIMEOUT_MS, 'redis');
    return { status: 'ok', latency: Date.now() - started };
  } catch (error) {
    return { status: 'down', latency: Date.now() - started, error: error.message };
  }
}

export async function GET() {
  const startTime = Date.now();

  // Paralel check — sequential 2×1.5sn beklemek yerine max(1.5sn) toplam
  const [db, redisResult] = await Promise.all([checkDb(), checkRedis()]);

  const isHealthy = db.status === 'ok' && redisResult.status === 'ok';

  const body = {
    status: isHealthy ? 'ok' : 'degraded',
    version: APP_VERSION,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    db,
    redis: redisResult,
    latency: {
      db: `${db.latency}ms`,
      redis: `${redisResult.latency}ms`,
      total: `${Date.now() - startTime}ms`,
    },
    // Sistem metrikleri (opsiyonel — Linux prod'da anlamlı)
    os: {
      memory: {
        free: Math.round(os.freemem() / 1024 / 1024) + 'MB',
        total: Math.round(os.totalmem() / 1024 / 1024) + 'MB',
      },
      loadavg: os.loadavg(),
    },
  };

  return NextResponse.json(body, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
