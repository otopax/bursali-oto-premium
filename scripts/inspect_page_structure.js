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

(async () => {
  console.log('Sayfa Yapısı İnceleme Başlıyor...');
  const chrome = findChrome();
  const browser = await puppeteer.launch({ 
    executablePath: chrome, 
    headless: false, 
    args: [
      '--start-maximized',
      '--user-data-dir=C:/Users/xbors/OneDrive/Desktop/Bursali_Oto_Dijital_Yonetim/Web_Sitesi/bursali-oto-web/.crawler-profile'
    ]
  });
  
  const page = (await browser.pages())[0];
  console.log('Sayfaya gidiliyor...');
  await page.goto('https://webdatabays.com/workshop/touch/site/layout/adjustmentData?groupId=ADJUSTMENT_DATA&typeId=t_1440', { waitUntil: 'networkidle2', timeout: 60000 });

  await new Promise(r => setTimeout(r, 4000));

  const pageAnalysis = await page.evaluate(() => {
    const allDivs = document.querySelectorAll('div');
    const divsWithText = [];
    allDivs.forEach(d => {
      const text = d.innerText ? d.innerText.trim() : '';
      if (text && d.children.length === 0) {
        divsWithText.push({ tag: d.tagName, className: d.className, text: text.substring(0, 100) });
      }
    });

    const tables = document.querySelectorAll('table');
    const tableData = [];
    tables.forEach(t => {
      const rows = [];
      t.querySelectorAll('tr').forEach(tr => {
        const cells = Array.from(tr.querySelectorAll('td, th')).map(c => c.innerText.trim());
        if (cells.length) rows.push(cells);
      });
      tableData.push(rows);
    });

    return {
      title: document.title,
      url: window.location.href,
      tableCount: tables.length,
      tables: tableData,
      sampleDivs: divsWithText.slice(0, 30),
      bodyTextSnippet: document.body.innerText ? document.body.innerText.substring(0, 1500) : ''
    };
  });

  fs.writeFileSync('scripts/_page_structure.json', JSON.stringify(pageAnalysis, null, 2), 'utf-8');
  console.log('Analiz tamamlandı! scripts/_page_structure.json dosyasına yazıldı.');
  console.log('Bulunan Tablo Sayısı:', pageAnalysis.tableCount);
  console.log('Sayfa Metin Başlangıcı:\n', pageAnalysis.bodyTextSnippet.substring(0, 300));

  await browser.close();
})();
