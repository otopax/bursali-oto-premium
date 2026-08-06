const { execSync } = require('child_process');
const html = execSync('curl.exe -sL https://www.bursaliotoservis.com/en/hakkimizda', { encoding: 'utf8' });
const regex = /href="\/tr\/[^"]*"/g;
let match;
while ((match = regex.exec(html)) !== null) {
  console.log('Found link in EN hakkimizda:', match[0]);
}

const html2 = execSync('curl.exe -sL https://www.bursaliotoservis.com/en/ariza-kodlari/P0171', { encoding: 'utf8' });
let match2;
while ((match2 = regex.exec(html2)) !== null) {
  console.log('Found link in EN P0171:', match2[0]);
}
