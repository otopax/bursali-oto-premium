const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'public', 'ariza_kodlari');

let totalFiles = 0;
let brands = new Set();
let models = new Set();
let totalFuses = 0;
let totalRelays = 0;
let totalFaultCodes = 0; // If they scraped fault codes

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else if (file === 'data.json') {
            totalFiles++;
            try {
                const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                if (content.make) brands.add(content.make);
                if (content.model) models.add(content.model);
                
                // If it contains fuse data
                if (content.fuses && Array.isArray(content.fuses)) {
                    totalFuses += content.fuses.length;
                }
                // Also check if data is nested
                if (content.data && Array.isArray(content.data)) {
                     totalFaultCodes += content.data.length;
                }
                
                if (content.tables && Array.isArray(content.tables)) {
                    for(const table of content.tables) {
                        if(table.rows) {
                           totalFuses += table.rows.length;
                        }
                    }
                }

                // Any other schema elements
                
            } catch(e) {
               // ignore
            }
        }
    }
}

scanDir(dataDir);

console.log(JSON.stringify({
    totalFiles,
    brands: Array.from(brands),
    totalModels: models.size,
    sampleModels: Array.from(models).slice(0, 5),
    totalFuses,
    totalFaultCodes
}, null, 2));
