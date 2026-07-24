import { NextResponse } from 'next/server';
import { ChatService } from '@/services/ChatService';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || 'BMW motor isinma sorunu';
  
  try {
    const service = new ChatService();
    const results = await service.semanticSearch(q, 3); // top 3 results

    return NextResponse.json({
      success: true,
      query: q,
      results: results
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
