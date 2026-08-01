let sharpModule;
try {
  sharpModule = require('sharp');
} catch (_) {
  sharpModule = null;
}

import crypto from 'crypto';
import { z } from 'zod';
import { generateObject } from 'ai';
import * as Sentry from '@sentry/nextjs';
import { container } from '@/application/di/container';
import { redis } from '@/lib/cache';
import { Logger } from '@/lib/observability/Logger';

// Structured Output Schema
const VisionAnalysisSchema = z.object({
  partName: z.string().describe("Tespit edilen parçanın adı"),
  damageType: z.string().describe("Hasar türü (örneğin: çizik, göçük, kırık, sızıntı, sağlam)"),
  severity: z.string().describe("Hasarın ciddiyet derecesi (1-10)"),
  estimatedCost: z.number().describe("Tahmini onarım maliyeti (TL)"),
  advice: z.string().describe("Müşteriye tavsiye (örneğin: 'Hemen servise gelin', 'Kullanıma engel değil')"),
});

export class VisionService {
  constructor(aiProvider) {
    this.aiProvider = aiProvider;
  }

  /**
   * İstemciden gelen Base64 resmi optimize eder.
   */
  async processImageForAI(base64Image) {
    const startTime = Date.now();
    try {
      // Data URI'dan raw base64'ü ayır
      const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
      const buffer = Buffer.from(base64Data, 'base64');
      
      let optimizedBuffer = buffer;
      if (sharpModule) {
        try {
          optimizedBuffer = await sharpModule(buffer)
            .resize({ width: 1024, height: 1024, fit: 'inside' })
            .jpeg({ quality: 75, progressive: true })
            .toBuffer();
        } catch (_) {}
      }
      
      const processTimeMs = Date.now() - startTime;
      const sizeKb = Math.round(optimizedBuffer.length / 1024);

      // Sentry Metrics
      try {
        Sentry.metrics.distribution('ai.vision.image_size_kb', sizeKb, { unit: 'kilobyte' });
        Sentry.metrics.distribution('ai.vision.process_time_ms', processTimeMs, { unit: 'millisecond' });
      } catch (e) {
        Logger.warn('Sentry Metrics Error', e.message);
      }

      Logger.info(`Image processed for AI: ${sizeKb}KB in ${processTimeMs}ms`);
      
      return optimizedBuffer.toString('base64');
    } catch (error) {
      Logger.error('Image Processing Error', error);
      throw new Error('IMAGE_PROCESSING_FAILED');
    }
  }

  /**
   * Resmin hash'ini (SHA-256) oluşturur.
   */
  generateImageHash(base64Image, prompt) {
    return crypto.createHash('sha256').update(base64Image + (prompt || '')).digest('hex');
  }

  /**
   * Resmi ve Prompt'u alır, Cache'i kontrol eder, yoksa AI'a yollar ve JSON döner.
   */
  async analyzeImage(base64Image, userPrompt) {
    // 1. Resmi Optimize Et
    const optimizedBase64 = await this.processImageForAI(base64Image);
    
    // 2. Semantic Cache (Görsel Versiyonu) Kontrolü
    const hash = this.generateImageHash(optimizedBase64, userPrompt);
    const cacheKey = `vision_cache:${hash}`;
    
    try {
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult) {
        Logger.info('Vision Cache Hit', { hash });
        return { source: 'cache', data: typeof cachedResult === 'string' ? JSON.parse(cachedResult) : cachedResult };
      }
    } catch (e) {
      Logger.warn('Redis Cache Error (Fail-Open)', e);
    }

    // 3. AI SDK ile Analiz (Structured Output)
    const systemPrompt = "Bu araç parçası fotoğrafını analiz et. Eğer hasar varsa, hasar türünü (çizik, göçük, kırık, sızıntı vb.) belirle. Sadece JSON formatında cevap ver. Açıklama yapma.";
    
    try {
      const googleProvider = this.aiProvider.getProvider();
      
      // AI SDK Image type takes string (base64) or Uint8Array or URL. Wait, the `ai` docs: 
      // `image: new URL('data:image/jpeg;base64,...')` or Uint8Array. 
      // Actually `image: new URL('data:image/jpeg;base64,' + optimizedBase64)` is standard.
      // Wait, Vercel AI SDK 3.x/4.x requires `image: new URL(...)` or buffer. Let's use Buffer.
      const imageBuffer = Buffer.from(optimizedBase64, 'base64');

      const { object, usage } = await generateObject({
        model: googleProvider('gemini-2.5-flash'), // Flash modeli vision destekler ve ucuzdur
        schema: VisionAnalysisSchema,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: [
              { type: 'text', text: userPrompt || 'Bu parçadaki hasarı analiz et.' },
              { type: 'image', image: imageBuffer }
            ] 
          }
        ],
      });

      // Token Tracking via Sentry
      if (usage && usage.totalTokens) {
        try {
          Sentry.metrics.distribution('ai.token.usage', usage.totalTokens, { unit: 'count', tags: { type: 'vision' } });
        } catch (e) {
          // ignore
        }
      }

      // 4. Sonucu Cache'le
      try {
        await redis.set(cacheKey, JSON.stringify(object), { ex: 604800 }); // 7 gün
      } catch (e) {
        Logger.warn('Redis Cache Set Error', e);
      }

      return { source: 'ai', data: object };
    } catch (error) {
      Logger.error('Vision AI Error', error);
      throw new Error('VISION_AI_FAILED');
    }
  }
}
