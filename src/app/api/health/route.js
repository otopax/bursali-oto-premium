import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import os from 'os';

// Initialize instances outside handler to avoid connection pooling issues
const prisma = new PrismaClient();

// Use global redis instance if possible to avoid connection limits
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: 1,
  connectTimeout: 2000,
});

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const status = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    os: {
      memory: {
        free: Math.round(os.freemem() / 1024 / 1024) + 'MB',
        total: Math.round(os.totalmem() / 1024 / 1024) + 'MB',
      },
      cpu: os.loadavg(),
    },
    services: {
      postgres: 'unknown',
      redis: 'unknown',
    },
    latency: {},
  };

  try {
    // 1. Check PostgreSQL
    const pgStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    status.services.postgres = 'ok';
    status.latency.postgres = `${Date.now() - pgStart}ms`;
  } catch (error) {
    status.services.postgres = 'down';
    status.errors = status.errors || {};
    status.errors.postgres = error.message;
  }

  try {
    // 2. Check Redis
    const redisStart = Date.now();
    await redis.ping();
    status.services.redis = 'ok';
    status.latency.redis = `${Date.now() - redisStart}ms`;
  } catch (error) {
    status.services.redis = 'down';
    status.errors = status.errors || {};
    status.errors.redis = error.message;
  }

  status.latency.total = `${Date.now() - startTime}ms`;

  const isHealthy = status.services.postgres === 'ok' && status.services.redis === 'ok';

  return NextResponse.json(status, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
