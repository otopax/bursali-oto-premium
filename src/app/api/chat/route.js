export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30 seconds

import { z } from 'zod';
import { validate } from '@/lib/validate';
import { rateLimit } from '@/lib/rate-limit';
import { getToken } from 'next-auth/jwt';
import { container } from '@/application/di/container';

const chatBodySchema = z.object({
  messages: z.array(z.any()),
  vehicleContext: z.object({
    isRegistered: z.boolean().optional(),
    year: z.union([z.number(), z.string()]).optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    chassis: z.string().optional()
  }).optional().nullable(),
  guestId: z.string().optional().nullable()
});

async function postHandler(req) {
  try {
    // 1. Edge/Infrastructure Level Rate Limiting (Fail Closed if Redis is up)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitStatus = await rateLimit('chat', ip, 30, 60, { failClosed: true });
    
    if (!limitStatus.success) {
      return new Response('Too Many Requests', { status: 429 });
    }

    const { messages, vehicleContext, guestId } = req.valid.body;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || 'BursaliOtoSecretKey2026' });

    // 2. Delegate to Application Service (DDD)
    const result = await container.chatService.executeChatFlow({ 
      messages, 
      vehicleContext, 
      guestId, 
      token 
    });

    // If the service returned a direct Response (e.g., Cache Hit)
    if (result instanceof Response) {
      return result;
    }

    // Otherwise, return the streaming response
    // GEÇİCİ TEŞHİS (yeni anahtar sonrası hâlâ hata var — gerçek mesajı gör):
    const dbgErr = {
      onError: (e) => 'DBG: ' + String((e && (e.message || (e.error && e.error.message))) || e).slice(0, 400),
    };
    return result.toUIMessageStreamResponse ? result.toUIMessageStreamResponse(dbgErr) :
           result.toDataStreamResponse ? result.toDataStreamResponse(dbgErr) :
           result.toTextStreamResponse();

  } catch (error) {
    // Handle Domain Exceptions
    if (error.message === 'GUEST_QUOTA_EXCEEDED') {
      return new Response(JSON.stringify({ error: 'guest_quota_exceeded' }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (error.message === 'PROMPT_INJECTION_DETECTED') {
      return new Response(JSON.stringify({ error: 'prompt_injection_detected', message: 'Güvenlik ihlali tespit edildi.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.error('Chat API Error:', error);
    // GEÇİCİ TEŞHİS: gerçek hatayı gör (diagnoz sonrası geri alınacak)
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      detail: String(error && error.message || error),
      where: (error && error.stack) ? String(error.stack).split('\n').slice(0, 4).join(' | ') : ''
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export const POST = validate({ body: chatBodySchema }, postHandler);
