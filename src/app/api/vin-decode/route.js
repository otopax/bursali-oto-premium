import { NextResponse } from 'next/server';
import { decodeVin } from '@/lib/vinService';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req) {
  try {
    // Basic Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitStatus = await rateLimit(ip, 20, 60); // 20 requests per minute
    if (!limitStatus.success) {
      return NextResponse.json({ error: 'Çok fazla istek gönderildi.' }, { status: 429 });
    }

    const body = await req.json();
    const { vin } = body;

    if (!vin || vin.length !== 17) {
      return NextResponse.json({ error: 'Geçersiz şasi numarası. 17 haneli olmalıdır.' }, { status: 400 });
    }

    const result = await decodeVin(vin.toUpperCase());

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('VIN Decode API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
