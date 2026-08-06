const { execSync } = require('child_process');
const html = execSync('curl.exe -sL https://www.bursaliotoservis.com/en/hakkimizda', { encoding: 'utf8' });
const anchors = html.match(/<a\s+[^>]*href=["'](?:\/tr\/|https?:\/\/[^\/]+\/tr\/)[^"']*["'][^>]*>/gi) || [];
console.log('EN Hakkimizda body anchor matches:', anchors);

const html2 = execSync('curl.exe -sL https://www.bursaliotoservis.com/en/ariza-kodlari/P0171', { encoding: 'utf8' });
const anchors2 = html2.match(/<a\s+[^>]*href=["'](?:\/tr\/|https?:\/\/[^\/]+\/tr\/)[^"']*["'][^>]*>/gi) || [];
console.log('EN P0171 body anchor matches:', anchors2);
