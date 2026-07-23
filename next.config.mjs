import './src/lib/env-config.js';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');

// Sentry has been removed.
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone',
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
  experimental: {
    ppr: 'incremental',
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


    return [
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
};
 
import withBundleAnalyzer from '@next/bundle-analyzer';

const analyzerPlugin = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default analyzerPlugin(withNextIntl(nextConfig));
