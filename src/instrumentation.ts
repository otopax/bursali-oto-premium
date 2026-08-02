export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // We only enable OpenTelemetry on the Node.js runtime (server side)
      const { registerOTel } = require('@vercel/otel');

      registerOTel({
        serviceName: 'bursali-oto-service',
      });
    } catch {
      // @vercel/otel is optional
    }
  }
}
