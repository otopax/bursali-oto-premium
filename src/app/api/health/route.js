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

async function checkAi() {
  const started = Date.now();
  // AI is considered up if we can just resolve a promise for now, 
  // to avoid real quota usage. We could ping openai.com if needed.
  try {
    await withTimeout(Promise.resolve('ok'), CHECK_TIMEOUT_MS, 'ai');
    return { status: 'ok', latency: Date.now() - started };
  } catch (error) {
    return { status: 'down', latency: Date.now() - started, error: error.message };
  }
}

export async function GET(request) {
  const startTime = Date.now();
  const url = new URL(request.url);
  const isDeep = url.searchParams.get('deep') === '1';

  if (isDeep) {
    // Güvenlik: Deep health check sadece internal API key ile yapılabilir
    const apiKey = request.headers.get('x-internal-api-key') || request.headers.get('authorization')?.split(' ')[1];
    const validKey = process.env.INTERNAL_API_KEY || 'bursali-oto-internal-secret-2026';
    
    if (apiKey !== validKey) {
      return NextResponse.json({ error: 'Unauthorized for deep health check' }, { status: 401 });
    }

    // Rate Limiting (Deep check)
    try {
      const { rateLimit } = await import('@/lib/rate-limit');
      const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
      // Deep check için sıkı kısıtlama: 10 istek / 1 dakika
      const rl = await rateLimit('health-deep', ip, 10, 60, { failClosed: false });
      if (!rl.success) {
        return new NextResponse('Too Many Requests', { status: 429 });
      }
    } catch (err) {
      console.warn('[Health] Rate limiting error (Fail-Open active):', err.message);
    }

    // Paralel check — sequential 2×1.5sn beklemek yerine max(1.5sn) toplam
    const [db, redisResult, aiResult] = await Promise.all([checkDb(), checkRedis(), checkAi()]);

    const isHealthy = db.status === 'ok' && redisResult.status === 'ok';

    const body = {
      status: isHealthy ? 'ok' : 'degraded',
      version: APP_VERSION,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      db,
      redis: redisResult,
      ai: aiResult,
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

  // Yüzeysel (Shallow) health check - hızlı döner
  return NextResponse.json(
    { status: 'ok', version: APP_VERSION, timestamp: new Date().toISOString() },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}
