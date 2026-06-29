const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://fuse-box.info';
const DATA_DIR = path.join(process.cwd(), 'public', 'fusebox_data');

// Utility to create directory if not exists
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Utility to sleep (delay between requests to avoid ban)
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Download an image
async function downloadImage(url, filepath) {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });
        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(filepath);
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (err) {
        console.error(`Failed to download image ${url}:`, err.message);
    }
}

// Crawl Homepage for Brands
async function getBrands() {
    console.log('Fetching homepage...');
    const res = await axios.get(BASE_URL);
    const $ = cheerio.load(res.data);
    
    const brands = [];
    $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.startsWith('https://fuse-box.info/') && href.split('/').length === 4) {
            const pathSegment = href.split('/').pop();
            if (pathSegment.length > 1) {
                const brandName = $(el).text().trim() || pathSegment;
                if (brandName && !brands.find(b => b.url === href) && brandName !== 'Home') {
                    brands.push({ name: brandName, url: href });
                }
            }
        }
    });
    
    return brands.filter(b => !b.url.includes('contact') && !b.url.includes('about') && !b.url.includes('policy') && b.name.length > 1);
}

// Crawl Brand Page for Models
async function getModels(brandUrl) {
    console.log(`Fetching models from ${brandUrl}...`);
    const res = await axios.get(brandUrl);
    const $ = cheerio.load(res.data);
    
    const models = [];
    // Model links are typically inside strong tags or inside su-column
    $('.su-column-inner a').each((i, el) => {
        const href = $(el).attr('href');
        let modelName = $(el).find('strong').text().trim() || $(el).text().trim();
        if (href && href.includes(brandUrl.replace(BASE_URL, ''))) {
             if (!modelName) {
                 modelName = href.split('/').pop().replace(/-/g, ' ');
             }
             if (!models.find(m => m.url === href)) {
                 models.push({ name: modelName.replace('...', '').replace('..', ''), url: href });
             }
        }
    });
    
    // Fallback
    if (models.length === 0) {
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.includes(brandUrl.replace(BASE_URL, '')) && href !== brandUrl && href.split('/').length > 4) {
                const modelName = $(el).text().trim();
                if (modelName && !models.find(m => m.url === href)) {
                    models.push({ name: modelName, url: href });
                }
            }
        });
    }
    
    return models;
}

// Crawl Model Page for Data and Images
async function parseModelPage(modelUrl, brandName, modelName) {
    console.log(`Processing model: ${modelName} -> ${modelUrl}`);
    const res = await axios.get(modelUrl);
    const $ = cheerio.load(res.data);
    
    const brandDir = path.join(DATA_DIR, brandName.replace(/[^a-zA-Z0-9-]/g, '_'));
    const modelDir = path.join(brandDir, modelName.replace(/[^a-zA-Z0-9-]/g, '_'));
    ensureDir(modelDir);
    
    const data = {
        brand: brandName,
        model: modelName,
        url: modelUrl,
        fuseBoxes: [],
        tables: []
    };
    
    // Extract images (fuse box diagrams)
    let imgCounter = 1;
    $('.entry-content img').each((i, el) => {
        const src = $(el).attr('src');
        if (src && src.includes('wp-content/uploads') && !src.includes('Ads')) {
            const imgName = `diagram_${imgCounter}.jpg`;
            data.fuseBoxes.push({
                imageName: imgName,
                originalUrl: src
            });
            imgCounter++;
        }
    });
    
    // Extract tables (fuse assignments)
    $('.entry-content table').each((i, el) => {
        const tableData = [];
        const headers = [];
        $(el).find('th').each((j, th) => {
            headers.push($(th).text().trim());
        });
        
        $(el).find('tr').each((j, tr) => {
            if ($(tr).find('th').length > 0) return; // skip header row
            const rowData = {};
            $(tr).find('td').each((k, td) => {
                const header = headers[k] || `Col_${k}`;
                rowData[header] = $(td).text().trim();
            });
            tableData.push(rowData);
        });
        
        if (tableData.length > 0) {
            data.tables.push(tableData);
        }
    });
    
    // Save JSON data
    fs.writeFileSync(path.join(modelDir, 'data.json'), JSON.stringify(data, null, 2));
    
    // Download images
    for (const fb of data.fuseBoxes) {
        console.log(`  Downloading image ${fb.imageName}...`);
        await downloadImage(fb.originalUrl, path.join(modelDir, fb.imageName));
        await sleep(500); // 0.5s delay between images
    }
    
    console.log(`  Saved ${data.tables.length} tables and ${data.fuseBoxes.length} images for ${modelName}`);
}

async function start() {
    const isTestMode = process.argv.includes('--test');
    console.log(`Starting Crawler in ${isTestMode ? 'TEST' : 'FULL'} mode...`);
    
    ensureDir(DATA_DIR);
    
    const brands = await getBrands();
    console.log(`Found ${brands.length} brands.`);
    
    for (let i = 0; i < (isTestMode ? 1 : brands.length); i++) {
        const brand = brands[i];
        try {
            const models = await getModels(brand.url);
            console.log(`Found ${models.length} models for ${brand.name}.`);
            
            for (let j = 0; j < (isTestMode ? 2 : models.length); j++) {
                const model = models[j];
                try {
                    await parseModelPage(model.url, brand.name, model.name);
                    await sleep(2000); // 2 second delay between models
                } catch (err) {
                    console.error(`Error processing model ${model.name}:`, err.message);
                }
            }
        } catch (err) {
            console.error(`Error processing brand ${brand.name}:`, err.message);
        }
    }
    
    console.log('Crawling finished successfully!');
}

start();
