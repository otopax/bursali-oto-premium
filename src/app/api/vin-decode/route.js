import { NextResponse } from 'next/server';
import { decodeVin } from '@/lib/vinService';
import { rateLimit } from '@/lib/rate-limit';
import { validate } from '@/lib/validate';
import { z } from 'zod';
import { CloudflareKV } from '@/lib/cloudflare/kv';

const vinSchema = z.object({
  vin: z.string().length(17)
});

async function postHandler(req) {
  try {
    // Basic Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitStatus = await rateLimit(ip, 20, 60); // 20 requests per minute
    if (!limitStatus.success) {
      return NextResponse.json({ error: 'Çok fazla istek gönderildi.' }, { status: 429 });
    }

    const { vin } = req.valid.body;
    const normalizedVin = vin.toUpperCase();

    // 1. Check Cloudflare KV Cache
    const cachedData = await CloudflareKV.getVinCache(normalizedVin);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const result = await decodeVin(normalizedVin);

    if (result.success) {
      // 2. Set Cloudflare KV Cache (background)
      CloudflareKV.setVinCache(normalizedVin, result).catch(e => console.error('KV set error', e));
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('VIN Decode API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}

export const POST = validate({ body: vinSchema }, postHandler);
