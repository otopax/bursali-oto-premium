import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "production",
  tracesSampleRate: 0.5, // Backend API isteklerinin %50'sini izle
  profilesSampleRate: 0.3, // CPU Profiling (performans darboğazlarını bulmak için)
  enableTracing: true,
});
