import * as Sentry from '@sentry/nextjs';

const DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: false,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    release: process.env.NEXT_PUBLIC_APP_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || '0.1.0',
    integrations: (defaultIntegrations) => defaultIntegrations,
    beforeSend(event) {
      if (event.request?.cookies) delete event.request.cookies;
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      if (event.user) {
        delete event.user.ip_address;
      }
      if (event.request && event.request.data) {
        try {
          let bodyStr = typeof event.request.data === 'string' ? event.request.data : JSON.stringify(event.request.data);
          bodyStr = bodyStr.replace(/[A-HJ-NPR-Z0-9]{17}/gi, '[MASKED_VIN]');
          bodyStr = bodyStr.replace(/(\+90|0)?5\d{2}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/g, '[MASKED_PHONE]');
          bodyStr = bodyStr.replace(/eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, '[MASKED_JWT]');
          bodyStr = bodyStr.replace(/\b([0-8][0-9])\s?[A-Z]{1,3}\s?(\d{2,4})\b/g, '[MASKED_PLATE]');
          bodyStr = bodyStr.replace(/"lat"\s*:\s*-?\d+\.\d+/gi, '"lat":"[MASKED]"');
          bodyStr = bodyStr.replace(/"lng"\s*:\s*-?\d+\.\d+/gi, '"lng":"[MASKED]"');
          bodyStr = bodyStr.replace(/"latitude"\s*:\s*-?\d+\.\d+/gi, '"latitude":"[MASKED]"');
          bodyStr = bodyStr.replace(/"longitude"\s*:\s*-?\d+\.\d+/gi, '"longitude":"[MASKED]"');
          event.request.data = JSON.parse(bodyStr);
        } catch (e) {
          // parse hatası olursa atla
        }
      }
      return event;
    },
  });
} else {
  // eslint-disable-next-line no-console
  console.info('[Sentry] SENTRY_DSN yok — server-side Sentry devre dışı.');
}
