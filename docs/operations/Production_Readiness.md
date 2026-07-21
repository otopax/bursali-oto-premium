# Production Readiness Checklist

Yeni bir özellik veya mikroservis canlıya alınmadan önce aşağıdaki liste %100 tamamlanmış olmalıdır:

- [ ] **Data:** Prisma Migration (`migrate deploy`) test ortamında doğrulandı mı?
- [ ] **Rollback:** İşler ters giderse nasıl geri alınacağı (Rollback Plan) belli mi?
- [ ] **Load Test:** Beklenen trafiği kaldırabiliyor mu? (K6 ile test edildi mi?)
- [ ] **Observability:** Sentry Error Tracking entegre mi? Özel metrikler eklendi mi?
- [ ] **Feature Flag:** Sorun anında kodu silmeden özelliği kapatabileceğimiz flag var mı?
- [ ] **Security:** Rate limiting ve input validation (Zod) eklendi mi?
- [ ] **Runbooks:** Özellik çökerse ne yapılacağı Runbook'lara eklendi mi?
- [ ] **KPI:** Değişikliğin iş hedeflerine (Conversion, Latency) etkisi ölçülebiliyor mu?
