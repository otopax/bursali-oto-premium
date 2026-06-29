const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const https = require('https');

const BASE_URL = 'https://fuse-box.info';
const CATALOG_DIR = path.join(process.cwd(), 'public', 'catalog');
const STATE_FILE = path.join(CATALOG_DIR, '_fusebox_crawler_state.json');

// We use the brands we found from the homepage analysis
const BRANDS = ['opel'];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.text();
    } catch (e) {
      console.log(`[!] Attempt ${i+1} failed for ${url}: ${e.message}`);
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
           const redirectUrl = response.headers.location.startsWith('//') ? 'https:' + response.headers.location : (response.headers.location.startsWith('/') ? BASE_URL + response.headers.location : response.headers.location);
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

async function run() {
  console.log("=========================================");
  console.log("   FUSE-BOX.INFO CRAWLER INITIATED       ");
  console.log("=========================================");

  if (!fs.existsSync(CATALOG_DIR)) fs.mkdirSync(CATALOG_DIR, { recursive: true });

  let state = { queue: [], completed: [] };
  if (fs.existsSync(STATE_FILE)) {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    console.log(`[INFO] Resuming. Queue: ${state.queue.length}, Completed: ${state.completed.length}`);
  }

  // Populate initial queue with brands
  if (state.queue.length === 0 && state.completed.length === 0) {
    console.log("[INFO] Building initial queue from brands...");
    for (const brand of BRANDS) {
      console.log(`  -> Finding models for ${brand}...`);
      const html = await fetchWithRetry(`${BASE_URL}/${brand}`);
      if (html) {
        const $ = cheerio.load(html);
        $('a').each((i, el) => {
          const href = $(el).attr('href');
          const txt = $(el).text().trim();
          if (href && href.includes(`fuse-box.info/${brand}/`) && txt.length > 2) {
            const parts = href.split('/');
            const modelSlug = parts[parts.length - 1] || parts[parts.length - 2];
            // Exclude non-model links
            if (modelSlug && !modelSlug.includes('category') && modelSlug !== brand) {
              const task = { type: 'download', brand, modelSlug, url: href };
              if (!state.queue.find(t => t.url === href)) state.queue.push(task);
            }
          }
        });
      }
      fs.writeFileSync(STATE_FILE, JSON.stringify(state));
      await delay(1000);
    }
  }

  // Process queue
  while (state.queue.length > 0) {
    const task = state.queue.shift();

    if (task.type === 'download') {
      if (state.completed.includes(task.url)) continue;

      console.log(`\n[DOWNLOAD] Fetching ${task.brand} -> ${task.modelSlug}`);
      const dir = path.join(CATALOG_DIR, task.brand, task.modelSlug);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const html = await fetchWithRetry(task.url);
      if (html) {
        const $ = cheerio.load(html);
        
        // 1. Extract Images (excluding header/footer/logos)
        let imgCount = 0;
        $('.entry-content img').each((i, el) => {
          const src = $(el).attr('src') || $(el).attr('data-src');
          if (src && !src.includes('logo') && !src.includes('icon')) {
            const finalSrc = src.startsWith('//') ? 'https:' + src : (src.startsWith('/') ? BASE_URL + src : src);
            const ext = path.extname(new URL(finalSrc).pathname) || '.jpg';
            const name = `diagram_${imgCount + 1}${ext}`;
            downloadFile(finalSrc, path.join(dir, name)).catch(()=>{});
            imgCount++;
          }
        });
        console.log(`  -> Found ${imgCount} images.`);

        // 2. Extract Tables as HTML
        const tablesHtml = [];
        $('.entry-content table').each((i, el) => {
           // get outer html of the table
           tablesHtml.push($.html(el));
        });
        if (tablesHtml.length > 0) {
           fs.writeFileSync(path.join(dir, 'tables.html'), tablesHtml.join('\n<br>\n'));
           console.log(`  -> Saved ${tablesHtml.length} tables to tables.html`);
        } else {
           // sometimes they use divs instead of tables, so let's save the whole text content just in case
           const content = $('.entry-content').text().trim();
           fs.writeFileSync(path.join(dir, 'content.txt'), content);
           console.log(`  -> No tables found, saved content.txt`);
        }
      }

      state.completed.push(task.url);
      fs.writeFileSync(STATE_FILE, JSON.stringify(state));
      await delay(1500); // polite delay
    }
  }

  console.log("\n[SUCCESS] fuse-box.info crawler finished!");
}

run();
