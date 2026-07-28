import { z } from 'zod';
import { tool } from 'ai';
import * as Sentry from "@sentry/nextjs";
import { DataAccessLayer } from '@/lib/dataAccessLayer';
import { getSystemPrompt } from '@/lib/ai/promptRegistry';
import { getAiCache, setAiCache } from '@/lib/ai/semanticCache';
import { checkHallucination } from '@/lib/ai/hallucinationGuard';
import { redis } from '@/lib/cache';
import { getCache, setCache } from '@/lib/cache';
import { container } from '@/application/di/container';
import { VehicleRepository } from '@/lib/repositories/VehicleRepository';
import { prisma } from '@/lib/prisma';
import { Logger } from '@/lib/observability/Logger';
import { arizaUrl } from '@/lib/urls';
import { getVehicleServiceStatus } from '@/lib/vipGarage';

export class ChatService {
  constructor(aiProvider) {
    this.aiProvider = aiProvider;
  }
  /**
   * AI Context Window Manager
   * Token tasarrufu ve Context taşmasını engellemek için mesaj geçmişini budar.
   */
  optimizeContextWindow(messages, maxMessages = 12) {
    if (messages.length <= maxMessages) return messages;
    
    Logger.info(`Optimizing Context Window: Reducing from ${messages.length} to ${maxMessages}`);
    // İlk mesajı (genelde ilk context) ve son N mesajı tutar
    const firstMessage = messages[0];
    const recentMessages = messages.slice(-(maxMessages - 1));
    return [firstMessage, ...recentMessages];
  }

