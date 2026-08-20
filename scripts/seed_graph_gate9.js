const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
    console.log("Starting GATE 9: Knowledge Graph Seed...");
    
    console.log("Fetching all SourceImportRecords...");
    const sources = await prisma.sourceImportRecord.findMany();
    
    if (sources.length !== 7949) {
        console.error(`ERROR: Expected 7949 sources, found ${sources.length}`);
        process.exit(1);
    }

    // Maps for deduplication and ID generation
    const manufacturersMap = new Map(); // brand -> id
    const vehiclesMap = new Map(); // brand::model::year -> id
    const enginesMap = new Map(); // vehicleId::engineCode -> id
    const variantsMap = new Map(); // engineId::engineNameRaw -> id

    const manufacturersData = [];
    const vehiclesData = [];
    const enginesData = [];
    const engineVariantsData = [];

    // Phase 1: Group and assign IDs
    for (const source of sources) {
        const brandKey = source.brand.toUpperCase().trim();
        const modelName = source.model.trim();
        const yearStart = source.yearFrom || 0; // Using 0 for UNKNOWN_YEAR to satisfy Int requirement in DB
        const engineCode = source.engineCode;
        const engineNameRaw = source.engineNameRaw;

        // Manufacturer
        if (!manufacturersMap.has(brandKey)) {
            const mId = uuidv4();
            manufacturersMap.set(brandKey, mId);
            manufacturersData.push({
                id: mId,
                name: brandKey
            });
        }
        const mId = manufacturersMap.get(brandKey);

        // Vehicle
        const vKey = `${mId}::${modelName}::${yearStart}`;
        if (!vehiclesMap.has(vKey)) {
            const vId = uuidv4();
            vehiclesMap.set(vKey, vId);
            vehiclesData.push({
                id: vId,
                manufacturerId: mId,
                model: modelName,
                yearStart: yearStart
            });
        }
        const vId = vehiclesMap.get(vKey);

        // Engine
        const eKey = `${vId}::${engineCode}`;
        if (!enginesMap.has(eKey)) {
            const eId = uuidv4();
            enginesMap.set(eKey, eId);
            enginesData.push({
                id: eId,
                vehicleId: vId,
                code: engineCode
            });
        }
        const eId = enginesMap.get(eKey);

        // EngineVariant
        const evKey = `${eId}::${engineNameRaw}`;
        if (!variantsMap.has(evKey)) {
            const evId = uuidv4();
            variantsMap.set(evKey, evId);
            engineVariantsData.push({
                id: evId,
                engineId: eId,
                designation: engineNameRaw
            });
        }
    }

    console.log(`Prepared to insert:
    Manufacturers: ${manufacturersData.length}
    Vehicles: ${vehiclesData.length}
    Engines: ${enginesData.length}
    EngineVariants: ${engineVariantsData.length}
    `);

    console.log("Cleaning up existing Graph entities properly...");
    // Clear relations from SourceImportRecord first to avoid errors
    await prisma.sourceImportRecord.updateMany({
        data: { vehicleId: null, engineId: null, engineVariantId: null }
    });
    // Delete dependents
    await prisma.fuse.deleteMany();
    await prisma.fuseBox.deleteMany();
    // Delete graph entities
    await prisma.engineVariant.deleteMany();
    await prisma.engine.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.manufacturer.deleteMany();

    console.log("Inserting Graph Entities...");
    await prisma.manufacturer.createMany({ data: manufacturersData });
    await prisma.vehicle.createMany({ data: vehiclesData });
    await prisma.engine.createMany({ data: enginesData });
    await prisma.engineVariant.createMany({ data: engineVariantsData });

    console.log("Linking SourceImportRecords to Graph Entities...");
    // Update all sources in a transaction for speed
    const updatePromises = sources.map(source => {
        const brandKey = source.brand.toUpperCase().trim();
        const modelName = source.model.trim();
        const yearStart = source.yearFrom || 0;
        const engineCode = source.engineCode;
        const engineNameRaw = source.engineNameRaw;

        const mId = manufacturersMap.get(brandKey);
        const vId = vehiclesMap.get(`${mId}::${modelName}::${yearStart}`);
        const eId = enginesMap.get(`${vId}::${engineCode}`);
        const evId = variantsMap.get(`${eId}::${engineNameRaw}`);

        return prisma.sourceImportRecord.update({
            where: { id: source.id },
            data: {
                vehicleId: vId,
                engineId: eId,
                engineVariantId: evId
            }
        });
    });

    // Run in chunks to prevent memory/transaction limits
    const chunkSize = 500;
    for (let i = 0; i < updatePromises.length; i += chunkSize) {
        await Promise.all(updatePromises.slice(i, i + chunkSize));
    }
    
    console.log("Seeding complete. Running Post-Seed Integrity Checks...");

    // Post-Seed Validation
    const countM = await prisma.manufacturer.count();
    const countV = await prisma.vehicle.count();
    const countE = await prisma.engine.count();
    const countEV = await prisma.engineVariant.count();
    const countS = await prisma.sourceImportRecord.count();

    const orphanSources = await prisma.sourceImportRecord.count({
        where: { engineVariantId: null }
    });

    const orphanVariants = await prisma.engineVariant.count({
        where: { sourceRecords: { none: {} } }
    });

    const multipleVariantsPerSource = await prisma.sourceImportRecord.findMany({
        include: { engineVariant: true } // Since it's 1-to-1 relation field, Prisma strictly guarantees only 1 is linked
    }); // N/A logic-wise as foreign key enforces it.

    console.log(`\n================================`);
    console.log(`POST-SEED FORENSIC CHECK`);
    console.log(`================================`);
    console.log(`Manufacturer COUNT: ${countM} (Expected: 85)`);
    console.log(`Vehicle COUNT: ${countV} (Expected: 1055)`);
    console.log(`Engine COUNT: ${countE} (Expected: 7128)`);
    console.log(`EngineVariant COUNT: ${countEV} (Expected: 7949)`);
    console.log(`SourceImportRecord COUNT: ${countS} (Expected: 7949)`);
    console.log(`--------------------------------`);
    console.log(`Source without Variant: ${orphanSources}`);
    console.log(`Variant without Source: ${orphanVariants}`);

    let emptyEngineCode = 0;
    let emptyEngineNameRaw = 0;
    
    for (const source of sources) {
        if (!source.engineCode || source.engineCode.trim() === '') emptyEngineCode++;
        if (!source.engineNameRaw || source.engineNameRaw.trim() === '') emptyEngineNameRaw++;
    }
    
    console.log(`Source engineCode NULL/empty: ${emptyEngineCode}`);
    console.log(`Source engineNameRaw NULL/empty: ${emptyEngineNameRaw}`);
    console.log(`================================\n`);

    if (countM === 85 && countV === 1055 && countE === 7128 && countEV === 7949 && countS === 7949 && orphanSources === 0 && orphanVariants === 0) {
        console.log("FINAL: PASS");
    } else {
        console.error("FINAL: FAIL");
        process.exit(1);
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
