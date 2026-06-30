const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, 'audit_report.json');
const quarantineDir = path.join(__dirname, 'quarantine');

if (!fs.existsSync(reportPath)) {
    console.log("No audit report found.");
    process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

let restoredCount = 0;

for (const cf of report.corruptedFiles) {
    if (cf.reason === 'Invalid JPG header') {
        const originalPath = cf.file;
        const fileName = path.basename(originalPath);
        const quarantinePath = path.join(quarantineDir, fileName);
        
        if (fs.existsSync(quarantinePath)) {
            // Check if it's a PNG
            const fd = fs.openSync(quarantinePath, 'r');
            const buffer = Buffer.alloc(4);
            fs.readSync(fd, buffer, 0, 4, 0);
            fs.closeSync(fd);
            
            const hex = buffer.toString('hex').toUpperCase();
            if (hex.startsWith('89504E47')) {
                // It's a PNG! Let's rename it to .png and put it back in its original folder
                const originalDir = path.dirname(originalPath);
                const newFileName = fileName.replace(/\.jpe?g$/i, '.png');
                const restorePath = path.join(originalDir, newFileName);
                
                try {
                    // Ensure the original directory exists (it should, but just in case)
                    if (!fs.existsSync(originalDir)) {
                        fs.mkdirSync(originalDir, { recursive: true });
                    }
                    
                    fs.renameSync(quarantinePath, restorePath);
                    
                    // Also update the JSON files that might be referencing this image?
                    // This is too complex right now, but at least the image is back.
                    // Wait, if the JSON references "acura_cl_1997.jpg", the frontend will look for .jpg.
                    // If we rename it to .png, the frontend will get a 404!
                    // What happens if we keep the .jpg extension but move it back?
                    // Actually, modern browsers don't care about the extension. If you serve a PNG file with a .jpg extension, Chrome/Safari/Edge will render it perfectly because they look at the MIME type or the file header.
                    // So we can just move them BACK exactly as they were, and update the audit script to ALLOW PNG headers for .jpg files.
                    
                    // Let's just move it back with the original .jpg extension so the frontend links don't break.
                    fs.renameSync(quarantinePath, originalPath);
                    restoredCount++;
                } catch (e) {
                    console.log("Error restoring", originalPath, e.message);
                }
            }
        }
    }
}

console.log(`Restored ${restoredCount} misnamed PNG files back to their original locations!`);
