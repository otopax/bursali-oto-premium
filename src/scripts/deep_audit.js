const fs = require('fs');
const path = require('path');

const targetDirs = [
    'ariza_kodlari',
    'catalog',
    'fusebox_data',
    'startmycar_manuals'
];

const publicDir = path.join(__dirname, 'public');

let totalScanned = 0;
let corruptedFiles = [];
let mismatchedFiles = [];

function checkJSON(filePath, brandFromPath) {
    try {
        const stats = fs.statSync(filePath);
        if (stats.size === 0) throw new Error("0-byte JSON file");
        
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        let modified = false;

        // Logical check: if there is a 'make' field, it should somewhat match the brand in path
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            // Remove cost information strictly
            if (data.aiAnalysis && data.aiAnalysis.estimatedCostInfo) {
                delete data.aiAnalysis.estimatedCostInfo;
                modified = true;
            }

            const make = data.make || data.brand || (data.vehicle && data.vehicle.make);
            if (make && typeof make === 'string') {
                const makeStr = make.toLowerCase().replace(/[^a-z0-9]/g, '');
                const pathStr = brandFromPath.toLowerCase().replace(/[^a-z0-9]/g, '');
                
                // Allow partial match (e.g. mercedes-benz vs mercedes)
                if (!makeStr.includes(pathStr) && !pathStr.includes(makeStr)) {
                    mismatchedFiles.push({ file: filePath, reason: `Mismatch: JSON make '${make}' does not match path brand '${brandFromPath}'` });
                }
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        }

        return true;
    } catch (e) {
        corruptedFiles.push({ file: filePath, reason: e.message });
        return false;
    }
}

function checkPDF(filePath) {
    try {
        const stats = fs.statSync(filePath);
        if (stats.size === 0) throw new Error("0-byte PDF file");
        
        const fd = fs.openSync(filePath, 'r');
        const buffer = Buffer.alloc(5);
        fs.readSync(fd, buffer, 0, 5, 0);
        fs.closeSync(fd);
        
        if (buffer.toString('utf8') !== '%PDF-') {
            throw new Error("Invalid PDF header (Not a real PDF)");
        }
        return true;
    } catch (e) {
        corruptedFiles.push({ file: filePath, reason: e.message });
        return false;
    }
}

function checkImage(filePath) {
    try {
        const stats = fs.statSync(filePath);
        if (stats.size === 0) throw new Error("0-byte Image file");
        
        const fd = fs.openSync(filePath, 'r');
        const buffer = Buffer.alloc(4);
        fs.readSync(fd, buffer, 0, 4, 0);
        fs.closeSync(fd);
        
        const ext = path.extname(filePath).toLowerCase();
        const hex = buffer.toString('hex').toUpperCase();
        
        // Very basic magic number checks
        if (ext === '.jpg' || ext === '.jpeg') {
            if (!hex.startsWith('FFD8FF') && !hex.startsWith('89504E47')) throw new Error("Invalid JPG/PNG header");
        } else if (ext === '.png') {
            if (!hex.startsWith('89504E47') && !hex.startsWith('FFD8FF')) throw new Error("Invalid PNG/JPG header");
        } else if (ext === '.webp') {
            // RIFF....WEBP (bytes 0-3 RIFF, 8-11 WEBP)
            // Just assume ok if size > 0 for now to keep it simple, or check RIFF
            const riffBuffer = Buffer.alloc(12);
            const fd2 = fs.openSync(filePath, 'r');
            fs.readSync(fd2, riffBuffer, 0, 12, 0);
            fs.closeSync(fd2);
            if (riffBuffer.toString('utf8', 0, 4) !== 'RIFF' || riffBuffer.toString('utf8', 8, 12) !== 'WEBP') {
                 // throw new Error("Invalid WEBP header"); // Some might not have standard header, but let's be strict
            }
        }
        return true;
    } catch (e) {
        corruptedFiles.push({ file: filePath, reason: e.message });
        return false;
    }
}

function scanDir(dir, baseDirName) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
            scanDir(fullPath, baseDirName);
        } else {
            totalScanned++;
            const ext = path.extname(fullPath).toLowerCase();
            
            // Extract brand name from the path (usually the folder right inside the targetDir)
            // e.g. public/catalog/audi/a4 -> brand is 'audi'
            const relativeToPublic = path.relative(publicDir, fullPath);
            const parts = relativeToPublic.split(path.sep);
            const brandFromPath = parts.length > 1 ? parts[1] : '';

            if (ext === '.json') {
                checkJSON(fullPath, brandFromPath);
            } else if (ext === '.pdf') {
                checkPDF(fullPath);
            } else if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                checkImage(fullPath);
            }
        }
    }
}

console.log("Starting deep audit of downloaded files...\n");

for (const td of targetDirs) {
    const p = path.join(publicDir, td);
    if (fs.existsSync(p)) {
        console.log(`Scanning [${td}]...`);
        scanDir(p, td);
    } else {
        console.log(`Directory missing: [${td}]`);
    }
}

const report = {
    timestamp: new Date().toISOString(),
    totalScanned,
    corruptedCount: corruptedFiles.length,
    mismatchedCount: mismatchedFiles.length,
    corruptedFiles,
    mismatchedFiles
};

fs.writeFileSync(path.join(__dirname, 'audit_report.json'), JSON.stringify(report, null, 2));

console.log("\n--- AUDIT COMPLETE ---");
console.log(`Total Files Scanned : ${totalScanned}`);
console.log(`Corrupted Files     : ${corruptedFiles.length}`);
console.log(`Mismatched Files    : ${mismatchedFiles.length}`);
console.log("\nDetailed report saved to audit_report.json");

// Quarantine corrupted files to avoid production crashes
if (corruptedFiles.length > 0) {
    const quarantineDir = path.join(__dirname, 'quarantine');
    if (!fs.existsSync(quarantineDir)) fs.mkdirSync(quarantineDir);
    
    console.log("Moving corrupted files to quarantine...");
    for (const cf of corruptedFiles) {
        try {
            const relativePath = path.relative(publicDir, cf.file);
            const dest = path.join(quarantineDir, relativePath);
            const destDir = path.dirname(dest);
            if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
            fs.renameSync(cf.file, dest);
        } catch (err) {
            // Ignore rename errors for open files
        }
    }
}
