# Observability Standard (Gözlemlenebilirlik Standardı)

Sistemdeki her servisin (Next.js, Worker, DB) sahip olması gereken standart metrikler ve loglama kuralları.

## Zorunlu Dashboard Panelleri
1. **Availability:** % (Uptime)
2. **Latency:** p50, p95, p99 gecikme süreleri.
3. **Error Rate:** 5xx hatalarının yüzdesi.
4. **Saturation (Doygunluk):** Redis Memory kullanımı, DB Connection sayısı, CPU load.
5. **Business Context:** Saniyedeki yeni randevu, AI Token tüketim hızı.

## Loglama Standardı
Pino logger kullanılarak her log satırında `correlationId`, `userId`, `action` ve `timestamp` bulunmalıdır.
