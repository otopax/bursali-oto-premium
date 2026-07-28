import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GEÇİCİ ÖLÇÜM UCU — Bilgi grafiği doluluk raporu (yalnızca SAYIM döner, PII yok).
// Admin-dışı yolda; middleware /api/admin korumasına takılmaz. Ölçüm alınınca SİLİNMELİDİR.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const [faultCodes, parts, videos, diag, diagWithOutcome, customerVehicles] = await Promise.all([
      prisma.faultCode.count(),
      prisma.part.count(),
      prisma.repairVideo.count(),
      prisma.diagnosticLog.count(),
      prisma.diagnosticLog.count({ where: { actualOutcome: { not: null } } }),
      prisma.customerVehicle.count(),
    ]);

    const [partsWithPrice, partsInStock, fcWithParts, fcWithVideos, fcWithSolution] = await Promise.all([
      prisma.part.count({ where: { price: { not: null } } }),
      prisma.part.count({ where: { stock: { gt: 0 } } }),
      prisma.faultCode.count({ where: { parts: { some: {} } } }),
      prisma.faultCode.count({ where: { repairVideos: { some: {} } } }),
      prisma.faultCode.count({ where: { stepByStepSolution: { not: null } } }),
    ]);

    let fcWithEmbedding = null;
    try {
      const r = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS c FROM "FaultCode" WHERE embedding IS NOT NULL`);
      fcWithEmbedding = r && r[0] ? r[0].c : null;
    } catch (e) { fcWithEmbedding = 'err'; }

    return NextResponse.json({
      ok: true,
      faultCode: { total: faultCodes, withParts: fcWithParts, withVideos: fcWithVideos, withSolution: fcWithSolution, withEmbedding: fcWithEmbedding },
      part: { total: parts, withPrice: partsWithPrice, inStock: partsInStock },
      repairVideo: { total: videos },
      diagnosticLog: { total: diag, withActualOutcome: diagWithOutcome },
      customerVehicle: { total: customerVehicles },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
