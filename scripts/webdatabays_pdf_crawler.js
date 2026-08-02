/**
 * webdatabays PDF crawler — MOTOR KODU bazlı, DEDUPE'li, site-native "Yazdır" çıktısı (page.pdf).
 * ==============================================================================================
 * MANTIK (senin istediğin):
 *  - Veri motor koduna göre. Her motorun ZAMANLAMA + AYARLAMA PDF'i BİR KEZ indirilir.
 *  - Aynı motoru kullanan TÜM modellere _map.json ile dağıtılır (tekrar indirme YOK).
 *  - PDF = page.pdf() → sitenin kendi print CSS'i = "Yazdır" ile birebir temiz.
 *  - Dedupe: timing → storyId, ayarlama → motorKodu. Zaten inen dosya tekrar inmez (resume).
 *
 * ÇOK YAVAŞ (bot yakalanmamak icin). Marka filtreli. Test limiti var.
 *
 * KULLANIM:
 *  1) İLK KEZ GİRİŞ (bir defalık, headful):  $env:WDB_LOGIN="1"; node scripts/webdatabays_pdf_crawler.js
 *       → Chrome acilir, webdatabays'e giris yap, ENTER'a bas. Oturum .crawler-profile'a kaydedilir, kapanir.
 *  2) TEST (2 motor):    $env:WDB_LIMIT="2"; $env:WDB_BRANDS="AUDI"; node scripts/webdatabays_pdf_crawler.js
 *  3) TAM (marka marka): $env:WDB_BRANDS="AUDI"; node scripts/webdatabays_pdf_crawler.js
 *
 * ÇIKTI:
 *   public/kutuphane_data/_pdf/timing_<storyId>.pdf   (tekil zamanlama PDF'leri)
 *   public/kutuphane_data/_pdf/adj_<motorKodu>.pdf    (tekil ayarlama PDF'leri)
 *   public/kutuphane_data/_map.json                   (marka/model/motor → PDF eşlemesi)
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const puppeteer = require('puppeteer-core');
const ask = (q) => new Promise(res => { const rl = readline.createInterface({ input: process.stdin, output: process.stdout }); rl.question(q, a => { rl.close(); res(a); }); });

const BASE = 'https://webdatabays.com/workshop/touch/site/layout';
const PROFILE_DIR = path.join(__dirname, '../.crawler-profile');
const TREE_DIR = path.join(__dirname, '../public/vehicle_tree');
const OUT_DIR = path.join(__dirname, '../public/kutuphane_data');
const PDF_DIR = path.join(OUT_DIR, '_pdf');
const MAP_FILE = path.join(OUT_DIR, '_map.json');

const MIN = parseInt(process.env.WDB_MIN || '5000', 10);
const MAX = parseInt(process.env.WDB_MAX || '9000', 10);
const ENGINE_PAUSE = parseInt(process.env.WDB_ENGINEPAUSE || '10000', 10);
const LIMIT = parseInt(process.env.WDB_LIMIT || '0', 10);
const BRAND_FILTER = process.env.WDB_BRANDS ? process.env.WDB_BRANDS.split(',').map(s => s.trim().toUpperCase()) : null;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const rnd = () => sleep(MIN + Math.random() * (MAX - MIN));
const slug = s => (s || '').toString().toLowerCase().replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const CHROME_CANDIDATES = [process.env.CHROME_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',process.env.LOCALAPPDATA?process.env.LOCALAPPDATA+'/Google/Chrome/Application/chrome.exe':null].filter(Boolean);
const findChrome = () => { for (const p of CHROME_CANDIDATES){try{if(p&&fs.existsSync(p))return p;}catch(_){}} return null; };

async function goto(page, url) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(700);
  } catch (err) {
    if (err.message && err.message.includes('detached Frame')) {
      console.log('⚠️ Detached frame algılandı, sayfa yeniden yükleniyor...');
      await sleep(1500);
      try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); } catch (_) {}
    } else {
      throw err;
    }
  }
}
async function expandAndScroll(page) {
  try {
    await page.evaluate(async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const toggles = [...document.querySelectorAll('a,button,span,div')].filter(e => /^(Göster|Show|Genişlet)$/i.test((e.textContent||'').trim()));
      for (const t of toggles) { try { t.click(); await wait(120); } catch (_) {} }
      let last = -1;
      for (let i = 0; i < 50; i++) { window.scrollTo(0, document.body.scrollHeight); await wait(220); const h = document.body.scrollHeight; if (h === last) break; last = h; }
      window.scrollTo(0, 0);
    });
    await sleep(800);
  } catch (_) {}
}
// PDF'ten once sayfayi temizle: sadece #content kalsin (ust menu/nav/butonlar gitsin), diyagramlar kalsin
async function cleanForPdf(page, headerTitle, vehLine) {
  try {
    await page.evaluate((title, veh) => {
      const c = document.getElementById('content');
      let inner = c ? c.cloneNode(true) : document.body.cloneNode(true);
      // buton/geri-don/yazdir/goster-gizle gibi UI ogelerini kaldir (gorseller KALIR)
      inner.querySelectorAll('a,button,input,select').forEach(el => {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (/(Yazdır|Genel bakışa geri dön|Sakla|Göster|Gizle|Maliyet tahminine ekle)/i.test(t) || /^[<>^+*›»°\-\s]{0,3}$/.test(t)) { try { el.remove(); } catch (_) {} }
      });
      // parca satirlarindaki tek "+" / ok / sembol ikonlari (span/td/i/em icinde, cocuk elemani olmayan yapraklar)
      inner.querySelectorAll('span,i,em,td,div,li').forEach(el => {
        try {
          if (el.children.length === 0) {
            const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
            if (/^[+<>^*›»°]$/.test(t)) el.remove();
          }
        } catch (_) {}
      });
      const brand = `<div style="background:#111;color:#fff;padding:14px 20px;border-bottom:4px solid #d4af37;margin-bottom:14px">
        <div style="color:#d4af37;font-weight:700;letter-spacing:2px;font-size:12px">BURSALI OTO SERVİS · FETHİYE</div>
        <div style="font-size:18px;font-weight:700;margin-top:4px">${title || ''}</div>
        <div style="color:#ccc;font-size:12px">${veh || ''}</div></div>`;
      document.body.innerHTML = brand + '<div id="pw">' + inner.innerHTML + '</div>';

      // DOM Temizliği: !important ile inline CSS ezme & Görünmeyen öğeleri sıfırlama
      document.querySelectorAll('#pw *').forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) {
          el.style.setProperty('height', '0px', 'important');
          el.style.setProperty('min-height', '0px', 'important');
          el.style.setProperty('margin', '0px', 'important');
          el.style.setProperty('padding', '0px', 'important');
        } else {
          el.style.setProperty('height', 'auto', 'important');
          el.style.setProperty('min-height', '0px', 'important');
          el.style.setProperty('max-height', 'none', 'important');
          el.style.setProperty('position', 'static', 'important');
          el.style.setProperty('overflow', 'visible', 'important');
        }

        // Metin veya görsel içermeyen boş yaprak blokları kaldır
        const hasText = (el.textContent || '').trim().length > 0;
        const hasImg = !!el.querySelector('img') || el.tagName === 'IMG' || el.tagName === 'SVG';
        if (!hasText && !hasImg && el.children.length === 0) {
          el.remove();
        }
      });

      const s = document.createElement('style');
      s.textContent = '@page{margin:10mm} html,body{background:#fff !important;color:#1a1a1a !important;height:auto !important;min-height:auto !important} '
        + '#pw,#pw *{position:static !important;float:none !important;overflow:visible !important;min-height:0 !important;max-height:none !important;height:auto !important} '
        + '#pw table{border-collapse:collapse;width:100%} #pw th,#pw td{border:1px solid #ccc;padding:4px 7px;font-size:11px} '
        + '#pw img{max-width:100% !important;height:auto !important} '
        + '#pw [style*="position:absolute"],#pw [style*="position: absolute"]{position:static !important}';
      document.head.appendChild(s);

      document.body.style.height = 'auto';
      document.documentElement.style.height = 'auto';
    }, headerTitle, vehLine);
    await sleep(250);
  } catch (_) {}
}
async function savePdf(page, outPath) {
  await page.pdf({ path: outPath, format: 'A4', printBackground: true, preferCSSPageSize: false, margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' } });
}

(async () => {
  const chrome = findChrome(); if (!chrome) { console.error('Chrome bulunamadi (CHROME_PATH ver).'); process.exit(1); }
  fs.mkdirSync(PDF_DIR, { recursive: true });
  // Stale Chrome profil kilidini temizle (onceki calisma yarim kapandiysa "already running" hatasini onler)
  for (const f of ['SingletonLock', 'SingletonSocket', 'SingletonCookie', 'lockfile']) {
    try { fs.rmSync(path.join(PROFILE_DIR, f), { force: true, recursive: true }); } catch (_) {}
  }

  // GİRİŞ MODU: headful, oturum kaydet, cik
  if (process.env.WDB_LOGIN === '1') {
    const b = await puppeteer.launch({ executablePath: chrome, headless: false, defaultViewport: null, userDataDir: PROFILE_DIR, args: ['--start-maximized','--disable-blink-features=AutomationControlled'], ignoreDefaultArgs: ['--enable-automation'] });
    const p = (await b.pages())[0] || await b.newPage();
    await p.goto(`${BASE}/makesOverview`, { waitUntil: 'domcontentloaded' });
    await ask('\n👉 Acilan Chrome\'da webdatabays\'e GIRIS yap, marka listesi gorunsun. Sonra ENTER: ');
    await b.close();
    console.log('✅ Oturum kaydedildi (.crawler-profile). Simdi TEST/TAM calistir (WDB_LOGIN olmadan).');
    return;
  }

  // CRAWL MODU: HEADFUL (site headless'i engelliyor) + kayitli oturum. page.pdf() headful'da da calisir.
  const browser = await puppeteer.launch({ executablePath: chrome, headless: false, defaultViewport: null, userDataDir: PROFILE_DIR, args: ['--start-maximized','--disable-blink-features=AutomationControlled'], ignoreDefaultArgs: ['--enable-automation'] });
  const page = (await browser.pages())[0] || await browser.newPage();
  await page.evaluateOnNewDocument(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });

  // Oturum kontrolu — girisli degilse ayni pencerede giris yaptir
  const checkLogin = async () => {
    await goto(page, `${BASE}/makesOverview`);
    await expandAndScroll(page); // AJAX ile gelen marka linkleri icin bekle+kaydir
    return page.evaluate(() => {
      const q = sel => document.querySelectorAll(sel).length;
      const makeLinks = q('a[href*="modelOverview?makeId="]')
        + q('[data-url*="modelOverview?makeId="]')
        + [...document.querySelectorAll('a,[data-url]')].filter(a => /makeId=m_/.test(a.getAttribute('href')||a.getAttribute('data-url')||'')).length;
      const loginForm = q('input[type="password"]') + q('input[name*="pass" i]') + q('input[name*="email" i]');
      return {
        ok: makeLinks > 3,
        makeLinks,
        loginForm,
        url: location.href,
        title: (document.title || '').slice(0, 80),
        bodyHint: (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 160),
      };
    });
  };
  let st = await checkLogin();
  for (let tries = 0; !st.ok && tries < 2; tries++) {
    console.log(`\nℹ️  Durum: makeLinks=${st.makeLinks} loginForm=${st.loginForm} url=${st.url}`);
    console.log(`   Baslik: "${st.title}"  |  Sayfa: "${st.bodyHint}"`);
    if (st.loginForm > 0) console.log('   → Oturum dusmus gorunuyor: acilan pencerede GIRIS yap.');
    else console.log('   → Marka listesi gorunmuyor olabilir (yavas yuklendi). Sayfa yuklenince ENTER.');
    await ask('\n👉 Acilan Chrome\'da webdatabays marka listesi gorunsun. Hazir olunca ENTER: ');
    st = await checkLogin();
  }
  if (!st.ok) {
    console.error(`❌ Hala giris gorunmuyor (makeLinks=${st.makeLinks}, loginForm=${st.loginForm}). Cikiliyor.`);
    console.error(`   URL=${st.url}  Baslik="${st.title}"`);
    await browser.close(); process.exit(1);
  }
  console.log(`✅ Giris OK (marka link sayisi=${st.makeLinks}).`);

  // Harita + dedupe durumu (resume)
  let map = { byEngine: {}, byModel: {}, generatedAt: null };
  if (fs.existsSync(MAP_FILE)) { try { map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf-8')); map.byEngine = map.byEngine||{}; map.byModel = map.byModel||{}; } catch (_) {} }
  const seenTiming = new Set(fs.existsSync(PDF_DIR) ? fs.readdirSync(PDF_DIR).filter(f => f.startsWith('timing_')).map(f => f.replace('timing_','').replace('.pdf','')) : []);
  const seenAdj = new Set(fs.existsSync(PDF_DIR) ? fs.readdirSync(PDF_DIR).filter(f => f.startsWith('adj_')).map(f => f.replace('adj_','').replace('.pdf','')) : []);

  const treeFiles = fs.readdirSync(TREE_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
  let done = 0;

  for (const tf of treeFiles) {
    const tree = JSON.parse(fs.readFileSync(path.join(TREE_DIR, tf), 'utf-8'));
    if (BRAND_FILTER && !BRAND_FILTER.some(b => tree.make.toUpperCase().includes(b))) continue;
    const bSlug = slug(tree.make);
    map.byModel[bSlug] = map.byModel[bSlug] || {};
    console.log(`\n🚗 ${tree.make}`);

    for (const model of (tree.models || [])) {
      const mSlug = slug(model.name);
      for (const gen of (model.generations || [])) {
        if (!gen.modelId) continue;
        await rnd();
        await goto(page, `${BASE}/modelTypesList?modelId=${gen.modelId}`);
        await expandAndScroll(page);
        const rows = await page.evaluate(() => [...document.querySelectorAll('table tr')].map(tr => {
          const cells = [...tr.querySelectorAll('td')].map(td => (td.textContent||'').replace(/\s+/g,' ').trim());
          const du = tr.getAttribute('data-url') || '';
          const tid = (du.match(/typeId=(t_\d+)/) || [])[1] || null;
          return { tip: cells[0]||'', motorKodu: cells[1]||'', typeId: tid };
        }).filter(r => r.typeId && r.tip));

        for (const eng of rows) {
          const adjKey = slug(eng.motorKodu || eng.tip);
          // resume: bu model+motor zaten haritada mi?
          const already = (map.byModel[bSlug][mSlug] || []).some(x => x.typeId === eng.typeId);
          if (already) continue;
          try {
            await rnd();
            await goto(page, `${BASE}/modelDetail?typeId=${eng.typeId}`);
            const links = await page.evaluate(() => {
              const g = re => { const a = [...document.querySelectorAll('a[href]')].find(x => re.test(x.getAttribute('href')||'')); return a ? a.getAttribute('href') : null; };
              return { timing: g(/repairManuals\?.*groupId=TIMING/), adjustment: g(/adjustmentData\?/) };
            });
            const storyId = links.timing ? (links.timing.match(/storyId=(\d+)/) || [])[1] : null;
            const timingName = storyId ? `timing_${storyId}.pdf` : null;
            const adjName = `adj_${adjKey}.pdf`;
            const vehLine = `${tree.make} ${model.name} — ${eng.motorKodu || ''} ${eng.tip || ''}`.replace(/\s+/g, ' ').trim();

            // ZAMANLAMA (dedupe: storyId)
            if (timingName && !seenTiming.has(storyId)) {
              await rnd();
              await goto(page, links.timing.startsWith('http') ? links.timing : `https://webdatabays.com${links.timing}`);
              await expandAndScroll(page);
              await cleanForPdf(page, 'Zamanlama Kayışı — Sökme/Takma', vehLine);
              await savePdf(page, path.join(PDF_DIR, timingName));
              seenTiming.add(storyId);
            }
            // AYARLAMA (dedupe: motorKodu)
            if (links.adjustment && !seenAdj.has(adjKey)) {
              await rnd();
              await goto(page, links.adjustment.startsWith('http') ? links.adjustment : `https://webdatabays.com${links.adjustment}`);
              await expandAndScroll(page);
              await cleanForPdf(page, 'Ayarlama Verisi', vehLine);
              await savePdf(page, path.join(PDF_DIR, adjName));
              seenAdj.add(adjKey);
            }
            // HARİTA
            map.byEngine[adjKey] = { motorKodu: eng.motorKodu, timing: timingName || null, adjustment: fs.existsSync(path.join(PDF_DIR, adjName)) ? adjName : null };
            (map.byModel[bSlug][mSlug] = map.byModel[bSlug][mSlug] || []).push({ tip: eng.tip, motorKodu: eng.motorKodu, typeId: eng.typeId, timing: timingName || null, adjustment: fs.existsSync(path.join(PDF_DIR, adjName)) ? adjName : null });
            fs.writeFileSync(MAP_FILE, JSON.stringify({ ...map, generatedAt: new Date().toISOString() }, null, 2));
            done++;
            console.log(`   ✔ ${model.name} ${eng.motorKodu||eng.tip} → ${timingName || 'timing-yok'} + ${adjName}`);
            await sleep(ENGINE_PAUSE);
            if (LIMIT && done >= LIMIT) { console.log(`\n🧪 TEST limiti (${LIMIT}). PDF: ${seenTiming.size} timing + ${seenAdj.size} ayarlama.`); await browser.close(); return; }
          } catch (e) { console.log(`   ⚠️ ${model.name} ${eng.motorKodu} hata: ${e.message}`); }
        }
      }
    }
    console.log(`⏳ Marka (${tree.make}) bitti. Bot korumasi icin 15 saniye bekleniyor...`);
    await sleep(15000);
  }
  console.log(`\n🎉 Bitti. ${done} motor islendi. Tekil PDF: ${seenTiming.size} timing + ${seenAdj.size} ayarlama.`);
  await browser.close();
})().catch(e => { console.error('Kritik hata:', e); process.exit(1); });
