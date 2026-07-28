import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GEÇİCİ DEBUG UCU — searchFaultCode graph sorgusunu izole test eder. Doğrulama sonrası SİLİNMELİ.
// /api/diag-fault?code=P0087
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const includeGraph = {
  parts: { select: { name: true, oemNumber: true, category: true, price: true, currency: true, stock: true } },
  repairVideos: { select: { title: true, url: true, source: true } },
  sensor: { select: { name: true, type: true } },
};

export async function GET(request) {
  const code = (request.nextUrl.searchParams.get('code') || 'P0087').trim().toUpperCase();
  const out = { code };
  try { out.count = await prisma.faultCode.count(); } catch (e) { out.countErr = e.message; }
  try { out.exact = await prisma.faultCode.findUnique({ where: { code }, include: includeGraph }); } catch (e) { out.exactErr = e.message; }
  try { out.insensitive = await prisma.faultCode.findFirst({ where: { code: { equals: code, mode: 'insensitive' } }, include: includeGraph }); } catch (e) { out.insensitiveErr = e.message; }
  return NextResponse.json(out);
}
