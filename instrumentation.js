// Next.js Instrumentation Hook (Faz A / Görev 5)
// Sentry has been removed. OpenTelemetry will be implemented here.

import { registerOTel } from '@vercel/otel';

export async function register() {
  registerOTel({ serviceName: 'bursali-oto-premium' });
}

