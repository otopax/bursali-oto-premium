// Sentry Server-side yapılandırması (Faz A / Görev 5)
// Node.js API routes, server components, ve middleware hatalarını yakalar.
// DSN yoksa init olmaz.
import * as Sentry from '@sentry/nextjs';

const DSN = process.env.SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: false,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION,
    // Prisma sorguları için otomatik span (yavaş sorgu tespiti)
    integrations: (defaultIntegrations) => defaultIntegrations,
    // PII sızıntısını engelle — password, token, sessionId gibi alanları maskele
    beforeSend(event) {
      if (event.request?.cookies) delete event.request.cookies;
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      return event;
    },
  });
} else {
  // eslint-disable-next-line no-console
  console.info('[Sentry] SENTRY_DSN yok — server-side Sentry devre dışı.');
}
