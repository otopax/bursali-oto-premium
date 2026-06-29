const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const TARGET_BRANDS = ["BMW", "MERCEDES-BENZ", "AUDI", "PORSCHE", "VOLKSWAGEN", "VOLVO", "LAND ROVER", "OPEL"];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomSleep(min, max) {
  const ms = Math.floor(Math.random() * (max - min + 1) + min);
  console.log(`[İnsan Davranışı] ${ms}ms bekleniyor...`);
  return sleep(ms);
}

async function humanScroll(page) {
  console.log("[İnsan Davranışı] Sayfada fiziksel olarak aşağı yukarı geziniyor...");
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel({ deltaY: Math.floor(Math.random() * 500) + 200 });
    await sleep(Math.floor(Math.random() * 1000) + 500);
  }
  await page.mouse.wheel({ deltaY: -Math.floor(Math.random() * 400) - 200 });
  await sleep(1000);
}

async function humanClick(page, element) {
  await element.scrollIntoView();
  await sleep(500);
  const box = await element.boundingBox();
  if (box) {
    const x = box.x + (box.width / 2);
    const y = box.y + (box.height / 2);
    await page.mouse.move(x, y, { steps: 10 });
    await sleep(200);
    await page.mouse.click(x, y);
  } else {
    await element.click();
  }
}

async function runScraper() {
  console.log(`==== TÜM MARKALAR İÇİN FİZİKSEL TARAMA BAŞLIYOR ====`);

  let browser;
  try {
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    console.log("Chrome'a başarıyla bağlanıldı!");
  } catch (error) {
    console.error("Chrome bağlantı hatası! Lütfen 'Asistan_Chrome_Baslat.bat' dosyasını MASAÜSTÜNDEN ÇİFT TIKLAYARAK açın.");
    process.exit(1);
  }

  const pages = await browser.pages();
  let page = pages.find(p => p.url().includes('webdatabays.com'));
  
  if (!page) {
    console.log("WebDataBays sekmesi bulunamadı. Lütfen siteye girip giriş yapın!");
    process.exit(1);
  }

  const outputDir = path.join(process.cwd(), 'public', 'webdatabays_data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (let b = 0; b < TARGET_BRANDS.length; b++) {
    const brandName = TARGET_BRANDS[b];
    console.log(`\n========================================`);
    console.log(`>>> SIRADAKİ MARKA: ${brandName} <<<`);
    console.log(`========================================`);

    const START_URL = 'https://webdatabays.com/workshop/touch/site/layout/makesOverview';
    await page.goto(START_URL, { waitUntil: 'networkidle2' });
    await humanScroll(page);
    await randomSleep(2000, 4000);

    const brandElements = await page.$$('#makes li a');
    let targetBrandEl = null;

    for (let el of brandElements) {
      const text = await page.evaluate(e => e.textContent.trim().toUpperCase(), el);
      if (text === brandName) {
        targetBrandEl = el;
        break;
      }
    }

    if (!targetBrandEl) {
      console.error(`HATA: ${brandName} ana sayfada bulunamadı, atlanıyor!`);
      continue;
    }

    let finalData = { brand: brandName, models: [] };

    console.log(`${brandName} bulundu! Fiziksel olarak tıklanıyor...`);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      humanClick(page, targetBrandEl)
    ]);
    
    await humanScroll(page);
    await randomSleep(3000, 5000);

    const modelLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('#models li.model a')).map(a => a.href);
    });
    
    console.log(`Toplam ${modelLinks.length} model grubu bulundu. Sırayla içlerine giriliyor...`);

    for (let i = 0; i < modelLinks.length; i++) {
      const url = modelLinks[i];
      
      await page.goto(url, { waitUntil: 'networkidle2' });
      await humanScroll(page);
      await randomSleep(3000, 5000);

      const modelText = await page.evaluate(() => {
         const p = document.querySelector('h1') || document.querySelector('.makeName');
         return p ? p.textContent.trim() : "Model";
      });

      console.log(`[${i+1}/${modelLinks.length}] Kasalar analiz ediliyor...`);
      
      let modelData = {
        modelName: `Model Grubu ${i+1}`,
        yearRange: "Bilinmiyor",
        chassisList: []
      };

      try {
        const chassisList = await page.evaluate(() => {
          const nodes = Array.from(document.querySelectorAll('li.tile a, li.list a, .entry a, #models li a, #types li a'));
          return nodes.map(a => a.textContent.replace(/\s+/g, ' ').trim()).filter(text => text && text.length > 1);
        });

        const uniqueChassis = [...new Set(chassisList)];
        modelData.chassisList = uniqueChassis;
        
        console.log(`  -> ${uniqueChassis.length} adet kasa bulundu.`);
        finalData.models.push(modelData);
      } catch (e) {
        console.error(`  -> Sayfada hata oluştu, atlanıyor. Hata: ${e.message}`);
      }

      if ((i + 1) % 5 === 0) {
        console.log(`[Dinlenme] Bot şüphe çekmemek için 10 saniye kahve molasında...`);
        await sleep(10000);
      }
    }

    const outputPath = path.join(outputDir, `${brandName.toLowerCase()}_chassis.json`);
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2), 'utf-8');
    console.log(`BAŞARILI! ${brandName} kaydedildi: ${outputPath}`);
    
    console.log(`Marka arası büyük dinlenme (20 saniye)...`);
    await sleep(20000);
  }

  await browser.disconnect();
  console.log("TÜM İŞLEMLER TAMAMLANDI! Chrome bağlantısı kesildi.");
}

runScraper();
