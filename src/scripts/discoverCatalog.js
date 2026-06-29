const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.startmycar.com';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Fetching: ${url}`);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (res.status === 404) return null; // Model doesn't have fuseboxes
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.text();
    } catch (e) {
      console.log(`Attempt ${i+1} failed for ${url}: ${e.message}`);
      await delay(2000);
    }
  }
  return null;
}

async function run() {
  const catalog = { brands: [] };
  
  // 1. Fetch all brands
  const html = await fetchWithRetry(`${BASE_URL}/fusebox`);
  if (!html) return console.log("Failed to load main fusebox page");
  
  const $ = cheerio.load(html);
  
  const brandLinks = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.endsWith('/info/fusebox')) {
      const parts = href.split('/');
      if (parts.length === 4 && parts[1] && parts[1] !== 'info') {
        const brand = parts[1];
        if (!brandLinks.includes(brand)) {
          brandLinks.push(brand);
        }
      }
    }
  });

  console.log(`Found ${brandLinks.length} brands:`, brandLinks);

  // For testing, let's just do the first 2 brands to prove the concept works.
  // The user can run this later without slice to get all 10,000+ cars.
  const testBrands = brandLinks.slice(0, 2);

  for (const brand of testBrands) {
    const brandData = { name: brand, models: [] };
    
    // 2. Fetch models for this brand
    const brandHtml = await fetchWithRetry(`${BASE_URL}/${brand}/info/fusebox`);
    if (brandHtml) {
      const $brand = cheerio.load(brandHtml);
      const modelLinks = [];
      $brand('a').each((i, el) => {
        const href = $brand(el).attr('href');
        if (href && href.endsWith('/info/fusebox') && href.includes(`/${brand}/`)) {
          const parts = href.split('/');
          if (parts.length === 5) {
            const model = parts[2];
            if (!modelLinks.includes(model)) {
              modelLinks.push(model);
            }
          }
        }
      });
      
      console.log(`Found ${modelLinks.length} models for ${brand}`);
      
      for (const model of modelLinks) {
        const modelData = { name: model, years: [] };
        // 3. Fetch years for this model
        const modelHtml = await fetchWithRetry(`${BASE_URL}/${brand}/${model}/info/fusebox`);
        if (modelHtml) {
          const $model = cheerio.load(modelHtml);
          const yearLinks = [];
          $model('a').each((i, el) => {
            const href = $model(el).attr('href');
            if (href && href.includes(`/${brand}/${model}/info/fusebox/`)) {
              const parts = href.split('/');
              if (parts.length === 6) {
                const year = parts[5];
                if (/^\d{4}$/.test(year) && !yearLinks.includes(year)) {
                  yearLinks.push(year);
                }
              }
            }
          });
          console.log(`  -> ${model}: found ${yearLinks.length} years`);
          modelData.years = yearLinks;
        }
        brandData.models.push(modelData);
        await delay(1000); // Rate limiting
      }
    }
    catalog.brands.push(brandData);
  }

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  
  const outPath = path.join(publicDir, 'catalog_index.json');
  fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2));
  console.log(`\nCatalog saved to ${outPath}`);
}

run();
