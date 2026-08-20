const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function slugify(text) {
    if (!text) return 'diger';
    const trMap = {
      'çÇ':'c', 'ğĞ':'g', 'şŞ':'s', 'üÜ':'u', 'ıİ':'i', 'öÖ':'o'
    };
    for(let key in trMap) {
      text = text.replace(new RegExp('['+key+']','g'), trMap[key]);
    }
    const res = text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
      
    return res || 'diger'; // Fallback if slug becomes empty
}

async function main() {
    console.log("=== FINAL PRE-INTEGRATION BLOCKER CHECK ===\n");
    
    // --- 1. GATE 12A: BMW/DIGER COLLISION ---
    console.log("-> GATE 12A: BMW/DIGER COLLISION INVESTIGATION");
    const mBmw = await prisma.manufacturer.findFirst({ where: { name: 'BMW' }, include: { vehicles: true } });
    if (!mBmw) {
        console.log("BMW not found");
    } else {
        const digerVehicles = mBmw.vehicles.filter(v => slugify(v.model) === 'diger');
        console.log(`Found ${digerVehicles.length} vehicles under BMW that slugify to 'diger'`);
        
        for (const v of digerVehicles) {
            console.log(`\nVehicle ID: ${v.id}, Model: "${v.model}"`);
            const engines = await prisma.engine.findMany({ where: { vehicleId: v.id }, include: { variants: true } });
            
            // Get source records for these variants
            let sourceCount = 0;
            for (const eng of engines) {
                for (const varRecord of eng.variants) {
                    const sources = await prisma.sourceImportRecord.findMany({ where: { engineVariantId: varRecord.id } });
                    sourceCount += sources.length;
                    for (const s of sources) {
                        const raw = s.rawRecord;
                        console.log(`- Source ID: ${s.id} | model: "${raw.model}" | engine: "${raw.engine}" | engineCode: "${raw.engineCode}"`);
                    }
                }
            }
            console.log(`Total source records for this Vehicle entity: ${sourceCount}`);
        }
        
        const isDifferentEntities = digerVehicles.length > 1;
        console.log(`\nResult: Are different Vehicle entities mapping to the same public slug? ${isDifferentEntities ? 'YES' : 'NO'}`);
    }

    // --- 2. GATE 12B: INDEXABLE URL CARDINALITY ---
    console.log("\n-> GATE 12B: INDEXABLE URL CARDINALITY");
    const allManufacturers = await prisma.manufacturer.findMany({ include: { vehicles: true } });
    
    let validSitemapRoutes = 0;
    let validVehicleCount = 0;
    let unindexableVehicleCount = 0;
    
    for (const m of allManufacturers) {
        const mSlug = slugify(m.name);
        
        // Manufacturer must have a valid non-fallback slug
        if (mSlug === 'diger') continue;
        
        const uniqueModelSlugs = new Set();
        
        for (const v of m.vehicles) {
            const vSlug = slugify(v.model);
            
            if (vSlug === 'diger') {
                unindexableVehicleCount++;
                continue; // Skip garbage slugs from sitemap
            }
            
            // Only count unique slugs to prevent duplicates in sitemap
            if (!uniqueModelSlugs.has(vSlug)) {
                uniqueModelSlugs.add(vSlug);
                validVehicleCount++;
            }
        }
    }
    
    // Each valid vehicle generates 5 localized URLs for /kutuphane/[marka]/[model]
    validSitemapRoutes = validVehicleCount * 5;
    
    console.log(`Total Graph Vehicles: ${allManufacturers.reduce((acc, m) => acc + m.vehicles.length, 0)}`);
    console.log(`Valid, non-diger, unique sitemap-eligible Vehicles: ${validVehicleCount}`);
    console.log(`Unindexable (diger/garbage) Vehicles: ${unindexableVehicleCount}`);
    console.log(`Actual new sitemap URLs to add: ${validSitemapRoutes}`);
    
    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
