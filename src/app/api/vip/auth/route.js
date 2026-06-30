import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { rateLimit } from '@/lib/rate-limit'; // V4 Güvenlik: Brute force engelleme

const prisma = new PrismaClient();

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

    // Boşlukları temizle ve büyük harfe çevir
    const cleanPlate = plate.replace(/\s+/g, '').toUpperCase();
    const cleanPhone = phone.replace(/\s+/g, '');

    // Veritabanında arama
    const vehicle = await prisma.customerVehicle.findFirst({
      where: {
        plate: cleanPlate,
        customer: {
          phone: cleanPhone
        }
      },
      include: {
        customer: true,
        workOrders: {
          include: {
            items: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        tenant: {
          select: {
            name: true // Sadece servis adını gönder
          }
        }
      }
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Bu plaka ve telefon numarasına ait aktif bir kayıt bulunamadı.' }, { status: 404 });
    }

    // Mobil uygulama için güvenli bir 'session token' (JWT) üretilebilir, 
    // şimdilik doğrudan veriyi (Magic Login gibi) dönüyoruz.
    return NextResponse.json({ 
      success: true, 
      data: {
        vehicleInfo: {
          id: vehicle.id,
          plate: vehicle.plate,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          vin: vehicle.vin
        },
        customerInfo: {
          firstName: vehicle.customer.firstName,
          lastName: vehicle.customer.lastName
        },
        serviceName: vehicle.tenant.name,
        history: vehicle.workOrders
      } 
    });

  } catch (error) {
    console.error('VIP Auth Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
