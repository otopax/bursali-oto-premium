const fs = require('fs');
const path = require('path');

const DTC_DIR = path.join(process.cwd(), 'public', 'ariza_kodlari_data');

async function main() {
    console.log("Analyzing DTC JSON files for Knowledge Graph mapping evidence...");
    
    if (!fs.existsSync(DTC_DIR)) {
        console.error(`Directory not found: ${DTC_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(DTC_DIR).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} DTC files.\n`);

    let total = 0;
    let vehicleAddressable = 0;
    let engineAddressable = 0;
    let engineCodeAddressable = 0;
    let variantAddressable = 0;
    let generic = 0;
    let unknown = 0;

    let p0171Evidence = null;
    let p0300Evidence = null;

    for (const file of files) {
        const filePath = path.join(DTC_DIR, file);
        let data;
        try {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch(e) {
            console.error(`Error parsing ${file}`);
            unknown++;
            continue;
        }

        total++;

        // Analyze evidence fields
        const hasBrand = data.brand || (data.brands && data.brands.length > 0);
        const hasModels = data.models && data.models.length > 0;
        const hasEngineCode = data.engineCode || data.engineCodes || (data.models && data.models.some(m => String(m).match(/\b[A-Z0-9]{3,5}\b/))); // Loose heuristic for codes in model strings
        const hasVariant = data.variant || (data.models && data.models.some(m => String(m).match(/1\.6 TDI|2\.0 TFSI/i)));
        
        let classification = "Generic";
        
        // Exact field check
        if (data.engineVariantId || data.variant) {
            classification = "EngineVariant-addressable";
            variantAddressable++;
        } else if (data.engineCode || data.engineCodes) {
            classification = "EngineCode-addressable";
            engineCodeAddressable++;
        } else if (data.engine || hasVariant) {
            classification = "Engine-addressable";
            engineAddressable++;
        } else if (hasModels) {
            classification = "Vehicle-addressable";
            vehicleAddressable++;
        } else if (hasBrand) {
            // It has a brand but no specific models -> Generic for a brand, still generic in terms of our vehicle graph
            classification = "Generic (Brand Level)";
            generic++;
        } else {
            classification = "Generic";
            generic++;
        }

        const codeStr = String(data.code || file.replace('.json', '')).toUpperCase();
        
        if (codeStr === 'P0171') {
            p0171Evidence = {
                file: file,
                keys: Object.keys(data),
                brand: data.brand,
                models: data.models,
                engineCode: data.engineCode || 'null',
                classification: classification
            };
        }
        
        if (codeStr === 'P0300') {
            p0300Evidence = {
                file: file,
                keys: Object.keys(data),
                brand: data.brand,
                models: data.models,
                engineCode: data.engineCode || 'null',
                classification: classification
            };
        }
    }

    console.log(`SONUÇ TABLOSU:`);
    console.log(`DTC total: ${total}`);
    console.log(`Vehicle-addressable: ${vehicleAddressable}`);
    console.log(`Engine-addressable: ${engineAddressable}`);
    console.log(`EngineCode-addressable: ${engineCodeAddressable}`);
    console.log(`EngineVariant-addressable: ${variantAddressable}`);
    console.log(`Generic: ${generic}`);
    console.log(`Unknown: ${unknown}\n`);

    console.log(`P0171:`);
    console.log(`Evidence: ${JSON.stringify(p0171Evidence, null, 2)}`);
    let p0171Map = "None";
    let p0171Conf = "0%";
    if (p0171Evidence) {
        if (p0171Evidence.classification === "Engine-addressable") { p0171Map = "Partial (Text matching)"; p0171Conf = "30%"; }
        else if (p0171Evidence.classification === "Generic (Brand Level)") { p0171Map = "Brand Only"; p0171Conf = "10%"; }
        else if (p0171Evidence.classification === "Vehicle-addressable") { p0171Map = "Vehicle level"; p0171Conf = "20%"; }
    }
    console.log(`Possible mapping: ${p0171Map}`);
    console.log(`Confidence: ${p0171Conf}\n`);

    console.log(`P0300:`);
    console.log(`Evidence: ${JSON.stringify(p0300Evidence, null, 2)}`);
    let p0300Map = "None";
    let p0300Conf = "0%";
    if (p0300Evidence) {
        if (p0300Evidence.classification === "Engine-addressable") { p0300Map = "Partial (Text matching)"; p0300Conf = "30%"; }
        else if (p0300Evidence.classification === "Generic (Brand Level)") { p0300Map = "Brand Only"; p0300Conf = "10%"; }
        else if (p0300Evidence.classification === "Vehicle-addressable") { p0300Map = "Vehicle level"; p0300Conf = "20%"; }
    }
    console.log(`Possible mapping: ${p0300Map}`);
    console.log(`Confidence: ${p0300Conf}\n`);

}

main();
