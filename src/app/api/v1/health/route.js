import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/cache';

export const dynamic = 'force-dynamic';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '2.4.1';
const BUILD_NUMBER = process.env.NEXT_PUBLIC_BUILD_NUMBER || 'a1b2c3';
const GIT_COMMIT = process.env.NEXT_PUBLIC_GIT_COMMIT || '7d4e6fa';
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
    return { status: 'down', latency_ms: Date.now() - started, error: error.message };
  }
}

async function checkRedis() {
  const started = Date.now();
  try {
    const ping = redis.ping ? await redis.ping() : await redis.get('non_existent');
    return { status: 'ok', latency_ms: Date.now() - started };
  } catch (error) {
    return { status: 'down', latency_ms: Date.now() - started, error: error.message };
  }
}

export async function GET() {
  const start = Date.now();
  
  const [dbResult, redisResult] = await Promise.all([
    checkDb(),
    checkRedis()
  ]);

  const isDegraded = dbResult.status !== 'ok' || redisResult.status !== 'ok';

  const responseBody = {
    status: isDegraded ? 'degraded' : 'healthy',
    environment: process.env.NODE_ENV || 'production',
    version: APP_VERSION,
    build: BUILD_NUMBER,
    commit: GIT_COMMIT,
    uptime: process.uptime(),
    database: dbResult,
    redis: redisResult,
    ai: {
      status: 'ok' // Can be enhanced by calling AI Orchestrator's Circuit Breaker state
    },
    timestamp: new Date().toISOString()
  };

  const httpStatus = isDegraded ? 503 : 200;

  return NextResponse.json(responseBody, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Health-Latency': `${Date.now() - start}ms`
    }
  });
}
