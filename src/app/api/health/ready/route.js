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
    return { status: 'UP', latency: Date.now() - started };
  } catch (error) {
    return { status: 'DOWN', latency: Date.now() - started, error: error.message };
  }
}

async function checkRedis() {
  const started = Date.now();
  try {
    if (redis.isMemory) {
      return { 
        status: 'DEGRADED', 
        latency: Date.now() - started, 
        error: 'Using Memory Fallback',
      };
    }
    await redis.ping();
    return { status: 'UP', latency: Date.now() - started };
  } catch (error) {
    return { status: 'DOWN', latency: Date.now() - started, error: error.message };
  }
}

async function checkAi(isDeep = false) {
  if (!isDeep) {
    return { status: 'UP', latency: 0, note: 'shallow_ping' };
  }
  const started = Date.now();
  try {
    const result = await AIOrchestrator.executeWithFallback("PING_TEST_ONLY_DO_NOT_REPLY_JUST_SAY_PONG").catch(() => null);
    return { status: 'UP', latency: Date.now() - started };
  } catch (error) {
    return { status: 'DOWN', latency: Date.now() - started, error: error.message };
  }
}

async function checkVector() {
  const started = Date.now();
  try {
    const res = await withTimeout(prisma.$queryRaw`SELECT count(id) as c FROM "FaultCode" WHERE embedding IS NOT NULL`, CHECK_TIMEOUT_MS, 'vector');
    const total = await withTimeout(prisma.$queryRaw`SELECT count(id) as c FROM "FaultCode"`, CHECK_TIMEOUT_MS, 'total');
    
    const count = Number(res?.[0]?.c || 0);
    const totalCount = Number(total?.[0]?.c || 0);
    const coverage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(2) + '%' : '0%';
    
    return { status: count > 0 ? 'UP' : 'DOWN', coverage, latency: Date.now() - started };
  } catch (error) {
    return { status: 'DOWN', latency: Date.now() - started, error: error.message };
  }
}

export async function GET(request) {
  const start = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const isDeep = searchParams.get('deep') === '1';
  
  const [dbResult, redisResult, aiResult, vectorResult] = await Promise.all([
    checkDb(),
    checkRedis(),
    checkAi(isDeep),
    checkVector()
  ]);

  const isCritical = dbResult.status === 'DOWN';
  const isDegraded = redisResult.status === 'DEGRADED' || aiResult.status === 'DOWN' || vectorResult.status === 'DOWN';

  let overallStatus = 'healthy';
  if (isCritical) overallStatus = 'critical';
  else if (isDegraded) overallStatus = 'degraded';

  const responseBody = {
    status: overallStatus,
    checks: {
      database: dbResult,
      redis: redisResult,
      gemini: aiResult,
      vector: vectorResult
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
