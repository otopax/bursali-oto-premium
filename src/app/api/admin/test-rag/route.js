import { NextResponse } from 'next/server';

// Build-güvenli: ChatService zincirinin build sırasında derlenip TDZ/circular
// hatası vermesini önler (route yalnızca çalışma anında değerlendirilir).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || 'BMW motor isinma sorunu';

  try {
    // Lazy import: ağır ChatService chunk'ı build'de değil, istek anında yüklenir.
    const { ChatService } = await import('@/services/ChatService');
    const service = new ChatService();
    const results = await service.semanticSearch(q, 3); // top 3

    return NextResponse.json({
      success: true,
      query: q,
      results
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
