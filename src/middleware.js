import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

const protectedRoutes = [
  '/teknik-kutuphane',
  '/bilgi-bankasi',
  '/katalog',
  '/vip-garaj'
];

const privilegedPrefixes = [
  '/admin',
  '/finans',
  '/erp',
  '/yonetim',
  '/api/admin',
  '/api/erp'
];

export async function middleware(request) {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  
  // 1. Trace ID for observability & Anti-Spoofing: Strip client identity headers
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();
  request.headers.set('x-correlation-id', correlationId);
  request.headers.set('x-nonce', nonce);

  // Strip client-controlled user headers to prevent header spoofing attacks
  request.headers.delete('x-user-role');
  request.headers.delete('x-user-permissions');

  const pathname = request.nextUrl.pathname;
  request.headers.set('x-current-path', pathname);

  // Exclude NextAuth internal endpoints from revocation checks so users can log out / fetch sessions
  const isNextAuthInternal = pathname.startsWith('/api/auth');

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
  
  // 1.6 Admin API Protection - Strict NextAuth Token Only (x-admin-secret BYPASS REMOVED)
  if (pathname.startsWith('/api/admin')) {
    let isAdmin = false;
    try {
      const adminToken = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
      });
      const userId = adminToken?.sub || adminToken?.id;
      isAdmin = !!(userId && adminToken && ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(adminToken.role));
    } catch (e) {
      isAdmin = false;
    }
    if (!isAdmin) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized: admin access required' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  // Admin UI Protection - Cryptographic Token & Role Verification
  if (pathname.startsWith('/admin') || pathname.startsWith('/tr/admin') || pathname.startsWith('/en/admin')) {
    let adminToken = null;
    try {
      adminToken = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
      });
    } catch (e) {
      adminToken = null;
    }
    
    const userId = adminToken?.sub || adminToken?.id;
    const isAuthorizedAdmin = !!(userId && adminToken && ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(adminToken.role));

    if (!isAuthorizedAdmin) {
      const locale = pathname.split('/')[1] || 'tr';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      loginUrl.searchParams.set('error', 'admin_required');
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Authentication & Token Revocation Verification
  const pathWithoutLocale = pathname.replace(/^\/[^\/]+/, '') || pathname;
  const isProtected = protectedRoutes.some(route => 
    pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );
  const isPrivilegedRoute = privilegedPrefixes.some(prefix =>
    pathWithoutLocale === prefix || pathWithoutLocale.startsWith(`${prefix}/`) || pathname.startsWith(prefix)
  );

  if ((isProtected || isPrivilegedRoute) && !isNextAuthInternal) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
    });

    if (!token && isProtected) {
      const locale = pathname.split('/')[1] || 'tr';
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.searchParams.set('callbackUrl', pathname);
      url.searchParams.set('error', 'login_required');
      return NextResponse.redirect(url);
    }

    if (token) {
      const userId = token.sub || token.id;
      if (!userId) {
        return new NextResponse(
          JSON.stringify({ success: false, error: 'Unauthorized: Invalid User Identity' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
      }

      // Token Versioning & Session Revocation
      if (token.tokenVersion !== undefined) {
        try {
          const { Redis } = await import('@upstash/redis');
          const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
          });

          const redisKey = `auth:tokenVer:${userId}`;
          let version = await redis.get(redisKey);
          
          if (version === null) {
            const validKey = process.env.INTERNAL_API_KEY;
            const apiUrl = new URL(`/api/auth/token-version?userId=${userId}`, request.url);
            
            const dbCheck = await fetch(apiUrl.toString(), {
              headers: validKey ? { 'x-internal-api-key': validKey } : {},
              signal: AbortSignal.timeout(1000)
            });
            
            if (dbCheck.ok) {
              const data = await dbCheck.json();
              version = data.version;
            } else {
              throw new Error(`DB fallback API failed: ${dbCheck.status}`);
            }
          }
          
          if (parseInt(token.tokenVersion) < parseInt(version)) {
            console.warn(`[Security Block] Revoked token attempt by user ${userId}`);
            if (pathname.startsWith('/api/')) {
              return new NextResponse(
                JSON.stringify({ success: false, error: 'Session Revoked' }),
                { status: 401, headers: { 'content-type': 'application/json' } }
              );
            }
            const locale = pathname.split('/')[1] || 'tr';
            const url = request.nextUrl.clone();
            url.pathname = `/${locale}/login`;
            url.searchParams.set('error', 'session_expired');
            return NextResponse.redirect(url);
          }
        } catch (error) {
          if (isPrivilegedRoute) {
            console.error(`[Security FAIL-CLOSED] Token version check failed for user ${userId}.`, error.message);
            if (pathname.startsWith('/api/')) {
              return new NextResponse(
                JSON.stringify({ success: false, error: 'Service Unavailable: Authentication Verification Failed' }),
                { status: 503, headers: { 'content-type': 'application/json' } }
              );
            }
            const locale = pathname.split('/')[1] || 'tr';
            const url = request.nextUrl.clone();
            url.pathname = `/${locale}/login`;
            url.searchParams.set('error', 'system_unavailable');
            return NextResponse.redirect(url);
          }
        }
      }

      // Propagate verified server-side claims to downstream headers
      if (token.role) {
        request.headers.set('x-user-role', token.role);
      }
      if (token.permissions) {
        request.headers.set('x-user-permissions', JSON.stringify(token.permissions));
      }
    }
  }

  // 3. Execute next-intl middleware for language routing
  let response;
  
  if (request.nextUrl.pathname === '/') {
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
    response = intlMiddleware(request);
    
    if (request.headers.get('x-user-role')) {
      response.headers.set('x-user-role', request.headers.get('x-user-role'));
    }
    if (request.headers.get('x-user-permissions')) {
      response.headers.set('x-user-permissions', request.headers.get('x-user-permissions'));
    }
    response.headers.set('x-current-path', request.headers.get('x-current-path'));
    
    const locale = pathname.split('/')[1] || 'tr';
    let tags = [`locale:${locale}`];

    if (pathWithoutLocale.startsWith('/teknik-kutuphane')) {
      tags.push('library', 'library:article');
    } else if (pathWithoutLocale.startsWith('/ariza-kodlari')) {
      tags.push('fault', 'fault:code');
      const code = pathWithoutLocale.split('/')[2];
      if (code) tags.push(`fault:${code.toLowerCase()}`);
    } else if (pathWithoutLocale.startsWith('/bmw-ozel-servis')) {
      tags.push('brand:bmw', 'service');
    } else if (pathWithoutLocale.startsWith('/mercedes-ozel-servis')) {
      tags.push('brand:mercedes', 'service');
    }

    response.headers.set('Cache-Tag', tags.join(', '));

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

    if (pathname.includes('/ariza-cozumleri')) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    } else if (!pathname.startsWith('/api') && !pathname.startsWith('/login') && !pathname.startsWith('/admin')) {
      response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=86400, stale-while-revalidate=43200');
    }
  }

  if (response) {
    response.headers.set('x-correlation-id', correlationId);
  }

  return response || NextResponse.next({ request: { headers: request.headers } });
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/api/:path*']
};

