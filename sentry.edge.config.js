// Sentry Edge Runtime yapılandırması (Faz A / Görev 5)
// middleware.js ve Edge API route hatalarını yakalar.
import * as Sentry from '@sentry/nextjs';

const DSN = process.env.SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: false,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION,
  });
}
