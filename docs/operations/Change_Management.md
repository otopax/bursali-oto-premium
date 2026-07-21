# Change Management (Değişiklik Yönetimi - ITIL)

Üretim (Production) ortamına yapılacak her müdahale risk barındırır. Değişiklikler 3 kategoriye ayrılır:

## 1. Standard Change (Standart Değişiklik)
- **Tanım:** Düşük riskli, sık yapılan ve önceden onaylanmış işlemler (Örn: Blog yazısı ekleme, UI metin değişikliği).
- **Onay:** Otomatik (PR Approve yeterli).
- **Rollback:** `git revert`

## 2. Normal Change (Normal Değişiklik)
- **Tanım:** Yeni özellik eklenmesi, veritabanı şema değişikliği (Örn: Prisma model güncellemesi).
- **Onay:** Kod Review + QA Onayı.
- **Rollback:** Veritabanı yedeğinden dönme veya Feature Flag kapatma.

## 3. Emergency Change (Acil Değişiklik - Hotfix)
- **Tanım:** Canlı ortamdaki kritik bir hatayı (P1) çözmek için mesai dışı yapılan acil müdahale.
- **Onay:** SRE Lead veya CTO sözlü/Slack onayı.
- **Rollback:** Önceki stabil Docker imajına (Railway Revert) saniyeler içinde dönme.
