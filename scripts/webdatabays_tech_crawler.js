/**
 * webdatabays TEKNİK VERİ crawler'ı — ZAMANLAMA KAYIŞI + AYARLAMA VERİSİ (öncelik), motor bazlı.
 * ================================================================================================
 * Yapı (gerçek, incelendi — varsayım yok):
 *   modelTypesList?modelId=<GEN>            → motor satırları, her satır modelDetail?typeId=<t_..>
 *   modelDetail?typeId=<t_..>               → linkler: "Zamanlama kayışı" (repairManuals&groupId=TIMING&storyId=..),
 *                                              "Ayarlama verisi" (adjustmentData), + diğer bölümler
 *   → o linkler açılır, "Göster" bölümleri açılır, TAM kaydırılır ("2 ekran" eksik kalmasın), içerik çekilir.
 *
 * ÇOK YAVAŞ çalışır (bot yakalanmamak için). Resume'lidir. Marka filtreli. Test limiti var.
 *
 * KULLANIM (senin girişli Chrome'un debug portuyla açıkken — bağlan modu, EN GÜVENLİ):
 *   & "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\wdb-debug"
 *   # açılan pencerede webdatabays'e girişli ol, sonra:
 *   node scripts/webdatabays_tech_crawler.js
 *
 * ÖNCE TEST ET (1-2 motor):   $env:WDB_LIMIT="2"; node scripts/webdatabays_tech_crawler.js
 * Tek marka:                  $env:WDB_BRANDS="AUDI"; node scripts/webdatabays_tech_crawler.js
 *
 * ÇIKTI: public/kutuphane_data/<marka>/<model>/<motorKodu>__<typeId>/{zamanlama.json, ayarlama.json}
 *        + _tech_index.json (marka/model/motor → dosya)
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const puppeteer = require('puppeteer-core');
const ask = (q) => new Promise(res => { const rl = readline.createInterface({ input: process.stdin, output: process.stdout }); rl.question(q, a => { rl.close(); res(a); }); });

const BASE = 'https://webdatabays.com/workshop/touch/site/layout';
const CDP_URL = process.env.WDB_CDP || 'http://127.0.0.1:9222';
const PROFILE_DIR = path.join(__dirname, '../.crawler-profile');
const TREE_DIR = path.join(__dirname, '../public/vehicle_tree');
const OUT_DIR = path.join(__dirname, '../public/kutuphane_data');

// ÇOK YAVAŞ gecikmeler (env ile ayarlanabilir)
const MIN = parseInt(process.env.WDB_MIN || '5000', 10);
const MAX = parseInt(process.env.WDB_MAX || '9000', 10);
const ENGINE_PAUSE = parseInt(process.env.WDB_ENGINEPAUSE || '12000', 10);
const LIMIT = parseInt(process.env.WDB_LIMIT || '0', 10); // 0 = sınırsız
const BRAND_FILTER = process.env.WDB_BRANDS ? process.env.WDB_BRANDS.split(',').map(s => s.trim().toUpperCase()) : null;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const rnd = () => sleep(MIN + Math.random() * (MAX - MIN));
const slug = s => (s || '').toString().toLowerCase().replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const CHROME_CANDIDATES = [process.env.CHROME_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',process.env.LOCALAPPDATA?process.env.LOCALAPPDATA+'/Google/Chrome/Application/chrome.exe':null].filter(Boolean);
const findChrome = () => { for (const p of CHROME_CANDIDATES){try{if(p&&fs.existsSync(p))return p;}catch(_){}} return null; };

async function goto(page, url) { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); await sleep(700); }

// "Göster" bölümlerini aç + sayfayı TAM kaydır (2 ekran / lazy içerik eksik kalmasın)
async function expandAndScroll(page) {
  try {
    await page.evaluate(async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      // "Göster" / genişlet düğmelerini tıkla
      const toggles = [...document.querySelectorAll('a,button,span,div')].filter(e => /^(Göster|Show|Genişlet)$/i.test((e.textContent||'').trim()));
      for (const t of toggles) { try { t.click(); await wait(120); } catch (_) {} }
      // tam kaydır
      let last = -1;
      for (let i = 0; i < 50; i++) { window.scrollTo(0, document.body.scrollHeight); await wait(220); const h = document.body.scrollHeight; if (h === last) break; last = h; }
      document.querySelectorAll('*').forEach(el => { try { if (el.scrollHeight > el.clientHeight + 40) el.scrollTop = el.scrollHeight; } catch (_) {} });
      window.scrollTo(0, 0);
    });
    await sleep(900);
  } catch (_) {}
}

// Sayfanın TÜM içeriğini çıkar (başlıklar + tablolar + tam metin + görseller) — hiçbir alan atlanmasın
async function extract(page) {
  return page.evaluate(() => {
    const clean = s => (s || '').replace(/\s+/g, ' ').trim();
    const title = clean((document.querySelector('h1,.pageTitle,.storyTitle') || {}).textContent || document.title);
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,legend')].map(h => clean(h.textContent)).filter(Boolean);
    const tables = [...document.querySelectorAll('table')].map(t => [...t.querySelectorAll('tr')].map(tr => [...tr.querySelectorAll('th,td')].map(c => clean(c.textContent)).filter(Boolean)).filter(r => r.length)).filter(t => t.length);
    // etiket-değer: iki metin çocuklu satırlar (div tabanlı)
    const kv = [];
    document.querySelectorAll('div,li,tr').forEach(row => {
      const kids = [...row.children].filter(c => clean(c.textContent));
      if (kids.length === 2 && !kids.some(k => k.querySelector('div,table,ul'))) {
        const a = clean(kids[0].textContent), b = clean(kids[1].textContent);
        if (a && b && a.length < 60 && b.length < 120) kv.push([a, b]);
      }
    });
    const images = [...new Set([...document.querySelectorAll('img')].map(i => i.currentSrc || i.src).filter(s => /workshop_assets/.test(s || '')))];
    const fullText = clean(document.body.innerText);
    // ANA İÇERİK HTML'i (#content) — site kendi tablo/bölüm düzeniyle; üst-nav/menü haricinde.
    let contentHtml = '';
    const c = document.getElementById('content');
    if (c) {
      const clone = c.cloneNode(true);
      clone.querySelectorAll('script,style,button,input,select,.print,[onclick]').forEach(e => { try { e.remove(); } catch (_) {} });
      // "Genel bakışa geri dön" / "Yazdır" gibi buton-linkleri de temizle
      clone.querySelectorAll('a').forEach(a => { const t = (a.textContent || '').trim(); if (/^(Yazdır|Genel bakışa geri dön|Göster|Gizle|Sakla)/i.test(t)) { try { a.remove(); } catch (_) {} } });
      contentHtml = clone.innerHTML;
    }
    return { title, headings, tables, kv, images, fullText, contentHtml };
  });
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  let browser;
  if (process.env.WDB_LAUNCH === '1') {
    const chrome = findChrome(); if (!chrome) { console.error('Chrome bulunamadi.'); process.exit(1); }
    browser = await puppeteer.launch({ executablePath: chrome, headless: false, defaultViewport: null, userDataDir: PROFILE_DIR, args: ['--start-maximized','--disable-blink-features=AutomationControlled'], ignoreDefaultArgs: ['--enable-automation'] });
  } else {
    try { browser = await puppeteer.connect({ browserURL: CDP_URL, defaultViewport: null }); console.log('🔗 Mevcut Chrome oturumuna baglanildi.'); }
    catch (e) { console.error('❌ Debug Chrome baglanti yok. Chrome\'u --remote-debugging-port=9222 --user-data-dir="C:\\wdb-debug" ile ac.'); process.exit(1); }
  }
  const pages = await browser.pages();
  const page = pages.find(p => /webdatabays\.com/.test(p.url())) || pages[0] || await browser.newPage();

  // GİRİŞ GÜVENCESİ: boş veri çekmemek için oturumu onaylat
  await goto(page, `${BASE}/makesOverview`);
  await ask('\n👉 Acilan/bagli Chrome\'da webdatabays GIRISLI ve marka listesi gorunuyor mu? Emin ol, sonra ENTER: ');

  // Ağaçtan iş listesi
  const treeFiles = fs.readdirSync(TREE_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
  const timingStorySeen = new Set(); // dedupe (aynı zamanlama story'sini tekrar cekme)
  const index = [];
  let done = 0;

  for (const tf of treeFiles) {
    const tree = JSON.parse(fs.readFileSync(path.join(TREE_DIR, tf), 'utf-8'));
    if (BRAND_FILTER && !BRAND_FILTER.some(b => tree.make.toUpperCase().includes(b))) continue;
    console.log(`\n🚗 ${tree.make}`);
    for (const model of (tree.models || [])) {
      for (const gen of (model.generations || [])) {
        if (!gen.modelId) continue;
        // 1) generation motor satirlari + typeId
        await rnd();
        await goto(page, `${BASE}/modelTypesList?modelId=${gen.modelId}`);
        await expandAndScroll(page);
        const rows = await page.evaluate(() => [...document.querySelectorAll('table tr')].map(tr => {
          const cells = [...tr.querySelectorAll('td')].map(td => (td.textContent||'').replace(/\s+/g,' ').trim());
          // typeId satırın data-url ozniteliginde (hucrelerde degil): data-url="/.../modelDetail?typeId=t_.."
          const du = tr.getAttribute('data-url') || '';
          const tid = (du.match(/typeId=(t_\d+)/) || [])[1] || (tr.innerHTML.match(/typeId=(t_\d+)/) || [])[1] || null;
          return { tip: cells[0]||'', motorKodu: cells[1]||'', kapasite: cells[2]||'', guc: cells[3]||'', yil: cells[4]||'', typeId: tid };
        }).filter(r => r.typeId && r.tip));

        for (const eng of rows) {
          const dir = path.join(OUT_DIR, slug(tree.make), slug(model.name), `${slug(eng.motorKodu||eng.tip)}__${eng.typeId}`);
          const timingFile = path.join(dir, 'zamanlama.json');
          const adjFile = path.join(dir, 'ayarlama.json');
          if (fs.existsSync(timingFile) && fs.existsSync(adjFile)) { continue; } // resume
          fs.mkdirSync(dir, { recursive: true });

          try {
            // 2) modelDetail → timing + adjustment linklerini DİNAMİK oku (uydurma yok)
            await rnd();
            await goto(page, `${BASE}/modelDetail?typeId=${eng.typeId}`);
            const links = await page.evaluate(() => {
              const g = (re) => { const a = [...document.querySelectorAll('a[href]')].find(x => re.test(x.getAttribute('href')||'')); return a ? a.getAttribute('href') : null; };
              return { timing: g(/repairManuals\?.*groupId=TIMING/), adjustment: g(/adjustmentData\?/) };
            });

            // 3) ZAMANLAMA KAYIŞI
            if (links.timing && !fs.existsSync(timingFile)) {
              const storyId = (links.timing.match(/storyId=(\d+)/) || [])[1];
              await rnd();
              await goto(page, links.timing.startsWith('http') ? links.timing : `https://webdatabays.com${links.timing}`);
              await expandAndScroll(page);
              const data = await extract(page);
              fs.writeFileSync(timingFile, JSON.stringify({ brand: tree.make, model: model.name, motorKodu: eng.motorKodu, tip: eng.tip, yil: eng.yil, typeId: eng.typeId, storyId, section: 'zamanlama-kayisi', ...data }, null, 2));
              if (storyId) timingStorySeen.add(storyId);
            }
            // 4) AYARLAMA VERİSİ
            if (links.adjustment && !fs.existsSync(adjFile)) {
              await rnd();
              await goto(page, links.adjustment.startsWith('http') ? links.adjustment : `https://webdatabays.com${links.adjustment}`);
              await expandAndScroll(page);
              const data = await extract(page);
              fs.writeFileSync(adjFile, JSON.stringify({ brand: tree.make, model: model.name, motorKodu: eng.motorKodu, tip: eng.tip, yil: eng.yil, typeId: eng.typeId, section: 'ayarlama-verisi', ...data }, null, 2));
            }
            index.push({ brand: tree.make, model: model.name, motorKodu: eng.motorKodu, typeId: eng.typeId, dir: path.relative(OUT_DIR, dir) });
            done++;
            console.log(`   ✔ ${model.name} ${eng.motorKodu||eng.tip} (${eng.typeId}) → zamanlama+ayarlama`);
            await sleep(ENGINE_PAUSE); // motorlar arası uzun mola
            if (LIMIT && done >= LIMIT) { fs.writeFileSync(path.join(OUT_DIR, '_tech_index.json'), JSON.stringify(index, null, 2)); console.log(`\n🧪 TEST limiti (${LIMIT}) doldu. Cikti: public/kutuphane_data/`); if (process.env.WDB_LAUNCH==='1') await browser.close(); else browser.disconnect(); return; }
          } catch (e) {
            console.log(`   ⚠️ ${model.name} ${eng.motorKodu} hata: ${e.message}`);
          }
        }
      }
    }
  }
  fs.writeFileSync(path.join(OUT_DIR, '_tech_index.json'), JSON.stringify(index, null, 2));
  console.log(`\n🎉 Bitti. ${done} motor. Cikti: public/kutuphane_data/`);
  if (process.env.WDB_LAUNCH === '1') await browser.close(); else browser.disconnect();
})().catch(e => { console.error('Kritik hata:', e); process.exit(1); });
