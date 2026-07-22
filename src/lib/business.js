// AI Ajanları ve Arama Motorları için Tek Kaynak (Single Source of Truth)
// Tüm JSON-LD (Schema), llms.txt ve iletişim formları bu veriyi okur.
// Tutarlılık, yapay zeka botlarının (ChatGPT, Claude) işletmeyi tanıması için kritiktir.

export const businessData = {
  name: "Bursalı Oto Servis Fethiye",
  alternateName: "Bursalı Oto",
  description: "Fethiye premium oto servis. PIWIS ve ODIS ile garantili BMW, Mercedes, Porsche tamiri. 7/24 VIP yol yardım ve orijinal yedek parça güvencesi.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'),
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}/bg.png`,
  image: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}/bg.png`,
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
    latitude: 36.6260547, // GBP pin koordinatı (birebir — 08.07.2026)
    longitude: 29.1369750
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
    "Dalaman",
    "Kaş",
    "Kalkan",
    "Seydikemer",
    "Çalış",
    "Kayaköy"
  ],
  knowsLanguage: ["tr", "en", "ru", "uk", "ar"],
  sameAs: [
    "https://share.google/mmxy3aJXSwucLeiOb", // Google Maps işletme profili (GBP)
    "https://g.page/r/CcbQoQMYPX4ZEBM" // Google İşletme Profili kısa linki
    // Instagram/Facebook açılınca buraya eklenecek
  ],
  // GBP "yorum iste" linki (WhatsApp yorum akışında kullanılır)
  reviewUrl: "https://g.page/r/CcbQoQMYPX4ZEBM/review",
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
  },
  // GBP Q&A ile birebir aynı tutulmalı (NAP/içerik tutarlılığı — AI bulunurluk sinyali)
  faq: [
    {
      question: "Hangi araç markalarına bakıyorsunuz?",
      answer: "Fethiye Yeni Sanayi'de özellikle Porsche, Mercedes-Benz, BMW, Audi, Volkswagen, Volvo ve Land Rover gibi premium Alman ve Avrupa araç markalarının özel servisiyiz."
    },
    {
      question: "Arıza tespitini nasıl yapıyorsunuz? Orijinal cihazınız var mı?",
      answer: "Evet. Markaya özel lisanslı orijinal arıza tespit cihazları (Porsche PIWIS, Audi/VW ODIS, Mercedes Xentry, BMW ISTA) kullanarak noktasal hata tespiti yapıyoruz."
    },
    {
      question: "Otomatik şanzıman tamiri yapıyor musunuz?",
      answer: "Kesinlikle. DSG, S-Tronic, PDK ve ZF şanzımanların mekatronik kart tamiri, kavrama (debriyaj) değişimi ve tam revizyon işlemlerini servisimizde garantili olarak gerçekleştiriyoruz."
    },
    {
      question: "Do you have English speaking staff? Do you help tourists?",
      answer: "Yes, we have fluent English and Russian speaking staff. We assist expats and tourists with transparent pricing and professional car repair in Fethiye."
    },
    {
      question: "Yolda kaldım, oto çekici hizmetiniz var mı?",
      answer: "Fethiye, Göcek, Ölüdeniz ve çevre bölgelerde 7/24 oto kurtarma ve çekici hizmetimiz mevcuttur. Bizi günün her saati arayabilirsiniz."
    },
    {
      question: "Sadece periyodik bakım mı yapıyorsunuz yoksa motor rektifiye işlemi de yapıyor musunuz?",
      answer: "Periyodik yağ ve filtre bakımından, en ağır motor revizyonlarına (rektifiye, silindir kapak değişimi, triger zincir seti değişimi) kadar A'dan Z'ye tüm mekanik işlemleri uzman kadromuzla kendi garajımızda yapıyoruz."
    }
  ]
};
