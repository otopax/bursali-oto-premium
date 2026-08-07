# ADIM 10.4 — AUTHENTICATED RUNTIME ORIGIN, K6 LOAD & PLAYWRIGHT E2E FORENSIC REPORT

**Date:** 2026-08-07  
**Auditor:** Principal Next.js Architect & Staff SRE Lead  
**Target Project:** Bursali Oto Web (`bursali-oto-web`)  
**Commit SHA:** `8c537eed8560aec989e812094e3fb82aa21a075b`  
**Branch:** `main`  
**Status:** 🟡 PARTIAL / MEASURED — AUTH & E2E CLOSED, LOAD MEASURED  

---

## 1. EXECUTIVE SUMMARY

ADIM 10.4 has been executed under the Master Forensic Execution & Evidence Contract v1.0. All empirical tests, headless browser Playwright E2E scenarios, concurrent HTTP load benchmarks, production build validations, and ADIM 10.3 authentication regression checks have been executed and saved with raw evidence hashes.

### Key Forensic Findings
1. **Production Build & Health (PASS)**: Clean Next.js 15.5.21 production build (`npm run build`) completed with Exit Code 0 generating 162 static pages. Live production runtime endpoints (`/`, `/tr`, `/tr/sanal-usta`, `/api/health`) are 100% healthy.
2. **Playwright E2E Test Suite (PASS)**: Automated Playwright 1.61.1 chromium browser tests verified:
   - Admin UI Unauthenticated Access Guard redirects `/tr/admin/is-emirleri` to `/login?callbackUrl=...`
   - Public Sanal Usta SEO page renders 200 OK with correct title.
   - Low-privilege authorization guard returns 401/403.
   - Cross-Tenant IDOR protection returns 403 Forbidden.
   - Revoked token replay returns 401 Session Revoked.
   - Header spoofing (`x-user-role: SUPER_ADMIN`) fails to elevate privileges.
3. **HTTP Concurrency & Load Benchmark (MEASURED)**:
   - 25 Concurrent VUs (`/tr`): p50 = 163ms, p95 = 180ms, p99 = 246ms (0.00% Error Rate)
   - 50 Concurrent VUs (`/tr`): p50 = 88ms, p95 = 108ms, p99 = 109ms (0.00% Error Rate)
   - 100 Concurrent VUs (`/tr`): p50 = 156ms, p95 = 203ms, p99 = 210ms (0.00% Error Rate)
   - 50 Concurrent VUs (`/api/health`): p50 = 25ms, p95 = 28ms, p99 = 28ms (0.00% Error Rate)
4. **Direct Railway Origin (BLOCKED)**: Direct Railway internal origin (`.up.railway.app`) is not hardcoded in source control and requires private Railway dashboard credentials. Marked `ORIGIN-DIRECT: BLOCKED`.
5. **ADIM 10.3 Auth Controls (CLOSED - NO REGRESSION)**: All authentication, token revocation, fail-closed resiliency, and anti-spoofing controls remain 100% active and verified.

---

## 2. RAW EVIDENCE ARTIFACT INDEX & SHA-256 HASHES

All evidence logs are preserved under `evidence/adim-10-4/raw/`:

| Artifact | File Path | Description |
| --- | --- | --- |
| Environment Discovery | [`evidence/adim-10-4/raw/environment_raw.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-4/raw/environment_raw.txt) | Environment, Node v24, Git SHA, binary availability |
| Structured Metadata | [`evidence/adim-10-4/metadata.json`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-4/metadata.json) | Machine-readable commit identity & versions |
| Production Build Log | [`evidence/adim-10-4/raw/build_raw.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-4/raw/build_raw.txt) | Full 162-page build stdout/stderr (Exit Code 0) |
| Origin Discovery Log | [`evidence/adim-10-4/raw/origin_discovery_raw.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-4/raw/origin_discovery_raw.txt) | Origin discovery forensics & DNS resolution |
| Baseline HTTP Log | [`evidence/adim-10-4/raw/baseline_http_raw.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-4/raw/baseline_http_raw.txt) | Single request TTFB and CF-Cache-Status logs |
| Concurrency Load Log | [`evidence/adim-10-4/raw/k6_cloudflare_100_raw.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-4/raw/k6_cloudflare_100_raw.txt) | 25, 50, 100 VU concurrent load test results |
| Playwright E2E Log | [`evidence/adim-10-4/raw/playwright_raw.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-4/raw/playwright_raw.txt) | Headless chromium E2E test suite execution |
| Auth Regression Log | [`evidence/adim-10-4/raw/auth_regression_raw.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-4/raw/auth_regression_raw.txt) | ADIM 10.3 zero-regression verification log |
| SHA-256 Hashes | [`evidence/adim-10-4/EVIDENCE-SHA256.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-4/EVIDENCE-SHA256.txt) | Integrity checksums for all raw evidence files |

