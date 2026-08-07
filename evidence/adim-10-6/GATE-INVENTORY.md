# ADIM 10.6 — GATE INVENTORY & DISCOVERY REPORT

| Gate ID | Description | Current State | Evidence Location | Status |
| ------- | ----------- | ------------- | ----------------- | ------ |
| **GATE-10.3-AUTH** | NextAuth v5 Canonical Auth Trust Boundary | 0 Legacy Auth Files, 0 Fallback Secrets | security_scan_final_raw.txt | 🟢 VERIFIED PASS |
| **GATE-10.3-REVOC** | Token Revocation & Anti-Spoofing | Header Stripping & tokenVersion Check | uth_regression_final_raw.txt | 🟢 VERIFIED PASS |
| **GATE-10.3-TENANT** | Server-Side Tenant Isolation (ERP WorkOrders/Customers) | Scoped DB Queries (HTTP 403 on IDOR) | 	enant_isolation_final_raw.txt | 🟢 VERIFIED PASS |
| **GATE-10.4-BUILD** | Production Build & Pre-render | 162 Static Pages (Exit Code 0) | uild_final_raw.txt | 🟢 VERIFIED PASS |
| **GATE-10.4-K6-EDGE** | Native Grafana k6 Load Test (Cloudflare Edge 100 VU) | 135.1 req/s, p95 303ms, 0.00% Error | k6_edge_final_raw.txt | 🟢 VERIFIED PASS |
| **GATE-10.4-K6-ORIGIN**| Native Grafana k6 Load Test (Direct Railway 100 VU) | 56.3 req/s, p95 814ms, 0.00% Error | k6_origin_final_raw.txt | 🟢 VERIFIED PASS |
| **GATE-10.4-E2E** | Playwright Chromium E2E Suite (7 Scenarios) | 7/7 Scenarios PASS | playwright_final_raw.txt | 🟢 VERIFIED PASS |
| **GATE-10.5-BACKUP** | PostgreSQL pg_dump & Railway Volume Snapshot | Backup script & Volume Snapshot (RTO < 5m, RPO < 1m) | ackup_restore_final_raw.txt | 🟢 VERIFIED PASS |
| **GATE-10.5-RESILIENCE**| Redis Invalidation & DB Outage Fail-Closed | HTTP 503 Fail-Closed on Outage | ailure_mode_final_raw.txt | 🟢 VERIFIED PASS |
| **GATE-10.6-API-MATRIX**| API Route Auth & Rate Limit Coverage Audit | 28 API Routes Inventory | pi_auth_matrix_final.txt | 🟢 VERIFIED PASS |
| **GATE-10.6-SEO** | SEO, Metadata, H1, Robots, Sitemap, JSON-LD Audit | 48k+ Sitemap, 5 Locales, 0 H1 Dups | seo_integrity_final_raw.txt | 🟢 VERIFIED PASS |
