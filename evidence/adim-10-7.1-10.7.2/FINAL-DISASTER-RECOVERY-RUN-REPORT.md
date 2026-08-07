# ADIM 10.7.1 + 10.7.2 — FINAL DISASTER RECOVERY RUNTIME FORENSIC REPORT

**Date:** 2026-08-07  
**Auditor:** Principal Software Architect & Staff SRE Lead  
**Target Project:** Bursali Oto Web (`bursali-oto-web`)  
**Commit SHA:** `8c537eed8560aec989e812094e3fb82aa21a075b`  
**Branch:** `main`  
**Status:** 🟡 ADIM 10.7 OPEN — RUNTIME EVIDENCE PENDING (OFFSITE CLOUD UPLOAD & STANDBY DB RESTORE REQUIRE LIVE CLOUD/STANDBY ENVIRONMENT CONFIGURATION)

---

## 1. EXECUTIVE SUMMARY & RAW EVIDENCE AUDIT

Under the Master Forensic Execution Contract v1.0 (ADIM 10.7.1 + 10.7.2), an independent runtime verification of **OPS-10.7-04 (Offsite Cloud Backup Runtime)** and **OPS-10.7-05 (Live Standby PostgreSQL Restore Runtime)** was performed on the environment.

### Key Empirical Findings
1. **Fresh Backup Generation (PASS)**:
   - Executed `scripts/backup-db.js` against the codebase. Generated a valid backup file (`bursali_oto_2026-08-07_025836.dump`, SHA-256: `A6C210316357CB41...`).
2. **rclone Binary & Remote Configuration (FAIL / NOT CONFIGURED)**:
   - `rclone` binary is `NOT_IN_LOCAL_PATH` and `$env:BACKUP_RCLONE_REMOTE` is `NOT_CONFIGURED`.
   - Real-time cloud upload to remote storage (e.g. AWS S3 / Cloudflare R2 / Google Drive) was **NOT EXECUTED in live runtime**.
   - Per non-negotiable contract rules, `OPS-10.7-04`: `🟡 NOT VERIFIED IN RUNTIME`.
3. **Standby PostgreSQL DB & pg_restore (FAIL / UNREACHABLE)**:
   - Standby PostgreSQL instance at `127.0.0.1:5433` is **OFFLINE / UNREACHABLE** and `pg_restore` binary is `NOT_IN_LOCAL_PATH`.
   - Real SQL `pg_restore` execution against a standby database was **NOT EXECUTED in live runtime**.
   - Per non-negotiable contract rules, `OPS-10.7-05`: `🟡 NOT VERIFIED IN RUNTIME`.
4. **Schema Integrity (PASS)**:
   - Programmatically audited `prisma/schema.prisma`: **33 Prisma models** discovered (`Tenant`, `User`, `Customer`, `WorkOrder`, `CustomerVehicle`, etc.) with valid relational contracts.
5. **RPO Measurement (NOT DETERMINABLE)**:
   - Transaction log (WAL) sync timestamp verification could not be measured because standby DB was offline. Per anti-hallucination rules, `RPO = NOT DETERMINABLE`.
6. **SHA-256 Checksum Integrity (100% MATCH)**:
   - All 18 raw evidence files under `evidence/adim-10-7.1-10.7.2/final/` were hashed and verified with 100% exact match in `FINAL-EVIDENCE-SHA256.txt`.

---

## 2. RAW EVIDENCE ARTIFACT INDEX & SHA-256 HASHES

All raw evidence files are saved under `evidence/adim-10-7.1-10.7.2/final/` and hashed in `FINAL-EVIDENCE-SHA256.txt`:

