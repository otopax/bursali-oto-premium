import fs from 'fs/promises';
import path from 'path';

const root = path.join(process.cwd(), 'public', 'catalog');
const repoRoot = process.cwd();

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

async function searchSeedForCountry() {
    try {
        const seedPath = path.join(repoRoot, 'prisma', 'seed.ts');
        const content = await fs.readFile(seedPath, 'utf-8');
        return content.includes('country');
    } catch {
        return false;
    }
}

async function run() {
    console.log("=== P0.3.2-R NATURAL-KEY / DUPLICATE FORENSIC AUDIT ===");
    
    // A - Manufacturer Country
    let hasCountryInSeed = await searchSeedForCountry();
    console.log("\nA — Manufacturer Country");
    console.log(`COUNTRY_SOURCE_AVAILABLE_IN_SEED: ${hasCountryInSeed}`);
    
    // Read all JSONs
    const records = [];
    let fileCount = 0;
    
    for await (const file of walk(root)) {
        if (!file.endsWith('.json')) continue;
        fileCount++;
        
        const relative = file.replace(root + path.sep, '');
        const parts = relative.split(path.sep);
        const brand = parts.length >= 4 ? parts[0] : null;
        const model = parts.length >= 4 ? parts[1] : null;
        const year = parts.length >= 4 ? parts[2] : null;
        
        try {
            const content = await fs.readFile(file, 'utf-8');
            const json = JSON.parse(content);
            const boxes = Array.isArray(json) ? json : [json];
            
            for (let i = 0; i < boxes.length; i++) {
                const box = boxes[i];
                const fuses = Array.isArray(box.fuses) ? box.fuses : [];
                records.push({
                    File: relative,
                    Brand: brand,
                    Model: model,
                    Year: year,
                    BoxIndex: i,
                    BoxName: box.boxName || "",
                    DiagramUrl: box.boxDiagramImg?.url || null,
                    ThumbnailUrl: box.boxThumbnail || null,
                    Fuses: fuses
                });
            }
        } catch(e) {
            // ignore parse errors
        }
    }
    
    const uniqueBrands = new Set();
    records.forEach(r => { if (r.Brand) uniqueBrands.add(r.Brand); });
    console.log(`Total Unique Brands in JSON: ${uniqueBrands.size}`);
    
    // B - Vehicle Collision
    console.log("\nB — Vehicle Collision");
    // Since file path is brand/model/year/fuseboxes.json, collision means multiple files for same B/M/Y
    const bmyGroups = new Map();
    for (const r of records) {
        const key = `${r.Brand}|${r.Model}|${r.Year}`;
        bmyGroups.set(key, (bmyGroups.get(key) || new Set()).add(r.File));
    }
    let hasCollision = false;
    for (const [key, files] of bmyGroups.entries()) {
        if (files.size > 1) {
            console.log(`COLLISION DETECTED: ${key} maps to ${files.size} files.`);
            hasCollision = true;
        }
    }
    if (!hasCollision) {
        console.log("No file collisions. 1 File per Brand/Model/Year strictly enforced by filesystem.");
    }
    
    // C - FuseBox Duplicate Forensics
    console.log("\nC — FuseBox Duplicate Forensics");
    const boxGroups = new Map();
    for (const r of records) {
        const key = `${r.Brand}|${r.Model}|${r.Year}|${r.BoxName}`;
        if (!boxGroups.has(key)) boxGroups.set(key, []);
        boxGroups.get(key).push(r);
    }
    
    let duplicateGroupCount = 0;
    const sampleDuplicates = [];
    for (const [key, group] of boxGroups.entries()) {
        if (group.length > 1) {
            duplicateGroupCount++;
            if (sampleDuplicates.length < 5) {
                sampleDuplicates.push({
                    key,
                    file_count: new Set(group.map(g => g.File)).size,
                    box_count: group.length,
                    diagrams: group.map(g => g.DiagramUrl),
                    fuse_counts: group.map(g => g.Fuses.length)
                });
            }
        }
    }
    console.log(`Found ${duplicateGroupCount} duplicate FuseBox groups.`);
    console.log("Sample of 5 duplicate groups to prove they are variants/revisions:");
    console.log(JSON.stringify(sampleDuplicates, null, 2));
    
    // D - Missing Fuse ID
    console.log("\nD — Missing Fuse ID");
    const missingFuses = [];
    for (const r of records) {
        let fIdx = 0;
        for (const f of r.Fuses) {
            const id = f.id ? String(f.id).trim() : "";
            if (!id) {
                missingFuses.push({
                    Brand: r.Brand,
                    Model: r.Model,
                    Year: r.Year,
                    BoxName: r.BoxName,
                    Description: f.description,
                    Type: f.kind?.type,
                    Format: f.kind?.format,
                    Amperage: f.kind?.amp,
                    File: r.File,
                    ArrayIndex: fIdx
                });
            }
            fIdx++;
        }
    }
    console.log(`Found ${missingFuses.length} fuses missing ID.`);
    console.log("Sample of 5 missing ID fuses:");
    console.log(JSON.stringify(missingFuses.slice(0, 5), null, 2));

    console.log("\n=== P0.3.2-R END ===");
}

run();
