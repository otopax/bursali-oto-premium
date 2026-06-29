const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const https = require('https');

async function downloadFile(url, dest) {
  if (fs.existsSync(dest)) return;
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200 || response.statusCode === 301 || response.statusCode === 302) {
        if(response.statusCode === 301 || response.statusCode === 302) {
           return downloadFile(response.headers.location.startsWith('//') ? 'https:' + response.headers.location : response.headers.location, dest).then(resolve).catch(reject);
        }
        const file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      } else {
        reject(`Failed to download ${url}: ${response.statusCode}`);
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err.message));
    });
  });
}

async function scrapeCar(brand, model, year) {
  console.log(`\n=> Scraper started for: ${brand} ${model} ${year}`);
  const url = `https://www.startmycar.com/${brand}/${model}/info/fusebox/${year}`;
  
  const catalogDir = path.join(process.cwd(), 'public', 'catalog', brand, model, year);
  if (!fs.existsSync(catalogDir)) {
    fs.mkdirSync(catalogDir, { recursive: true });
  }

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    // 1. Extract JSON data from scripts
    let nativeData = null;
    $('script').each((i, el) => {
      const scriptContent = $(el).html();
      if (scriptContent && scriptContent.includes('fuseboxesData')) {
        const match = scriptContent.match(/fuseboxesData\s*=\s*(\[.*?\]);/s) || scriptContent.match(/var\s+fuseboxesData\s*=\s*(\[.*?\}\]);/s);
        if (match && match[1]) {
          try { nativeData = JSON.parse(match[1]); } catch(e){}
        }
      }
    });

    if (nativeData) {
      fs.writeFileSync(path.join(catalogDir, 'fuseboxes.json'), JSON.stringify(nativeData, null, 2));
      console.log(`[+] Saved fuseboxes.json (${nativeData.length} boxes)`);
    } else {
      console.log('[-] No fuseboxesData found.');
    }

    // 2. Look for PDFs
    let pdfCount = 0;
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.toLowerCase().endsWith('.pdf')) {
        pdfCount++;
        const pdfUrl = href.startsWith('//') ? 'https:' + href : (href.startsWith('/') ? `https://www.startmycar.com${href}` : href);
        const pdfName = `manual_${pdfCount}.pdf`;
        console.log(`[+] Found PDF! Downloading ${pdfName}...`);
        downloadFile(pdfUrl, path.join(catalogDir, pdfName)).catch(e => console.log('[-] PDF fail:', e));
      }
    });

    // 3. Look for Images
    let imgCount = 0;
    $('.fusebox-image img, .fusebox-schema img').each((i, el) => {
      const imgSrc = $(el).attr('data-src') || $(el).attr('src');
      if (imgSrc) {
        let imgName = `box_${imgCount}.webp`;
        if (imgSrc.includes('thumbnails') || imgSrc.includes('color')) imgName = `box_${imgCount}_color.webp`;
        const finalUrl = imgSrc.startsWith('//') ? 'https:' + imgSrc : imgSrc;
        
        console.log(`[+] Downloading image: ${imgName}`);
        downloadFile(finalUrl, path.join(catalogDir, imgName)).catch(e => console.log('[-] Img fail:', e));
        imgCount++;
      }
    });

  } catch(e) {
    console.log(`[-] Scraping failed: ${e.message}`);
  }
}

async function run() {
  console.log("Starting Master Catalog Scraper (Fast Node.js Mode)...");
  
  // Test run
  await scrapeCar('alfa-romeo', 'giulietta', '2013');
  await scrapeCar('ford', 'f-150', '2021');

  console.log("\nDone! Check the public/catalog folder.");
}

run();
