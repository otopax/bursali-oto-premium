const fs = require('fs');
const puppeteer = require('puppeteer-core');

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
];
function findChrome() {
  for (const p of CHROME_CANDIDATES) { if (fs.existsSync(p)) return p; }
  return null;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const rndDelay = () => sleep(3000 + Math.random() * 4000); // 3-7 saniye arasi rastgele bekleme

(async () => {
  console.log('JSON Probe Başlıyor (Yavas Mod - Bot Korumasi Icin)...');
  const chrome = findChrome();
  const browser = await puppeteer.launch({ 
    executablePath: chrome, headless: false, 
    args: [
      '--start-maximized', 
      '--disable-blink-features=AutomationControlled',
      '--user-data-dir=C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/.crawler-profile'
    ], 
    ignoreDefaultArgs: ['--enable-automation']
  });
  
  const page = (await browser.pages())[0];
  await page.evaluateOnNewDocument(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });
  
  console.log('Siteye baglaniliyor...');
  await page.goto('https://webdatabays.com/workshop/touch/site/layout/makesOverview', { waitUntil: 'domcontentloaded', timeout: 60000 });
  
  console.log('Bot engeli olmamasi icin 4 saniye bekleniyor...');
  await sleep(4000);
  
  console.log('Hedef motora (AUDI 1.8 DS) geciliyor...');
  await rndDelay();
  await page.goto('https://webdatabays.com/workshop/touch/site/layout/adjustmentData?groupId=ADJUSTMENT_DATA&typeId=t_1440', { waitUntil: 'domcontentloaded', timeout: 60000 });
  
  console.log('Tablonun yuklenmesi bekleniyor (Giris yapmadiysaniz veya Cloudflare cikarsa lutfen gecin)...');
  await page.waitForSelector('table', { timeout: 90000 }).catch(() => console.log('Tablo bulunamadi, manuel kontrol edin.'));
  
  await rndDelay();
  console.log('Tablo bulundu, veriler insansi bir hizda cekiliyor...');
  
  const data = await page.evaluate(() => {
    const result = { motorKodu: 'DS', kategori: 'Ayarlama Verisi', veriler: [] };
    const rows = document.querySelectorAll('tr');
    rows.forEach(tr => {
      const cells = tr.querySelectorAll('td');
      if (cells.length >= 2) {
        const key = cells[0].innerText.trim();
        const val1 = cells[1].innerText.trim();
        const val2 = cells.length > 2 ? cells[2].innerText.trim() : '';
        if (key) result.veriler.push({ ozellik: key, deger: (val1 + ' ' + val2).trim() });
      }
    });
    return result;
  });

  fs.writeFileSync('public/kutuphane_data/ornek_motor_verisi.json', JSON.stringify(data, null, 2), 'utf-8');
  console.log('BASARILI! Veriler public/kutuphane_data/ornek_motor_verisi.json dosyasina kaydedildi.');
  
  await sleep(2000);
  await browser.close();
})();
