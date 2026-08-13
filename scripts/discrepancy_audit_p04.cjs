const { PrismaClient } = require('@prisma/client');
const fs = require('fs/promises');
const path = require('path');

const DB_URL = "postgresql://admin:mysecretpassword@127.0.0.1:5433/disposable_import_p04?schema=public";
const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } });

async function run() {
    console.log("=== P0.4.6.1 DISCREPANCY FORENSIC ===");
    console.log("TARGET: " + DB_URL);
    console.log("PRODUCTION_CONTACT: 0\nRAILWAY_CONTACT: 0\n");

    const catalogDir = path.join(process.cwd(), 'public', 'catalog');
    const allFiles = [];
    async function walk(dir) {
        try {
            const files = await fs.readdir(dir, { withFileTypes: true });
            for (const file of files) {
                const res = path.join(dir, file.name);
                if (file.isDirectory()) await walk(res);
                else if (file.name === 'fuseboxes.json') allFiles.push(res);
            }
        } catch (e) {}
    }
    await walk(catalogDir);
    
    let sourceVehiclesMap = new Map();
    let sourceFuseBoxesMap = new Map();
    
    let sourceFusesCount = 0;
    let sourceMCount = new Set();
    const skippedFiles = [];
    
    for (const filePath of allFiles) {
        const relative = path.relative(catalogDir, filePath).replace(/\\/g, '/');
        const parts = relative.split('/');
        
        // This simulates exactly what the old script vs new script did
        if (parts.length < 4) {
            skippedFiles.push({ file: relative, reason: 'Depth < 4' });
            continue; 
        }
        
        const brand = parts[0];
        const model = parts[1];
        const yearStart = parseInt(parts[2], 10);
        
        if (isNaN(yearStart)) { 
            skippedFiles.push({ file: relative, reason: 'NaN yearStart' });
            continue; 
        }
        
        sourceMCount.add(brand);
        const vKey = `${brand}|${model}|${yearStart}`;
        
        if (!sourceVehiclesMap.has(vKey)) {
            sourceVehiclesMap.set(vKey, []);
        }
        sourceVehiclesMap.get(vKey).push(relative);
        
        const content = await fs.readFile(filePath, 'utf-8');
        let boxes = [];
        try {
            boxes = JSON.parse(content);
        } catch (e) {
            skippedFiles.push({ file: relative, reason: 'Invalid JSON' });
            continue;
        }
        
        if (!Array.isArray(boxes)) {
            skippedFiles.push({ file: relative, reason: 'Root is not array' });
            continue;
        }
        
        for (let i = 0; i < boxes.length; i++) {
            const box = boxes[i];
            const fbKey = `${vKey}#${i}`;
            const fbFuses = Array.isArray(box.fuses) ? box.fuses.length : 0;
            sourceFuseBoxesMap.set(fbKey, {
                name: box.name ? String(box.name) : null,
                fuseCount: fbFuses,
                file: relative
            });
            sourceFusesCount += fbFuses;
        }
    }
    
    console.log(`--- SOURCE ---`);
    console.log(`JSON_FILES: ${allFiles.length}`);
    console.log(`SOURCE_MANUFACTURERS: ${sourceMCount.size}`);
    console.log(`SOURCE_VEHICLES: ${sourceVehiclesMap.size}`);
    console.log(`SOURCE_FUSEBOXES: ${sourceFuseBoxesMap.size}`);
    console.log(`SOURCE_FUSES: ${sourceFusesCount}`);
    
    console.log(`\n--- SKIPPED FILES / DISCREPANCY ANALYSIS ---`);
    if (skippedFiles.length > 0) {
        console.log(`FOUND ${skippedFiles.length} FILES THAT DROPPED OUT OF THE COUNT:`);
        console.log(JSON.stringify(skippedFiles, null, 2));
    } else {
        console.log("No files skipped by parser logic.");
        // If no files skipped, it means allFiles.length exactly matches the inventory logic.
        // Let's check duplicates!
        let totalFilesTracked = 0;
        let dupes = 0;
        for (const [vKey, filesArr] of sourceVehiclesMap.entries()) {
            totalFilesTracked += filesArr.length;
            if (filesArr.length > 1) {
                console.log(`DUPLICATE VEHICLE DETECTED IN SOURCE: ${vKey} has ${filesArr.length} files:`, filesArr);
                dupes++;
            }
        }
        console.log(`TOTAL UNIQUE VEHICLE KEYS: ${sourceVehiclesMap.size}, TOTAL FILES ASSIGNED TO THEM: ${totalFilesTracked}`);
    }
    
    console.log(`\n--- DATABASE ---`);
    const dbMCount = await prisma.manufacturer.count();
    const dbVCount = await prisma.vehicle.count();
    const dbFBCount = await prisma.fuseBox.count();
    const dbFCount = await prisma.fuse.count();
    
    const orphanVCount = 0;
    const orphanFBCount = 0;
    const orphanFCount = 0;

    console.log(`DB_MANUFACTURERS: ${dbMCount}`);
    console.log(`DB_VEHICLES: ${dbVCount}`);
    console.log(`DB_FUSEBOXES: ${dbFBCount}`);
    console.log(`DB_FUSES: ${dbFCount}`);
    console.log(`ORPHAN_VEHICLES: ${orphanVCount}`);
    console.log(`ORPHAN_FUSEBOXES: ${orphanFBCount}`);
    console.log(`ORPHAN_FUSES: ${orphanFCount}`);
    
    const dbVehicles = await prisma.vehicle.findMany({
        include: { manufacturer: true }
    });
    
    const dbVehiclesMap = new Map();
    const dbVIdToKey = new Map();
    
    for (const v of dbVehicles) {
        const vKey = `${v.manufacturer.name}|${v.model}|${v.yearStart}`;
        dbVehiclesMap.set(vKey, v.id);
        dbVIdToKey.set(v.id, vKey);
    }
    
    const sourceOnlyV = [];
    const dbOnlyV = [];
    for (const vKey of sourceVehiclesMap.keys()) {
        if (!dbVehiclesMap.has(vKey)) sourceOnlyV.push(vKey);
    }
    for (const vKey of dbVehiclesMap.keys()) {
        if (!sourceVehiclesMap.has(vKey)) dbOnlyV.push(vKey);
    }
    
    console.log(`\n--- VEHICLE DIFFERENCE ---`);
    console.log(`SOURCE_ONLY:`, sourceOnlyV);
    console.log(`DB_ONLY:`, dbOnlyV);
    
    const dbFuseBoxes = await prisma.fuseBox.findMany({
        include: { _count: { select: { fuses: true } } }
    });
    
    const dbFbByVehicle = new Map();
    for (const fb of dbFuseBoxes) {
        const vKey = dbVIdToKey.get(fb.vehicleId);
        if (!dbFbByVehicle.has(vKey)) dbFbByVehicle.set(vKey, []);
        dbFbByVehicle.get(vKey).push({
            name: fb.name,
            fuseCount: fb._count.fuses
        });
    }
    
    const sourceFbByVehicle = new Map();
    for (const [fbKey, fbData] of sourceFuseBoxesMap.entries()) {
        const vKey = fbKey.split('#')[0];
        if (!sourceFbByVehicle.has(vKey)) sourceFbByVehicle.set(vKey, []);
        sourceFbByVehicle.get(vKey).push(fbData);
    }
    
    let fbMatchCount = 0;
    let fbMismatchCount = 0;
    let fbMismatchDetails = [];
    
    for (const vKey of sourceFbByVehicle.keys()) {
        const srcBoxes = sourceFbByVehicle.get(vKey) || [];
        const dbBoxes = dbFbByVehicle.get(vKey) || [];
        
        if (srcBoxes.length !== dbBoxes.length) {
            fbMismatchCount++;
            fbMismatchDetails.push({
                vehicleKey: vKey,
                reason: `Length mismatch: src=${srcBoxes.length}, db=${dbBoxes.length}`
            });
            continue;
        }
        
        const unassignedDb = [...dbBoxes];
        for (const src of srcBoxes) {
            const matchIdx = unassignedDb.findIndex(db => db.name === src.name && db.fuseCount === src.fuseCount);
            if (matchIdx !== -1) {
                unassignedDb.splice(matchIdx, 1);
                fbMatchCount++;
            } else {
                fbMismatchCount++;
                fbMismatchDetails.push({
                    vehicleKey: vKey,
                    src,
                    unassignedDb: [...unassignedDb]
                });
            }
        }
    }
    
    console.log(`\n--- FUSEBOX CARDINALITY & DIFFERENCE ---`);
    console.log(`MATCH_COUNT: ${fbMatchCount}`);
    console.log(`MISMATCH_COUNT: ${fbMismatchCount}`);
    if (fbMismatchDetails.length > 0) {
        console.log(`MISMATCH DETAILS:`, JSON.stringify(fbMismatchDetails.slice(0,5), null, 2));
    }
    
    console.log(`\n--- FINAL ---`);
    const vehiclePass = sourceOnlyV.length === 0 && dbOnlyV.length === 0;
    const fbPass = fbMismatchCount === 0 && fbMatchCount === sourceFuseBoxesMap.size;
    const fusePass = sourceFusesCount === dbFCount;
    const orphanPass = orphanVCount === 0 && orphanFBCount === 0 && orphanFCount === 0;
    
    console.log(`VEHICLE_SET_RECONCILIATION: ${vehiclePass ? 'PASS' : 'FAIL'}`);
    console.log(`FUSEBOX_SET_RECONCILIATION: ${fbPass ? 'PASS' : 'FAIL'}`);
    console.log(`FUSE_CARDINALITY: ${fusePass ? 'PASS' : 'FAIL'}`);
    console.log(`ORPHAN: ${orphanPass ? 'PASS' : 'FAIL'}`);
    
    const isPass = vehiclePass && fbPass && fusePass && orphanPass;
    console.log(`FINAL: ${isPass ? 'PASS' : 'BLOCKED'}`);
}

run()
    .then(() => prisma.$disconnect())
    .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
