import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Build-güvenli: DB sorgusu yalnızca çalışma anında koşar, statik toplamada değil.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const totalResult = await prisma.$queryRaw`SELECT count(id) as c FROM "FaultCode"`;
    const embeddedResult = await prisma.$queryRaw`SELECT count(id) as c FROM "FaultCode" WHERE embedding IS NOT NULL`;
    
    const totalCount = Number(totalResult?.[0]?.c || 0);
    const embeddedCount = Number(embeddedResult?.[0]?.c || 0);
    const coverage = totalCount > 0 ? ((embeddedCount / totalCount) * 100).toFixed(2) : '100.00';

    return NextResponse.json({
      success: true,
      data: {
        totalFaultCodes: totalCount,
        embeddedFaultCodes: embeddedCount,
        coveragePercentage: `${coverage}%`
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
