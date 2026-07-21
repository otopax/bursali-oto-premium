# 08. Security & Supply Chain

## 1. Supply Chain & Vulnerability Register

Gerçek çalışma zamanı `npm audit` sonuçlarına dayanan Tedarik Zinciri Güvenliği raporu:

| Paket (Dependency) | Vulnerability | Severity (Önem) | CVE / Çözüm (Mitigation) | Durum |
| :--- | :--- | :--- | :--- | :--- |
| `next` | SSRF / Caching Poisoning | 🔴 Critical / High | Next.js 15.5.21 sürümüne güncellenmeli. | ❌ Action Required |
| `next-auth` (`uuid`) | Buffer Bounds (CWE-1285) | 🟠 High | `uuid` <11.1.1 sürümünden kaynaklı. | ❌ Action Required |
| `postcss` | XSS (Cross-Site Scripting) | 🟡 Moderate | CSS output zafiyeti. Güncellenmeli. | ❌ Action Required |

> [!CAUTION]
> SBOM (Software Bill of Materials), Dependabot veya RenovateBot yapılandırması repository'de bulunmamaktadır (❌ Not Implemented). Bu zafiyetler manuel `npm audit` taramasıyla bulunmuştur.

## 2. Threat Model (STRIDE) & Residual Risk

| Tehdit (Threat) | Likelihood | Impact | Mitigation (Azaltım) | Owner | Kalan Risk (Residual) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DDoS / Brute Force** | Yüksek | Orta | Redis Rate Limit + Vercel Edge Cache | SRE | Low |
| **Prompt Injection** | Yüksek | Yüksek| Regex Guard (`hallucinationGuard.js`) | AI Lead| Medium |
| **Data Breach (DB Leak)**| Düşük | Kritik | Prisma Parameterized Query + SSL | DBA | Low |
| **Session Hijacking** | Düşük | Yüksek| Sıkı CSP Headerları ve HttpOnly Cookies | SecOps | Low |

---
**Confidence Level:** High (`npm audit --json` komutu canlı çalıştırıldı ve `next.config.mjs` Headers analizi yapıldı).
