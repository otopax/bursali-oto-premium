# Architecture Governance Board (Mimari Yönetişim Kurulu)

Kritik teknik kararlar (Yeni bir veritabanına geçiş, mikroservis mimarisine geçiş vb.) bireysel olarak alınamaz. Aşağıdaki süreç izlenmelidir:

## Karar Süreci (Decision Lifecycle)

1. **RFC (Request for Comments):** Fikri olan mühendis bir RFC belgesi yazar ve ekiple paylaşır.
2. **Architecture Review:** Kurul (CTO, Principal Engineer, Security Lead) RFC'yi inceler.
3. **ADR (Architecture Decision Record):** Karar onaylanırsa `/docs/architecture/ADR/` altına kaydedilir.
4. **Implementation:** Kodlama başlar.
5. **Production:** Canlıya alınır.
6. **Postmortem:** Kararın 6 ay sonraki etkileri (ROI, Performans) değerlendirilir.
