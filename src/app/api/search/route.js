import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';
import Redis from 'ioredis';
import { rateLimit } from '@/lib/rate-limit';

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: 1,
  connectTimeout: 2000,
});

export async function GET(request) {
  // Rate Limit Check (60 requests per minute per IP)
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitStatus = await rateLimit(ip, 60, 60);
  
  if (!limitStatus.success) {
    return NextResponse.json(
      { error: 'Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limitStatus.limit.toString(),
          'X-RateLimit-Remaining': limitStatus.remaining.toString(),
          'Retry-After': limitStatus.resetIn.toString()
        }
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  const cacheKey = `search:cache:${q.toLowerCase().trim()}`;

  try {
    // 1. Check Redis Cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json({ results: JSON.parse(cachedData), cached: true });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
    
    // Vektör araması (RAG)
    const embedRes = await ai.models.embedContent({ model: 'gemini-embedding-001', contents: q });
    const vectorStr = `[${embedRes.embeddings[0].values.join(',')}]`;

    // pgvector sorgusu: En yakın 5 arıza kodunu getir (Cosine Similarity)
    const results = await prisma.$queryRawUnsafe(`
      SELECT 
        fc.code,
        fc."aiAnalysis",
        m.name as model_name,
        m.slug as model_slug,
        b.name as brand_name,
        b.slug as brand_slug,
        1 - (fc.embedding <=> $1::vector) as similarity
      FROM "FaultCode" fc
      JOIN "Model" m ON fc."modelId" = m.id
      JOIN "Brand" b ON m."brandId" = b.id
      ORDER BY fc.embedding <=> $1::vector
      LIMIT 5;
    `, vectorStr);

    // Sonuçları JSON'a dönüştür (aiAnalysis verisini deserialize et)
    const formattedResults = results.map(r => ({
      code: r.code,
      brand: r.brand_name,
      brandSlug: r.brand_slug,
      model: r.model_name,
      modelSlug: r.model_slug,
      similarity: r.similarity,
      description: r.aiAnalysis ? r.aiAnalysis.description : 'Açıklama bulunamadı.',
      url: `/tr/ariza-cozumleri/${r.brand_slug}/${r.model_slug}/${r.code}`
    }));

    // Eğer benzerlik %65'in altındaysa sonuçları gösterme (alakasız arama olabilir)
    const filteredResults = formattedResults.filter(r => r.similarity > 0.65);

    // 2. Save to Redis Cache (24 hours TTL)
    await redis.set(cacheKey, JSON.stringify(filteredResults), 'EX', 86400);

    return NextResponse.json({ results: filteredResults, cached: false });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Arama sırasında hata oluştu' }, { status: 500 });
  }
}

