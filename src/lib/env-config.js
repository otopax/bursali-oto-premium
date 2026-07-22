import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url("Geçerli bir veritabanı URL'si girilmelidir."),
  GEMINI_API_KEY: z.string().min(30, "Gemini API anahtarı geçersiz veya çok kısa."),
  REDIS_URL: z.string().url("Geçerli bir Redis URL'si girilmelidir.").optional(),
  UPSTASH_REDIS_REST_URL: z.string().url("Geçerli bir Upstash URL'si girilmelidir.").optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(10, "Upstash Token geçersiz.").optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(10, "Güçlü bir NextAuth Secret girilmelidir.").optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ [Enterprise Governance] Startup Failed: Invalid Configuration');
  console.error(parsed.error.flatten().fieldErrors);
  
  // Sadece production ve test ortamlarında katı şekilde çıkış yapalım,
  // dev ortamında çalışmayı tamamen kitlememek adına uyarıda da bırakılabilir 
  // ama Enterprise Standard gereği süreci öldürüyoruz.
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

export const env = parsed.data;
