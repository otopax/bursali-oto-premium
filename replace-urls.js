const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(filePath);
    }
  });
  return results;
};

const SITE_URL_VAR = "(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com')";
const SITE_URL_TEMPLATE = "${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}";

const replaceHardcodedURLs = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace backtick instances
  const btRegex = /`https:\/\/(www\.)?bursaliotoservis\.com([^`]*)`/g;
  if (btRegex.test(content)) {
    content = content.replace(btRegex, '`${process.env.NEXT_PUBLIC_SITE_URL || \'https://www.bursaliotoservis.com\'}$2`');
    changed = true;
  }

  // Replace single quote instances
  const sqRegex = /'https:\/\/(www\.)?bursaliotoservis\.com'/g;
  if (sqRegex.test(content)) {
    content = content.replace(sqRegex, "(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com')");
    changed = true;
  }
  const sqRegex2 = /'https:\/\/(www\.)?bursaliotoservis\.com([^']*)'/g;
  if (sqRegex2.test(content)) {
    content = content.replace(sqRegex2, "`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}$2`");
    changed = true;
  }

  // Replace double quote instances
  const dqRegex = /"https:\/\/(www\.)?bursaliotoservis\.com"/g;
  if (dqRegex.test(content)) {
    content = content.replace(dqRegex, "(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com')");
    changed = true;
  }
  const dqRegex2 = /"https:\/\/(www\.)?bursaliotoservis\.com([^"]*)"/g;
  if (dqRegex2.test(content)) {
    content = content.replace(dqRegex2, "`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}$2`");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
};

const files = walk('./src');
files.forEach(replaceHardcodedURLs);

console.log("URL Replacement Complete.");
