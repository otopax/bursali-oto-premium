import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function PUT(req, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { status, complaint, mileage, notes } = body;

    const dataToUpdate = {};
    if (status) dataToUpdate.status = status;
    if (complaint !== undefined) dataToUpdate.complaint = complaint;
    if (mileage !== undefined) dataToUpdate.mileage = mileage ? parseInt(mileage) : null;
    if (notes !== undefined) dataToUpdate.notes = notes;

    if (status === 'COMPLETED') {
      dataToUpdate.completedAt = new Date();
    }

    const workOrder = await prisma.workOrder.updateMany({
      where: {
        id: id,
        tenantId: session.user.tenantId
      },
      data: dataToUpdate
    });

    if (workOrder.count === 0) {
      return NextResponse.json({ error: 'Work order not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, updated: workOrder.count });
  } catch (error) {
    console.error('WorkOrder PUT Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.workOrder.findUnique({
      where: { 
        id: id,
        tenantId: session.user.tenantId
      },
      include: {
        items: true,
        vehicle: {
          include: {
            customer: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('WorkOrder GET Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
