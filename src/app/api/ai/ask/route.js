// V5.0 ULTIMATE: Tum sistem entegrasyon endpoint'i (App Router).
// Migrated from src/pages/api/ai/ask.js -> App Router format.
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { AIOrchestrator } from '@/domains/AI/AIOrchestrator';
import { Guardrails } from '@/domains/Security/Guardrails';
import { EventBus } from '@/lib/events/EventBus';
import { QuotaManager } from '@/domains/Customer/QuotaManager';
import { PredictiveEngine } from '@/domains/Vehicle/PredictiveEngine';
import KnowledgeGraph from '@/domains/Knowledge/KnowledgeGraph';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { CloudflareKV } from '@/lib/cloudflare/kv';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req) {
  try {
    const { prompt, vehicleId, ip: bodyIp } = await req.json();
    const ip = bodyIp || req.headers.get('x-forwarded-for') || '127.0.0.1';
    const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();

    // 0. Rate Limit (fail-closed — AI kotasını korur)
    const limitStatus = await rateLimit('ai:ask', ip, 20, 60, { failClosed: true });
    if (!limitStatus.success) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }

    // 1. Guvenlik Duvari (Guardrails)
    const safePrompt = Guardrails.process(prompt);

    // 2. Kota Kontrolu (Guest icin)
    const quota = await QuotaManager.checkGuestQuota(ip);
    if (!quota.allowed) {
      return NextResponse.json({ error: quota.reason }, { status: 429 });
    }

    // KV Cache Check
    const cacheKey = crypto.createHash('sha256').update(safePrompt + (vehicleId || '')).digest('hex');
    const cachedResponse = await CloudflareKV.getAiCache(cacheKey);
    
    if (cachedResponse) {
      // 6. Kota tuket (Cache'den gelse de kotadan düşüyoruz, çünkü ticari mantık)
      await QuotaManager.consumeGuestQuota(ip);
      return NextResponse.json({
        ...cachedResponse,
        correlationId,
        cached: true
      });
    }

    // 3. AI Sorgusu (Circuit Breaker + Timeout + Cost-Aware)
    const aiResponse = await AIOrchestrator.executeWithFallback(safePrompt);

    // 4. Knowledge Graph zenginlestirme
    let diagnosis = null;
    let prediction = null;
    if (vehicleId) {
      const vehicleData = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        include: { manufacturer: true }
      });
      if (vehicleData) {
        diagnosis = await KnowledgeGraph.getCommonFailuresForVehicle(
          vehicleData.manufacturer.name,
          vehicleData.model,
          vehicleData.yearStart
        );
        prediction = await PredictiveEngine.predictFailures({
          make: vehicleData.manufacturer.name,
          model: vehicleData.model,
          mileage: 120000,
          climate: 'Temperate'
        });
      }
    }

    // 5. Event yayin (Idempotency Shield)
    await EventBus.publish('AI_Query_Completed', {
      correlationId,
      vehicleId,
      prompt: safePrompt,
      response: aiResponse,
      timestamp: new Date()
    });

    // 6. Kota tuket
    await QuotaManager.consumeGuestQuota(ip);

    const finalResponse = {
      success: true,
      response: aiResponse,
      diagnosis,
      prediction,
      quotaUsed: 1
    };

    // Background'da KV'ye yaz (hata verirse akışı bölmesin)
    CloudflareKV.setAiCache(cacheKey, finalResponse).catch(e => console.error('KV set error', e));

    return NextResponse.json({ ...finalResponse, correlationId });
  } catch (error) {
    console.error('[API/ai/ask] Hata:', error.message);
    if (error.message === 'CIRCUIT_BREAKER_OPEN_ALL') {
      return NextResponse.json({ error: 'Sanal Usta şu anda yoğun, lütfen bizi arayın.' }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
