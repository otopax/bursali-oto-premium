const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATALOG_DIR = path.join(process.cwd(), 'public', 'catalog');

async function migrate() {
  console.log("=========================================");
  console.log("   PHASE 21: DATABASE MIGRATION STARTED  ");
  console.log("=========================================");

  if (!fs.existsSync(CATALOG_DIR)) {
    console.log("Catalog directory not found!");
    return;
  }

  const brands = fs.readdirSync(CATALOG_DIR).filter(f => fs.statSync(path.join(CATALOG_DIR, f)).isDirectory());
  console.log(`Found ${brands.length} brands to process.`);

  for (const brand of brands) {
    console.log(`\nProcessing brand: ${brand}`);
    
    // UPSERT Manufacturer
    const manufacturer = await prisma.manufacturer.upsert({
      where: { name: brand },
      update: {},
      create: {
        name: brand,
        country: "Unknown"
      }
    });

    const brandDir = path.join(CATALOG_DIR, brand);
    const models = fs.readdirSync(brandDir).filter(f => fs.statSync(path.join(brandDir, f)).isDirectory());

    for (const model of models) {
      const modelDir = path.join(brandDir, model);
      const years = fs.readdirSync(modelDir).filter(f => fs.statSync(path.join(modelDir, f)).isDirectory());

      for (const yearStr of years) {
        const yearInt = parseInt(yearStr);
        if (isNaN(yearInt)) continue;

        const yearDir = path.join(modelDir, yearStr);
        const fuseboxesFile = path.join(yearDir, 'fuseboxes.json');

        // Check if there are any fuseboxes downloaded for this year
        if (!fs.existsSync(fuseboxesFile)) continue;

        // UPSERT Vehicle
        const vehicle = await prisma.vehicle.upsert({
          where: {
            manufacturerId_model_generation_yearStart: {
              manufacturerId: manufacturer.id,
              model: model,
              generation: "Unknown",
              yearStart: yearInt
            }
          },
          update: {},
          create: {
            manufacturerId: manufacturer.id,
            model: model,
            generation: "Unknown",
            yearStart: yearInt,
            bodyType: "Unknown",
            fuelType: "Unknown"
          }
        });

        // Read and parse fuseboxes
        let fuseboxesData = [];
        try {
          const raw = fs.readFileSync(fuseboxesFile, 'utf8');
          fuseboxesData = JSON.parse(raw);
        } catch (e) {
          console.error(`Failed to parse ${fuseboxesFile}`);
          continue;
        }

        let addedBoxes = 0;
        let addedFuses = 0;

        for (const box of fuseboxesData) {
          // INSERT FuseBox
          const dbBox = await prisma.fuseBox.create({
            data: {
              vehicleId: vehicle.id,
              name: box.boxName || "Unknown Box",
              diagramImgUrl: box.boxDiagramImg?.url || null,
              thumbnailUrl: box.boxThumbnail || null
            }
          });
          addedBoxes++;

          // INSERT Fuses/Relays
          if (box.fuses && Array.isArray(box.fuses)) {
            const fuseInserts = box.fuses.map(f => {
              return {
                fuseBoxId: dbBox.id,
                originalId: String(f.id),
                type: f.kind?.type || null,
                format: f.kind?.format || null,
                amperage: parseFloat(f.kind?.amp) || null,
                description: f.description || null,
                isNotUsed: !!f.kind?.notUsed
              };
            });

            if (fuseInserts.length > 0) {
              await prisma.fuse.createMany({
                data: fuseInserts,
                skipDuplicates: true
              });
              addedFuses += fuseInserts.length;
            }
          }
        }

        console.log(`  -> ${model} ${yearInt}: Added ${addedBoxes} boxes, ${addedFuses} fuses/relays.`);
      }
    }
  }

  console.log("\n✅ PHASE 21 MIGRATION COMPLETE!");
}

migrate()
  .catch(e => {
    console.error("Migration failed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
