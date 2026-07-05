// AI Ajanları ve Arama Motorları için Tek Kaynak (Single Source of Truth)
// Tüm JSON-LD (Schema), llms.txt ve iletişim formları bu veriyi okur.
// Tutarlılık, yapay zeka botlarının (ChatGPT, Claude) işletmeyi tanıması için kritiktir.

export const businessData = {
  name: "Bursalı Oto Servis Fethiye",
  alternateName: "Bursalı Oto",
  description: "Fethiye premium oto servis. PIWIS ve ODIS ile garantili BMW, Mercedes, Porsche tamiri. 7/24 VIP yol yardım ve orijinal yedek parça güvencesi.",
  url: "https://www.bursaliotoservis.com",
  logo: "https://www.bursaliotoservis.com/bg.png",
  image: "https://www.bursaliotoservis.com/bg.png",
  telephone: "+905548812021",
  priceRange: "₺₺-₺₺₺",
  address: {
    streetAddress: "Taşyaka Mahallesi, Yeni Sanayi Sitesi, 264. Sokak, No: 1",
    addressLocality: "Fethiye",
    addressRegion: "Muğla",
    postalCode: "48300",
    addressCountry: "TR"
  },
  geo: {
    latitude: 36.6212, // Fethiye Sanayi Sitesi tahmini koordinatı
    longitude: 29.1303
  },
  openingHoursSpecification: [
    {
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:30",
      closes: "19:30"
    }
  ],
  areaServed: [
    "Fethiye",
    "Göcek",
    "Ölüdeniz",
    "Çalış",
    "Kayaköy",
    "Seydikemer",
    "Dalaman"
  ],
  knowsLanguage: ["tr", "en", "ru", "uk", "ar"],
  sameAs: [
    // Gelecekte açılacak sosyal medya ve Google Maps hesapları buraya eklenecek
  ],
  makesOffer: [
    {
      name: "7/24 Oto Çekici ve Yol Yardım",
      description: "Konum alındıktan hemen sonra anında çıkış yapılır. 3 adet çekicimiz ile ekstra bekleme süresi olmadan hizmet verilir."
    },
    {
      name: "Otomatik Şanzıman Tamiri ve Revizyonu",
      description: "DSG, ZF ve Aisin şanzımanlarda garantili tamir."
    },
    {
      name: "Porsche, Mercedes, BMW, Audi Özel Servis",
      description: "PIWIS, ODIS ve orijinal diagnostik cihazlarıyla servis hizmeti."
    },
    {
      name: "Motor Arızası Teşhisi ve Revizyonu",
      description: "Orijinal yedek parça ile garantili motor yenileme."
    },
    {
      name: "Klima Bakımı ve Gaz Dolumu",
      description: "Profesyonel klima gaz dolumu ve dezenfeksiyon."
    },
    {
      name: "VIP Filo Gece Bakımı",
      description: "Turizm araçları için gece vardiyalı kesintisiz bakım."
    },
    {
      name: "Ücretsiz Check-up",
      description: "Aracınızın genel durumunu gösteren ücretsiz kontrol."
    }
  ],
  experience: {
    years: 50,
    details: "Kurucumuzun 50 yıllık, 2. kuşak ustalarımızın 20 yıllık uzmanlığıyla Fethiye'de hizmet vermekteyiz."
  }
};
