const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'public/ariza_kodlari/Acura/acura_adx_2025_2026_fuses/P0001/data.json');
const content = fs.readFileSync(file, 'utf8');
console.log(content.substring(0, 500));
