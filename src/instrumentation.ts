export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // We only enable OpenTelemetry on the Node.js runtime (server side)
    const { registerOTel } = require('@vercel/otel');

    registerOTel({
      serviceName: 'bursali-oto-service',
      // If Sentry is enabled, it handles its own OTel initialization, but this is for generic OTel
    });
  }
}
