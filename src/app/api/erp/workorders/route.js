import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

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
    const { customerId, vehicleId, complaint, mileage, notes } = body;

    if (!vehicleId) {
      return NextResponse.json({ error: 'Vehicle ID is required.' }, { status: 400 });
    }

    const workOrder = await prisma.workOrder.create({
      data: {
        tenantId: session.user.tenantId,
        vehicleId: vehicleId,
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
