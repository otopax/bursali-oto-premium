export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30 seconds

import { z } from 'zod';
import { validate } from '@/lib/validate';
import { rateLimit } from '@/lib/rate-limit';
import { getToken } from 'next-auth/jwt';
import { ChatService } from '@/services/ChatService';

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
    const limitStatus = await rateLimit(ip, 30, 60, { failClosed: true });
    
    if (!limitStatus.success) {
      return new Response('Too Many Requests', { status: 429 });
    }

    const { messages, vehicleContext, guestId } = req.valid.body;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || 'BursaliOtoSecretKey2026' });

    // 2. Delegate to Application Service (DDD)
    const result = await ChatService.executeChatFlow({ 
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
    return result.toDataStreamResponse ? result.toDataStreamResponse() : 
           result.toUIMessageStreamResponse ? result.toUIMessageStreamResponse() : 
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
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export const POST = validate({ body: chatBodySchema }, postHandler);
