module.exports = {
  apps: [
    {
      name: "proje-yonetici-bot",
      script: "./proje_yoneticisi.js",
      watch: false,
      // 12 saatte bir çalıştırır ve çıkış yaparsa yeniden başlatır
      autorestart: true,
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "musteri-simulasyon-bot",
      script: "./musteri_bot.js",
      watch: false,
      // Sürekli çalışır, kod içindeki setInterval ile belirli periyotlarla rapor üretir
      autorestart: true,
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};
