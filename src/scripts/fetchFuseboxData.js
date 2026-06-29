const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// To use Gemini, you need the API key from .env.local
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });
const { GoogleGenAI } = require('@google/genai');

const make = process.argv[2] || 'ford';
const model = process.argv[3] || 'f-150';
const year = process.argv[4] || '2021';

const url = `https://www.startmycar.com/${make}/${model}/info/fusebox/${year}`;
console.log(`Fetching from ${url}...`);

async function run() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    let rawFuseboxesData = null;
    $('script').each((i, el) => {
      const scriptContent = $(el).html();
      if (scriptContent && scriptContent.includes('fuseboxesData')) {
        const match = scriptContent.match(/fuseboxesData\s*=\s*(\[.*?\]);/s) || scriptContent.match(/var\s+fuseboxesData\s*=\s*(\[.*?\}\]);/s);
        if (match && match[1]) {
          try {
            rawFuseboxesData = JSON.parse(match[1]);
          } catch(e) {
            console.error("Error parsing fuseboxesData JSON", e.message);
          }
        }
      }
    });

    if (!rawFuseboxesData) {
      const inlineMatch = html.match(/var\s+fuseboxesData\s*=\s*(\[\{.*\}\]);/s);
      if (inlineMatch && inlineMatch[1]) {
         try { rawFuseboxesData = JSON.parse(inlineMatch[1]); } catch(e){}
      }
    }

    if (!rawFuseboxesData) {
      console.log('Could not extract JSON. Aborting.');
      return;
    }

    console.log(`Found ${rawFuseboxesData.length} fuseboxes.`);

    const parsedBoxes = [];

    for (let boxIndex = 0; boxIndex < rawFuseboxesData.length; boxIndex++) {
      const boxData = rawFuseboxesData[boxIndex];
      const section = $(`#fusebox${boxIndex}`);
      
      const fusesTable = [];
      section.find('tr.row-fuse').each((i, tr) => {
        const row = $(tr);
        const fuseId = row.attr('data-fuse-id');
        const amp = row.find('.amp').text().trim();
        const ampColor = row.find('.amp').css('background-color') || row.find('.amp').attr('style') || '';
        const desc = row.find('.fusedesc').text().trim() || row.find('td:last-child').text().trim();
        const fuseType = row.find('.format').text().trim();
        
        fusesTable.push({
          id: fuseId,
          amp,
          ampColor: ampColor.replace('background-color:', '').replace(';', '').trim(),
          type: fuseType,
          originalDesc: desc,
          translatedDesc: ''
        });
      });

      let imageUrl = boxData.boxThumbnail;
      if (!imageUrl && boxData.boxDiagramImg) imageUrl = boxData.boxDiagramImg.url;
      if (!imageUrl) {
        imageUrl = section.find('.deferred-fusebox-placeholder__image').attr('src');
      }
      
      let localImageName = `box_${boxIndex}_color.webp`;
      let localImagePath = `/images/fuseboxes/${make}/${model}/${year}/${localImageName}`;
      
      parsedBoxes.push({
        boxName: boxData.boxName || section.find('.deferred-fusebox-placeholder__title').text().trim() || `Box ${boxIndex+1}`,
        originalImageUrl: imageUrl,
        localImageName: localImageName,
        localImagePath: localImagePath,
        boxRotation: boxData.boxRotation || 0,
        layoutData: boxData.fuses || boxData, // the coordinate data
        fusesTable: fusesTable
      });
    }

    console.log('Translating descriptions using Gemini...');
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    let toTranslate = [];
    parsedBoxes.forEach(box => {
      box.fusesTable.forEach(fuse => {
        if (fuse.originalDesc) {
          toTranslate.push(fuse.originalDesc);
        }
      });
    });

    const uniqueToTranslate = [...new Set(toTranslate)];
    console.log(`Found ${uniqueToTranslate.length} unique descriptions to translate.`);

    const translationPrompt = `Aşağıdaki araba sigortası (fuse box) İngilizce açıklamalarını, sanayideki bir Türk oto tamir ustasının anlayacağı profesyonel ve teknik Türkçe jargonuna çevir. Çıktı olarak SADECE her bir çeviriyi satır satır ver. Orijinal metni ekleme. Hiçbir ek açıklama yazma.
Örneğin:
"Engine control module" -> "Motor kontrol beyni (ECM)"
"Fuel pump relay" -> "Yakıt pompası rölesi"

Çevrilecekler:
${uniqueToTranslate.join('\n')}`;

    let translationMap = {};
    if (uniqueToTranslate.length > 0 && process.env.GEMINI_API_KEY) {
      try {
        const res = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: translationPrompt
        });
        const translations = res.text.split('\n').map(t=>t.trim()).filter(t => t.length > 0);
        
        for(let i=0; i<Math.min(uniqueToTranslate.length, translations.length); i++){
            translationMap[uniqueToTranslate[i]] = translations[i];
        }
      } catch (err) {
        console.error("Gemini Translation failed. Falling back to original.", err.message);
      }
    }

    parsedBoxes.forEach(box => {
      box.fusesTable.forEach(fuse => {
        fuse.translatedDesc = translationMap[fuse.originalDesc] || fuse.originalDesc;
        fuse.translatedDesc = fuse.translatedDesc.replace(/startmycar/gi, "sistemimiz");
      });
    });

    const publicDir = path.join(__dirname, '../../public/images/fuseboxes', make, model, year);
    fs.mkdirSync(publicDir, { recursive: true });

    for (let box of parsedBoxes) {
      if (box.originalImageUrl) {
        console.log(`Downloading image for ${box.boxName}: ${box.originalImageUrl}`);
        try {
          const imgUrl = box.originalImageUrl.startsWith('//') ? 'https:' + box.originalImageUrl : box.originalImageUrl;
          const imgRes = await fetch(imgUrl);
          const buffer = await imgRes.arrayBuffer();
          fs.writeFileSync(path.join(publicDir, box.localImageName), Buffer.from(buffer));
        } catch (e) {
          console.error(`Failed to download image ${box.originalImageUrl}`, e.message);
        }
      }
      delete box.originalImageUrl;
    }

    const dataDir = path.join(__dirname, '../../src/data/fuseboxes', make, model);
    fs.mkdirSync(dataDir, { recursive: true });
    
    const jsonPath = path.join(dataDir, `${year}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(parsedBoxes, null, 2));

    console.log(`Successfully extracted, translated, and saved data to ${jsonPath}`);
  } catch (error) {
    console.error('Fatal Error:', error);
  }
}

run();
