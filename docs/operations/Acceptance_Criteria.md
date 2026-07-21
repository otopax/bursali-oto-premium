# Operational Acceptance Criteria (OAC)

Yeni bir servisin veya büyük bir modülün canlı ortama (Production) alınabilmesi için operasyonel kabul kriterleri:

| Kriter | Açıklama | Onay |
| :--- | :--- | :--- |
| **Unit Test Coverage** | Kritik iş mantıklarında (Fatura, Randevu) > %80. | [ ] |
| **E2E Testing** | Playwright ile ana kullanıcı akışları test edildi. | [ ] |
| **Lighthouse Score** | Performans > 90, TBT < 100ms. | [ ] |
| **SLO & Alerts** | P99 gecikme < 1.5s için Sentry/Datadog uyarısı kuruldu. | [ ] |
| **Dashboard** | Sistemin anlık metrikleri KPI paneline eklendi. | [ ] |
| **Runbook** | Hata anında yapılacaklar belgelendi. | [ ] |
