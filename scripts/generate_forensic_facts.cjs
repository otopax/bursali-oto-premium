const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getFolderStats(dir, ignorePaths = ['node_modules', '.git', '.next']) {
  let stats = { fileCount: 0, totalSize: 0, folderCount: 0 };
  
  if (!fs.existsSync(dir)) return stats;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    if (ignorePaths.includes(file)) continue;
    
    const filePath = path.join(dir, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        stats.folderCount++;
        const childStats = getFolderStats(filePath, ignorePaths);
        stats.fileCount += childStats.fileCount;
        stats.totalSize += childStats.totalSize;
        stats.folderCount += childStats.folderCount;
      } else {
        stats.fileCount++;
        stats.totalSize += stat.size;
      }
    } catch(e) {}
  }
  return stats;
}

function buildTree(dir, depth = 0, maxDepth = 3, ignorePaths = ['node_modules', '.git', '.next']) {
  if (depth > maxDepth) return '';
  let tree = '';
  if (!fs.existsSync(dir)) return tree;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (ignorePaths.includes(file)) continue;
    const filePath = path.join(dir, file);
    try {
      const stat = fs.statSync(filePath);
      const prefix = '  '.repeat(depth) + '├── ';
      if (stat.isDirectory()) {
        tree += `${prefix}${file}/\n`;
        tree += buildTree(filePath, depth + 1, maxDepth, ignorePaths);
      } else {
        tree += `${prefix}${file} (${(stat.size / 1024).toFixed(1)} KB)\n`;
      }
    } catch(e) {}
  }
  return tree;
}

function execCmd(cmd) {
  try { return execSync(cmd, { encoding: 'utf-8' }).trim(); }
  catch(e) { return 'UNKNOWN'; }
}

function run() {
  const root = process.cwd();
  console.log("=== BURSALI OTO SERVIS FORENSIC DATA ===");
  
  // Git
  console.log("\n[GIT INFO]");
  console.log(`Branch: ${execCmd('git branch --show-current')}`);
  console.log(`Current SHA: ${execCmd('git rev-parse HEAD')}`);
  console.log(`Remote: ${execCmd('git remote -v')}`);
  
  // Filesystem
  console.log("\n[FILESYSTEM INFO]");
  const stats = getFolderStats(root);
  console.log(`Total Files (excl. node_modules): ${stats.fileCount}`);
  console.log(`Total Folders (excl. node_modules): ${stats.folderCount}`);
  console.log(`Total Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  console.log("\n[TREE STRUCTURE]");
  console.log(buildTree(root, 0, 2));
  
  // Package
  console.log("\n[PACKAGE.JSON]");
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));
    console.log(`Dependencies: ${Object.keys(pkg.dependencies || {}).length}`);
    console.log(`DevDependencies: ${Object.keys(pkg.devDependencies || {}).length}`);
  } catch(e) {}
  
}

run();
