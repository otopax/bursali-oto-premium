const fs = require('fs');
const path = require('path');

const RAW_FILE = 'C:\\\\Users\\\\xbors\\\\.gemini\\\\antigravity\\\\brain\\\\375ab2fe-444e-4ec5-971e-39d2076a92a1\\\\raw_faults_research.md';
const OUT_DIR = path.join(__dirname, '../src/content/faults');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const rawContent = fs.readFileSync(RAW_FILE, 'utf-8');

// Normalize line endings
const text = rawContent.replace(/\r\n/g, '\n');

// Split by brand sections
const brands = text.split('## 🚘 ');
brands.shift(); // Remove intro text

let totalCreated = 0;

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// Map Turkish characters for slug
function turkishSlugify(text) {
  const charMap = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };
  let t = text;
  for (let key in charMap) {
    t = t.replace(new RegExp(key, 'g'), charMap[key]);
  }
  return slugify(t);
}

for (const brandSection of brands) {
  const lines = brandSection.split('\n');
  const brandTitleLine = lines[0]; // e.g. "BMW (Bayerische Motoren Werke) - 17 Kronik Arıza"
  const brandName = brandTitleLine.split(' ')[0].trim();
  
  // Split by faults
  const faults = brandSection.split('### ');
  faults.shift(); // remove brand header stuff
  
  for (const fault of faults) {
    const faultLines = fault.trim().split('\n');
    const titleLine = faultLines[0].trim(); // e.g. "1. N20 Motor Triger Zinciri Kopması"
    
    // Clean up title (remove "1. ")
    const titleMatch = titleLine.match(/^\d+\.\s+(.*)$/);
    const title = titleMatch ? titleMatch[1] : titleLine;
    
    const fullTitle = `${brandName} ${title}`;
    const slug = turkishSlugify(fullTitle);
    
    // Extract fields
    let model = "", sikayet = "", neden = "", cozum = "", imageUrl = "";
    
    for (let line of faultLines) {
      if (line.startsWith('- **Marka & Model:**')) model = line.replace('- **Marka & Model:**', '').trim();
      if (line.startsWith('- **Şikayet:**')) sikayet = line.replace('- **Şikayet:**', '').trim();
      if (line.startsWith('- **Kök Neden:**')) neden = line.replace('- **Kök Neden:**', '').trim();
      if (line.startsWith('- **Çözüm:**')) cozum = line.replace('- **Çözüm:**', '').trim();
      if (line.startsWith('- **Görsel URL:**')) {
        const match = line.match(/\[.*\]\((.*)\)/);
        if (match) imageUrl = match[1];
      }
    }
    
    const mdxContent = `---
title: "${fullTitle.replace(/"/g, '\\"')}"
brand: "${brandName}"
model: "${model.replace(/"/g, '\\"')}"
slug: "${slug}"
image: "${imageUrl}"
---

## Şikayet
${sikayet}

## Kök Neden
${neden}

## Çözüm
${cozum}
`;

    fs.writeFileSync(path.join(OUT_DIR, `${slug}.mdx`), mdxContent);
    totalCreated++;
  }
}

console.log(`Created ${totalCreated} MDX files in src/content/faults!`);
