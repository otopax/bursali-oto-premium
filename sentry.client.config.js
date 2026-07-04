// Sentry Client-side yapılandırması (Faz A / Görev 5)
// Tarayıcıda çalışan React bileşenlerindeki hataları yakalar.
// DSN yoksa (env boş) Sentry init edilmez → hiçbir istek gitmez.
import * as Sentry from '@sentry/nextjs';

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    // Performance monitoring — trafiğin %10'u örneklenir (bedava plan quota tasarrufu)
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Session replay — bug'ı görsel olarak kaydeder (opsiyonel, quota kullanır)
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0, // hata olursa session'ı kaydet
    // Prod'da debug kapalı
    debug: false,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION,
    // Bazı gürültülü hataları filtrele
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
    ],
  });
} else {
  // eslint-disable-next-line no-console
  console.info('[Sentry] DSN yok — client-side Sentry devre dışı.');
}
