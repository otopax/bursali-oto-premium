export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const leads = await prisma.socialLead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, status } = await request.json();
    const updatedLead = await prisma.socialLead.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    return NextResponse.json(updatedLead);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const newLead = await prisma.socialLead.create({
      data: {
        platform: data.platform || 'WEBSITE_BOT',
        name: data.name || 'Bot Ziyaretçisi',
        phone: data.phone,
        vehicle: data.vehicle || '',
        symptoms: data.symptoms || '',
        status: 'NEW'
      }
    });
    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
