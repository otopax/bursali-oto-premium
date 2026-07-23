import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { withIdempotency, completeIdempotency } from '@/lib/middleware/idempotency';

// GET: İş Emirlerini Listele (Tenant'a Göre - Mobil Uyumlu)
export async function GET(req) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized. Tenant ID is required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // PENDING, IN_PROGRESS vb.
    const limit = parseInt(searchParams.get('limit') || '50');
    // Faz 4: Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const query = {
      where: {
        tenantId: session.user.tenantId,
      },
      include: {
        vehicle: {
          include: {
            customer: true
          }
        },
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: skip
    };

    if (status) {
      query.where.status = status;
    }

    const [workOrders, total] = await prisma.$transaction([
      prisma.workOrder.findMany(query),
      prisma.workOrder.count({ where: query.where })
    ]);

    return NextResponse.json({ success: true, data: workOrders, meta: { total, page, limit } });
  } catch (error) {
    console.error('WorkOrders GET Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Yeni İş Emri Oluştur (Mobil Uyumlu)
export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Faz 4: Idempotency Kontrolü
    const { isIdempotent, error, record, cachedResponse, status } = await withIdempotency(req, session.user.id);
    if (isIdempotent) {
      if (error) return NextResponse.json({ error }, { status });
      return NextResponse.json(cachedResponse, { status });
    }

    // Request stream consume edildiği için cloned req üzerinden body parse yapıldı
    // `req.json()` çalışmayabilir çünkü middleware'de `.text()` ile okuduk.
    // Ancak next/server'da bazen multiple read izni verilir. 
    // Daha güvenli olması için klon kullanarak body alıyoruz.
    const body = await req.clone().json();
    const { plate, phone, firstName, brand, model, year, complaint, mileage, notes, vehicleId } = body;

    let targetVehicleId = vehicleId;

    if (!targetVehicleId) {
      if (!plate || !phone || !firstName) {
        return NextResponse.json({ error: 'Plaka, Telefon ve İsim alanları zorunludur.' }, { status: 400 });
      }

      // Find or create customer
      let customer = await prisma.customer.findFirst({
        where: { tenantId: session.user.tenantId, phone: phone }
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            tenantId: session.user.tenantId,
            firstName,
            phone
          }
        });
      }

      // Find or create vehicle
      let vehicle = await prisma.customerVehicle.findFirst({
        where: { tenantId: session.user.tenantId, plate: plate }
      });

      if (!vehicle) {
        vehicle = await prisma.customerVehicle.create({
          data: {
            tenantId: session.user.tenantId,
            customerId: customer.id,
            plate: plate,
            brand: brand || 'Bilinmiyor',
            model: model || 'Bilinmiyor',
            year: year ? parseInt(year) : null
          }
        });
      }
      
      targetVehicleId = vehicle.id;
    }

    // Faz 4: Transactional Outbox Pattern
    const idempotencyKey = record?.key || null;
    
    const result = await prisma.$transaction(async (tx) => {
      const workOrder = await tx.workOrder.create({
        data: {
          tenantId: session.user.tenantId,
          vehicleId: targetVehicleId,
          complaint: complaint,
          mileage: mileage ? parseInt(mileage) : null,
          notes: notes,
          status: 'PENDING',
          idempotencyKey: idempotencyKey
        },
        include: {
          vehicle: true
        }
      });

      // Outbox event oluştur
      await tx.outboxEvent.create({
        data: {
          aggregateType: 'WorkOrder',
          aggregateId: workOrder.id,
          eventType: 'WorkOrderCreated',
          eventVersion: 'v1',
          payload: {
            id: workOrder.id,
            tenantId: workOrder.tenantId,
            vehicleId: workOrder.vehicleId,
            status: workOrder.status
          },
          status: 'PENDING'
        }
      });

      return workOrder;
    });

    const responsePayload = { success: true, data: result };

    // Idempotency kaydını tamamla
    if (record?.key) {
      await completeIdempotency(record.key, responsePayload);
    }

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error) {
    console.error('WorkOrder POST Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
