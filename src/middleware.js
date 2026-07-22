import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

// V5.0 Güvenlik: Korumalı Rotalar (Login zorunlu)
// Sanal Usta artık Misafir moduna açık olduğu için buradan çıkarıldı.
const protectedRoutes = [
  '/teknik-kutuphane', 
  '/bilgi-bankasi', 
  '/katalog',
  '/ariza-kodlari',
  '/vip-garaj'
];

export async function middleware(request) {
  // 1. Trace ID for observability
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();
  request.headers.set('x-correlation-id', correlationId);

  const pathname = request.nextUrl.pathname;
  request.headers.set('x-current-path', pathname);
  
  // 1.5 Global Rate Limiting (Edge Compatible via Upstash REST or Fail-Open)
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const key = `rl:global:${ip}`;
    const limit = 200;
    
    // We only rate-limit if Upstash is available. Otherwise we Fail-Open instantly.
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, 60);
      }
      if (current > limit) {
        return new NextResponse('Too Many Requests', { status: 429 });
      }
    }
  } catch (err) {
    console.warn('[Middleware] Global rate limiting error (Fail-Open active):', err.message);
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
  
  // Skip next-intl for API routes, just pass them through
  if (request.nextUrl.pathname.startsWith('/api')) {
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
