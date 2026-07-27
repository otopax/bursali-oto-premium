import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit'; // V4 Güvenlik: Brute force engelleme
import { getVehicleServiceStatus } from '@/lib/vipGarage';

// POST: VIP Garaj Müşteri Girişi (Plaka + Telefon) - Mobil Uyumlu
export async function POST(req) {
  try {
    // Kurumsal IP tabanlı Brute-Force Koruması (Faz 23)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitStatus = await rateLimit(`vip_login_${ip}`, 10, 60); // 1 dakikada max 10 deneme
    
    if (!limitStatus.success) {
      return NextResponse.json({ error: 'Çok fazla giriş denemesi. Lütfen 1 dakika bekleyin.' }, { status: 429 });
    }

    const body = await req.json();
    const { plate, phone } = body;

    if (!plate || !phone) {
      return NextResponse.json({ error: 'Plaka ve Telefon numarası zorunludur.' }, { status: 400 });
    }

    // Tek doğruluk kaynağı: lib/vipGarage (Sanal Usta getServiceStatus ile aynı sorgu)
    const data = await getVehicleServiceStatus(plate, phone);

    if (!data) {
      return NextResponse.json({ error: 'Bu plaka ve telefon numarasına ait aktif bir kayıt bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('VIP Auth Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
