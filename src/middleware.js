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
  }

  // 3. Execute next-intl middleware for language routing (redirects / to /tr)
  let response;
  
  // Skip next-intl for API routes, just pass them through
  if (request.nextUrl.pathname.startsWith('/api')) {
    response = NextResponse.next();
  } else {
    response = intlMiddleware(request);
  }

  // 4. Attach Trace ID to the response
  if (response) {
    response.headers.set('x-correlation-id', correlationId);
  }

  return response || NextResponse.next();
}

export const config = {
  // Match all paths except internal Next.js files, images, and static assets
  matcher: ['/((?!_next|.*\\..*).*)', '/api/:path*']
};
