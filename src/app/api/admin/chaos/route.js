import { NextResponse } from 'next/server';
import { Logger } from '@/lib/observability/Logger';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req) {
  const traceId = req.headers.get('x-correlation-id') || crypto.randomUUID();
  const spanId = crypto.randomUUID();
  
  // Sadece yetkili hesaplar bu route'u çağırabilmeli (Middleware'de Fail-Closed test ediliyor)
  const role = req.headers.get('x-user-role');
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    Logger.warn('Unauthorized Chaos testing attempt', { traceId, spanId, role });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { scenario } = await req.json();

  Logger.info(`Starting Chaos Scenario: ${scenario}`, { traceId, spanId });

  try {
    switch (scenario) {
      case 'redis_down': {
        // Redis connection simulation failure
        Logger.debug('Simulating Redis timeout...', { traceId, spanId });
        await new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 500));
        break;
      }
      case 'db_timeout': {
        // Simüle edilmiş Prisma timeout
        Logger.debug('Simulating Prisma query timeout...', { traceId, spanId });
        // Gerçekte prisma'ya aşırı yük bindirebiliriz ama burada error throw ediyoruz:
        const start = Date.now();
        await new Promise((_, reject) => setTimeout(() => reject(new Error('P2024: Timed out fetching a new connection from the connection pool')), 1000));
        break;
      }
      case 'gemini_timeout': {
        Logger.debug('Simulating Gemini API Timeout & Circuit Breaker...', { traceId, spanId });
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 100); // Kasıtlı çok kısa timeout
        
        try {
          await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
            signal: controller.signal
          });
        } catch (err) {
          clearTimeout(timeoutId);
          // Circuit breaker devreye giriyor
          Logger.warn('Circuit Breaker OPEN for Gemini', { 
            traceId, 
            spanId,
            error: err.message,
            fallbackEngaged: true
          });
          return NextResponse.json({ 
            success: true, 
            message: 'Gemini timed out. Fallback engaged.',
            traceId
          });
        }
        break;
      }
      default:
        return NextResponse.json({ error: 'Unknown scenario' }, { status: 400 });
    }
  } catch (error) {
    // Merkezi Hata Yakalama (Sentry / OTel'e gidecek yer)
    Logger.error(`Chaos Scenario Failed: ${scenario}`, {
      traceId,
      spanId,
      error: error.message,
      stack: error.stack,
      degraded: true
    });
    
    // Sağlık durumunu (Health API) degraded olarak işaretlemek için (Opsiyonel state tutulabilir)
    // Global değişken veya Redis kullanılabilir (eğer Redis çökmediyse).
    
    return NextResponse.json({
      success: false,
      scenario,
      error: error.message,
      traceId,
      status: 'DEGRADED'
    }, { status: 503 });
  }

  return NextResponse.json({ success: true, scenario, traceId });
}
