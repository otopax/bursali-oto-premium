// Sentry test API endpoint (Faz A / Görev 5)
// Bilinçli hata fırlatır — Sentry server SDK yakalar.
export const dynamic = 'force-dynamic';

export async function GET() {
  throw new Error('Sentry test hatası (server API) — bu bilinçli üretilmiştir.');
}
