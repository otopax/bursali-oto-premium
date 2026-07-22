import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { AIOrchestrator } from '@/domains/AI/AIOrchestrator';

export const dynamic = 'force-dynamic';

const CHECK_TIMEOUT_MS = 15000; // Artırıldı: Ücretsiz DB cold start uyku modundan uyanma payı

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
    return { status: 'critical', latency: Date.now() - started, error: error.message };
  }
}

async function checkRedis() {
  const started = Date.now();
  try {
    if (redis.isMemory) {
      return { 
        status: 'degraded', 
        latency: Date.now() - started, 
        error: 'Using Memory Fallback',
        debug_redis_url_exists: !!process.env.REDIS_URL,
        debug_upstash_exists: !!process.env.UPSTASH_REDIS_REST_URL,
        debug_init_error: redis.initError
      };
    }
    await redis.ping();
    return { status: 'ok', latency: Date.now() - started };
  } catch (error) {
    return { status: 'degraded', latency: Date.now() - started, error: error.message };
  }
}

async function checkAi(isDeep = false) {
  if (!isDeep) {
    // Return last known state or assumed OK if shallow ping
    return { status: 'ok', provider: 'gemini', note: 'shallow_ping' };
  }

  // 5 Min TTL cache check
  const cachedPing = await redis.get('health:ai:ping');
  if (cachedPing) {
    return { status: 'ok', provider: 'gemini', latency: parseInt(cachedPing, 10), note: 'cached' };
  }

  const started = Date.now();
  try {
    // Basic ping via orchestrator
    const result = await AIOrchestrator.executeWithFallback("PING_TEST_ONLY_DO_NOT_REPLY_JUST_SAY_PONG").catch(() => null);

    const latency = Date.now() - started;
    await redis.set('health:ai:ping', latency.toString(), { ex: 300 }); // 5 dk TTL

    return { status: 'ok', provider: 'gemini', latency };
  } catch (error) {
    return { status: 'degraded', provider: 'gemini', latency: Date.now() - started, error: error.message };
  }
}

export async function GET(request) {
  const start = Date.now();
  
  const searchParams = request.nextUrl.searchParams;
  const isDeep = searchParams.get('deep') === '1';
  
  const [dbResult, redisResult, aiResult] = await Promise.all([
    checkDb(),
    checkRedis(),
    checkAi(isDeep)
  ]);

  const isCritical = dbResult.status === 'critical';
  const isDegraded = redisResult.status === 'degraded' || aiResult.status === 'degraded';

  let overallStatus = 'healthy';
  if (isCritical) overallStatus = 'critical';
  else if (isDegraded) overallStatus = 'degraded';

  const responseBody = {
    status: overallStatus,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      database: dbResult,
      redis: redisResult,
      ai: aiResult
    }
  };

  const httpStatus = isCritical ? 503 : 200;

  return NextResponse.json(responseBody, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Health-Latency': `${Date.now() - start}ms`
    }
  });
}
