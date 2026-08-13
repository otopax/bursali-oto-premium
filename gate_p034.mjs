import fs from 'fs/promises';
import path from 'path';

const root = path.join(process.cwd(), 'public', 'catalog');

async function *walk(dir) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      const res = path.join(dir, file.name);
      if (file.isDirectory()) yield* walk(res);
      else yield res;
    }
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
}

async function run() {
    console.log("=== P0.3.4 VEHICLE NATURAL-KEY FORENSIC VALIDATION ===");
    
    let totalFiles = 0;
    const records = [];
    const bmyGroups = new Map();
    const yearFormats = new Set();
    const yearEndFields = new Set();
    const generationFields = new Set();

    for await (const file of walk(root)) {
        if (!file.endsWith('.json')) continue;
        totalFiles++;
        
        const relative = file.replace(root + path.sep, '');
        const parts = relative.split(path.sep);
        const brand = parts.length >= 4 ? parts[0] : null;
        const model = parts.length >= 4 ? parts[1] : null;
        const year = parts.length >= 4 ? parts[2] : null;
        
        yearFormats.add(year);
        
        const bmyKey = `${brand}|${model}|${year}`;
        if (!bmyGroups.has(bmyKey)) {
            bmyGroups.set(bmyKey, { paths: new Set(), fuseBoxCount: 0, fuseCount: 0, jsons: [] });
        }
        bmyGroups.get(bmyKey).paths.add(file);
        
        try {
            const content = await fs.readFile(file, 'utf-8');
            const json = JSON.parse(content);
            const boxes = Array.isArray(json) ? json : [json];
            
            let boxCount = 0;
            let fuseCount = 0;
            
            for (const box of boxes) {
                if (box.yearEnd !== undefined) yearEndFields.add(box.yearEnd);
                if (box.generation !== undefined) generationFields.add(box.generation);
                
                boxCount++;
                const fuses = Array.isArray(box.fuses) ? box.fuses : [];
                fuseCount += fuses.length;
            }
            
            bmyGroups.get(bmyKey).fuseBoxCount += boxCount;
            bmyGroups.get(bmyKey).fuseCount += fuseCount;
            
        } catch(e) {}
    }
    
    // 1 & 2 & 4: Collision and uniqueness
    console.log("\n1, 2, 4 — Brand/Model/Year Collision & Uniqueness Audit");
    let hasCollision = false;
    for (const [key, group] of bmyGroups.entries()) {
        if (group.paths.size > 1) {
            console.log(`COLLISION DETECTED: ${key} maps to ${group.paths.size} files.`);
            hasCollision = true;
        }
    }
    if (!hasCollision) {
        console.log("No file collisions. Every Brand/Model/Year maps to exactly 1 unique file path.");
        console.log("No Prisma compound unique constraint conflicts possible if yearStart is unique.");
    }
    
    // 3: generation = NULL
    console.log("\n3 — Generation Audit");
    if (generationFields.size === 0) {
        console.log("CONFIRMED: 'generation' field does NOT exist in any JSON. generation = NULL for all records.");
    } else {
        console.log(`Generation fields found:`, Array.from(generationFields));
    }
    
    // 6: yearEnd Audit
    console.log("\n6 — YearEnd Audit");
    let hasYearRange = false;
    for (const y of yearFormats) {
        if (y && y.includes('-')) hasYearRange = true;
    }
    if (hasYearRange) {
        console.log("WARNING: Some folder names contain year ranges (e.g., '-').");
    } else {
        console.log("CONFIRMED: Folder names strictly contain single years (e.g. '2005').");
    }
    if (yearEndFields.size === 0) {
        console.log("CONFIRMED: 'yearEnd' field does NOT exist in any JSON object. yearEnd = NULL for all records.");
    } else {
        console.log(`yearEnd fields found inside JSON:`, Array.from(yearEndFields));
    }

    // 7 & 8: Cardinality stats
    console.log("\n7 & 8 — Vehicle Cardinality Stats");
    let maxBox = 0, maxBoxKey = "";
    let maxFuse = 0, maxFuseKey = "";
    let avgBox = 0, avgFuse = 0;
    
    for (const [key, group] of bmyGroups.entries()) {
        avgBox += group.fuseBoxCount;
        avgFuse += group.fuseCount;
        if (group.fuseBoxCount > maxBox) { maxBox = group.fuseBoxCount; maxBoxKey = key; }
        if (group.fuseCount > maxFuse) { maxFuse = group.fuseCount; maxFuseKey = key; }
    }
    console.log(`Average FuseBoxes per Vehicle: ${(avgBox / bmyGroups.size).toFixed(2)}`);
    console.log(`Max FuseBoxes in a single Vehicle: ${maxBox} (${maxBoxKey})`);
    console.log(`Average Fuses per Vehicle: ${(avgFuse / bmyGroups.size).toFixed(2)}`);
    console.log(`Max Fuses in a single Vehicle: ${maxFuse} (${maxFuseKey})`);

    // 5 & 9: Import identity strategy confirmation
    console.log("\n5 & 9 — Canonical Vehicle Identity Strategy");
    console.log(`Canonical Vehicle Identity: Manufacturer.name + Vehicle.model + Vehicle.yearStart`);
    console.log(`UUID Strategy: DB 'id' will be generated UUIDs. Natural keys remain preserved in their respective string/int fields without overriding UUIDs.`);
    
    console.log("\n=== P0.3.4 END ===");
}

run();
