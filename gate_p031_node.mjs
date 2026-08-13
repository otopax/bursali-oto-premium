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
  const records = [];
  let totalFiles = 0;
  let totalBytes = 0;
  const parseErrors = [];
  
  for await (const file of walk(root)) {
    if (!file.endsWith('.json')) continue;
    totalFiles++;
    const stat = await fs.stat(file);
    totalBytes += stat.size;
    
    const relative = file.replace(root + path.sep, '');
    const parts = relative.split(path.sep);
    const brand = parts.length >= 4 ? parts[0] : null;
    const model = parts.length >= 4 ? parts[1] : null;
    const year = parts.length >= 4 ? parts[2] : null;
    
    try {
        const content = await fs.readFile(file, 'utf-8');
        const json = JSON.parse(content);
        const boxes = Array.isArray(json) ? json : [json];
        
        for (const box of boxes) {
            const fuses = Array.isArray(box.fuses) ? box.fuses : [];
            records.push({
                File: relative,
                Brand: brand,
                Model: model,
                Year: year,
                BoxName: box.boxName || "",
                FuseCount: fuses.length,
                MissingBox: !box.boxName || String(box.boxName).trim() === "",
                MissingFuse: fuses.length === 0,
                Fuses: fuses
            });
        }
    } catch(e) {
        parseErrors.push(file);
    }
  }
  
  console.log("=== P0.3.1 FINAL JSON FORENSIC RECONCILIATION (NODEJS FALLBACK) ===");
  console.log(`JSON_FILES=${totalFiles}`);
  console.log(`TOTAL_BYTES=${totalBytes}`);
  
  const totalBoxes = records.length;
  const totalFuses = records.reduce((acc, r) => acc + r.FuseCount, 0);
  console.log(`TOTAL_FUSEBOXES=${totalBoxes}`);
  console.log(`TOTAL_FUSES=${totalFuses}`);
  
  const missingBox = records.filter(r => r.MissingBox).length;
  const emptyFuseBoxes = records.filter(r => r.MissingFuse).length;
  console.log(`MISSING_BOX_NAME=${missingBox}`);
  console.log(`EMPTY_FUSEBOXES=${emptyFuseBoxes}`);
  
  const uniqueBrands = new Set(records.filter(r => r.Brand).map(r => r.Brand)).size;
  const uniqueModels = new Set(records.filter(r => r.Model).map(r => `${r.Brand}|${r.Model}`)).size;
  const uniqueVehicleYears = new Set(records.map(r => `${r.Brand}|${r.Model}|${r.Year}`)).size;
  console.log(`UNIQUE_BRANDS=${uniqueBrands}`);
  console.log(`UNIQUE_BRAND_MODEL_PAIRS=${uniqueModels}`);
  console.log(`UNIQUE_VEHICLE_YEAR_KEYS=${uniqueVehicleYears}`);
  
  const boxGroups = new Map();
  for (const r of records) {
      const key = `${r.Brand}|${r.Model}|${r.Year}|${r.BoxName}`;
      boxGroups.set(key, (boxGroups.get(key) || 0) + 1);
  }
  let duplicateBoxes = 0;
  for (const count of boxGroups.values()) {
      if (count > 1) duplicateBoxes++;
  }
  console.log(`DUPLICATE_FUSEBOX_GROUPS=${duplicateBoxes}`);
  
  let totalFuseObjects = 0;
  let missingFuseId = 0;
  let missingFuseDescription = 0;
  const fuseGroups = new Map();
  
  for (const r of records) {
      for (const f of r.Fuses) {
          totalFuseObjects++;
          const id = f.id ? String(f.id).trim() : "";
          const desc = f.description ? String(f.description).trim() : "";
          
          if (!id) missingFuseId++;
          if (!desc) missingFuseDescription++;
          
          if (id) {
              const key = `${r.Brand}|${r.Model}|${r.Year}|${r.BoxName}|${id}`;
              fuseGroups.set(key, (fuseGroups.get(key) || 0) + 1);
          }
      }
  }
  
  let duplicateFuses = 0;
  for (const count of fuseGroups.values()) {
      if (count > 1) duplicateFuses++;
  }
  console.log(`FUSE_OBJECTS=${totalFuseObjects}`);
  console.log(`FUSE_MISSING_ID=${missingFuseId}`);
  console.log(`FUSE_MISSING_DESCRIPTION=${missingFuseDescription}`);
  console.log(`DUPLICATE_FUSE_IDENTITY_GROUPS=${duplicateFuses}`);
  
  const invalidYears = records.filter(r => r.Year && !/^[0-9]{4}$/.test(r.Year)).length;
  console.log(`INVALID_YEAR_PATHS=${invalidYears}`);
  
  const vauxhallRecords = records.filter(r => r.Brand && r.Brand.toLowerCase() === 'vauxhall');
  // Need unique files for vauxhall
  const vauxhallFiles = new Set(vauxhallRecords.map(r => r.File)).size;
  const vauxhallFuses = vauxhallRecords.reduce((acc, r) => acc + r.FuseCount, 0);
  console.log(`VAUXHALL_FILES=${vauxhallFiles}`);
  console.log(`VAUXHALL_FUSEBOXES=${vauxhallRecords.length}`);
  console.log(`VAUXHALL_FUSES=${vauxhallFuses}`);
  
  console.log("\nPARSE_FAILURE_COUNT=" + parseErrors.length);
  console.log("PARSE_FAILURE_FILES=");
  parseErrors.forEach(p => console.log(p));
}

run();
