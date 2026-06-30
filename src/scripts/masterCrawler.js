const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const https = require('https');

const KNOWN_BRANDS = [
  'alfa-romeo', 'audi', 'bmw', 'chevrolet', 'chrysler', 'citroen', 'dacia', 'dodge', 
  'fiat', 'ford', 'honda', 'hyundai', 'jeep', 'kia', 'land-rover', 'mazda', 'mercedes-benz', 
  'mini', 'mitsubishi', 'nissan', 'opel', 'peugeot', 'porsche', 'renault', 'seat', 
  'skoda', 'subaru', 'suzuki', 'toyota', 'volkswagen', 'volvo'
];

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
      console.log(`[!] Attempt ${i+1} failed for ${url}`);
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
           return downloadFile(response.headers.location.startsWith('//') ? 'https:' + response.headers.location : response.headers.location, dest).then(resolve).catch(reject);
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

const CATALOG_DIR = path.join(process.cwd(), 'public', 'catalog');
const INDEX_FILE = path.join(CATALOG_DIR, '_crawler_state.json');

async function run() {
  console.log("=========================================");
  console.log("   MASTER CATALOG CRAWLER INITIATED      ");
  console.log("=========================================");

  if (!fs.existsSync(CATALOG_DIR)) fs.mkdirSync(CATALOG_DIR, { recursive: true });

  let state = { queue: [], completed: [] };
  if (fs.existsSync(INDEX_FILE)) {
    state = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
    console.log(`[INFO] Resuming from saved state. ${state.queue.length} items in queue.`);
  }

  if (state.queue.length === 0 && state.completed.length === 0) {
    console.log("[INFO] Building initial queue from exhaustive brand list...");
    const allBrands = [
      'acura', 'alfa-romeo', 'aston-martin', 'audi', 'bentley', 'bmw', 'buick', 'byd', 'cadillac', 
      'chery', 'chevrolet', 'chrysler', 'citroen', 'dacia', 'daewoo', 'daihatsu', 'dodge', 'ferrari', 
      'fiat', 'fisker', 'ford', 'genesis', 'gmc', 'honda', 'hummer', 'hyundai', 'infiniti', 'isuzu', 
      'iveco', 'jaguar', 'jeep', 'kia', 'lada', 'lamborghini', 'lancia', 'land-rover', 'lexus', 
      'lincoln', 'lotus', 'mahindra', 'maserati', 'maybach', 'mazda', 'mclaren', 'mercedes-benz', 
      'mercury', 'mg', 'mini', 'mitsubishi', 'nissan', 'oldsmobile', 'opel', 'peugeot', 'plymouth', 
      'polestar', 'pontiac', 'porsche', 'ram', 'renault', 'rolls-royce', 'rover', 'saab', 'saturn', 
      'scion', 'seat', 'skoda', 'smart', 'ssangyong', 'subaru', 'suzuki', 'tata', 'tesla', 'toyota', 
      'vauxhall', 'volkswagen', 'volvo'
    ];
    console.log(`[INFO] Found ${allBrands.length} brands! Building queue...`);
    for (const brand of allBrands) {
      console.log(`  -> Discovering models for ${brand}...`);
      const html = await fetchWithRetry(`https://www.startmycar.com/${brand}`);
      if (html) {
        const $ = cheerio.load(html);
        $('a').each((i, el) => {
          const href = $(el).attr('href');
          if (href && href.startsWith(`/${brand}/`) && !href.includes('/info/')) {
            const parts = href.split('/');
            if (parts.length === 3) { // e.g. /alfa-romeo/giulietta
              const model = parts[2];
              if (model && model.length > 1) {
                const task = { type: 'model', brand, model };
                if (!state.queue.find(t => t.model === model && t.brand === brand)) {
                  state.queue.push(task);
                }
              }
            }
          }
        });
      }
      fs.writeFileSync(INDEX_FILE, JSON.stringify(state));
      await delay(500);
    }
  }

  while (state.queue.length > 0) {
    const task = state.queue.shift();

    if (task.type === 'model') {
      console.log(`\n[DISCOVER] Finding years for ${task.brand} ${task.model}...`);
      const html = await fetchWithRetry(`https://www.startmycar.com/${task.brand}/${task.model}/info/fusebox`);
      if (html) {
        const $ = cheerio.load(html);
        let foundYears = false;
        $('a').each((i, el) => {
          const href = $(el).attr('href');
          if (href && href.includes(`/${task.brand}/${task.model}/info/fusebox/`)) {
            const parts = href.split('/');
            if (parts.length === 6) {
              const year = parts[5];
              if (/^\d{4}$/.test(year)) {
                state.queue.unshift({ type: 'download', brand: task.brand, model: task.model, year });
                foundYears = true;
              }
            }
          }
        });
        
        if (!foundYears) {
           state.queue.unshift({ type: 'download', brand: task.brand, model: task.model, year: 'all' });
        }
      }
    } 
    else if (task.type === 'download') {
      const taskStr = `${task.brand}_${task.model}_${task.year}`;
      if (state.completed.includes(taskStr)) continue;

      console.log(`\n[DOWNLOAD] Fetching ${task.brand} ${task.model} ${task.year}...`);
      let url = `https://www.startmycar.com/${task.brand}/${task.model}/info/fusebox/${task.year}`;
      if (task.year === 'all') url = `https://www.startmycar.com/${task.brand}/${task.model}/info/fusebox`;

      const dir = path.join(CATALOG_DIR, task.brand, task.model, task.year);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const html = await fetchWithRetry(url);
      if (html) {
        const $ = cheerio.load(html);
        let nativeData = null;
        $('script').each((i, el) => {
          const content = $(el).html();
          if (content && content.includes('fuseboxesData')) {
            const match = content.match(/fuseboxesData\s*=\s*(\[.*?\]);/s) || content.match(/var\s+fuseboxesData\s*=\s*(\[.*?\}\]);/s);
            if (match) {
              try { nativeData = JSON.parse(match[1]); } catch(e){}
            }
          }
        });

        if (nativeData) {
          fs.writeFileSync(path.join(dir, 'fuseboxes.json'), JSON.stringify(nativeData, null, 2));
          console.log(`  -> Saved JSON (${nativeData.length} boxes)`);
        }

        $('a').each((i, el) => {
          const href = $(el).attr('href');
          if (href && href.toLowerCase().endsWith('.pdf')) {
            const pdfUrl = href.startsWith('//') ? 'https:' + href : (href.startsWith('/') ? `https://www.startmycar.com${href}` : href);
            downloadFile(pdfUrl, path.join(dir, `manual_${i}.pdf`)).catch(()=>{});
            console.log(`  -> Found PDF`);
          }
        });

        let iCount = 0;
        $('.fusebox-image img, .fusebox-schema img').each((i, el) => {
          const src = $(el).attr('data-src') || $(el).attr('src');
          if (src) {
            const finalSrc = src.startsWith('//') ? 'https:' + src : src;
            const name = src.includes('thumbnails') || src.includes('color') ? `box_${iCount}_color.webp` : `box_${iCount}.webp`;
            downloadFile(finalSrc, path.join(dir, name)).catch(()=>{});
            iCount++;
          }
        });
      }
      state.completed.push(taskStr);
    }

    fs.writeFileSync(INDEX_FILE, JSON.stringify(state));
    await delay(1000); 
  }

  console.log("\n[SUCCESS] Master Crawler has finished all tasks in queue!");
}

run();
