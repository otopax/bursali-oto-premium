import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { DataAccessLayer } from '@/lib/dataAccessLayer';
import { getSystemPrompt } from '@/lib/ai/promptRegistry';
import { getAiCache, setAiCache } from '@/lib/ai/semanticCache';
import { checkHallucination } from '@/lib/ai/hallucinationGuard';
import { rateLimit } from '@/lib/rate-limit';

export const maxDuration = 30; // 30 seconds

import { getCache, setCache } from '@/lib/cache';

export async function POST(req) {
  // IP tabanlı kurumsal Rate Limiting
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitStatus = await rateLimit(ip, 30, 60);
  
  if (!limitStatus.success) {
    return new Response('Too Many Requests', { status: 429 });
  }

  const { messages } = await req.json();

  // 1. Semantic Cache Kontrolü (Aynı sohbet geçmişi var mı?)
  const cachedResponse = await getAiCache(messages);
  if (cachedResponse) {
    // Return mock stream response for cached text
    // The vercel AI sdk expects a stream, but for cached text we can just return the raw text if handled properly by client
    // Or we return a single chunk stream. We'll return 0:"text" format that AI SDK uses
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`0:"${cachedResponse.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n`));
        controller.close();
      }
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-AI-Cache': 'HIT' } });
  }

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: getSystemPrompt('CHAT_BOT', 'v2'),
    messages,
    tools: {
      getBrands: tool({
        description: 'Sistemde verisi bulunan araç markalarını listeler.',
        parameters: z.object({}),
        execute: async () => {
          return { brands: await DataAccessLayer.getFaultBrands() };
        },
      }),
      searchFaultCode: tool({
        description: 'Verilen marka, model ve arıza kodu (örn: P0171) için veritabanında analiz olup olmadığını kontrol eder.',
        parameters: z.object({
          brand: z.string().describe('Araç markası (örn: acura)'),
          model: z.string().describe('Araç modeli slug formatında (örn: acura_adx_2025_2026_fuses)'),
          code: z.string().describe('Arıza kodu (örn: P0171)')
        }),
        execute: async ({ brand, model, code }) => {
          const cacheKey = `fault_${brand}_${model}_${code}`;
          const cachedResult = await getCache(cacheKey);
          if (cachedResult) return cachedResult;

          const data = await DataAccessLayer.getFaultCodeAnalysis(brand, model, code);
          if (data) {
            const response = {
              success: true,
              data: {
                title: data.title,
                description: data.ai_analysis?.description || "Açıklama yok",
                symptoms: data.ai_analysis?.symptoms || [],
                causes: data.ai_analysis?.causes || [],
                mechanic_advice: data.ai_analysis?.mechanic_advice || "Öneri yok"
              }
            };
            await setCache(cacheKey, response, 3600); // 1 saat cache
            return response;
          }
          return { success: false, message: 'Bu koda ait veri bulunamadı.' };
        },
      }),
      searchFuse: tool({
        description: 'Verilen marka ve model için aracın sigorta (fuse box) verilerini ve rollerin tablosunu getirir. Soru sigorta çakmaklık veya roleler ile ilgiliyse bu aracı kullan.',
        parameters: z.object({
          brand: z.string().describe('Araç markası (örn: Acura)'),
          model: z.string().describe('Araç modeli (örn: acura_adx_2025_2026_fuses)')
        }),
        execute: async ({ brand, model }) => {
          const cacheKey = `fuse_${brand}_${model}`;
          const cachedResult = await getCache(cacheKey);
          if (cachedResult) return cachedResult;

          const data = await DataAccessLayer.getFuseboxDiagrams(brand, model);
          if (data) {
            const response = {
              success: true,
              data: data
            };
            await setCache(cacheKey, response, 3600); // 1 saat cache
            return response;
          }
          return { success: false, message: 'Bu araca ait sigorta verisi bulunamadı.' };
        },
      }),
      findModelForBrand: tool({
        description: 'Bir markaya ait sistemde kayıtlı modellerin slug listesini döndürür.',
        parameters: z.object({
          brand: z.string().describe('Araç markası')
        }),
        execute: async ({ brand }) => {
          return { models: await DataAccessLayer.getFaultModels(brand) };
        }
      }),
      semanticSearch: tool({
        description: 'Müşterinin arıza kodunu bilmediği, sadece şikayetini (örn: "motor tekliyor") anlattığı durumlarda veritabanında yapay zeka vektör araması yapar.',
        parameters: z.object({
          query: z.string().describe('Müşterinin şikayeti veya arıza tanımı'),
          brandSlug: z.string().optional().describe('Eğer biliniyorsa araç markasının slug hali')
        }),
        execute: async ({ query, brandSlug }) => {
          const { GoogleGenAI } = require('@google/genai');
          const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
          const embedRes = await ai.models.embedContent({ model: 'gemini-embedding-001', contents: query });
          const vectorStr = `[${embedRes.embeddings[0].values.join(',')}]`;

          const { prisma } = require('@/lib/prisma');
          
          let results;
          if (brandSlug) {
            results = await prisma.$queryRawUnsafe(`
              SELECT f.code, f."aiAnalysis", m.name as model, b.name as brand,
                     1 - (f.embedding <=> $1::vector) as similarity
              FROM "FaultCode" f
              JOIN "Model" m ON f."modelId" = m.id
              JOIN "Brand" b ON m."brandId" = b.id
              WHERE b.slug = $2 AND f.embedding IS NOT NULL
              ORDER BY f.embedding <=> $1::vector
              LIMIT 3;
            `, vectorStr, brandSlug);
          } else {
            results = await prisma.$queryRawUnsafe(`
              SELECT f.code, f."aiAnalysis", m.name as model, b.name as brand,
                     1 - (f.embedding <=> $1::vector) as similarity
              FROM "FaultCode" f
              JOIN "Model" m ON f."modelId" = m.id
              JOIN "Brand" b ON m."brandId" = b.id
              WHERE f.embedding IS NOT NULL
              ORDER BY f.embedding <=> $1::vector
              LIMIT 3;
            `, vectorStr);
          }

          return {
            success: true,
            results: results.map(r => ({
              faultCode: r.code,
              vehicle: `${r.brand} ${r.model}`,
              similarity: r.similarity,
              description: r.aiAnalysis?.description || '',
              causes: r.aiAnalysis?.commonCauses || r.aiAnalysis?.causes || []
            }))
          };
        }
      })
    },
    onFinish: async ({ text, toolCalls }) => {
      const toolsUsedCount = toolCalls ? toolCalls.length : 0;
      
      // Halüsinasyon Kontrolü
      const guardResult = checkHallucination(text, toolsUsedCount);
      let finalText = text;
      
      if (guardResult.isHallucinated) {
        finalText = text + "\n\n" + guardResult.warning;
        console.warn('AI Hallucination Detected:', text.substring(0, 50));
      }

      // Başarılı yanıtı Cache'e kaydet (1 gün)
      await setAiCache(messages, finalText, 86400);
    }
  });

  return result.toDataStreamResponse ? result.toDataStreamResponse() : 
         result.toUIMessageStreamResponse ? result.toUIMessageStreamResponse() : 
         result.toTextStreamResponse();
}
