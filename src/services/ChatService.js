import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { DataAccessLayer } from '@/lib/dataAccessLayer';
import { getSystemPrompt } from '@/lib/ai/promptRegistry';
import { getAiCache, setAiCache } from '@/lib/ai/semanticCache';
import { checkHallucination } from '@/lib/ai/hallucinationGuard';
import { redis } from '@/lib/cache';
import { getCache, setCache } from '@/lib/cache';
import { getSortedPostsData } from '@/lib/blog';
import { VehicleRepository } from '@/lib/repositories/VehicleRepository';
import { prisma } from '@/lib/prisma';

export class ChatService {
  /**
   * Guest kotasını kontrol eder.
   */
  static async checkGuestQuota(guestId, messages) {
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    const redisKey = `guest_quota:${guestId}`;
    
    const currentQuota = await redis.get(redisKey);
    if (currentQuota && parseInt(currentQuota) >= 3 && userMessageCount > 3) {
      throw new Error('GUEST_QUOTA_EXCEEDED');
    }

    await redis.incr(redisKey);
    await redis.expire(redisKey, 86400); // 24 hours
  }

  /**
   * Zararlı Prompt'ları engeller (Guardrail)
   */
  static checkPromptInjection(messages) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      const maliciousPatterns = /ignore previous instructions|system prompt|bana şifreleri ver|bypass|jailbreak|açıklığın/i;
      if (maliciousPatterns.test(lastMessage.content)) {
        throw new Error('PROMPT_INJECTION_DETECTED');
      }
    }
  }

  /**
   * VIP Garaj Bilgilerini Sisteme Enjekte Eder
   */
  static async buildSystemPrompt(vehicleContext) {
    let dynamicSystemPrompt = getSystemPrompt('CHAT_BOT', 'v2');
    
    if (vehicleContext && vehicleContext.isRegistered) {
      dynamicSystemPrompt += `\n\nÖNEMLİ BİLGİ: Şu an konuştuğun müşterinin aracı kesin olarak şudur: ${vehicleContext.year} model ${vehicleContext.brand} ${vehicleContext.model}. ${vehicleContext.chassis ? `Şasi numarası (VIN): ${vehicleContext.chassis}.` : ''} Yapacağın tüm teşhisleri, vereceğin parça numaralarını ve arıza kodu analizlerini sadece ve sadece bu araca özel yap. Genel geçer cevaplar verme.`;

      if (vehicleContext.chassis) {
        try {
          const dbVehicle = await VehicleRepository.getVehicleWithHistory(vehicleContext.chassis);
          if (dbVehicle) {
            dynamicSystemPrompt += `\n\n[VIP GARAJ SİSTEM BİLGİSİ]: Bu araç servisimizin özel VIP kayıtlı müşterisidir (Plaka: ${dbVehicle.plate}). ERP Sistemimizde şu geçmiş servis kayıtları mevcuttur:`;
            
            if (dbVehicle.serviceHistories && dbVehicle.serviceHistories.length > 0) {
              dynamicSystemPrompt += `\n- Geçmiş Bakım/Onarım Geçmişi: ` + dbVehicle.serviceHistories.map(sh => `${sh.date.toLocaleDateString('tr-TR')} tarihinde ${sh.mileage} km'de "${sh.type}" yapılmış. Detay: ${sh.description}`).join(' | ');
            }
            
            if (dbVehicle.workOrders && dbVehicle.workOrders.length > 0) {
              dynamicSystemPrompt += `\n- Tamamlanan İş Emirleri: ` + dbVehicle.workOrders.map(wo => `${wo.completedAt ? wo.completedAt.toLocaleDateString('tr-TR') : ''} tarihinde tamamlanmış. Müşteri Şikayeti: ${wo.complaint}. Değişen Parçalar/İşlemler: ${wo.items.map(i => i.name).join(', ')}`).join(' | ');
            }
            
            dynamicSystemPrompt += `\n\nKRİTİK GÖREV: Müşterinin sorduğu arızayı teşhis ederken KESİNLİKLE bu geçmiş servis kayıtlarını ve değiştirilen parçaları göz önünde bulundur. Örneğin müşteri motordan ses geliyor diyorsa ve geçmişte zincir değişmişse, "Triger zincirinizi 3 ay önce değiştirmiştik, o kısımdan kaynaklandığını düşünmüyorum, turbo borularına bakalım" şeklinde "Seni ve aracını tanıyorum" hissi veren, son derece zeki ve profesyonel bir cevap ver!`;
          }
        } catch (e) {
          console.error("VIP Garage AI Lookup Error:", e);
        }
      }
    }
    
    dynamicSystemPrompt += `\n\nDOKTOR MODU VE SATIŞ ODAKLI ASİSTAN: Asla eksik bilgiyle anında kesin bir teşhis koyma. Eğer arızanın kesin sebebini bulmak için kullanıcının verdiği şikayet yetersizse, bir Oto Diagnostik uzmanı gibi kısa sorular sor. 
    ŞİMDİ ÇOK ÖNEMLİ: Müşteri bir arıza (örn: triger sesi, airmatic patlaması vb.) söylediğinde, MUTLAKA "searchChronicFaults" aracını kullanarak veritabanımızdaki makaleleri ara. Eğer müşteri bir ARIZA KODU (Örn: P0420, P0171) sorarsa veya teorik bir bilgi isterse MUTLAKA "searchLibrary" aracını kullanarak Kütüphanemizdeki makaleleri ara.
    Eğer eşleşen bir makale (Arıza Çözümü veya Kütüphane) bulursan, kullanıcıya ŞU ŞEKİLDE HTML link ver: "Bu konu hakkında detaylı makalemizi buradan okuyabilirsiniz: <a href='/kutuphane/makale-slug' target='_blank' style='color:#d4af37;text-decoration:underline;'>Makale Başlığı</a>". Asla Markdown kullanma, her zaman HTML <a> etiketi kullan!
    EN ÖNEMLİ KURAL: Her diyaloğun veya teşhisin sonunda KESİNLİKLE "Müsait olduğunuz bir zaman aracınızı Fethiye'deki özel servisimize getirin, ustalarımızla birlikte ücretsiz detaylı check-up yapalım ve kesin randevu oluşturalım. Randevu talebinizi hemen iletebilirim, ne dersiniz?" şeklinde RANDEVU (Lead) satışı yapmaya çalış. Arıza ciddiyse müşteriyi korkutmadan servise gelmesi gerektiğine ikna et!`;

    return dynamicSystemPrompt;
  }

  /**
   * Ana sohbet akışını yönetir
   */
  static async executeChatFlow({ messages, vehicleContext, guestId, token }) {
    // 1. Quota Check
    if (!token && guestId) {
      await this.checkGuestQuota(guestId, messages);
    }

    // 2. Prompt Injection Check
    this.checkPromptInjection(messages);

    // 3. Semantic Cache Check
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

    // 4. Build System Prompt with Context
    const systemPrompt = await this.buildSystemPrompt(vehicleContext);

    // 5. Execute LLM
    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages,
      tools: this.getAiTools(),
      onFinish: async ({ text, toolCalls }) => {
        const toolsUsedCount = toolCalls ? toolCalls.length : 0;
        const guardResult = checkHallucination(text, toolsUsedCount);
        let finalText = text;
        
        if (guardResult.isHallucinated) {
          finalText = text + "\n\n" + guardResult.warning;
          console.warn('AI Hallucination Detected:', text.substring(0, 50));
        }

        await setAiCache(messages, finalText, 86400);
      }
    });

    return result;
  }

  static getAiTools() {
    return {
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
            ).slice(0, 3);
            
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
        description: 'Teknik Kütüphane (Library) içerisinde genel otomotiv bilgileri, arıza kodu makaleleri (örn: P0420 detaylı analizi) veya teknik terimler arar.',
        parameters: z.object({
          keyword: z.string().describe('Aranacak kelime veya arıza kodu')
        }),
        execute: async ({ keyword }) => {
          try {
            const allLibrary = getSortedPostsData('tr', 'library');
            if (!allLibrary || allLibrary.length === 0) return { success: false, message: 'Kütüphane veritabanı boş.' };
            
            const lowerKeyword = keyword.toLowerCase();
            const results = allLibrary.filter(f => 
              (f.title && f.title.toLowerCase().includes(lowerKeyword)) || 
              (f.description && f.description.toLowerCase().includes(lowerKeyword)) ||
              (f.tags && f.tags.some(tag => tag.toLowerCase().includes(lowerKeyword)))
            ).slice(0, 3);
            
            if (results.length > 0) {
              return { success: true, articles: results.map(r => ({ id: r.id, title: r.title, url: `/kutuphane/${r.id}` })) };
            }
            return { success: false, message: 'Makale bulunamadı.' };
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
        description: 'Verilen marka, model ve arıza kodu (örn: P0171) için analiz.',
        parameters: z.object({
          brand: z.string(),
          model: z.string(),
          code: z.string()
        }),
        execute: async ({ brand, model, code }) => {
          const cacheKey = `${brand}_${model}_${code}`;
          const cachedResult = await getCache('fault', cacheKey);
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
            await setCache('fault', cacheKey, response, 3600);
            return response;
          }
          return { success: false, message: 'Veri bulunamadı.' };
        },
      }),
      searchFuse: tool({
        description: 'Sigorta (fuse box) verilerini getirir.',
        parameters: z.object({
          brand: z.string(),
          model: z.string()
        }),
        execute: async ({ brand, model }) => {
          const cacheKey = `${brand}_${model}`;
          const cachedResult = await getCache('fuse', cacheKey);
          if (cachedResult) return cachedResult;

          const data = await DataAccessLayer.getFuseboxDiagrams(brand, model);
          if (data) {
            const response = { success: true, data: data };
            await setCache('fuse', cacheKey, response, 3600);
            return response;
          }
          return { success: false, message: 'Sigorta verisi bulunamadı.' };
        },
      }),
      estimateCost: tool({
        description: 'Tahmini maliyet hesaplar.',
        parameters: z.object({
          partName: z.string(),
          brand: z.string(),
          basePartCost: z.number()
        }),
        execute: async ({ partName, brand, basePartCost }) => {
          const premiumBrands = ['bmw', 'mercedes', 'audi', 'porsche', 'land rover', 'volvo'];
          const isPremium = premiumBrands.some(b => (brand || '').toLowerCase().includes(b));
          
          const multiplier = isPremium ? 1.5 : 1.0;
          const laborCost = 2500 * multiplier;
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
        description: 'Tahmini onarım süresi hesaplar.',
        parameters: z.object({
          jobType: z.string()
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
        description: 'Sürüş riski değerlendirir.',
        parameters: z.object({
          symptom: z.string()
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
        description: 'Periyodik bakım kalemleri.',
        parameters: z.object({
          brand: z.string(),
          model: z.string(),
          mileage: z.number()
        }),
        execute: async ({ brand, model, mileage }) => {
          const { MaintenanceRepository } = require('@/lib/repositories/MaintenanceRepository');
          return await MaintenanceRepository.getSchedule(brand, model, mileage);
        }
      }),
      vinLookup: tool({
        description: 'Şasi kodunu çözer (VIN).',
        parameters: z.object({
          vin: z.string()
        }),
        execute: async ({ vin }) => {
          const { decodeVin } = require('@/lib/vinService');
          return await decodeVin(vin);
        }
      }),
      findModelForBrand: tool({
        description: 'Markaya ait modelleri döndürür.',
        parameters: z.object({
          brand: z.string()
        }),
        execute: async ({ brand }) => {
          return { models: await DataAccessLayer.getFaultModels(brand) };
        }
      }),
      semanticSearch: tool({
        description: 'Şikayete göre vektör araması yapar.',
        parameters: z.object({
          query: z.string(),
          brandSlug: z.string().optional()
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
    };
  }
}
