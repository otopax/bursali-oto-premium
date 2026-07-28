import { z } from 'zod';
import { validate } from '@/lib/validate';
import { rateLimit } from '@/lib/rate-limit';
import { getToken } from 'next-auth/jwt';
import { container } from '@/application/di/container';
import { Logger } from '@/lib/observability/Logger';

// Sadece Base64 resim ve prompt bekliyoruz.
const visionBodySchema = z.object({
  image: z.string().describe("Base64 encoded image string"),
  prompt: z.string().optional().describe("Kullanıcıdan gelen opsiyonel açıklama"),
  guestId: z.string().optional().nullable()
});

async function postHandler(req) {
  try {
    const { image, prompt, guestId } = req.valid.body;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || 'BursaliOtoSecretKey2026' });

    // 1. SRE Rate Limit Identifier Priority: Auth User -> Guest ID -> IP
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const identifier = (token && token.sub) ? `usr_${token.sub}` : (guestId ? `gst_${guestId}` : `ip_${ip}`);
    
    // Vision API için Rate Limit biraz daha katı (Maliyet kontrolü)
    const limitStatus = await rateLimit('vision', identifier, {
      burstLimit: 3, burstWindow: 60,
      sustainedLimit: 10, sustainedWindow: 3600
    });
    
    if (!limitStatus.success) {
      return new Response(JSON.stringify({ error: 'rate_limit_exceeded', reason: limitStatus.reason }), { 
        status: 429, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 2. Delegate to VisionService
    const result = await container.visionService.analyzeImage(image, prompt);

    return new Response(JSON.stringify(result), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    Logger.error('Vision API Error:', error);
    
    const statusCode = error.message === 'IMAGE_PROCESSING_FAILED' ? 400 : 500;
    
    return new Response(JSON.stringify({
      error: error.message || 'Internal Server Error'
    }), { status: statusCode, headers: { 'Content-Type': 'application/json' } });
  }
}

export const POST = validate({ body: visionBodySchema }, postHandler);
