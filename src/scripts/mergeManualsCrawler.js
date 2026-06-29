const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const https = require('https');

const CATALOG_DIR = path.join(process.cwd(), 'public', 'catalog');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.text();
    } catch (e) {
      await delay(2000);
    }
  }
  return null;
}

async function downloadFile(url, dest) {
  if (fs.existsSync(dest)) return;
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200 || response.statusCode === 301 || response.statusCode === 302) {
        if(response.statusCode === 301 || response.statusCode === 302) {
           const redirectUrl = response.headers.location.startsWith('//') ? 'https:' + response.headers.location : response.headers.location;
           return downloadFile(redirectUrl, dest).then(resolve).catch(reject);
        }
        const file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      } else {
        reject(`Failed: ${response.statusCode}`);
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err.message));
    });
  });
}

async function fetchManualsForBrandModel(brand, modelSlug, destFolder) {
  // We need to map fuse-box.info modelSlug to StartMyCar modelSlug.
  // Example: fuse-box: 'audi-a1-8x-2010-2018-fuses' -> StartMyCar: 'a1'
  let smcModel = modelSlug.replace(`${brand}-`, '').split('-')[0]; // simple heuristic
  
  // 1. Owner's Manuals
  const ownerUrl = `https://www.startmycar.com/${brand}/${smcModel}/info/manuals`;
  let html = await fetchWithRetry(ownerUrl);
  if (html) {
    const $ = cheerio.load(html);
    let count = 0;
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.endsWith('.pdf')) {
        const finalUrl = href.startsWith('//') ? 'https:' + href : href;
        downloadFile(finalUrl, path.join(destFolder, `owner_manual_${count}.pdf`)).catch(()=>{});
        count++;
      }
    });
    if(count > 0) console.log(`  -> Downloaded ${count} Owner Manuals`);
  }

  // 2. Service & Repair Manuals
  const serviceUrl = `https://www.startmycar.com/${brand}/${smcModel}/info/manuals/service-repair`;
  html = await fetchWithRetry(serviceUrl);
  if (html) {
    const $ = cheerio.load(html);
    let count = 0;
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.endsWith('.pdf')) {
        const finalUrl = href.startsWith('//') ? 'https:' + href : href;
        downloadFile(finalUrl, path.join(destFolder, `service_manual_${count}.pdf`)).catch(()=>{});
        count++;
      }
    });
    if(count > 0) console.log(`  -> Downloaded ${count} Service Manuals`);
  }
}

async function run() {
  console.log("=========================================");
  console.log("   MANUALS MERGE CRAWLER INITIATED       ");
  console.log("=========================================");

  if (!fs.existsSync(CATALOG_DIR)) {
    console.log("Catalog directory not found! Run fuseBoxCrawler.js first.");
    return;
  }

  const brands = fs.readdirSync(CATALOG_DIR).filter(f => !f.startsWith('_'));
  
  for (const brand of brands) {
    const brandPath = path.join(CATALOG_DIR, brand);
    if (!fs.statSync(brandPath).isDirectory()) continue;

    const models = fs.readdirSync(brandPath);
    for (const model of models) {
      const modelPath = path.join(brandPath, model);
      if (!fs.statSync(modelPath).isDirectory()) continue;

      console.log(`\n[MERGE] Looking for manuals for: ${brand} -> ${model}`);
      await fetchManualsForBrandModel(brand, model, modelPath);
      await delay(1000); // polite delay
    }
  }

  console.log("\n[SUCCESS] Manuals merging finished!");
}

run();