| Artifact Name | File Path | SHA-256 Checksum | Status |
| --- | --- | --- | --- |
| Environment Final | [`environment_final_raw.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-7.1-10.7.2/final/environment_final_raw.txt) | `4EEBA7D149EA78E1...` | Node v24, Docker, Railway CLI, Tool checks |
| Backup Generation | [`backup_generation_final_raw.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-7.1-10.7.2/final/backup_generation_final_raw.txt) | `AEB3EB9AF04D65B6...` | Fresh dump file creation output |
| Backup SHA-256 | [`backup_sha256_final.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-7.1-10.7.2/final/backup_sha256_final.txt) | `3B0C8B411AFD1C44...` | SHA-256 hash of latest dump file |
| rclone Version | [`rclone_version_final_raw.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-7.1-10.7.2/final/rclone_version_final_raw.txt) | `3F7C4576F29743F5...` | rclone binary check output |
| Offsite Upload Log | [`offsite_upload_final_raw.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-7.1-10.7.2/final/offsite_upload_final_raw.txt) | `F5D1192EB079438B...` | rclone & remote configuration audit log |
| Remote Integrity | [`remote_integrity_final_raw.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-7.1-10.7.2/final/remote_integrity_final_raw.txt) | `5808E63E3714BF97...` | Remote SHA-256 download match log |
| Standby Environment| [`standby_environment_final_raw.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-7.1-10.7.2/final/standby_environment_final_raw.txt) | `138AFBCA229F1176...` | Standby DB TCP connection audit log |
| Standby Restore Log| [`standby_restore_final_raw.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-7.1-10.7.2/final/standby_restore_final_raw.txt) | `71A037A8F4FC6B80...` | `pg_restore` execution audit log |
| Schema Integrity | [`restore_integrity_final.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-7.1-10.7.2/final/restore_integrity_final.txt) | `B6F27C4FBEC12965...` | 33 Prisma models count & contract audit |
| Data Integrity | [`data_integrity_final.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-7.1-10.7.2/final/data_integrity_final.txt) | `1AB0BEBA82F37F0D...` | Relational FK & cascading delete rules audit |
| RTO / RPO Log | [`rto_rpo_final.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-7.1-10.7.2/final/rto_rpo_final.txt) | `A0C3B08186CBC1F3...` | RTO theoretical vs measured & RPO log |
| Post-Restore Valid | [`post_restore_validation_final.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-7.1-10.7.2/final/post_restore_validation_final.txt) | `E5BF1E87C01A8704...` | Standby App connection test log |
| SHA-256 Integrity | [`FINAL-EVIDENCE-SHA256.txt`](file:///C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/evidence/adim-10-7.1-10.7.2/final/FINAL-EVIDENCE-SHA256.txt) | Checksum integrity verification file |

---

## 3. MASTER FORENSIC VERDICT MATRIX

```text
============================================================
ADIM 10.7.1 + 10.7.2
FINAL DISASTER RECOVERY RUNTIME GATE
============================================================

Fresh Backup Generation       : PASS (bursali_oto_2026-08-07_025836.dump)
Local SHA-256                 : PASS (A6C210316357CB419FA5C65DB1CB32E5...)

rclone Binary                 : FAIL (NOT_IN_LOCAL_PATH)
Remote Configuration          : FAIL (BACKUP_RCLONE_REMOTE is NOT_CONFIGURED)
Real Offsite Upload           : FAIL (NOT EXECUTED)
Remote Object Verification    : FAIL (N/A)
Remote SHA-256 Integrity      : FAIL (UNAVAILABLE)

Standby PostgreSQL            : FAIL (127.0.0.1:5433 OFFLINE)
pg_restore Binary             : FAIL (NOT_IN_LOCAL_PATH)
Real Database Restore         : FAIL (NOT EXECUTED)
Schema Integrity              : PASS (33 Prisma Models Verified)
Data Integrity                : PASS (Relational Contracts Verified)

RTO                           : < 5 min (THEORETICAL)
RPO                           : NOT DETERMINABLE (Standby DB offline)

Post-Restore Validation       : FAIL (UNVERIFIED IN RUNTIME)
Evidence SHA-256              : PASS (100% MATCH)

------------------------------------------------------------
OPS-10.7-04 Offsite Backup    : NOT VERIFIED IN RUNTIME
OPS-10.7-05 Standby Restore   : NOT VERIFIED IN RUNTIME
------------------------------------------------------------

FINAL VERDICT:
🟡 ADIM 10.7 OPEN — RUNTIME EVIDENCE PENDING

============================================================
```
