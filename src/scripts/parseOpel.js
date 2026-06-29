const fs = require('fs');
const path = require('path');

const absoluteContentPath = "C:\\Users\\xbors\\.gemini\\antigravity\\brain\\edfdae59-5bf1-41c9-9e10-6257e2f0f0af\\.system_generated\\steps\\1902\\content.md";

const content = fs.readFileSync(absoluteContentPath, 'utf-8');

const regex = /href="([^"]+)"><strong>(.*?)<\/strong>\s*\((.*?)\).*?<\/a>/g;
let match;
let models = [];

while ((match = regex.exec(content)) !== null) {
  const url = match[1];
  let rawName = match[2];
  // Strip all HTML tags
  let modelName = rawName.replace(/<[^>]*>?/gm, '');
  modelName = modelName.replace(/Opel\/Vauxhall/g, '').replace(/Opel \/ Vauxhall/g, '').replace(/Opel/g, '').trim();
  
  let yearRange = match[3].replace(/&#8230;/g, '').replace(/<[^>]*>?/gm, '').trim();
  
  if (modelName.length > 0 && !url.includes('jpg') && !url.includes('png') && !url.includes('wp-content')) {
     models.push({
         modelName: modelName,
         yearRange: yearRange,
         chassisList: [modelName + " (" + yearRange + ")"]
     });
  }
}

const uniqueModels = [];
const seen = new Set();
for (const m of models) {
   if (!seen.has(m.modelName)) {
      seen.add(m.modelName);
      uniqueModels.push(m);
   }
}

const finalData = {
   brand: "OPEL",
   models: uniqueModels
};

const outputDir = path.join(process.cwd(), 'public', 'webdatabays_data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'opel_chassis.json'), JSON.stringify(finalData, null, 2));
console.log(`Opel verileri başarıyla işlendi ve ${uniqueModels.length} model kaydedildi!`);
