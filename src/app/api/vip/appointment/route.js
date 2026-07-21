import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit'; 
import { prisma } from '@/lib/prisma';
import { validate } from '@/lib/validate';
import { z } from 'zod';

const appointmentSchema = z.object({
  plate: z.string().min(5).max(15),
  phone: z.string().min(10).max(20),
  complaint: z.string().max(1000).optional()
});

async function postHandler(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitStatus = await rateLimit(`vip_appt_${ip}`, 5, 60); 
    
    if (!limitStatus.success) {
      return NextResponse.json({ error: 'Çok fazla istek. Lütfen biraz bekleyin.' }, { status: 429 });
    }

    const { plate, phone, complaint } = req.valid.body;

    const cleanPlate = plate.replace(/\s+/g, '').toUpperCase();
    const cleanPhone = phone.replace(/\s+/g, '');

    const vehicle = await prisma.customerVehicle.findFirst({
      where: {
        plate: cleanPlate,
        customer: {
          phone: cleanPhone
        }
      },
      include: {
        customer: true,
        tenant: true
      }
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Bu plaka ve telefon numarasına ait kurumsal anlaşmalı bir kayıt bulunamadı.' }, { status: 404 });
    }

    // Create a new Work Order (Appointment)
    const workOrder = await prisma.workOrder.create({
      data: {
        tenantId: vehicle.tenantId,
        vehicleId: vehicle.id,
        status: 'PENDING',
        complaint: `[GECE VARDİYASI RANDEVUSU] - ${complaint || 'Periyodik Bakım / Kontrol'}`
      }
    });

    return NextResponse.json({ success: true, data: workOrder });
  } catch (error) {
    console.error('VIP Appointment Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = validate({ body: appointmentSchema }, postHandler);
