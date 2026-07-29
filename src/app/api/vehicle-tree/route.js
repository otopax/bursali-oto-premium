import { NextResponse } from 'next/server';
import { getBrands, getModels, getGenerations, getEngines } from '@/lib/vehicleTree';

// Araç ağacı kademeli API (Sanal Usta / Kütüphane / Arıza Çözümleri / VIP Garaj ortak kaynağı)
//   GET /api/vehicle-tree                                  → { brands }
//   GET /api/vehicle-tree?brand=bmw                        → { models }
//   GET /api/vehicle-tree?brand=bmw&modelGroupId=dg_1000045→ { generations }
//   GET /api/vehicle-tree?brand=bmw&modelId=d_770          → { engines }
export const runtime = 'nodejs';
export const revalidate = 86400; // ağaç statiktir; günlük ISR yeter

export async function GET(request) {
  const p = request.nextUrl.searchParams;
  const brand = p.get('brand');
  const modelGroupId = p.get('modelGroupId');
  const modelId = p.get('modelId');

  try {
    if (!brand) return NextResponse.json({ brands: getBrands() });
    if (modelId) return NextResponse.json({ brand, modelId, engines: getEngines(brand, modelId) });
    if (modelGroupId) return NextResponse.json({ brand, modelGroupId, generations: getGenerations(brand, modelGroupId) });
    return NextResponse.json({ brand, models: getModels(brand) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
