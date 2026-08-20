const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const dataPath = path.join('c:', 'Users', 'xbors', 'OneDrive', 'Desktop', 'Bursali_Oto_Dijital_Yonetim', 'Data_Scraper', 'webdatabays_data.json');

async function main() {
    console.log("Reading raw JSON data...");
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const sourceRecords = [];

    for (const [brand, models] of Object.entries(rawData)) {
        for (const [modelKey, engines] of Object.entries(models)) {
            if (!Array.isArray(engines)) continue;
            
            let yearFrom = null;
            let yearTo = null;
            let modelName = modelKey;
            
            // Extract years e.g. "500  2008 - 2022" or "U5  2021 - ..."
            const yearMatch = modelKey.match(/(\d{4})\s*-\s*(\d{4}|\.\.\.)?/);
            if (yearMatch) {
                yearFrom = parseInt(yearMatch[1], 10);
                if (yearMatch[2] && yearMatch[2] !== '...') {
                    yearTo = parseInt(yearMatch[2], 10);
                }
                modelName = modelKey.substring(0, yearMatch.index).trim();
            }

            for (const engine of engines) {
                const parts = engine.split('| Kod:');
                let engineNameRaw = engine;
                let engineCode = "UNKNOWN";
                
                if (parts.length > 1) {
                    engineNameRaw = parts[0].trim();
                    engineCode = parts[1].trim();
                }

                sourceRecords.push({
                    source: "WebDataBays",
                    brand: brand,
                    model: modelName,
                    yearFrom: yearFrom,
                    yearTo: yearTo,
                    engineNameRaw: engineNameRaw,
                    engineCode: engineCode,
                    rawRecord: { brand, modelKey, engine } // 1:1 original data
                });
            }
        }
    }

    console.log(`\nPrepared ${sourceRecords.length} source records for insertion.`);
    console.log("Inserting records into database...");

    // Insert into DB using createMany
    const result = await prisma.sourceImportRecord.createMany({
        data: sourceRecords
    });

    console.log(`\n========================================`);
    console.log(`EXPECTED SOURCE RECORDS = 7949`);
    console.log(`ACTUAL SOURCE RECORDS   = ${result.count}`);
    console.log(`========================================\n`);

    if (result.count === 7949) {
        console.log("✅ 1:1 PRESERVATION TEST PASSED!");
    } else {
        console.error("❌ 1:1 PRESERVATION TEST FAILED!");
    }
}

main()
  .catch(e => {
    console.error("Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
