/**
 * webdatabays PROBE — modelDetail (teknik veri: zamanlama kayışı/ayar vb.) sayfa YAPISINI dökümler.
 * AMAÇ: varsayım yapmadan, gerçek yapıyı görüp kesin çekme kodunu kurmak. Hiçbir şey yazmaz/değiştirmez.
 * "İki ekran aşağı kaydırma" notu için: sayfayı TAM kaydırıp görünmeyen içeriği de yükler, TÜM DOM'u alır.
 *
 * KULLANIM (senin webdatabays Chrome'un açıkken):
 *   (A) Bağlan modu: Chrome debug portuyla açıksa →  node scripts/webdatabays_probe.js
 *   (B) Kendi penceresi:  $env:WDB_LAUNCH="1"; node scripts/webdatabays_probe.js
 *   Farklı motor denemek için:  $env:WDB_PROBE="t_318011816"  (typeId)
 *
 * ÇIKTI: scripts/_probe_modeldetail.json  (yapı) + scripts/_probe_modeltypeslist.json (typeId->motor eşlemesi)
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const BASE = 'https://webdatabays.com/workshop/touch/site/layout';
const CDP_URL = process.env.WDB_CDP || 'http://127.0.0.1:9222';
const PROFILE_DIR = path.join(__dirname, '../.crawler-profile');
const TYPE_ID = process.env.WDB_PROBE || 't_318011816';
// typeId->motor eşlemesini görmek için bir modelTypesList (BMW 3 F30) — istersen WDB_PROBE_MODEL ile değiştir
const MODEL_ID = process.env.WDB_PROBE_MODEL || 'd_200000009';

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA ? process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe' : null,
].filter(Boolean);
const findChrome = () => { for (const p of CHROME_CANDIDATES) { try { if (p && fs.existsSync(p)) return p; } catch (_) {} } return null; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fullScroll(page) {
  // Sayfayı defalarca sona kadar kaydır (lazy içerik + "2 ekran aşağı" için)
  await page.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    let last = -1;
    for (let i = 0; i < 40; i++) {
      window.scrollTo(0, document.body.scrollHeight);
      await wait(250);
      const h = document.body.scrollHeight;
      if (h === last) break; last = h;
    }
    // içteki scrollable panelleri de kaydır
    document.querySelectorAll('*').forEach(el => { try { if (el.scrollHeight > el.clientHeight + 40) el.scrollTop = el.scrollHeight; } catch (_) {} });
    window.scrollTo(0, 0);
  });
  await sleep(800);
}

// Sayfadaki TÜM yapıyı çıkar (varsayımsız: başlıklar, tablolar, etiket-değer, görsel, tam metin)
async function dumpStructure(page) {
  return page.evaluate(() => {
    const clean = s => (s || '').replace(/\s+/g, ' ').trim();
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,legend,.title,.header,.sectionTitle')].map(h => ({ tag: h.tagName, text: clean(h.textContent) })).filter(x => x.text);
    const tables = [...document.querySelectorAll('table')].map(t => ({
      caption: clean(t.caption ? t.caption.textContent : ''),
      rows: [...t.querySelectorAll('tr')].map(tr => [...tr.querySelectorAll('th,td')].map(c => clean(c.textContent))).filter(r => r.some(Boolean)),
    })).filter(t => t.rows.length);
    // etiket-değer çiftleri: dt/dd, ve iki hücreli satırlar zaten tablolarda; ayrıca .label/.value ikilileri
    const dl = [];
    document.querySelectorAll('dl').forEach(d => { const dts = [...d.querySelectorAll('dt')], dds = [...d.querySelectorAll('dd')]; dts.forEach((dt, i) => dl.push([clean(dt.textContent), clean(dds[i] ? dds[i].textContent : '')])); });
    const images = [...document.querySelectorAll('img')].map(i => i.currentSrc || i.src).filter(s => /workshop_assets/.test(s || ''));
    // olası "sekme"/bölüm linkleri (teknik veri menüsü)
    const navLinks = [...document.querySelectorAll('a[href],[data-url]')].map(a => ({ text: clean(a.textContent), href: a.getAttribute('href') || '', dataUrl: a.getAttribute('data-url') || '' })).filter(x => (x.href && x.href !== '#') || x.dataUrl).slice(0, 120);
    return {
      url: location.href,
      title: clean(document.title),
      headings,
      tableCount: tables.length,
      tables,
      dl,
      images: [...new Set(images)].slice(0, 40),
      navLinks,
      fullText: clean(document.body.innerText).slice(0, 12000),
    };
  });
}

(async () => {
  let browser;
  if (process.env.WDB_LAUNCH === '1') {
    const chrome = findChrome(); if (!chrome) { console.error('Chrome bulunamadi (CHROME_PATH ver).'); process.exit(1); }
    browser = await puppeteer.launch({ executablePath: chrome, headless: false, defaultViewport: null, userDataDir: PROFILE_DIR, args: ['--start-maximized', '--disable-blink-features=AutomationControlled'], ignoreDefaultArgs: ['--enable-automation'] });
  } else {
    try { browser = await puppeteer.connect({ browserURL: CDP_URL, defaultViewport: null }); }
    catch (e) { console.error('Chrome debug portuna baglanilamadi. Debug Chrome ac ya da $env:WDB_LAUNCH="1" kullan.'); process.exit(1); }
  }
  const pages = await browser.pages();
  const page = pages.find(p => /webdatabays\.com/.test(p.url())) || pages[0] || await browser.newPage();

  // 1) modelDetail (teknik veri)
  console.log('modelDetail aciliyor: typeId=' + TYPE_ID);
  await page.goto(`${BASE}/modelDetail?typeId=${TYPE_ID}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(1000);
  await fullScroll(page);
  const detail = await dumpStructure(page);
  fs.writeFileSync(path.join(__dirname, '_probe_modeldetail.json'), JSON.stringify(detail, null, 2));
  console.log('  -> scripts/_probe_modeldetail.json  (baslik:', detail.headings.length, '| tablo:', detail.tableCount, '| gorsel:', detail.images.length, ')');

  // 2) modelTypesList: motor satirlarinda typeId nasil? (typeId->motor eslemesi)
  console.log('modelTypesList aciliyor: modelId=' + MODEL_ID);
  await page.goto(`${BASE}/modelTypesList?modelId=${MODEL_ID}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(800);
  await fullScroll(page);
  const rowsWithType = await page.evaluate(() => {
    const clean = s => (s || '').replace(/\s+/g, ' ').trim();
    return [...document.querySelectorAll('table tr')].map(tr => {
      const cells = [...tr.querySelectorAll('td')].map(td => clean(td.textContent));
      const html = tr.innerHTML || '';
      const tid = (html.match(/typeId=(t_\d+)/) || [])[1] || (tr.getAttribute('data-url') || '').match(/t_\d+/)?.[0] || null;
      return { cells, typeId: tid };
    }).filter(r => r.cells.length);
  });
  fs.writeFileSync(path.join(__dirname, '_probe_modeltypeslist.json'), JSON.stringify(rowsWithType, null, 2));
  const withId = rowsWithType.filter(r => r.typeId).length;
  console.log('  -> scripts/_probe_modeltypeslist.json  (satir:', rowsWithType.length, '| typeId bulunan:', withId, ')');

  console.log('\nBitti. Iki dosyayi bana ilet (ya da ben okurum).');
  if (process.env.WDB_LAUNCH === '1') await browser.close(); else browser.disconnect();
})().catch(e => { console.error('Probe hata:', e.message); process.exit(1); });
