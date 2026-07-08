const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const faultsDir = path.join(__dirname, '../src/content/faults');
const files = fs.readdirSync(faultsDir);

const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

let updatedCount = 0;

for (const file of files) {
  if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;

  const fullPath = path.join(faultsDir, file);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  const parsed = matter(fileContents);
  
  let modified = false;

  // 1. Add updated date if missing or outdated
  if (!parsed.data.updated || parsed.data.updated !== today) {
    parsed.data.updated = today;
    modified = true;
  }

  // 2. Add Hızlı Çözüm Özeti (Answer-First)
  const brand = parsed.data.brand || 'premium';
  const title = parsed.data.title || 'bu arıza';
  const snippet = `> **Hızlı Çözüm Özeti:** Bursalı Oto uzman servisinde, ${brand} araçlarına özel diyagnoz cihazlarıyla arıza tespiti yapılır ve ${title} sorununun kök nedeni mekanik/elektronik olarak garantili şekilde onarılır.\n\n`;

  if (!parsed.content.includes('Hızlı Çözüm Özeti')) {
    parsed.content = snippet + parsed.content.trimStart();
    modified = true;
  }

  if (modified) {
    const newContent = matter.stringify(parsed.content, parsed.data);
    fs.writeFileSync(fullPath, newContent, 'utf8');
    updatedCount++;
  }
}

console.log(`Successfully enriched ${updatedCount} MDX files.`);
