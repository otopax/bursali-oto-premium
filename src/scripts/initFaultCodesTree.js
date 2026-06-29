const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../../public');
const FUSEBOX_DIR = path.join(PUBLIC_DIR, 'fusebox_data');
const FAULT_CODES_DIR = path.join(PUBLIC_DIR, 'ariza_kodlari');

function initTree() {
  console.log('Arıza Kodları klasör ağacı oluşturuluyor...');
  
  if (!fs.existsSync(FUSEBOX_DIR)) {
    console.error('Hata: fusebox_data klasörü bulunamadı. Önce diğer botun verileri çekmesi gerekiyor.');
    return;
  }

  if (!fs.existsSync(FAULT_CODES_DIR)) {
    fs.mkdirSync(FAULT_CODES_DIR, { recursive: true });
  }

  const brands = fs.readdirSync(FUSEBOX_DIR).filter(file => {
    return fs.statSync(path.join(FUSEBOX_DIR, file)).isDirectory() && file.toLowerCase() !== 'fuse_box_diagrams';
  });

  let brandCount = 0;
  let modelCount = 0;

  for (const brand of brands) {
    const brandPath = path.join(FAULT_CODES_DIR, brand);
    if (!fs.existsSync(brandPath)) {
      fs.mkdirSync(brandPath, { recursive: true });
    }
    brandCount++;

    const fbBrandDir = path.join(FUSEBOX_DIR, brand);
    const models = fs.readdirSync(fbBrandDir).filter(file => fs.statSync(path.join(fbBrandDir, file)).isDirectory());

    for (const model of models) {
      const modelPath = path.join(brandPath, model);
      if (!fs.existsSync(modelPath)) {
        fs.mkdirSync(modelPath, { recursive: true });
      }
      modelCount++;
    }
  }

  console.log(`\nBaşarılı! Toplam ${brandCount} Marka ve ${modelCount} Model için arıza kodları iskeleti oluşturuldu.`);
  console.log(`Konum: ${FAULT_CODES_DIR}`);
}

initTree();
