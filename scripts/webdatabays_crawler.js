/**
 * webdatabays — Araç Bilgi Ağacı Crawler'ı (Marka → Model → Nesil/Şasi → Motor)
 * =============================================================================
 * NEDEN BÖYLE: Site programatik fetch/curl isteklerini 403 "AccessDenied" ile
 * engelliyor (bot koruması). Bu yüzden RAW HTTP / PowerShell Invoke-WebRequest ÇALIŞMAZ.
 * Tek güvenli yol: GERÇEK TARAYICI NAVİGASYONU. Bu script Chrome'u açar, senin
 * oturumunla sayfalarda gezinir, araya rastgele gecikme koyar (bot engeli yememek için)
 * ve yapısal veriyi (isim, id, motor tablosu, araç foto URL'si) JSON olarak yazar.
 *
 * KULLANIM — İKİ MOD:
 *
 * (A) ÖNERİLEN: MEVCUT CHROME'UNA BAĞLAN (yeni giriş YOK, en az yakalanma riski)
 *   1) TÜM Chrome pencerelerini kapat.
 *   2) Chrome'u debug portuyla aç (PowerShell):
 *      & "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
 *   3) Açılan Chrome'da webdatabays.com'a gir (zaten girişliysen bir şey yapma).
 *   4) Ayrı bir PowerShell'de:
 *      cd "...\Web_Sitesi\bursali-oto-web"
 *      node scripts/webdatabays_crawler.js
 *   → Script SENİN Chrome'una bağlanır, senin oturumunla gezer. Yeni pencere/giriş açmaz.
 *
 * (B) FALLBACK: kendi penceresini açar (ayrı profil; giriş gerekebilir)
 *      $env:WDB_LAUNCH="1"; node scripts/webdatabays_crawler.js
 *
 * ÇIKTI: public/vehicle_tree/<marka>.json  +  public/vehicle_tree/_index.json
 *
 * AYARLAR: aşağıdaki CONFIG bloğu. CHROME_PATH env ile Chrome yolunu override edebilirsin.
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const puppeteer = require('puppeteer-core');

// ---------------- CONFIG ----------------
const BASE = 'https://webdatabays.com/workshop/touch/site/layout';
const OUT_DIR = path.join(__dirname, '../public/vehicle_tree');
const IMG_DIR = path.join(OUT_DIR, 'images'); // indirilen araç görselleri buraya
const PROFILE_DIR = path.join(__dirname, '../.crawler-profile'); // oturum burada kalıcı
const DOWNLOAD_IMAGES = process.env.WDB_NOIMG !== '1'; // görselleri indir (kapatmak için WDB_NOIMG=1)
// Gecikmeler (env ile ayarlanabilir; throttle yememek için yüksek tutuldu)
const MIN_DELAY = parseInt(process.env.WDB_MIN || '2600', 10);       // sayfa arası min (ms)
const MAX_DELAY = parseInt(process.env.WDB_MAX || '5200', 10);       // sayfa arası max (ms)
const BRAND_PAUSE = parseInt(process.env.WDB_BRANDPAUSE || '15000', 10); // markalar arası mola (ms)
const COOLDOWN_MS = parseInt(process.env.WDB_COOLDOWN || '120000', 10);  // throttle algılanınca uzun mola (ms)
const COOLDOWN_TRIGGER = parseInt(process.env.WDB_COOLTRIG || '5', 10);  // üst üste kaç boş → cooldown
const CDP_URL = process.env.WDB_CDP || 'http://127.0.0.1:9222'; // mevcut Chrome'a bağlanma adresi

// Hedef markalar (makesOverview'daki isimlerle EŞLEŞİR, büyük/küçük duyarsız)
const TARGET_BRANDS = [
  'MERCEDES-BENZ', 'AUDI', 'VOLKSWAGEN', 'SEAT', 'SKODA', 'RENAULT', 'FIAT',
  'OPEL', 'PEUGEOT', 'FORD', 'LAND ROVER', 'VOLVO', 'BMW', 'DACIA',
  'TOYOTA', 'KIA', 'HYUNDAI'
];

// Windows Chrome yol adayları
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA ? process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe' : null,
].filter(Boolean);

// ---------------- yardımcılar ----------------
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const rndDelay = () => sleep(MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY));
const slug = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function findChrome() {
  for (const p of CHROME_CANDIDATES) { try { if (p && fs.existsSync(p)) return p; } catch (_) {} }
  return null;
}
function ask(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(res => rl.question(q, a => { rl.close(); res(a); }));
}

async function gotoStable(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await sleep(500); // sunucu-render + minik js
}

// Lazy-load görselleri tetiklemek için sayfayı yavaşça sona kadar kaydır
async function autoScroll(page) {
  try {
    await page.evaluate(async () => {
      await new Promise(resolve => {
        let y = 0; const step = 500;
        const t = setInterval(() => {
          window.scrollBy(0, step); y += step;
          if (y >= document.body.scrollHeight) { clearInterval(t); resolve(); }
        }, 120);
      });
      window.scrollTo(0, 0);
    });
    await sleep(600); // yüklenmeleri bekle
  } catch (_) {}
}

// Görsel URL'sinden dosya adı çıkar (son yol parçası, query'siz) → 306001492.svgz
const imageIdOf = (url) => { const m = (url || '').split('?')[0].match(/\/([^/]+\.(?:svgz?|png|jpe?g|webp|gif))$/i); return m ? m[1].toLowerCase() : null; };
const localImgPath = (url) => { const id = imageIdOf(url); return id ? `/vehicle_tree/images/${id}` : null; };

// --- Seviye parserleri (page.evaluate ile, canlı DOM'dan) ---
async function parseMakes(page) {
  return page.evaluate(() => [...document.querySelectorAll('a[href*="modelOverview?makeId="]')].map(a => ({
    name: (a.textContent || '').trim().replace(/\s+/g, ' '),
    makeId: (a.getAttribute('href').match(/makeId=(m_[0-9]+)/) || [])[1],
  })).filter(x => x.makeId && x.name));
}

async function parseModels(page) {
  return page.evaluate(() => [...document.querySelectorAll('a[href*="modelTypes?modelGroupId="]')].map(a => {
    const href = a.getAttribute('href');
    const img = a.querySelector('img');
    const raw = (a.textContent || '').trim().replace(/\s+/g, ' ');
    const ym = raw.match(/(\d{4}\s*-\s*(?:\d{4}|\.\.\.))/);
    return {
      modelGroupId: (href.match(/modelGroupId=(dg_[0-9]+)/) || [])[1],
      name: ym ? raw.replace(ym[0], '').trim() : raw,
      years: ym ? ym[0].replace(/\s+/g, ' ') : null,
      image: img ? (img.currentSrc || img.getAttribute('src') || img.getAttribute('data-src')) : null,
    };
  }).filter(x => x.modelGroupId));
}

async function parseGenerations(page) {
  return page.evaluate(() => {
    const items = [...document.querySelectorAll('a[data-model-id]')].filter(a => /^d_/.test(a.getAttribute('data-model-id') || ''));
    const carImg = [...document.querySelectorAll('img')].map(i => i.currentSrc || i.src).find(s => /workshop_assets/.test(s || '')) || null;
    return items.map(a => {
      const raw = (a.textContent || '').trim().replace(/\s+/g, ' ');
      const ym = raw.match(/(\d{4}\s*-\s*(?:\d{4}|\.\.\.))/);
      const chassis = (raw.match(/\(([^)]+)\)/) || [])[1] || null;
      return {
        modelId: a.getAttribute('data-model-id'),
        name: ym ? raw.replace(ym[0], '').trim() : raw,
        chassis,
        years: ym ? ym[0].replace(/\s+/g, ' ') : null,
        image: carImg,
      };
    });
  });
}

async function parseEngines(page) {
  return page.evaluate(() => {
    const carImg = [...document.querySelectorAll('img')].map(i => i.currentSrc || i.src).find(s => /workshop_assets/.test(s || '')) || null;
    const rows = [...document.querySelectorAll('table tr')].map(tr => [...tr.querySelectorAll('td')].map(td => (td.textContent || '').trim()));
    const engines = rows.filter(r => r.length >= 5 && r[0]).map(r => ({
      tip: r[0], motorKodu: r[1], kapasiteCc: r[2], gucKw: r[3], modelYili: r[4],
    }));
    return { engines, image: carImg };
  });
}

// ---------------- ana akış ----------------
(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const doLaunch = process.env.WDB_LAUNCH === '1';
  let browser, page;

  if (!doLaunch) {
    // (A) ÖNERİLEN: mevcut Chrome'una bağlan — yeni giriş YOK, senin oturumun
    try {
      browser = await puppeteer.connect({ browserURL: CDP_URL, defaultViewport: null });
      console.log(`🔗 Mevcut Chrome'a bağlanıldı (${CDP_URL}). Senin oturumun kullanılıyor.`);
    } catch (e) {
      console.error(`\n❌ Mevcut Chrome'a bağlanılamadı (${CDP_URL}).`);
      console.error('   Önce TÜM Chrome pencerelerini kapatıp Chrome\'u debug portuyla aç:');
      console.error('   & "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9222');
      console.error('   (Alternatif — kendi penceresini açsın: $env:WDB_LAUNCH="1"; node scripts/webdatabays_crawler.js)');
      process.exit(1);
    }
    const pages = await browser.pages();
    page = pages.find(p => /webdatabays\.com/.test(p.url())) || pages[0] || await browser.newPage();
    await page.bringToFront();
  } else {
    // (B) FALLBACK: ayrı profil penceresi aç (giriş gerekebilir)
    const chrome = findChrome();
    if (!chrome) {
      console.error('❌ Chrome bulunamadı. CHROME_PATH ile yolu ver.');
      process.exit(1);
    }
    browser = await puppeteer.launch({
      executablePath: chrome, headless: false, defaultViewport: null,
      userDataDir: PROFILE_DIR,
      // Gizlilik: otomasyon parmak izini azalt (bot tespitini düşürür)
      args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
      ignoreDefaultArgs: ['--enable-automation'],
    });
    page = (await browser.pages())[0] || await browser.newPage();
    await page.evaluateOnNewDocument(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });
    await gotoStable(page, `${BASE}/makesOverview`);
    await ask('\n👉 Açılan Chrome\'da site göründüğünden emin ol (gerekiyorsa giriş yap). Hazırsan ENTER: ');
  }

  // Görsel indirici — herhangi bir sekmeye takılabilsin diye fonksiyon (kopma sonrası yeni sekmeye de takılır)
  if (DOWNLOAD_IMAGES && !fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });
  const attachImageSaver = (pg) => {
    if (!DOWNLOAD_IMAGES) return;
    pg.on('response', async (res) => {
      try {
        const url = res.url();
        if (!/workshop_assets/i.test(url)) return;
        const ct = (res.headers()['content-type'] || '');
        const id = imageIdOf(url);
        if (!id && !ct.startsWith('image/')) return;
        const name = id || (String(Math.abs([...url].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7))) + '.img');
        const dest = path.join(IMG_DIR, name);
        if (fs.existsSync(dest)) return;
        const buf = await res.buffer();
        if (buf && buf.length) fs.writeFileSync(dest, buf);
      } catch (_) {}
    });
  };
  attachImageSaver(page);
  if (DOWNLOAD_IMAGES) console.log('🖼️  Görsel indirme AÇIK → public/vehicle_tree/images/');

  // Kopan sekmeden (detached frame) kurtulan navigasyon: hata olursa yeni sekme açıp tek sefer yeniden dener
  async function nav(url) {
    try {
      await gotoStable(page, url);
    } catch (e) {
      if (/detached|Target closed|Session closed|frame|context was destroyed/i.test(e.message || '')) {
        console.log('   ♻️ Sekme koptu, yeni sekme açılıyor...');
        try { page = await browser.newPage(); attachImageSaver(page); } catch (_) {}
        await sleep(1000);
        await gotoStable(page, url);
      } else { throw e; }
    }
  }

  // REFILL MODU: WDB_REFILL=1 → yeni crawl yapma; mevcut JSON'larda boş (0 motor) kalan nesilleri yeniden çek
  if (process.env.WDB_REFILL === '1') {
    console.log('🔧 REFILL modu — boş kalan nesiller yeniden çekiliyor...');
    const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
    for (const f of files) {
      const fp = path.join(OUT_DIR, f);
      let tree; try { tree = JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch (_) { continue; }
      if (!tree.models) continue;
      let fixed = 0;
      for (const model of tree.models) {
        for (const gen of (model.generations || [])) {
          if ((gen.engines && gen.engines.length > 0) || !gen.modelId) continue;
          await rndDelay();
          await nav(`${BASE}/modelTypesList?modelId=${gen.modelId}`);
          let { engines, image } = await parseEngines(page);
          for (let r = 0; r < 2 && engines.length === 0; r++) {
            await sleep(6000 + r * 10000);
            await nav(`${BASE}/modelTypesList?modelId=${gen.modelId}`);
            ({ engines, image } = await parseEngines(page));
          }
          if (engines.length > 0) {
            gen.engines = engines;
            if (image && !gen.image) { gen.image = image; gen.imageLocal = localImgPath(image); }
            fixed++;
            console.log(`   ✔ ${tree.make} ${model.name} ${gen.chassis || ''} → ${engines.length} motor`);
          } else {
            console.log(`   … ${tree.make} ${model.name} ${gen.chassis || ''} hâlâ boş`);
          }
        }
      }
      fs.writeFileSync(fp, JSON.stringify(tree, null, 2), 'utf-8');
      console.log(`🔧 ${f}: ${fixed} nesil dolduruldu.`);
    }
    console.log('\n🎉 Refill bitti.');
    if (process.env.WDB_LAUNCH === '1') { await browser.close(); } else { browser.disconnect(); }
    return;
  }

  console.log('🌐 makesOverview açılıyor...');
  await nav(`${BASE}/makesOverview`);

  const allMakes = await parseMakes(page);
  const targets = allMakes.filter(m => TARGET_BRANDS.some(t => m.name.toUpperCase().includes(t) || t.includes(m.name.toUpperCase())));
  console.log(`\n📋 Bulunan hedef marka: ${targets.map(t => t.name).join(', ')}`);

  const index = [];
  let emptyStreak = 0; // üst üste boş motor listesi sayacı (throttle tespiti)
  for (const make of targets) {
    const file = path.join(OUT_DIR, `${slug(make.name)}.json`);
    // RESUME: sadece DOLU dosyayı atla; boş kaydedilmiş markayı yeniden dene
    try {
      if (fs.existsSync(file)) {
        const prev = JSON.parse(fs.readFileSync(file, 'utf-8'));
        if (prev.models && prev.models.length > 0) {
          console.log(`⏭️  ${make.name} zaten dolu, atlanıyor.`);
          index.push({ make: make.name, file: path.basename(file), models: prev.models.length });
          continue;
        }
      }
    } catch (_) {}

    try {
      console.log(`\n🚗 ${make.name} (${make.makeId})`);
      await rndDelay();
      await nav(`${BASE}/modelOverview?makeId=${make.makeId}`);
      if (DOWNLOAD_IMAGES) await autoScroll(page);
      let models = await parseModels(page);
      if (models.length === 0) { // boş geldiyse bir kez daha dene (yükleme/kopma olabilir)
        await sleep(1500);
        await nav(`${BASE}/modelOverview?makeId=${make.makeId}`);
        if (DOWNLOAD_IMAGES) await autoScroll(page);
        models = await parseModels(page);
      }
      models.forEach(m => { m.imageLocal = localImgPath(m.image); });
      console.log(`   ${models.length} model grubu`);

      if (models.length === 0) { console.log(`   ⚠️ ${make.name} boş geldi — KAYDEDİLMİYOR (tekrar çalıştırınca yeniden denenecek).`); continue; }

      for (const model of models) {
        try {
          await rndDelay();
          await nav(`${BASE}/modelTypes?modelGroupId=${model.modelGroupId}&makeId=${make.makeId}`);
          if (DOWNLOAD_IMAGES) await autoScroll(page);
          const gens = await parseGenerations(page);
          model.generations = [];
          for (const gen of gens) {
            await rndDelay();
            await nav(`${BASE}/modelTypesList?modelId=${gen.modelId}`);
            let { engines, image } = await parseEngines(page);
            // THROTTLE SAVUNMASI: boş geldiyse bekleyip 2 kez daha dene (0 çoğu zaman throttle demek)
            for (let r = 0; r < 2 && engines.length === 0; r++) {
              await sleep(6000 + r * 10000);
              await nav(`${BASE}/modelTypesList?modelId=${gen.modelId}`);
              ({ engines, image } = await parseEngines(page));
            }
            if (engines.length === 0) {
              emptyStreak++;
              if (emptyStreak >= COOLDOWN_TRIGGER) {
                console.log(`   🧊 Üst üste ${emptyStreak} boş — site throttle ediyor olabilir. ${Math.round(COOLDOWN_MS / 1000)}s mola...`);
                await sleep(COOLDOWN_MS);
                emptyStreak = 0;
              }
            } else {
              emptyStreak = 0;
            }
            if (image && !gen.image) gen.image = image;
            gen.imageLocal = localImgPath(gen.image);
            gen.engines = engines;
            model.generations.push(gen);
            console.log(`      • ${model.name} ${gen.chassis || ''} → ${engines.length} motor`);
          }
        } catch (e) {
          console.log(`      ⚠️ ${model.name} hata: ${e.message}`);
          model.error = e.message;
        }
      }

      const tree = { make: make.name, makeId: make.makeId, crawledAt: new Date().toISOString(), models };
      fs.writeFileSync(file, JSON.stringify(tree, null, 2), 'utf-8');
      console.log(`   ✅ Kaydedildi: ${path.basename(file)}`);
      index.push({ make: make.name, file: path.basename(file), models: models.length });
      console.log(`   ⏸️  Marka molası ${Math.round(BRAND_PAUSE / 1000)}s...`);
      await sleep(BRAND_PAUSE);
    } catch (e) {
      console.log(`   ❌ ${make.name} atlandı (hata: ${e.message}) — KAYDEDİLMİYOR, tekrar denenecek.`);
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, '_index.json'), JSON.stringify(index, null, 2), 'utf-8');
  console.log('\n🎉 Bitti. Çıktı: public/vehicle_tree/');
  if (process.env.WDB_LAUNCH === '1') { await browser.close(); } else { browser.disconnect(); }
})().catch(e => { console.error('Kritik hata:', e); process.exit(1); });
