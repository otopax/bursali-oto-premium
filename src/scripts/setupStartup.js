const fs = require('fs');
const path = require('path');

const appData = process.env.APPDATA;
if (!appData) {
  console.error("APPDATA ortam değişkeni bulunamadı. Sadece Windows'ta çalışır.");
  process.exit(1);
}

const startupFolder = path.join(appData, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
const projectDir = path.resolve(__dirname, '../../');

// VBScript içeriği: Komut istemcisini (CMD) gizli (0) olarak çalıştırır.
const vbsContent = `
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "${projectDir}"
WshShell.Run "pm2 start src/scripts/orchestrateFaultCodes.js --name ""ArizaBot""", 0, False
`;

const vbsPath = path.join(startupFolder, 'BursaliOto_ArizaBot_Baslatici.vbs');

try {
  fs.writeFileSync(vbsPath, vbsContent.trim());
  console.log(`Başarılı! Başlangıç scripti şu konuma eklendi:`);
  console.log(vbsPath);
  console.log(`\nArtık bilgisayar her açıldığında bot (ArizaBot) arka planda otomatik olarak başlayacak.`);
} catch (err) {
  console.error("Başlangıç dosyası oluşturulurken hata oluştu:", err);
}
