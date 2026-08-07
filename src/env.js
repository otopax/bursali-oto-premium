import { z } from 'zod';

const envSchema = z.object({
  // Required Node Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Required Database
  DATABASE_URL: z.string().url("Geçerli bir Postgres DATABASE_URL sağlanmalı").default('postgresql://admin:dummy@localhost:5432/bursali_oto'),

  // Required Redis (for Resiliency, Quota, Rate Limit, BullMQ)
  REDIS_URL: z.string().url("Geçerli bir REDIS_URL sağlanmalı").optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Required AI
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),

  // Authentication
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(10, "Güvenli bir NEXTAUTH_SECRET tanımlanmalı").optional(),
});

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD === 'true' || !process.env.DATABASE_URL;
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  
  if (process.env.NODE_ENV === 'production' && !isBuildPhase) {
    throw new Error("Invalid environment variables");
  }
}

export const env = _env.success ? _env.data : process.env;
