/**
 * robots.txt generator (Faz A / Görev 1)
 * - www.bursaliotoservis.com base
 * - Tüm locale prefix'ler için admin/api/vip-garaj/login disallow
 * - Sitemap işaretlenmiş
 */
export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/*/admin/',
          '/vip-garaj/',
          '/*/vip-garaj/',
          '/login/',
          '/*/login/',
          '/_next/',
          '/private/',
          '/sentry-example-page',
          '/sentry-example-api',
        ],
      },

    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
