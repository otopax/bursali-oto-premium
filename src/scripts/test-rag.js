import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

async function testRAG() {
  const query = process.argv.slice(2).join(' ') || "Volvo XC60 DPF verimsiz hatası nedir?";
  console.log(`[RAG TEST] Soru: "${query}"`);

  try {
    const embedRes = await ai.models.embedContent({ 
        model: 'text-embedding-004', 
        contents: query 
    });
    const vectorStr = `[${embedRes.embeddings[0].values.join(',')}]`;

    const results = await prisma.$queryRawUnsafe(`
      SELECT f.code, f.description, (f.embedding <=> $1::vector) as distance
      FROM "FaultCode" f
      WHERE (f.embedding <=> $1::vector) < 0.2
      ORDER BY (f.embedding <=> $1::vector) ASC
      LIMIT 1
    `, vectorStr);

    if (results && results.length > 0) {
      console.log(`[RAG SONUÇ] En iyi eşleşen arıza kodu: ${results[0].code}`);
      console.log(`[RAG SONUÇ] Mesafe (Distance): ${results[0].distance}`);
      console.log(`[RAG SONUÇ] Açıklama: ${results[0].description}`);
    } else {
      console.log(`[RAG SONUÇ] Uygun eşleşme bulunamadı (Distance > 0.2).`);
    }

  } catch (error) {
    console.error('[RAG TEST HATA]', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRAG();
