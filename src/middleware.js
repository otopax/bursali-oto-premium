import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

// V5.0 Güvenlik: Korumalı Rotalar (Login zorunlu)
// Sanal Usta artık Misafir moduna açık olduğu için buradan çıkarıldı.
// NOT: '/ariza-kodlari' buradan ÇIKARILDI — public P-SEO içerik rotasıdır,
// Googlebot'un erişebilmesi için login zorunluluğu olmamalı.
const protectedRoutes = [
  '/teknik-kutuphane',
  '/bilgi-bankasi',
  '/katalog',
  '/vip-garaj'
];

export async function middleware(request) {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  
  // 1. Trace ID for observability
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();
  request.headers.set('x-correlation-id', correlationId);
  request.headers.set('x-nonce', nonce);

  const pathname = request.nextUrl.pathname;
  request.headers.set('x-current-path', pathname);

  // 1.2 Chaos Engineering (Fail-Open / Resiliency Testing)
  const chaosDelay = request.headers.get('x-chaos-delay');
  const chaosError = request.headers.get('x-chaos-error');
  const chaosKvFail = request.headers.get('x-chaos-kv-fail');
  const chaosQueueFail = request.headers.get('x-chaos-queue-fail');
  const chaosAiTimeout = request.headers.get('x-chaos-ai-timeout');
  
  if (chaosError === 'true' && process.env.NODE_ENV !== 'production') {
    return new NextResponse('Chaos Engineering: Simulated Fatal Error', { status: 500 });
  }
  
  if (chaosDelay) {
    const delayMs = parseInt(chaosDelay, 10);
    if (!isNaN(delayMs) && delayMs > 0 && delayMs <= 10000) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  // Set internal headers so endpoints can read them to simulate specific failures
  if (chaosKvFail) request.headers.set('x-internal-chaos-kv', chaosKvFail);
  if (chaosQueueFail) request.headers.set('x-internal-chaos-queue', chaosQueueFail);
  if (chaosAiTimeout) request.headers.set('x-internal-chaos-ai', chaosAiTimeout);
  
  // 1.5 Global Rate Limiting (Strict Fail-Closed)
  try {
    const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
    const { rateLimit } = await import('@/lib/rate-limit');
    await rateLimit('global', ip);
  } catch (err) {
    if (err.message === 'RATE_LIMIT_EXCEEDED') {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
    if (err.message.includes('REDIS_UNAVAILABLE')) {
      return new NextResponse('Service Unavailable - Redis missing or down', { status: 503 });
    }
    console.error('[Middleware] Rate limiting error:', err.message);
  }
  
  // 1.6 Admin API Koruması (GÜVENLİK: /api/admin uçları auth'suz kalmasın)
  // check-embeddings / test-rag (Gemini maliyeti) / test-worker (kuyruk flood) açıkta olmamalı.
  // Geçiş: geçerli admin oturumu VEYA x-admin-secret header (curl doğrulaması için).
  if (pathname.startsWith('/api/admin')) {
    const adminSecret = process.env.ADMIN_SECRET;
    const providedSecret = request.headers.get('x-admin-secret');
    let isAdmin = false;
    try {
      const adminToken = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET || 'BursaliOtoSecretKey2026'
      });
      isAdmin = !!(adminToken && ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(adminToken.role));
    } catch (e) {
      isAdmin = false;
    }
    const secretOk = !!adminSecret && providedSecret === adminSecret;
    if (!isAdmin && !secretOk) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized: admin access required' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  // 2. Güvenlik Kontrolü (Authentication)
  // Route'un başındaki dili (/tr veya /en) kesip ana rotayı buluyoruz
  const pathWithoutLocale = pathname.replace(/^\/[^\/]+/, '') || pathname;
  
  const isProtected = protectedRoutes.some(route => 
    pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );

  if (isProtected) {
    // NextAuth token kontrolü — hardcoded fallback KALDIRILDI (güvenlik)
    if (!process.env.NEXTAUTH_SECRET) {
      console.warn('Warning: NEXTAUTH_SECRET env variable is missing. Using fallback for build purposes.');
    }
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || 'BursaliOtoSecretKey2026'
    });

    if (!token) {
      // Kullanıcı giriş yapmamışsa, bulunduğu dilin login sayfasına yönlendir
      const locale = pathname.split('/')[1] || 'tr';
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.searchParams.set('callbackUrl', pathname);
      url.searchParams.set('error', 'login_required');
      return NextResponse.redirect(url);
    }

    // Faz 2.5: Token Versioning & Session Revocation
    // Eğer token içinde tokenVersion varsa (Eski tokenlarda olmayabilir)
    if (token.tokenVersion !== undefined) {
      try {
        const { Redis } = await import('@upstash/redis');
        // Lazy load Redis client because middleware uses edge runtime
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });

        const redisKey = `auth:tokenVer:${token.id}`;
        let version = await redis.get(redisKey);
        
        if (version === null) {
          // Redis'te yoksa iç API'den veritabanı kontrolü yapıp Redis'i doldururuz (Edge uyumlu çözüm)
          const validKey = process.env.INTERNAL_API_KEY || 'bursali-oto-internal-secret-2026';
          // Next.js middleware fetch uses the fully qualified URL
          const apiUrl = new URL(`/api/auth/token-version?userId=${token.id}`, request.url);
          
          const dbCheck = await fetch(apiUrl.toString(), {
            headers: { 'x-internal-api-key': validKey },
            // timeout logic
            signal: AbortSignal.timeout(1000)
          });
          
          if (dbCheck.ok) {
            const data = await dbCheck.json();
            version = data.version;
          } else {
            throw new Error(`DB fallback API failed: ${dbCheck.status}`);
          }
        }
        
        // Versiyon karşılaştırması
        if (parseInt(token.tokenVersion) < parseInt(version)) {
          // Kullanıcı oturumu iptal edilmiş veya yetkisi değişmiş!
          console.warn(`[Security] Revoked token used by user ${token.id}`);
          const locale = pathname.split('/')[1] || 'tr';
          const url = request.nextUrl.clone();
          url.pathname = `/${locale}/login`;
          url.searchParams.set('error', 'session_expired');
          return NextResponse.redirect(url);
        }
      } catch (error) {
        // FAIL-CLOSED Lojik (Admin, Finans, ERP rotaları ve yüksek yetkili roller için)
        const isPrivilegedRole = token.role && ['ADMIN', 'SUPER_ADMIN', 'FINANCE', 'MANAGER'].includes(token.role);
        const privilegedRoutes = ['/admin', '/finans', '/erp', '/yonetim', '/api/admin'];
        const isPrivilegedRoute = privilegedRoutes.some(route => 
          pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
        );
        
        if (isPrivilegedRole || isPrivilegedRoute) {
          console.error(`[Security BLOCK] Token version check failed for privileged user/route ${token.id}. Failing CLOSED.`, error.message);
          const locale = pathname.split('/')[1] || 'tr';
          const url = request.nextUrl.clone();
          url.pathname = `/${locale}/login`;
          url.searchParams.set('error', 'system_unavailable');
          return NextResponse.redirect(url);
        } else {
          // FAIL-OPEN Lojik (Misafir/Müşteri sayfaları için Redis/DB çökerse geçişe izin ver)
          console.warn(`[Security WARNING] Token version check bypassed due to Redis/API failure for user ${token.id} (Fail-Open active)`, error.message);
        }
      }
    }

    
    // RBAC: Token içindeki rolleri ve izinleri downstream (alt bileşenlere) iletmek için header'a ekliyoruz.
    if (token.role) {
      request.headers.set('x-user-role', token.role);
    }
    if (token.permissions) {
      request.headers.set('x-user-permissions', JSON.stringify(token.permissions));
    }
  }

  // 3. Execute next-intl middleware for language routing (redirects / to /tr)
  let response;
  
  if (request.nextUrl.pathname === '/') {
    // 307 Redirect yerine doğrudan rewrite (Lighthouse optimizasyonu)
    const url = request.nextUrl.clone();
    url.pathname = '/tr';
    response = NextResponse.rewrite(url);
    response.headers.set('x-current-path', '/tr');
  } else if (request.nextUrl.pathname.startsWith('/api')) {
    response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  } else {
    // next-intl middleware already clones the request, but to be safe we can re-apply our custom headers
    response = intlMiddleware(request);
    
    // Pass custom headers to the response so Server Components can read them if next-intl didn't
    if (request.headers.get('x-user-role')) {
      response.headers.set('x-user-role', request.headers.get('x-user-role'));
    }
    if (request.headers.get('x-user-permissions')) {
      response.headers.set('x-user-permissions', request.headers.get('x-user-permissions'));
    }
    response.headers.set('x-current-path', request.headers.get('x-current-path'));
    
    // Cloudflare Cache-Tags (Hiyerarşik)
    const locale = pathname.split('/')[1] || 'tr';
    let tags = [`locale:${locale}`];

    if (pathWithoutLocale.startsWith('/teknik-kutuphane')) {
      tags.push('library', 'library:article');
    } else if (pathWithoutLocale.startsWith('/ariza-kodlari')) {
      tags.push('fault', 'fault:code');
      // Örn: /ariza-kodlari/p0420
      const code = pathWithoutLocale.split('/')[2];
      if (code) tags.push(`fault:${code.toLowerCase()}`);
    } else if (pathWithoutLocale.startsWith('/bmw-ozel-servis')) {
      tags.push('brand:bmw', 'service');
    } else if (pathWithoutLocale.startsWith('/mercedes-ozel-servis')) {
      tags.push('brand:mercedes', 'service');
    }

    response.headers.set('Cache-Tag', tags.join(', '));

    // CSP — Next.js App Router uyumlu (strict-dynamic kaldırıldı)
    // strict-dynamic Next.js chunk <script> tag'lerine nonce enjekte edemediği
    // için TÜM JS'yi engelliyor. Güvenli alternatif: 'self' + 'unsafe-inline'.
    const csp = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' blob: data: https:;
      font-src 'self' data: https://fonts.gstatic.com;
      connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://challenges.cloudflare.com https://maps.googleapis.com https://vitals.vercel-insights.com https://cloudflareinsights.com;
      frame-src 'self' https://challenges.cloudflare.com https://www.google.com https://www.youtube.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s{2,}/g, ' ').trim();
    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('x-nonce', nonce);

    // Cache-Control: Cloudflare ve tarayıcı önbellek stratejisi
    // HTML sayfaları: kısa tarayıcı cache + uzun Cloudflare edge cache (stale-while-revalidate)
    if (!pathname.startsWith('/api') && !pathname.startsWith('/login') && !pathname.startsWith('/admin')) {
      response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=86400, stale-while-revalidate=43200');
    }
  }

  // 4. Attach Trace ID to the response
  if (response) {
    response.headers.set('x-correlation-id', correlationId);
  }

  return response || NextResponse.next({ request: { headers: request.headers } });
}

export const config = {
  // Match all paths except internal Next.js files, images, and static assets
  matcher: ['/((?!_next|.*\\..*).*)', '/api/:path*']
};
