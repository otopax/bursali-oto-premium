import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');

// Sentry wrapper — DSN varsa source map upload + release tracking yapar,
// yoksa no-op (build kırılmaz). Faz A / Görev 5.
let withSentryConfig = (config) => config;
try {
  const sentryPkg = await import('@sentry/nextjs');
  if (sentryPkg?.withSentryConfig) {
    withSentryConfig = sentryPkg.withSentryConfig;
  }
} catch {
  // Sentry paketi kurulmamışsa (opt-out) sessizce geç
}
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // www'suz → www'lu 301 kalıcı yönlendirme (Faz A / Görev 2)
  // Google canonical'ı tek tip toplasın diye şart. Vercel Dashboard'da da
  // yapılabilir ama defense-in-depth için burada da tanımlı.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'bursaliotoservis.com' }],
        destination: 'https://www.bursaliotoservis.com/:path*',
        permanent: true,
      },
      // 404 & Login Regressions 301 Redirects
      {
        source: '/:locale(tr|en|ru|uk|ar)/hizmetler',
        destination: '/:locale/ariza-cozumleri',
        permanent: true,
      },
      {
        source: '/:locale(tr|en|ru|uk|ar)/markalar',
        destination: '/:locale',
        permanent: true,
      },
      {
        source: '/:locale(tr|en|ru|uk|ar)/katalog',
        destination: '/:locale',
        permanent: true,
      },
      {
        source: '/:locale(tr|en|ru|uk|ar)/ariza-kodlari',
        destination: '/:locale/ariza-cozumleri',
        permanent: true,
      },
      {
        source: '/:locale(tr|en|ru|uk|ar)/bilgi-bankasi',
        destination: '/:locale/ariza-cozumleri',
        permanent: true,
      },
      {
        source: '/:locale(tr|en|ru|uk|ar)/blog',
        destination: '/:locale/ariza-cozumleri',
        permanent: true,
      }
    ];
  },
  async headers() {
    // Kurumsal güvenlik başlıkları (Enterprise Security Headers)
    const ContentSecurityPolicy = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://challenges.cloudflare.com https://maps.googleapis.com https://va.vercel-scripts.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' blob: data: https:;
      font-src 'self' data: https://fonts.gstatic.com;
      connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://challenges.cloudflare.com https://maps.googleapis.com https://vitals.vercel-insights.com;
      frame-src 'self' https://challenges.cloudflare.com https://www.google.com https://www.youtube.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), usb=(), bluetooth=()' }
        ],
      },
    ];
  },
};
 
// Sentry seçenekleri — org/project env'den okunur; yoksa source map yükleme kapalı.
const sentryBuildOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

import withBundleAnalyzer from '@next/bundle-analyzer';

const analyzerPlugin = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default analyzerPlugin(withSentryConfig(withNextIntl(nextConfig), sentryBuildOptions));
