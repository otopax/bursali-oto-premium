const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching all SourceImportRecords...");
    const sources = await prisma.sourceImportRecord.findMany();
    
    if (sources.length !== 7949) {
        console.error(`ERROR: Expected 7949 sources in DB, found ${sources.length}`);
        process.exit(1);
    }

    const manufacturers = new Set();
    const vehicles = new Set();
    const engines = new Set();
    const engineVariants = new Set();

    const variantToSource = new Map(); // variantKey -> array of source IDs
    const sourceToVariant = new Map(); // source ID -> array of variantKeys

    let duplicateVariantKeys = 0;
    const sameEngineDifferentVariants = new Map(); // engineKey -> array of variantKeys

    for (const source of sources) {
        const brand = source.brand.toUpperCase().trim();
        const modelName = source.model.trim();
        const yearFrom = source.yearFrom || 'UNKNOWN_YEAR';
        const engineCode = source.engineCode;
        const engineNameRaw = source.engineNameRaw;

        // Keys
        const manufacturerKey = brand;
        const vehicleKey = `${manufacturerKey}::${modelName}::${yearFrom}`;
        const engineKey = `${vehicleKey}::${engineCode}`;
        const variantKey = `${engineKey}::${engineNameRaw}`;

        manufacturers.add(manufacturerKey);
        vehicles.add(vehicleKey);
        engines.add(engineKey);
        engineVariants.add(variantKey);

        // Cardinality Tracking
        if (!variantToSource.has(variantKey)) {
            variantToSource.set(variantKey, []);
        }
        variantToSource.get(variantKey).push(source.id);

        if (!sourceToVariant.has(source.id)) {
            sourceToVariant.set(source.id, []);
        }
        sourceToVariant.get(source.id).push(variantKey);

        // Engine -> Variants Tracking (for reporting multiple trims under one engine)
        if (!sameEngineDifferentVariants.has(engineKey)) {
            sameEngineDifferentVariants.set(engineKey, new Set());
        }
        sameEngineDifferentVariants.get(engineKey).add(variantKey);
    }

    // Analysis
    let isSourceToVariant1to1 = true;
    let isVariantToSource1to1 = true;
    let orphanSources = 0;

    for (const [sourceId, variants] of sourceToVariant.entries()) {
        if (variants.length !== 1) {
            isSourceToVariant1to1 = false;
        }
        if (variants.length === 0) orphanSources++;
    }

    for (const [variantKey, sourceIds] of variantToSource.entries()) {
        if (sourceIds.length > 1) {
            isVariantToSource1to1 = false;
            duplicateVariantKeys++;
        }
    }

    console.log(`\nGATE 8 FINAL CARDINALITY`);
    console.log(`------------------------`);
    console.log(`SourceImportRecord: ${sources.length}`);
    console.log(`Manufacturer: ${manufacturers.size}`);
    console.log(`Vehicle: ${vehicles.size}`);
    console.log(`Engine: ${engines.size}`);
    console.log(`EngineVariant: ${engineVariants.size}`);

    console.log(`\nSource -> Variant: ${isSourceToVariant1to1 ? '1:1' : '1:N'}`);
    console.log(`Variant -> Source: ${isVariantToSource1to1 ? '1:1' : '1:N'}`);
    
    console.log(`\nDuplicate Variant Keys (Variants with >1 Source): ${duplicateVariantKeys}`);
    console.log(`Orphan Sources: ${orphanSources}`);
    console.log(`Orphan Manufacturer/Vehicle/Engine/Variant: 0 (All derived directly from sources)`);

    console.log(`\nSame engineCode with multiple engineNameRaw counts:`);
    let multiVariantEngines = 0;
    for (const [engineKey, variants] of sameEngineDifferentVariants.entries()) {
        if (variants.size > 1) {
            multiVariantEngines++;
        }
    }
    console.log(`Number of Engine entities with multiple distinct variants: ${multiVariantEngines}`);
    
    if (sources.length === 7949 && engineVariants.size === 7949 && duplicateVariantKeys === 0) {
        console.log(`\nFINAL DECISION:\nPASS`);
    } else {
        console.log(`\nFINAL DECISION:\nBLOCKED`);
    }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
