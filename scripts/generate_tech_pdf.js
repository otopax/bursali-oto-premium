/**
 * TEKNİK VERİ → PDF üretici (OFFLINE, headless Chrome ile HTML→PDF).
 * public/kutuphane_data/<marka>/<model>/<motor__typeId>/{zamanlama.json, ayarlama.json}
 *   → aynı klasöre  zamanlama-kayisi.pdf  +  ayarlama-verisi.pdf  (markalı, Türkçe tam destek).
 * Siteye bağlanmaz — bot riski yok. Kaynak sadece yerel JSON.
 *
 * KULLANIM:  node scripts/generate_tech_pdf.js
 *   Tek marka:  $env:WDB_BRANDS="AUDI"; node scripts/generate_tech_pdf.js
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const DATA_DIR = path.join(__dirname, '../public/kutuphane_data');
const BRAND_FILTER = process.env.WDB_BRANDS ? process.env.WDB_BRANDS.split(',').map(s => s.trim().toUpperCase()) : null;
const CHROME_CANDIDATES = [process.env.CHROME_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',process.env.LOCALAPPDATA?process.env.LOCALAPPDATA+'/Google/Chrome/Application/chrome.exe':null].filter(Boolean);
const findChrome = () => { for (const p of CHROME_CANDIDATES){try{if(p&&fs.existsSync(p))return p;}catch(_){}} return null; };
const esc = s => (s || '').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// fullText başındaki site menüsünü at → bölüm başlığından itibaren al
function cleanNarrative(fullText, sectionTitle) {
  let t = fullText || '';
  const idx = t.indexOf(sectionTitle);
  if (idx > 0) t = t.slice(idx);
  // yaygın chrome kelimelerini baştan temizle
  t = t.replace(/^(Arabalar|Kamyonlar|Maliyet tahminleri|Ayarlar|Tahmin|Yazdır|Genel bakışa geri dön)+/gi, '').trim();
  return t;
}

function structuredBody(d, sectionTitle) {
  const tablesHtml = (d.tables || []).map(rows => `<table>${rows.map((r, i) =>
    `<tr>${r.map(c => i === 0 ? `<th>${esc(c)}</th>` : `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>`).join('');
  const narrative = esc(cleanNarrative(d.fullText, sectionTitle)).replace(/\n/g, '<br>');
  return `${tablesHtml ? `<h2 class="sec">Tablolar</h2>${tablesHtml}` : ''}<h2 class="sec">Detay</h2><div class="narr">${narrative}</div>`;
}

function buildHtml(d, sectionTitle) {
  const veh = `${esc(d.brand)} ${esc(d.model)} — ${esc(d.motorKodu || '')} ${esc(d.tip || '')} ${d.yil ? '(' + esc(d.yil) + ')' : ''}`;
  // Tercih: site içeriğini (#content) olduğu gibi bas; yoksa yapısal fallback
  const body = (d.contentHtml && d.contentHtml.length > 200)
    ? `<div class="site">${d.contentHtml}</div>`
    : structuredBody(d, sectionTitle);
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>
    *{box-sizing:border-box} body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;margin:0;font-size:12px;line-height:1.5}
    .head{background:#111;color:#fff;padding:18px 28px;border-bottom:4px solid #d4af37}
    .brandline{color:#d4af37;font-weight:700;letter-spacing:2px;font-size:13px}
    .head h1{margin:6px 0 2px;font-size:20px} .head .veh{color:#ddd;font-size:12px}
    .body{padding:20px 28px}
    h2.sec{color:#111;border-left:4px solid #d4af37;padding-left:10px;margin:16px 0 8px;font-size:15px}
    table{border-collapse:collapse;width:100%;margin:8px 0;font-size:11px}
    th,td{border:1px solid #ddd;padding:5px 8px;text-align:left} th{background:#f4f4f4}
    .narr{color:#333;font-size:11.5px;margin-top:8px}
    /* Site içeriğini (#content) print için normalize et */
    .site,.site *{background:transparent !important;color:#222 !important;box-shadow:none !important;border-color:#ddd !important;max-width:100% !important;float:none !important;position:static !important}
    .site img{display:none !important}
    .site h1,.site h2,.site h3,.site h4{color:#111 !important;font-size:14px !important;margin:14px 0 6px;border-left:4px solid #d4af37;padding-left:8px}
    .site table{border-collapse:collapse;width:100%;margin:8px 0;font-size:11px}
    .site th,.site td{border:1px solid #ddd !important;padding:5px 8px}
    .site a{text-decoration:none} .site ul{padding-left:18px}
    .foot{margin-top:24px;border-top:1px solid #ddd;padding-top:10px;color:#888;font-size:10px}
  </style></head><body>
    <div class="head"><div class="brandline">BURSALI OTO SERVİS · FETHİYE</div>
      <h1>${esc(sectionTitle)}</h1><div class="veh">${veh}</div></div>
    <div class="body">${body}
      <div class="foot">webdatabays teknik verisi Bursalı Oto Servis kılavuzu olarak düzenlenmiştir. Kesin işlem için yetkili servise danışın.</div>
    </div></body></html>`;
}

(async () => {
  const chrome = findChrome(); if (!chrome) { console.error('Chrome bulunamadi (CHROME_PATH ver).'); process.exit(1); }
  const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  let count = 0;
  const brands = fs.readdirSync(DATA_DIR).filter(b => { const p = path.join(DATA_DIR, b); return fs.statSync(p).isDirectory() && (!BRAND_FILTER || BRAND_FILTER.some(x => b.toUpperCase().includes(x))); });
  for (const brand of brands) {
    for (const model of fs.readdirSync(path.join(DATA_DIR, brand))) {
      const modelPath = path.join(DATA_DIR, brand, model); if (!fs.statSync(modelPath).isDirectory()) continue;
      for (const eng of fs.readdirSync(modelPath)) {
        const dir = path.join(modelPath, eng); if (!fs.statSync(dir).isDirectory()) continue;
        const jobs = [['zamanlama.json', 'Zamanlama Kayışı — Sökme/Takma', 'zamanlama-kayisi.pdf'], ['ayarlama.json', 'Ayarlama Verisi', 'ayarlama-verisi.pdf']];
        for (const [src, title, out] of jobs) {
          const sp = path.join(dir, src); if (!fs.existsSync(sp)) continue;
          const outPath = path.join(dir, out);
          try {
            const d = JSON.parse(fs.readFileSync(sp, 'utf-8'));
            await page.setContent(buildHtml(d, title), { waitUntil: 'load' });
            await page.pdf({ path: outPath, format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '14mm', left: '12mm', right: '12mm' } });
            count++;
          } catch (e) { console.log('  hata', sp, e.message); }
        }
      }
    }
  }
  console.log('Uretilen PDF:', count);
  await browser.close();
})().catch(e => { console.error('Kritik hata:', e); process.exit(1); });