  /**
   * Guest kotasını kontrol eder.
   */
  async checkGuestQuota(guestId, messages) {
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    const redisKey = `guest_quota:${guestId}`;
    
    try {
      const currentQuota = await redis.get(redisKey);
      if (currentQuota && parseInt(currentQuota) >= 3 && userMessageCount > 3) {
        throw new Error('GUEST_QUOTA_EXCEEDED');
      }

      await redis.incr(redisKey);
      await redis.expire(redisKey, 86400); // 24 hours
    } catch (error) {
      if (error.message === 'GUEST_QUOTA_EXCEEDED') throw error;
      Logger.warn('Redis Quota Error (Failing Open)', { error: error.message });
      // FAIL OPEN: If Redis is down, allow the user to continue chatting
    }
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
  async buildSystemPrompt(vehicleContext) {
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
          Logger.error("VIP Garage AI Lookup Error", { error: e.message, stack: e.stack });
        }
      }
    }
    
    dynamicSystemPrompt += `\n\nDOKTOR MODU VE SATIŞ ODAKLI ASİSTAN: Asla eksik bilgiyle anında kesin bir teşhis koyma. Eğer arızanın kesin sebebini bulmak için kullanıcının verdiği şikayet yetersizse, bir Oto Diagnostik uzmanı gibi kısa sorular sor.
      KAYNAK ÖNCELİĞİ (ÇOK ÖNEMLİ): Her soruya cevap vermeden ÖNCE MUTLAKA kendi içerik kaynaklarımızdan ara ve cevabını bunlara dayandır. Genel/ezbere bilgiyi ancak bu üç kaynakta sonuç yoksa kullan. Üç kaynağın:
      1) ARIZA ÇÖZÜMLERİ (marka/model kronik arızaları ve belirtiler): "searchChronicFaults" aracını kullan.
      2) KÜTÜPHANE (arıza kodu makaleleri örn. P0420/P0171 ve teknik bilgi): "searchLibrary" aracını kullan.
      3) VIP GARAJ (müşterinin KENDİ aracının servis durumu / iş emri / bakım geçmişi): "getServiceStatus" aracını kullan; plaka ve telefon iste. Müşteri "aracım hazır mı, servis durumu, geçmiş bakımlarım" gibi kişisel araç sorusu sorarsa cevabı buradan ver.
      Müşteri belirti/şikayet (titreme, siyah duman, geç çalışma vb.) tarif ederse önce "searchChronicFaults", gerekiyorsa "searchLibrary" ile ara; ek olarak "semanticSearch" de deneyebilirsin.
      Eğer eşleşen bir makale bulursan, kullanıcıya aracın DÖNDÜRDÜĞÜ "url" alanını kullanarak HTML link ver: "Detaylı makalemiz: <a href='DÖNEN_URL' target='_blank' style='color:#d4af37;text-decoration:underline;'>Makale Başlığı</a>". Asla Markdown kullanma, her zaman HTML <a> etiketi kullan!
    EN ÖNEMLİ KURAL: Her diyaloğun veya teşhisin sonunda KESİNLİKLE "Müsait olduğunuz bir zaman aracınızı Fethiye'deki özel servisimize getirin, ustalarımızla birlikte ücretsiz detaylı check-up yapalım ve kesin randevu oluşturalım. Randevu talebinizi hemen iletebilirim, ne dersiniz?" şeklinde RANDEVU (Lead) satışı yapmaya çalış. Arıza ciddiyse müşteriyi korkutmadan servise gelmesi gerektiğine ikna et!`;

    dynamicSystemPrompt += `\n\n[TEŞHİS & PARÇA PROTOKOLÜ — ÇOK ÖNEMLİ]
- Müşteri bir arıza KODU verirse (örn: P0087) HER ZAMAN önce "searchFaultCode" aracını çağır (marka, model, kod ile). Dönen severity, belirti, sebep, çözüm adımları ve PARÇA listesini kullan.
- PARÇA & FİYAT UYDURMA YASAĞI: Yalnızca "searchFaultCode" veya "findPartsForFault" araçlarının döndürdüğü parçaları, OEM numaralarını ve fiyatları öner. Araç parça döndürmediyse OEM numarası veya fiyat UYDURMA; "Kesin parça ve fiyat için servisimize danışın" de. Fiyatı olan parçalarda stok durumunu belirt (stokta var / tedarik edilir).
- MALİYET: Fiyat verirken "estimateCost" aracını kullan ve varsa OEM numarasını gönder. Araç "priceKnown=false" dönerse bunun kaba tahmin olduğunu açıkça söyle, kesin rakam verme.
- CİDDİYET (severity) YÖNLENDİRME: severity CRITICAL/HIGH ise "aracı zorlamayın, en kısa sürede servise getirin" de ve randevuyu öne çıkar; LOW ise bilgilendirici/rahatlatıcı ol.
- GEÇMİŞ DENEYİM: Uygun olduğunda "getDiagnosticHistory" ile aynı marka/modeldeki servis-doğrulanmış geçmiş sonuçları çek ve "Bu modelde benzer belirtide çoğu zaman gerçek sebep ... çıkıyor" gibi tecrübe aktar. Yalnızca aracın döndürdüğü doğrulanmış kayıtları kullan.`;

    return dynamicSystemPrompt;
  }

  /**
   * Ana sohbet akışını yönetir
   */
  async executeChatFlow({ messages, vehicleContext, guestId, token, correlationId = 'unknown' }) {
    Logger.info('AI Chat Request Started', { correlationId, guestId, messagesCount: messages.length });
    
    // 1. Quota Check
    if (!token && guestId) {
      await this.checkGuestQuota(guestId, messages);
    }

    // 2. Prompt Injection Check (static metod — sinif adiyla cagrilmali, this ile degil)
    ChatService.checkPromptInjection(messages);

    const aiContext = {
      locale: 'tr', // TODO: dynamic if possible
      vehicleContext,
      aiModel: 'gemini-2.5-flash',
      systemPromptVersion: 'v2'
    };

    // 3. Semantic Cache Check
    const cachedResponse = await getAiCache(messages, aiContext);
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

    // 5. Context Window Manager (Token Optimization)
    const optimizedMessages = this.optimizeContextWindow(messages, 12);

    // 6. Execute Model Call via AI Provider (Vercel AI SDK Abstracted)
    const result = this.aiProvider.streamResponse({
      systemPrompt,
      messages: optimizedMessages,
      tools: this.getAiTools(),
      onFinish: async ({ text, toolCalls, usage }) => {
        if (usage && usage.totalTokens) {
          try {
            Sentry.metrics.distribution('ai.token.usage', usage.totalTokens, { unit: 'count' });
          } catch (e) {
            Logger.warn('Sentry Metric Error', e.message);
          }
        }
        const toolsUsedCount = toolCalls ? toolCalls.length : 0;
        const guardResult = checkHallucination(text, toolsUsedCount);
        let finalText = text;
        
        if (guardResult.isHallucinated) {
          finalText = text + "\n\n" + guardResult.warning;
          Logger.warn('AI Hallucination Detected', { textSnippet: text.substring(0, 50) });
        }

        // Cache using original full messages array to ensure exact match on next request
        // TTL for Chat AI is 6-24 hours according to user (we set 12 hours)
        await setAiCache(messages, finalText, 12 * 3600, aiContext);

        // TEŞHİS GERİ-BESLEME: VIP araç (şasi -> CustomerVehicle) için seansı logla.
        // actualOutcome sonradan serviste doldurulur; getDiagnosticHistory bu doğrulanmış
        // kayıtları kullanır. Guest'lerde CustomerVehicle olmadığından yazılmaz (FK güvenliği).
        try {
          if (vehicleContext && vehicleContext.chassis && finalText) {
            const cv = await VehicleRepository.getVehicleWithHistory(vehicleContext.chassis);
            if (cv && cv.id) {
              const lastUser = [...messages].reverse().find(m => m.role === 'user');
              await prisma.diagnosticLog.create({
                data: {
                  vehicleId: cv.id,
                  symptoms: (lastUser && lastUser.content ? String(lastUser.content) : '(belirti yok)').slice(0, 1000),
                  aiSuggestion: String(finalText).slice(0, 4000),
                  aiConfidence: (guardResult && guardResult.isHallucinated) ? 0.4 : 0.8
                }
              });
            }
          }
        } catch (e) {
          Logger.warn('DiagnosticLog write skipped', { error: e.message });
        }
      }
    });

    return result;
  }

  getAiTools() {
    const self = this;
    return {
      searchChronicFaults: tool({
        description: 'Verilen anahtar kelime veya araç modeline göre (örn: bmw n20, airmatic, dsg) kronik arızalar veritabanında (MDX makaleleri) arama yapar. Sonuçlar /ariza-cozumleri/ URL\'sine link vermek için kullanılır.',
        parameters: z.object({
          keyword: z.string().describe('Aranacak kelime (örn: triger, airmatic, mekatronik veya marka modeli)')
        }),
        execute: async ({ keyword }) => {
          try {
            const allFaults = await container.getSortedPostsUseCase.execute('tr', 'faults');
            if (!allFaults || allFaults.length === 0) return { success: false, message: 'Veritabanı boş.' };
            
            const lowerKeyword = keyword.toLowerCase();
            const results = allFaults.filter(f => 
              (f.title && f.title.toLowerCase().includes(lowerKeyword)) || 
              (f.brand && f.brand.toLowerCase().includes(lowerKeyword)) ||
              (f.model && f.model.toLowerCase().includes(lowerKeyword))
            ).slice(0, 3);
            
            if (results.length > 0) {
              return { success: true, articles: results.map(r => ({ id: r.id, title: r.title, url: arizaUrl('tr', r) })) };
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
            const allLibrary = await container.getSortedPostsUseCase.execute('tr', 'library');
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
      getServiceStatus: tool({
        description: 'VIP GARAJ: Müşterinin kendi aracının güncel servis durumunu, iş emrini ve geçmiş bakım karnesini getirir. Kullanıcı "aracım hazır mı", "servis durumu ne", "iş emrim ne durumda", "bakım geçmişim" gibi sorarsa kullan. ZORUNLU: plaka ve telefon. Verilmediyse kullanıcıdan nazikçe iste.',
        parameters: z.object({
          plate: z.string().describe('Araç plakası, örn: 48 ABC 123'),
          phone: z.string().describe('Sisteme kayıtlı telefon numarası')
        }),
        execute: async ({ plate, phone }) => {
          try {
            const data = await getVehicleServiceStatus(plate, phone);
            if (!data) {
              return { success: false, message: 'Bu plaka ve telefona ait kayıt bulunamadı. Lütfen bilgileri kontrol edin ya da servisimizle iletişime geçin.' };
            }
            const latest = (data.history && data.history[0]) ? data.history[0] : null;
            return {
              success: true,
              vehicle: `${data.vehicleInfo.brand} ${data.vehicleInfo.model} (${data.vehicleInfo.plate})`,
              customer: data.customerInfo.firstName,
              serviceName: data.serviceName,
              totalRecords: data.history ? data.history.length : 0,
              latestStatus: latest ? latest.status : null,
              latestComplaint: latest ? latest.complaint : null,
              history: (data.history || []).map(o => ({
                date: o.createdAt,
                status: o.status,
                complaint: o.complaint,
                notes: o.notes,
                items: (o.items || []).map(i => i.name)
              }))
            };
          } catch (e) {
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
        description: 'Verilen marka, model ve arıza kodu (örn: P0171) için TAM analiz: açıklama, ciddiyet (severity), belirtiler, olası sebepler, çözüm adımları, ilgili OEM parçalar (fiyat/stok) ve onarım videoları.',
        parameters: z.object({
          brand: z.string(),
          model: z.string(),
          code: z.string()
        }),
        execute: async ({ brand, model, code }) => {
          const normCode = (code || '').trim().toUpperCase();
          const cacheKey = `${brand}_${model}_${normCode}_v2`;
          const cachedResult = await getCache('fault', cacheKey);
          if (cachedResult) return cachedResult;

          // 1) Mevcut içerik analizi (JSON fallback) — throw ederse yut (aktif provider prisma.model'e bakıp patlayabiliyor)
          let data = null;
          try { data = await DataAccessLayer.getFaultCodeAnalysis(brand, model, code); } catch (e) { /* JSON yok/hatalı ise geç */ }

          // 2) Bilgi grafiği zenginleştirme: severity + OEM parçalar + videolar (varsa)
          const includeGraph = {
            parts: { select: { name: true, oemNumber: true, category: true, price: true, currency: true, stock: true } },
            repairVideos: { select: { title: true, url: true, source: true } },
            sensor: { select: { name: true, type: true } }
          };
          let graph = null;
          try {
            graph = await prisma.faultCode.findFirst({ where: { code: { equals: normCode, mode: 'insensitive' } }, include: includeGraph });
          } catch (e) { /* insensitive filtre sorunu olabilir; aşağıda exact denenir */ }
          if (!graph) {
            try { graph = await prisma.faultCode.findUnique({ where: { code: normCode }, include: includeGraph }); } catch (e) { /* geç */ }
          }

          if (!data && !graph) {
            return { success: false, message: 'Veri bulunamadı.' };
          }

          const parts = (graph && Array.isArray(graph.parts)) ? graph.parts.map(p => ({
            name: p.name,
            oemNumber: p.oemNumber || null,
            category: p.category,
            price: (p.price != null) ? p.price : null,
            currency: p.currency || 'TRY',
            inStock: p.stock > 0,
            stock: p.stock
          })) : [];

          const response = {
            success: true,
            data: {
              title: (data && (data.title || data.description)) || (graph && graph.description) || normCode,
              description: (data && data.description) || (graph && graph.description) || 'Açıklama yok',
              severity: (graph && graph.severity) || null,
              symptoms: (data && data.symptoms) || (graph && graph.symptoms) || [],
              causes: (data && data.causes) || (graph && graph.commonCauses) || [],
              solution: (data && data.mechanic_advice) || (graph && graph.stepByStepSolution) || null,
              parts,
              partsAvailable: parts.length > 0,
              repairVideos: (graph && graph.repairVideos && graph.repairVideos.length) ? graph.repairVideos : ((data && data.videos) || []),
              relatedSensor: (graph && graph.sensor) ? graph.sensor : null
            }
          };
          await setCache('fault', cacheKey, response, 3600);
          return response;
        },
      }),
      findPartsForFault: tool({
        description: 'Bir arıza kodu (örn: P0171) için servis kataloğundaki uyumlu OEM parçaları, fiyat ve stok durumuyla getirir. Parça önerisi YALNIZCA bu aracın veya searchFaultCode\'un döndürdüğü parçalardan yapılabilir.',
        parameters: z.object({
          code: z.string().describe('Arıza kodu, örn: P0171')
        }),
        execute: async ({ code }) => {
          const normCode = (code || '').trim().toUpperCase();
          try {
            const fc = await prisma.faultCode.findFirst({
              where: { code: { equals: normCode, mode: 'insensitive' } },
              include: { parts: { select: { name: true, oemNumber: true, category: true, price: true, currency: true, stock: true } } }
            });
            if (!fc || !fc.parts || fc.parts.length === 0) {
              return { success: false, message: 'Bu arıza kodu için katalogda kayıtlı parça yok. Kesin parça bilgisi için servise danışılmalı; OEM numarası/fiyat uydurma.' };
            }
            return {
              success: true,
              code: normCode,
              parts: fc.parts.map(p => ({
                name: p.name, oemNumber: p.oemNumber || null, category: p.category,
                price: (p.price != null) ? p.price : null, currency: p.currency || 'TRY',
                inStock: p.stock > 0, stock: p.stock
              }))
            };
          } catch (e) {
            return { success: false, error: e.message };
          }
        }
      }),
      getDiagnosticHistory: tool({
        description: 'Aynı marka/modelde geçmişte SERVİSTE DOĞRULANMIŞ gerçek arıza sonuçlarını (actualOutcome) getirir. "Bu modelde benzer belirtide gerçek sebep genelde şu çıkıyor" demek için kullan. Yalnızca doğrulanmış kayıtları döndürür; yoksa uydurma.',
        parameters: z.object({
          brand: z.string(),
          model: z.string(),
          symptom: z.string().optional().describe('Opsiyonel belirti filtresi')
        }),
        execute: async ({ brand, model, symptom }) => {
          try {
            const logs = await prisma.diagnosticLog.findMany({
              where: {
                actualOutcome: { not: null },
                vehicle: {
                  brand: { contains: brand, mode: 'insensitive' },
                  model: { contains: model, mode: 'insensitive' }
                },
                ...(symptom ? { symptoms: { contains: symptom, mode: 'insensitive' } } : {})
              },
              orderBy: { createdAt: 'desc' },
              take: 15,
              select: { symptoms: true, aiSuggestion: true, actualOutcome: true, aiConfidence: true, createdAt: true }
            });
            if (!logs || logs.length === 0) {
              return { success: false, message: 'Bu marka/model için doğrulanmış geçmiş teşhis kaydı yok.' };
            }
            return {
              success: true,
              total: logs.length,
              cases: logs.map(l => ({
                symptoms: l.symptoms,
                aiSuggestion: l.aiSuggestion,
                confirmedCause: l.actualOutcome,
                confidence: l.aiConfidence,
                date: l.createdAt
              }))
            };
          } catch (e) {
            return { success: false, error: e.message };
          }
        }
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
        description: 'Tahmini onarım maliyeti. Mümkünse OEM parça numarası ver; katalogda fiyat varsa GERÇEK fiyat kullanılır. Katalogda yoksa fiyat uydurulmaz, kaba tahmin olduğu belirtilir.',
        parameters: z.object({
          partName: z.string(),
          brand: z.string(),
          oemNumber: z.string().optional().describe('Varsa parçanın OEM numarası (gerçek fiyat için)'),
          basePartCost: z.number().optional().describe('Katalog fiyatı yoksa kaba tahmin (opsiyonel)')
        }),
        execute: async ({ partName, brand, oemNumber, basePartCost }) => {
          let realPart = null;
          try {
            if (oemNumber) realPart = await prisma.part.findFirst({ where: { oemNumber } });
            if (!realPart && partName) realPart = await prisma.part.findFirst({ where: { name: { contains: partName, mode: 'insensitive' } } });
          } catch (e) { /* Part tablosu yok/boş ise geç */ }

          const priceKnown = !!(realPart && realPart.price != null);
          const partCost = priceKnown ? realPart.price : (basePartCost || 0);

          const premiumBrands = ['bmw', 'mercedes', 'audi', 'porsche', 'land rover', 'volvo'];
          const isPremium = premiumBrands.some(b => (brand || '').toLowerCase().includes(b));
          const multiplier = isPremium ? 1.5 : 1.0;
          const laborCost = 2500 * multiplier;
          const totalMin = Math.round((partCost * multiplier) + laborCost);
          const totalMax = Math.round(totalMin * 1.3);

          return {
            partName: (realPart && realPart.name) || partName,
            oemNumber: (realPart && realPart.oemNumber) || oemNumber || null,
            priceKnown,
            inStock: realPart ? (realPart.stock > 0) : null,
            estimatedRange: `${totalMin.toLocaleString('tr-TR')} TL - ${totalMax.toLocaleString('tr-TR')} TL`,
            breakdown: { part: Math.round(partCost * multiplier), labor: laborCost, region: 'Fethiye' },
            note: priceKnown
              ? 'Parça fiyatı servis kataloğundan alınmıştır; işçilik bölgesel tahmindir.'
              : 'Parça fiyatı katalogda kayıtlı değil; verilen aralık kaba tahmindir, kesin fiyat için servise danışın.'
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
          try {
            const results = await self.semanticSearch(query, 5, brandSlug);
            return { success: true, results };
          } catch (e) {
            return { success: false, error: e.message };
          }
        }
      })
    };
  }

  async semanticSearch(query, limit = 5, brandSlug = null) {
    const startTime = Date.now();
    const values = await this.aiProvider.generateEmbedding(query);
    const vectorStr = `[${values.join(',')}]`;

    let results;
    if (brandSlug) {
      results = await prisma.$queryRawUnsafe(`
        SET hnsw.ef_search = 120;
        SELECT f.code, f."symptoms", f."commonCauses", v.model as model, m.name as brand,
               1 - (f.embedding <=> $1::vector) as similarity,
               (f.embedding <=> $1::vector) as distance
        FROM "FaultCode" f
        LEFT JOIN "Vehicle" v ON f."vehicleId" = v.id
        LEFT JOIN "Manufacturer" m ON v."manufacturerId" = m.id
        WHERE (m.name ILIKE $2 OR $2 IS NULL) AND f.embedding IS NOT NULL AND (1 - (f.embedding <=> $1::vector)) > 0.85
        ORDER BY f.embedding <=> $1::vector ASC
        LIMIT $3;
      `, vectorStr, `%${brandSlug}%`, limit);
    } else {
      results = await prisma.$queryRawUnsafe(`
        SET hnsw.ef_search = 120;
        SELECT f.code, f."symptoms", f."commonCauses", f."description", v.model as model, m.name as brand,
               1 - (f.embedding <=> $1::vector) as similarity,
               (f.embedding <=> $1::vector) as distance
        FROM "FaultCode" f
        LEFT JOIN "Vehicle" v ON f."vehicleId" = v.id
        LEFT JOIN "Manufacturer" m ON v."manufacturerId" = m.id
        WHERE f.embedding IS NOT NULL AND (1 - (f.embedding <=> $1::vector)) > 0.85
        ORDER BY f.embedding <=> $1::vector ASC
        LIMIT $2;
      `, vectorStr, limit);
    }

    const latency = Date.now() - startTime;
    
    results.forEach(r => {
       Logger.info('Retrieval Log', {
           Question: query,
           EmbeddingDistance: r.distance,
           RetrievedFaultCode: r.code,
           RetrievedSource: `${r.brand} ${r.model}`,
           Similarity: r.similarity,
           Latency: `${latency}ms`
       });
    });

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
}

