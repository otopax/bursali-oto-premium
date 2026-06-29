const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../../public');

const report = {
  arizaCozumleri: {
    totalBrands: 0,
    totalModels: 0,
    totalCodesAnalyzed: 0,
    sampleCodes: []
  },
  sigortaKutulari: {
    totalBrands: 0,
    totalModels: 0,
    totalImages: 0
  },
  teknikKutuphane: {
    totalBrands: 0,
    totalPdfs: 0
  }
};

// 1. Arıza Kodları Analizi
const arizaDir = path.join(publicDir, 'ariza_kodlari');
if (fs.existsSync(arizaDir)) {
  const brands = fs.readdirSync(arizaDir).filter(f => fs.statSync(path.join(arizaDir, f)).isDirectory());
  report.arizaCozumleri.totalBrands = brands.length;
  
  brands.forEach(brand => {
    const brandPath = path.join(arizaDir, brand);
    const models = fs.readdirSync(brandPath).filter(f => fs.statSync(path.join(brandPath, f)).isDirectory());
    report.arizaCozumleri.totalModels += models.length;
    
    models.forEach(model => {
      const modelPath = path.join(brandPath, model);
      const codes = fs.readdirSync(modelPath).filter(f => fs.statSync(path.join(modelPath, f)).isDirectory());
      
      codes.forEach(code => {
        const codePath = path.join(modelPath, code);
        const dataPath = path.join(codePath, 'data.json');
        if (fs.existsSync(dataPath)) {
          report.arizaCozumleri.totalCodesAnalyzed++;
          if (report.arizaCozumleri.sampleCodes.length < 10) {
            report.arizaCozumleri.sampleCodes.push(`${brand} ${model} -> ${code}`);
          }
        }
      });
    });
  });
}

// 2. Sigorta Kutuları
const sigortaDir = path.join(publicDir, 'fusebox_data');
if (fs.existsSync(sigortaDir)) {
  const brands = fs.readdirSync(sigortaDir).filter(f => fs.statSync(path.join(sigortaDir, f)).isDirectory());
  report.sigortaKutulari.totalBrands = brands.length;
  
  brands.forEach(brand => {
    const brandPath = path.join(sigortaDir, brand);
    const models = fs.readdirSync(brandPath).filter(f => fs.statSync(path.join(brandPath, f)).isDirectory());
    report.sigortaKutulari.totalModels += models.length;
    
    models.forEach(model => {
      const images = fs.readdirSync(path.join(brandPath, model)).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
      report.sigortaKutulari.totalImages += images.length;
    });
  });
}

// 3. Teknik Kütüphane (PDF'ler)
const pdfDir = path.join(publicDir, 'startmycar_manuals');
if (fs.existsSync(pdfDir)) {
  const brands = fs.readdirSync(pdfDir).filter(f => fs.statSync(path.join(pdfDir, f)).isDirectory());
  report.teknikKutuphane.totalBrands = brands.length;
  
  brands.forEach(brand => {
    const pdfs = fs.readdirSync(path.join(pdfDir, brand)).filter(f => f.endsWith('.pdf'));
    report.teknikKutuphane.totalPdfs += pdfs.length;
  });
}

console.log(JSON.stringify(report, null, 2));
