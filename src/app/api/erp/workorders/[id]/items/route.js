import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req, { params }) {
  try {
    const session = await auth();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { type, name, quantity, unitPrice, taxRate, discount } = body;

    if (!type || !name || quantity === undefined || unitPrice === undefined) {
      return NextResponse.json({ error: 'Eksik veri gönderildi.' }, { status: 400 });
    }

    const item = await prisma.workOrderItem.create({
      data: {
        workOrderId: id,
        type: type, // "PART" veya "LABOR"
        name: name,
        quantity: parseFloat(quantity),
        unitPrice: parseFloat(unitPrice),
        taxRate: parseFloat(taxRate) || 20,
        discount: parseFloat(discount) || 0
      }
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('WorkOrderItem Create Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
