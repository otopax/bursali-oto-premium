import { z } from 'zod';

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD === 'true' || !process.env.DATABASE_URL;

const envSchema = z.object({
  DATABASE_URL: z.string().url("Geçerli bir veritabanı URL'si girilmelidir.").default('postgresql://admin:dummy@localhost:5432/bursali_oto'),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().default('AIzaSyDummyKeyForBuildPhaseValidation12345'),
  REDIS_URL: z.string().url("Geçerli bir Redis URL'si girilmelidir.").optional(),
  UPSTASH_REDIS_REST_URL: z.string().url("Geçerli bir Upstash URL'si girilmelidir.").optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(10, "Upstash Token geçersiz.").optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(10, "Güçlü bir NextAuth Secret girilmelidir.").optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success && !isBuildPhase) {
  console.error('❌ [Enterprise Governance] Startup Failed: Invalid Configuration');
  console.error(parsed.error.flatten().fieldErrors);
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

export const env = parsed.data;
