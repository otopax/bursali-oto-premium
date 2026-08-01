import './src/lib/env-config.js';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');

// Sentry is enabled.
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone',
  // BUILD OOM FIX: ağır server-only paketleri webpack bundle'ından ÇIKAR (external bırak).
  // Bunları derlemek/parse etmek webpack heap'ini şişiriyordu (OOM webpack fazındaydı).
  // Runtime'da node_modules'tan require edilirler; bundle'a girmezler.
  serverExternalPackages: [
    'puppeteer-core',
    '@aws-sdk/client-s3',
    '@aws-sdk/s3-request-presigner',
    'exiftool-vendored',
    'jspdf',
    'jspdf-autotable',
    'ytdl-core',
    'youtube-transcript',
    'bullmq',
    'ioredis',
    'cheerio',
  ],
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
    minimumCacheTTL: 2592000,
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
      },
      // Kod makaleleri Kütüphane'ye taşındı (model="Tüm Modeller"): eski ariza-cozumleri linkleri → kutuphane
      {
        source: '/:locale(tr|en|ru|uk|ar)/ariza-cozumleri/:brand/tum-modeller/:slug',
        destination: '/:locale/kutuphane/:slug',
        permanent: true,
      }
    ];
  },
  async headers() {
    // Kurumsal güvenlik başlıkları (Enterprise Security Headers)


    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, s-maxage=31536000, immutable' },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/(bg.webp|bg.png|avatar.png|gallery-(.*))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, s-maxage=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.woff2',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, s-maxage=31536000, immutable' },
        ],
      },
      {
        source: '/(llms.txt|llms-full.txt)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), usb=(), bluetooth=()' }
        ],
      },
    ];
  },

  // BUILD OOM FIX: webpack build cache'i belleği şişiriyordu; derleme sırasında kapat.
  // (Yalnız build hızını biraz düşürür; RAM tüketimini belirgin azaltır.)
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};
 
import { withSentryConfig } from "@sentry/nextjs";
import withBundleAnalyzer from '@next/bundle-analyzer';

const analyzerPlugin = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const baseConfig = analyzerPlugin(withNextIntl(nextConfig));

export default withSentryConfig(baseConfig, {
  silent: true,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: "/monitoring",
  disableLogger: true,
});
