// Next.js Instrumentation Hook (Faz A / Görev 5)
// Server ve Edge runtime başlatılırken çalışır — Sentry init'i buradan yönlendirilir.
// DSN yoksa import edilen config dosyaları sessizce no-op olur.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Sentry v8+ için request hata yakalama hook'u
export const onRequestError = async (err, request, context) => {
  // Sentry SDK client varsa yakala (yoksa sessizce geç)
  try {
    const Sentry = await import('@sentry/nextjs');
    if (typeof Sentry.captureRequestError === 'function') {
      Sentry.captureRequestError(err, request, context);
    }
  } catch {
    // Sentry yüklü değilse (dev veya opt-out) sessiz geç
  }
};
