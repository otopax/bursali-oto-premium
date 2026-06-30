import { NextResponse } from 'next/server';
import { SearchEngine } from '@/domains/Search/SearchEngine';
import logger from '@/lib/logger';

/**
 * Global Search API
 * GET /api/search?q=radyo&type=fuse
 */
export async function GET(request) {
  const globalStartTimer = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all'; // fuse, fault, all
    
    if (!query) {
      return NextResponse.json({ error: 'Arama sorgusu (q) zorunludur.' }, { status: 400 });
    }

    let results = {};

    if (type === 'fuse' || type === 'all') {
      const startTimer = Date.now();
      const fuseResults = await SearchEngine.searchFuses(query, 20);
      const ms = Date.now() - startTimer;
      
      results.fuses = {
        data: fuseResults,
        timeMs: ms,
        count: fuseResults.length
      };
    }

    if (type === 'fault' || type === 'all') {
      const startTimer = Date.now();
      const faultResults = await SearchEngine.searchFaultCodes(query, 20);
      const ms = Date.now() - startTimer;
      results.faults = {
        data: faultResults,
        timeMs: ms,
        count: faultResults.length
      };
    }

    const totalMs = Date.now() - globalStartTimer;
    
    // V4.0 Observability: Log Search Engine Performance
    logger.info('Search Query Executed', { 
      query, 
      type, 
      totalTimeMs: totalMs,
      fuseCount: results.fuses?.count || 0,
      faultCount: results.faults?.count || 0 
    });

    return NextResponse.json({
      success: true,
      query,
      timeMs: totalMs,
      results
    });

  } catch (error) {
    logger.error('Search API Error', { error: error.message, stack: error.stack });
    return NextResponse.json(
      { error: 'Arama motorunda geçici bir hata oluştu.' },
      { status: 500 }
    );
  }
}
