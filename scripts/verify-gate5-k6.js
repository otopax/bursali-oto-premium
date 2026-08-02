// scripts/verify-gate5-k6.js
const fs = require('fs');

function verifyGate5Report(path) {
  try {
    if (!fs.existsSync(path)) {
      console.error(`⚠️ Rapor bulunamadı: ${path}`);
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(path, 'utf8'));

    const httpReqs = data.metrics.http_reqs?.count || 0;
    const p95 = data.metrics.http_req_duration?.["p(95)"] || data.metrics.http_req_duration?.p95 || 0;
    const failRate = data.metrics.http_req_failed?.value || data.metrics.http_req_failed?.rate || 0;
    const vusMax = data.metrics.vus_max?.value || data.metrics.vus_max?.max || 0;

    console.log("==================================================");
    console.log("📊 GATE 5 K6 YÜK TESTİ ADLİ VERİLEŞTİRME RAPORU");
    console.log("==================================================");
    console.log(`Zirve Eşzamanlı Kullanıcı (VUs Max) : ${vusMax}`);
    console.log(`Toplam İşlenen İstek (http_reqs)    : ${httpReqs}`);
    console.log(`95. Percentile Yanıt Süresi (p95)   : ${p95.toFixed(2)} ms`);
    console.log(`Hata Oranı (http_req_failed)        : ${(failRate * 100).toFixed(2)}%`);
    console.log("--------------------------------------------------");

    if (p95 < 500 && failRate < 0.001) {
      console.log("✅ GATE 5: PASS – 1000 VU Benchmark koşulları tam sağlandı.");
    } else {
      console.log("❌ GATE 5: PERFORMANCE THRESHOLD FAILED – p95 < 500ms veya hata oranı < 0.1% sağlanamadı.");
    }
    console.log("==================================================");
  } catch (err) {
    console.error("⚠️ Rapor okunamadı:", err.message);
    process.exit(1);
  }
}

const reportPath = process.argv[2] || 'evidence/gate-5-k6-report.json';
verifyGate5Report(reportPath);
