import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET: İş Emirlerini Listele (Tenant'a Göre - Mobil Uyumlu)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized. Tenant ID is required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // PENDING, IN_PROGRESS vb.
    const limit = parseInt(searchParams.get('limit') || '50');

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
      take: limit
    };

    if (status) {
      query.where.status = status;
    }

    const workOrders = await prisma.workOrder.findMany(query);

    return NextResponse.json({ success: true, data: workOrders });
  } catch (error) {
    console.error('WorkOrders GET Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Yeni İş Emri Oluştur (Mobil Uyumlu)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
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

    const workOrder = await prisma.workOrder.create({
      data: {
        tenantId: session.user.tenantId,
        vehicleId: targetVehicleId,
        complaint: complaint,
        mileage: mileage ? parseInt(mileage) : null,
        notes: notes,
        status: 'PENDING'
      },
      include: {
        vehicle: true
      }
    });

    return NextResponse.json({ success: true, data: workOrder }, { status: 201 });
  } catch (error) {
    console.error('WorkOrder POST Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
