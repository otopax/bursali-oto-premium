import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/cache';

export const dynamic = 'force-dynamic';

const CHECK_TIMEOUT_MS = 1500;

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
    return { status: 'ok', latency_ms: Date.now() - started };
  } catch (error) {
    return { status: 'critical', latency_ms: Date.now() - started, error: error.message };
  }
}

async function checkRedis() {
  const started = Date.now();
  try {
    const ping = redis.ping ? await redis.ping() : await redis.get('non_existent');
    return { status: 'ok', latency_ms: Date.now() - started };
  } catch (error) {
    return { status: 'degraded', latency_ms: Date.now() - started, error: error.message };
  }
}

export async function GET() {
  const start = Date.now();
  
  const [dbResult, redisResult] = await Promise.all([
    checkDb(),
    checkRedis()
  ]);

  const isCritical = dbResult.status === 'critical';
  const isDegraded = redisResult.status === 'degraded' || dbResult.status === 'degraded';

  let overallStatus = 'healthy';
  if (isCritical) overallStatus = 'critical';
  else if (isDegraded) overallStatus = 'degraded';

  const responseBody = {
    status: overallStatus,
    environment: process.env.NODE_ENV || 'production',
    uptime: process.uptime(),
    database: dbResult,
    redis: redisResult,
    ai: {
      status: 'ok' // Can be enhanced by calling AI Orchestrator's Circuit Breaker state
    },
    timestamp: new Date().toISOString()
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
