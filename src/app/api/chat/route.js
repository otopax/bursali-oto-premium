export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30 seconds

import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { DataAccessLayer } from '@/lib/dataAccessLayer';
import { getSystemPrompt } from '@/lib/ai/promptRegistry';
import { getAiCache, setAiCache } from '@/lib/ai/semanticCache';
import { checkHallucination } from '@/lib/ai/hallucinationGuard';
import { rateLimit } from '@/lib/rate-limit';
import { getCache, setCache, redis } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function POST(req) {
  // IP tabanlı kurumsal Rate Limiting — AI endpoint: Redis düştüğünde REDDET (fail-closed)
  // Gemini kotası bot saldırısında patlamasın diye kritik.
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitStatus = await rateLimit(ip, 30, 60, { failClosed: true });

  if (!limitStatus.success) {
    return new Response('Too Many Requests', { status: 429 });
  }

  const { messages, vehicleContext, guestId } = await req.json();

  // Guest Quota Control (3 messages)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || 'BursaliOtoSecretKey2026' });
  if (!token && guestId) {
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    const redisKey = `guest_quota:${guestId}`;
    
    // Check if quota exceeded in Redis
    const currentQuota = await redis.get(redisKey);
    if (currentQuota && parseInt(currentQuota) >= 3 && userMessageCount > 3) {
      return new Response(JSON.stringify({ error: 'guest_quota_exceeded' }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Increment quota for this message (if it's a new message)
    await redis.incr(redisKey);
    await redis.expire(redisKey, 86400); // 24 hours
  }

  // 1. Semantic Cache Kontrolü (Aynı sohbet geçmişi var mı?)
  const cachedResponse = await getAiCache(messages);
  if (cachedResponse) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`0:"${cachedResponse.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n`));
        controller.close();
      }
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-AI-Cache': 'HIT' } });
  }

  const { getSortedPostsData } = require('@/lib/blog');

  // Dinamik System Prompt: Eğer kullanıcı araç bilgisi girdiyse bunu AI'ya kesin bir dille bildir.
  let dynamicSystemPrompt = getSystemPrompt('CHAT_BOT', 'v2');
  if (vehicleContext && vehicleContext.isRegistered) {
    dynamicSystemPrompt += `\n\nÖNEMLİ BİLGİ: Şu an konuştuğun müşterinin aracı kesin olarak şudur: ${vehicleContext.year} model ${vehicleContext.brand} ${vehicleContext.model}. ${vehicleContext.chassis ? `Şasi numarası (VIN): ${vehicleContext.chassis}.` : ''} Yapacağın tüm teşhisleri, vereceğin parça numaralarını ve arıza kodu analizlerini sadece ve sadece bu araca özel yap. Genel geçer cevaplar verme.`;
  }
  
  // DOKTOR MODU (Decision Trees) & RANDEVU SATIŞI & MDX VERİTABANI
  dynamicSystemPrompt += `\n\nDOKTOR MODU VE SATIŞ ODAKLI ASİSTAN: Asla eksik bilgiyle anında kesin bir teşhis koyma. Eğer arızanın kesin sebebini bulmak için kullanıcının verdiği şikayet yetersizse, bir Oto Diagnostik uzmanı gibi kısa sorular sor. 
  ŞİMDİ ÇOK ÖNEMLİ: Müşteri bir arıza (örn: triger sesi, airmatic patlaması vb.) söylediğinde, MUTLAKA "searchChronicFaults" aracını kullanarak veritabanımızdaki makaleleri ara. Eğer müşteri bir ARIZA KODU (Örn: P0420, P0171) sorarsa veya teorik bir bilgi isterse MUTLAKA "searchLibrary" aracını kullanarak Kütüphanemizdeki makaleleri ara.
  Eğer eşleşen bir makale (Arıza Çözümü veya Kütüphane) bulursan, kullanıcıya ŞU ŞEKİLDE HTML link ver: "Bu konu hakkında detaylı makalemizi buradan okuyabilirsiniz: <a href='/kutuphane/makale-slug' target='_blank' style='color:#d4af37;text-decoration:underline;'>Makale Başlığı</a>". Asla Markdown kullanma, her zaman HTML <a> etiketi kullan!
  EN ÖNEMLİ KURAL: Her diyaloğun veya teşhisin sonunda KESİNLİKLE "Müsait olduğunuz bir zaman aracınızı Fethiye'deki özel servisimize getirin, ustalarımızla birlikte ücretsiz detaylı check-up yapalım ve kesin randevu oluşturalım. Randevu talebinizi hemen iletebilirim, ne dersiniz?" şeklinde RANDEVU (Lead) satışı yapmaya çalış. Arıza ciddiyse müşteriyi korkutmadan servise gelmesi gerektiğine ikna et!`;


  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: dynamicSystemPrompt,
    messages,
    tools: {
      searchChronicFaults: tool({
        description: 'Verilen anahtar kelime veya araç modeline göre (örn: bmw n20, airmatic, dsg) kronik arızalar veritabanında (MDX makaleleri) arama yapar. Sonuçlar /ariza-cozumleri/ URL\'sine link vermek için kullanılır.',
        parameters: z.object({
          keyword: z.string().describe('Aranacak kelime (örn: triger, airmatic, mekatronik veya marka modeli)')
        }),
        execute: async ({ keyword }) => {
          try {
            const allFaults = getSortedPostsData('tr', 'faults');
            if (!allFaults || allFaults.length === 0) return { success: false, message: 'Veritabanı boş.' };
            
            const lowerKeyword = keyword.toLowerCase();
            const results = allFaults.filter(f => 
              (f.title && f.title.toLowerCase().includes(lowerKeyword)) || 
              (f.brand && f.brand.toLowerCase().includes(lowerKeyword)) ||
              (f.model && f.model.toLowerCase().includes(lowerKeyword))
            ).slice(0, 3); // En iyi 3 sonucu dön
            
            if (results.length > 0) {
              return { success: true, articles: results.map(r => ({ id: r.id, title: r.title, url: `/ariza-cozumleri/${r.id}` })) };
            }
            return { success: false, message: 'Eşleşen kronik arıza makalesi bulunamadı.' };
          } catch(e) {
            return { success: false, error: e.message };
          }
        }
      }),
      searchLibrary: tool({
        description: 'Teknik Kütüphane (Library) içerisinde genel otomotiv bilgileri, arıza kodu makaleleri (örn: P0420 detaylı analizi) veya teknik terimler arar. Sonuçlar /kutuphane/ URL\'sine link vermek için kullanılır.',
        parameters: z.object({
          keyword: z.string().describe('Aranacak kelime veya arıza kodu (örn: P0171, triger sente sentezi, can-bus)')
        }),
        execute: async ({ keyword }) => {
          try {
            const allLibrary = getSortedPostsData('tr', 'library'); // Content/library klasörü
            if (!allLibrary || allLibrary.length === 0) return { success: false, message: 'Kütüphane veritabanı henüz boş veya oluşturulmadı.' };
            
            const lowerKeyword = keyword.toLowerCase();
            const results = allLibrary.filter(f => 
              (f.title && f.title.toLowerCase().includes(lowerKeyword)) || 
              (f.description && f.description.toLowerCase().includes(lowerKeyword)) ||
              (f.tags && f.tags.some(tag => tag.toLowerCase().includes(lowerKeyword)))
            ).slice(0, 3);
            
            if (results.length > 0) {
              return { success: true, articles: results.map(r => ({ id: r.id, title: r.title, url: `/kutuphane/${r.id}` })) };
            }
            return { success: false, message: 'Kütüphanede eşleşen teknik makale bulunamadı.' };
          } catch(e) {
            return { success: false, error: e.message };
          }
        }
      }),
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
                title: data.title || data.description,
                description: data.description || "Açıklama yok",
                symptoms: data.symptoms || [],
                causes: data.causes || [],
                mechanic_advice: data.mechanic_advice || "Öneri yok"
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
      estimateCost: tool({
        description: 'Verilen arıza veya parça değişimi için tahmini maliyet aralığı hesaplar.',
        parameters: z.object({
          partName: z.string().describe('Değişecek veya onarılacak parça (örn: Katalitik Konvertör)'),
          brand: z.string().describe('Araç markası'),
          basePartCost: z.number().describe('Parçanın tahmini taban fiyatı (TL cinsinden)')
        }),
        execute: async ({ partName, brand, basePartCost }) => {
          const premiumBrands = ['bmw', 'mercedes', 'audi', 'porsche', 'land rover', 'volvo'];
          const isPremium = premiumBrands.some(b => (brand || '').toLowerCase().includes(b));
          
          const multiplier = isPremium ? 1.5 : 1.0;
          const laborCost = 2500 * multiplier; // Fethiye base labor
          const totalMin = Math.round((basePartCost * multiplier) + laborCost);
          const totalMax = Math.round(totalMin * 1.3);
          
          return { 
            partName, 
            estimatedRange: `${totalMin.toLocaleString('tr-TR')} TL - ${totalMax.toLocaleString('tr-TR')} TL`,
            breakdown: { part: Math.round(basePartCost * multiplier), labor: laborCost, region: 'Fethiye' }
          };
        }
      }),
      estimateRepairTime: tool({
        description: 'Arıza veya bakım işleminin tahmini ne kadar süreceğini hesaplar.',
        parameters: z.object({
          jobType: z.string().describe('İşlem tipi (örn: periyodik bakım, motor revizyonu, şanzıman tamiri)')
        }),
        execute: async ({ jobType }) => {
          const type = jobType.toLowerCase();
          if (type.includes('motor') && type.includes('revizyon')) return { time: '7 - 14 İş Günü', urgency: 'Yüksek' };
          if (type.includes('şanzıman')) return { time: '3 - 5 İş Günü', urgency: 'Orta' };
          if (type.includes('periyodik') || type.includes('bakım') || type.includes('yağ')) return { time: '2 - 3 Saat', urgency: 'Düşük' };
          if (type.includes('teşhis') || type.includes('arıza tespiti')) return { time: '1 - 2 Saat', urgency: 'Hemen' };
          return { time: '1 - 2 İş Günü', urgency: 'Normal' };
        }
      }),
      estimateRisk: tool({
        description: 'Müşterinin tarif ettiği arızanın aracı sürmeye devam etmesi durumunda yaratacağı riski (Motor/Şanzıman hasarı vb.) değerlendirir.',
        parameters: z.object({
          symptom: z.string().describe('Müşterinin şikayeti veya arıza kodu')
        }),
        execute: async ({ symptom }) => {
          const s = symptom.toLowerCase();
          if (s.includes('hararet') || s.includes('kırmızı') || s.includes('yağ basıncı') || s.includes('şanzıman vuruntusu')) {
            return { riskLevel: 'KRİTİK', advice: 'Aracı KESİNLİKLE çalıştırmayın, hemen çekici çağırın.' };
          }
          if (s.includes('arıza lambası') || s.includes('titreme') || s.includes('çekişten düşme')) {
            return { riskLevel: 'YÜKSEK', advice: 'Aracı zorlamadan en kısa sürede servise getirin.' };
          }
          return { riskLevel: 'ORTA', advice: 'Müsait olduğunuzda kontrol edilmesi tavsiye edilir.' };
        }
      }),
      maintenanceLookup: tool({
        description: 'Belirli bir marka, model ve kilometre için yapılması gereken periyodik bakım kalemlerini getirir.',
        parameters: z.object({
          brand: z.string().describe('Araç markası'),
          model: z.string().describe('Araç modeli'),
          mileage: z.number().describe('Aracın güncel kilometresi')
        }),
        execute: async ({ brand, model, mileage }) => {
          const { MaintenanceRepository } = require('@/lib/repositories/MaintenanceRepository');
          return await MaintenanceRepository.getSchedule(brand, model, mileage);
        }
      }),
      vinLookup: tool({
        description: 'Müşterinin girdiği şasi numarasını (VIN) çözer ve aracın marka, model, motor ve şanzıman bilgilerini getirir.',
        parameters: z.object({
          vin: z.string().describe('17 haneli şasi numarası')
        }),
        execute: async ({ vin }) => {
          const { decodeVin } = require('@/lib/vinService');
          return await decodeVin(vin);
        }
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
          const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
          const embedRes = await ai.models.embedContent({ model: 'gemini-embedding-001', contents: query });
          const vectorStr = `[${embedRes.embeddings[0].values.join(',')}]`;

          let results;
          if (brandSlug) {
            results = await prisma.$queryRawUnsafe(`
              SELECT f.code, f."symptoms", f."commonCauses", v.model as model, m.name as brand,
                     1 - (f.embedding <=> $1::vector) as similarity
              FROM "FaultCode" f
              LEFT JOIN "Vehicle" v ON f."vehicleId" = v.id
              LEFT JOIN "Manufacturer" m ON v."manufacturerId" = m.id
              WHERE (m.name ILIKE $2 OR $2 IS NULL) AND f.embedding IS NOT NULL
              ORDER BY f.embedding <=> $1::vector DESC
              LIMIT 3;
            `, vectorStr, `%${brandSlug}%`);
          } else {
            results = await prisma.$queryRawUnsafe(`
              SELECT f.code, f."symptoms", f."commonCauses", f."description", v.model as model, m.name as brand,
                     1 - (f.embedding <=> $1::vector) as similarity
              FROM "FaultCode" f
              LEFT JOIN "Vehicle" v ON f."vehicleId" = v.id
              LEFT JOIN "Manufacturer" m ON v."manufacturerId" = m.id
              WHERE f.embedding IS NOT NULL
              ORDER BY f.embedding <=> $1::vector DESC
              LIMIT 3;
            `, vectorStr);
          }

          return {
            success: true,
            results: results.map(r => ({
              faultCode: r.code,
              vehicle: `${r.brand} ${r.model}`,
              similarity: r.similarity,
              description: r.description || '',
              causes: r.commonCauses || []
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

