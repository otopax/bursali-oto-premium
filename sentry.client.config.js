import * as Sentry from '@sentry/nextjs';

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    // Performance monitoring — trafiğin %10'u örneklenir
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Session replay — prod ortamında trafiğin %1'i, hataların %100'ü
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.0,
    replaysOnErrorSampleRate: 1.0,
    // Prod'da debug kapalı
    debug: false,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development',
    release: process.env.NEXT_PUBLIC_APP_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || '0.1.0',
    // Bazı gürültülü hataları filtrele
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
    ],
    // PII (KVKK) Data Scrubbing: IP, Telefon, VIN, JWT, Plate, GPS Maskeleme
    beforeSend(event) {
      if (event.user) {
        delete event.user.ip_address;
      }

      // Headers scrub (Token / Cookie)
      if (event.request?.headers) {
        if (event.request.headers['authorization']) {
          event.request.headers['authorization'] = '[MASKED_AUTH]';
        }
        if (event.request.headers['cookie']) {
          event.request.headers['cookie'] = '[MASKED_COOKIE]';
        }
      }
      
      if (event.request && event.request.data) {
        try {
          let bodyStr = typeof event.request.data === 'string' ? event.request.data : JSON.stringify(event.request.data);
          // Mask 17-char VINs
          bodyStr = bodyStr.replace(/[A-HJ-NPR-Z0-9]{17}/gi, '[MASKED_VIN]');
          // Mask Phone Numbers (+905..., 05...)
          bodyStr = bodyStr.replace(/(\+90|0)?5\d{2}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/g, '[MASKED_PHONE]');
          // Mask JWT Tokens
          bodyStr = bodyStr.replace(/eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, '[MASKED_JWT]');
          // Mask Turkish Plates (e.g., 34ABC123, 34 ABC 123)
          bodyStr = bodyStr.replace(/\b([0-8][0-9])\s?[A-Z]{1,3}\s?(\d{2,4})\b/g, '[MASKED_PLATE]');
          // Mask GPS Coordinates (e.g., "lat": 41.0082, "lng": 28.9784)
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
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
} else {
  // eslint-disable-next-line no-console
  console.info('[Sentry] DSN yok — client-side Sentry devre dışı.');
}
