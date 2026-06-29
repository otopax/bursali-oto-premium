const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.startmycar.com';
const DATA_DIR = path.join(process.cwd(), 'public', 'startmycar_manuals');
const TARGET_BRANDS = ['bmw', 'mercedes-benz', 'land-rover', 'volkswagen', 'audi', 'opel', 'renault'];

// Utility to create directory if not exists
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Utility to sleep
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Download a PDF
async function downloadPdf(url, filepath) {
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
        console.error(`Failed to download PDF ${url}:`, err.message);
    }
}

async function getModels(brandSlug) {
    console.log(`Fetching models for ${brandSlug}...`);
    try {
        const url = `${BASE_URL}/${brandSlug}/pickmodel`;
        const res = await axios.get(url);
        const $ = cheerio.load(res.data);
        
        const models = [];
        // The models on startmycar /pickmodel page are usually in div > a tags inside ColumnsMax5
        $('.ColumnsMax5 a').each((i, el) => {
            const href = $(el).attr('href'); // e.g. /ford/focus
            const modelName = $(el).text().trim();
            if (href && href.startsWith(`/${brandSlug}/`)) {
                const modelSlug = href.split('/').pop();
                if (modelSlug && !models.find(m => m.slug === modelSlug)) {
                    models.push({ name: modelName, slug: modelSlug });
                }
            }
        });
        
        // Also check popular models if any
        $('.FlexCentered--space-around a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.startsWith(`/${brandSlug}/`)) {
                const modelSlug = href.split('/').pop();
                const modelName = $(el).text().trim();
                if (modelSlug && !models.find(m => m.slug === modelSlug)) {
                    models.push({ name: modelName, slug: modelSlug });
                }
            }
        });
        
        return models;
    } catch (err) {
        console.error(`Failed to fetch models for ${brandSlug}:`, err.message);
        return [];
    }
}

async function parseModelManuals(brandSlug, modelSlug) {
    console.log(`Checking manuals for ${brandSlug} ${modelSlug}...`);
    const url = `${BASE_URL}/${brandSlug}/${modelSlug}/info/manuals/service-repair`;
    try {
        const res = await axios.get(url);
        const $ = cheerio.load(res.data);
        
        const brandDir = path.join(DATA_DIR, brandSlug);
        const modelDir = path.join(brandDir, modelSlug);
        
        const manuals = [];
        
        $('.js-manual').each((i, el) => {
            const pdfUrl = $(el).attr('href');
            if (pdfUrl && pdfUrl.endsWith('.pdf')) {
                // Find nearest Subtitle for title
                const title = $(el).closest('.manuals-box').find('.Subtitle').text().trim() || `Manual_${i + 1}`;
                const originalFilename = pdfUrl.split('/').pop();
                manuals.push({
                    title,
                    url: pdfUrl,
                    filename: originalFilename
                });
            }
        });
        
        if (manuals.length > 0) {
            console.log(`  Found ${manuals.length} manuals for ${modelSlug}.`);
            ensureDir(modelDir);
            
            // Save metadata
            const dataPath = path.join(modelDir, 'data.json');
            let existingData = { manuals: [] };
            if (fs.existsSync(dataPath)) {
                existingData = JSON.parse(fs.readFileSync(dataPath));
            }
            
            for (const manual of manuals) {
                if (!existingData.manuals.find(m => m.filename === manual.filename)) {
                    existingData.manuals.push(manual);
                }
                const pdfPath = path.join(modelDir, manual.filename);
                if (!fs.existsSync(pdfPath)) {
                    console.log(`  Downloading ${manual.filename}...`);
                    await downloadPdf(manual.url, pdfPath);
                    await sleep(1000); // Wait 1s between downloads
                } else {
                    console.log(`  Already downloaded ${manual.filename}. Skipping.`);
                }
            }
            
            fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2));
        } else {
            console.log(`  No service manuals found for ${modelSlug}.`);
        }
    } catch (err) {
        if (err.response && err.response.status === 404) {
            console.log(`  No service manuals page (404) for ${modelSlug}.`);
        } else {
            console.error(`  Error fetching manuals for ${modelSlug}:`, err.message);
        }
    }
}

async function start() {
    const isTestMode = process.argv.includes('--test');
    console.log(`Starting PDF Downloader in ${isTestMode ? 'TEST' : 'FULL'} mode...`);
    
    ensureDir(DATA_DIR);
    
    for (let i = 0; i < (isTestMode ? 1 : TARGET_BRANDS.length); i++) {
        const brandSlug = TARGET_BRANDS[i];
        try {
            const models = await getModels(brandSlug);
            console.log(`Found ${models.length} models for ${brandSlug}.`);
            
            for (let j = 0; j < (isTestMode ? 2 : models.length); j++) {
                const model = models[j];
                await parseModelManuals(brandSlug, model.slug);
                await sleep(2000); // 2 second delay between models
            }
        } catch (err) {
            console.error(`Error processing brand ${brandSlug}:`, err.message);
        }
    }
    
    console.log('PDF Downloading finished successfully!');
}

start();
