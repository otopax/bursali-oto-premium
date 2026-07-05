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
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' }
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

export default withSentryConfig(withNextIntl(nextConfig), sentryBuildOptions);
