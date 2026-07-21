# Bursalı Oto Premium - Enterprise Platform Playbook

Hoş geldiniz. Bu dizin (directory), Bursalı Oto Premium uygulamasının basit bir web projesinden öte, Fortune 500 ölçeğinde güvenilir (SRE), güvenli (Security) ve yapay zeka entegre (AI Governance) bir platform olarak yıllarca hayatta kalabilmesi için gerekli olan tüm yönergeleri, matrisleri ve kuralları barındırır.

## Dokümantasyon Mimarisi (7 Pillars)

Dokümantasyonumuz 7 ana sütuna ayrılmıştır. Her sütun, platformun belirli bir kurumsal olgunluğunu temsil eder:

1. [Architecture (Mimari)](./architecture/README.md): C4 diyagramları, ADR'ler ve Mimari Prensipler.
2. [Platform (Yönetişim)](./platform/README.md): Servis Katalogları, Veri Akışları ve Capability Matrix.
3. [SRE (Site Reliability)](./sre/README.md): SLO, SLA, Hata Bütçeleri, Timeout/Retry Matrisleri ve Kapasite Planlama.
4. [Security (Güvenlik)](./security/README.md): Tehdit Modelleri (Threat Model), Risk Kütüğü ve Uyumluluk.
5. [AI (Yapay Zeka)](./ai/README.md): RAG, Prompt Registry, Evaluation Pipeline ve AI Güvenliği.
6. [Operations (Operasyon)](./operations/README.md): Runbook'lar, Postmortem Şablonları ve BCP/DR süreçleri.
7. [Engineering (Mühendislik)](./engineering/README.md): Geliştirici Standartları (SOLID, DDD), Onboarding ve Feature Flags.

## Glossary (Kurumsal Sözlük)
- **ADR:** Architecture Decision Record (Mimari Karar Kaydı)
- **BCP:** Business Continuity Plan (İş Sürekliliği Planı)
- **DLQ:** Dead Letter Queue (Hatalı İşler Kuyruğu)
- **MTTR:** Mean Time To Recovery (Ortalama Kurtarma Süresi)
- **MTBF:** Mean Time Between Failures (Ortalama Arıza Arası Süre)
- **SLO/SLI/SLA:** Service Level Objective / Indicator / Agreement
- **PITR:** Point In Time Recovery
- **RAG:** Retrieval-Augmented Generation
- **CQRS:** Command Query Responsibility Segregation