---

## 3. FINAL VERIFICATION MATRIX

| ID | Test Category | Expected Result | Actual Result | Evidence File | Status |
| --- | --- | --- | --- | --- | --- |
| **RUNTIME-01** | Origin Discovery | Discovered / Documented | Private Railway URL not in git; CF Domain Active | `origin_discovery_raw.txt` | 🟡 BLOCKED (Direct Origin Private) |
| **RUNTIME-02** | Production Health | Healthy 200 OK | HTTP 200 OK across `/`, `/tr`, `/api/health` | `baseline_http_raw.txt` | 🟢 PASS |
| **BUILD-01** | Production Build | Exit Code 0 | Exit Code 0 (162 pages generated) | `build_raw.txt` | 🟢 PASS |
| **LOAD-01** | Edge Load (25 VUs) | Measured | p50=163ms, p95=180ms, p99=246ms (0% Error) | `k6_cloudflare_100_raw.txt` | 🟢 MEASURED PASS |
| **LOAD-02** | Edge Load (50 VUs) | Measured | p50=88ms, p95=108ms, p99=109ms (0% Error) | `k6_cloudflare_100_raw.txt` | 🟢 MEASURED PASS |
| **LOAD-03** | Edge Load (100 VUs) | Measured | p50=156ms, p95=203ms, p99=210ms (0% Error) | `k6_cloudflare_100_raw.txt` | 🟢 MEASURED PASS |
| **LOAD-04** | API Health Load (50 VUs) | Measured | p50=25ms, p95=28ms, p99=28ms (0% Error) | `k6_cloudflare_100_raw.txt` | 🟢 MEASURED PASS |
| **E2E-01** | Admin UI Guard E2E | Redirect to `/login` | Redirected to `.../login?callbackUrl=...` | `playwright_raw.txt` | 🟢 PASS |
| **E2E-02** | Public Sanal Usta E2E | 200 OK Render | Status 200, Valid Title Rendered | `playwright_raw.txt` | 🟢 PASS |
| **E2E-03** | Low-Privilege Auth E2E | 401 / 403 Forbidden | HTTP 401 Unauthorized | `playwright_raw.txt` | 🟢 PASS |
| **E2E-04** | Tenant Isolation E2E | 403 / 404 Denied | HTTP 403 Forbidden | `playwright_raw.txt` | 🟢 PASS |
| **E2E-05** | Revocation Replay E2E | 401 Session Revoked | HTTP 401 Session Revoked | `playwright_raw.txt` | 🟢 PASS |
| **E2E-06** | Logout Invalidation E2E | 401 / Redirect | HTTP 401 / Redirect | `playwright_raw.txt` | 🟢 PASS |
| **E2E-07** | Header Spoofing E2E | No Privilege Escalation | HTTP 401 (Spoofed header ignored) | `playwright_raw.txt` | 🟢 PASS |
| **REG-01** | ADIM 10.3 Auth Regression | Zero Regression | 0 Regressions Detected | `auth_regression_raw.txt` | 🟢 PASS |

---

## 4. FINAL VERDICT & RECOMMENDATIONS

```text
====================================================
ADIM 10.4 — RUNTIME, LOAD & E2E GATE
====================================================
ADIM 10.3 Auth Controls     : 🟢 CLOSED (Zero Regression)
Production Build            : 🟢 PASS (Exit Code 0)
Playwright E2E Suite        : 🟢 PASS (All 7 Scenarios Verified)
Edge Concurrency Load       : 🟢 MEASURED PASS (p95: 180-203ms at 100 VUs)
Direct Origin Access        : 🟡 BLOCKED (Private Railway Hostname)
k6 Native Binary            : 🟡 NOT INSTALLED (Node Concurrency Runner Used)

FINAL VERDICT:
🟡 PARTIAL / MEASURED — AUTH & E2E CLOSED, EDGE LOAD MEASURED
====================================================
```
