const fs = require('fs');
const path = require('path');

const tr = {
  HomePage: {
    title: "Premium Araç Uzmanı",
    subtitle: "40 yıllık geleneksel Alman motor mekanik tecrübemizi, en son teknoloji Yapay Zeka arıza tespit cihazlarıyla birleştiriyoruz. Fethiye premium oto servis. ISTA, XENTRY, PIWIS ve ODIS cihazları ile garantili BMW, Mercedes, Porsche ve Audi tamiri.",
    expertise: "Uzmanlık Alanlarımız",
    solutions: "Arıza Çözümleri",
    knowledgeBase: "Bilgi Bankası",
    tourists: "Yabancı Ziyaretçiler İçin",
    fleet: "VIP Filo Hizmetleri",
    catalog: "Araç Kataloğu",
    heroBadge: "👑 1986'DAN BERİ 40 YILLIK USTALIK MİRASI",
    heroTitlePrefix: "Bursalı Oto Servis Fethiye:",
    btnEmergency: "Acil Yol Yardım Hattı",
    btnWhatsapp: "WhatsApp ile İletişime Geç",
    towBadge: "🛡️ 7/24 Kesintisiz Acil Hizmet",
    towTitle: "🛡️ 7/24 Premium Yol Yardım ve VIP Kurtarma Hizmeti",
    towBullet1Title: "⚡ Hızlı Yönlendirme:",
    towBullet1Desc: " Konum atın, hemen yola çıkalım.",
    towBullet2Title: "🌙 Gece 3 Fark Etmez:",
    towBullet2Desc: " Gece ekibimiz ve yol yardım araçlarımız her an hazır.",
    towBullet3Title: "🚔 Maksimum Güvenlik:",
    towBullet3Desc: " Premium aracınızı sıfır riskle transfer edip yetkili servis standartlarında onarıma alıyoruz.",
    btnTowCall: "Acil Çekici Çağır",
    btnTowWhatsapp: "📍 WhatsApp Konum Gönder",
    trustTitle: "Neden Bize Güvenmelisiniz?",
    trustDesc: "Babadan oğula geçen 40 yıllık dürüst ustalık mirası, Alman marka araçlarda yetkili servis standartları.",
    servicesTitle: "Üst Düzey Mühendislik Çözümleri",
    servicesDesc: "Aracınızın marka ve modeline özel, orijinal lisanslı diyagnostik cihazlarımızla kusursuz arıza tespiti ve garantili onarım gerçekleştiriyoruz.",
    diagTitle: "Orijinal Ekipmanlarla Diagnostik",
    diagDesc: "BMW/Mini için ICOM, Mercedes için Star Diagnosis, VAG grubu için ODIS, Renault için Clip, Ford için IDS/VCM ve Volvo için VIDA gibi tamamen markaya özel orijinal servis cihazlarıyla kusursuz arıza tespiti sağlıyoruz.",
    transTitle: "Şanzıman ve Motor Revizyonu",
    transDesc: "Premium araçların kalbi olan motor ve şanzıman sistemlerinde (Örn: Volvo Aisin şanzımanlar) sadece %100 orijinal OEM parçalar kullanarak uzun ömürlü garantili çözümler sunuyoruz.",
    vipTitle: "VIP Transfer Filoları (Gece Bakımı)",
    vipDesc: "Turizm sezonunda operasyonunuz kesintiye uğramasın! VIP Vito ve Crafter filolarınız için özel Gece Vardiyası Bakımı sunuyoruz. Akşam teslim edin, sabah işinize güvenle devam edin.",
    expatBadge: "VIP Tourist & Expat Services",
    expatTitle: "We Speak English, Russian, Arabic & Ukrainian",
    reviewsTitle: "Müşterilerimiz Ne Diyor? (Google Yorumları)",
    reviewsDesc: "Gerçek müşteri deneyimleri ve 5 yıldızlı hizmet kalitemiz.",
    faultsTitle: "Uzmanlık Alanımız: Kronik Arızalar",
    faultsDesc: "En son çözdüğümüz premium araç arızaları ve garantili onarım yöntemlerimiz.",
    faultsBtn: "Tüm Arıza Çözümlerini Gör →",
    faultsModels: "Modeller:",
    specialServicesTitle: "Özel Hizmetlerimiz",
    contactTitle: "İletişim & Konum",
    contactInfoTitle: "İletişim Bilgilerimiz",
    contactAddress: "Taşyaka Mahallesi, Yeni Sanayi Sitesi, 264. Sokak, No: 1, 48300 Fethiye/Muğla",
    contactPhone1: "Telefon (İbrahim Bekiç):",
    contactPhone2: "Sabit Hat:",
    contactHours: "Pazartesi - Cumartesi (08:30 - 19:30)",
    contactWhatsappBtn: "WhatsApp Destek Hattı",
    faqTitle: "Sıkça Sorulan Sorular",
    seoBlockTitle: "Fethiye Oto Tamir ve Premium Araç Özel Servisi",
    seoBlockP1: "Bursalı Oto Servis olarak Fethiye sanayi sitesinde, özellikle Alman marka araçlar (BMW, Mercedes-Benz, Audi, Porsche, Volkswagen) ve premium segment otomobiller için yetkili servis kalitesinde özel servis hizmeti sunuyoruz. Amacımız, Fethiye ve çevresindeki premium araç sahiplerinin, araçlarını güvenle teslim edebilecekleri, şeffaf ve profesyonel bir bakım onarım merkezi olmaktır.",
    seoBlockP2: "Modern otomobiller karmaşık elektronik sistemlere ve hassas motor dinamiklerine sahiptir. Bu nedenle, sıradan arıza tespit cihazları yerine Porsche için PIWIS, VAG grubu için ODIS gibi sadece yetkili servislerin kullandığı orijinal lisanslı cihazlar kullanıyoruz. Bu donanımlar sayesinde deneme yanılma yöntemlerini tamamen ortadan kaldırıyor, noktasal arıza tespiti ile hem zamandan hem de gereksiz parça değişim maliyetlerinden tasarruf etmenizi sağlıyoruz.",
    seoBlockP3: "Hizmetlerimiz sadece mekanik onarımla sınırlı değildir. Fethiye'de 7/24 acil oto çekici ve yol yardım hizmetimiz ile yolda kaldığınız an yanınızdayız. Premium aracınızı sıfır hasar riskiyle kurtarıyor ve 7/24 kameralı güvenli otoparkımıza çekiyoruz. Ayrıca periyodik bakım, ağır bakım, otomatik şanzıman revizyonu (Aisin, ZF vb.), motor revizyonu ve DPF (Dizel Partikül Filtresi) temizliği gibi kritik işlemleri garantili olarak, orijinal veya üst düzey OEM yedek parçalar kullanarak gerçekleştiriyoruz. Fethiye'deki yabancı misafirlerimiz için İngilizce, Rusça, Arapça ve Ukraynaca dillerinde iletişim kurabilen uluslararası bir ekiple çalışmaktan gurur duyuyoruz.",
    footerAddress: "Yeni Sanayi Sitesi, Fethiye / Muğla",
    footerAbout: "Hakkımızda",
    footerPricing: "Fiyat Politikamız",
    footerFaults: "Arıza Çözümleri",
    footerCopyright: "© {year} Bursalı Oto Servis. Tüm hakları saklıdır."
  },
  TrustBadges: {
    originalParts: "Orijinal Yedek Parça Garantisi",
    noHiddenFees: "Gizli Ücret Yok",
    transparentPricing: "Şeffaf Fiyatlandırma"
  },
  SEO: {
    brandServiceTitle: "Fethiye {brand} Servisi | Orijinal Yedek Parça ve Garantili Bakım",
    brandServiceDesc: "Fethiye'nin en iyi {brand} özel servisi. {brand} marka araçlarınız için motor, şanzıman ve elektronik arıza tespiti. 7/24 Yol Yardım.",
    transmissionTitle: "Fethiye Otomatik Şanzıman Tamiri | Garantili Revizyon",
    transmissionDesc: "Fethiye'de garantili otomatik şanzıman tamiri. DSG, ZF, Aisin, CVT şanzıman arıza tespiti ve orijinal yedek parça ile onarım hizmeti."
  },
  SanalUstaTeaser: {
    q1: "Motor arıza lambası yandı, ne yapmalıyım?",
    q2: "Klima soğutmuyor, sebebi ne olabilir?",
    q3: "Şanzıman vuruntu yapıyor, tehlikeli mi?",
    cta: "Sen de Sor - Ücretsiz"
  },
  Metadata: {
    title: "Bursalı Oto Servis Fethiye | Premium Araç ve Motor Uzmanı",
    description: "Fethiye premium oto servis. ISTA, XENTRY, PIWIS ve ODIS cihazları ile garantili BMW, Mercedes, Porsche ve Audi tamiri. 7/24 VIP yol yardım ve orijinal yedek parça güvencesi."
  }
};

const en = {
  HomePage: {
    title: "Premium Car Specialist",
    subtitle: "We combine 40 years of traditional German engine mechanics experience with the latest AI-powered diagnostic devices. Premium auto repair in Fethiye. Guaranteed BMW, Mercedes, Porsche, and Audi repair with ISTA, XENTRY, PIWIS, and ODIS.",
    expertise: "Our Expertise",
    solutions: "Fault Solutions",
    knowledgeBase: "Knowledge Base",
    tourists: "For Expats & Tourists",
    fleet: "VIP Fleet Services",
    catalog: "Vehicle Catalog",
    heroBadge: "👑 40 YEARS OF MASTERY LEGACY SINCE 1986",
    heroTitlePrefix: "Bursali Auto Repair Fethiye:",
    btnEmergency: "Emergency Roadside Assistance",
    btnWhatsapp: "Contact via WhatsApp",
    towBadge: "🛡️ 24/7 Uninterrupted Emergency Service",
    towTitle: "🛡️ 24/7 Premium Roadside Assistance & VIP Towing",
    towBullet1Title: "⚡ Quick Dispatch:",
    towBullet1Desc: " Send your location, we'll be right there.",
    towBullet2Title: "🌙 3 AM Doesn't Matter:",
    towBullet2Desc: " Our night crew and tow trucks are always ready.",
    towBullet3Title: "🚔 Maximum Security:",
    towBullet3Desc: " We transfer your premium vehicle with zero risk and repair it at authorized service standards.",
    btnTowCall: "Call Emergency Tow Truck",
    btnTowWhatsapp: "📍 Send Location via WhatsApp",
    trustTitle: "Why Trust Us?",
    trustDesc: "40 years of honest father-to-son mastery, combined with authorized service standards for German vehicles.",
    servicesTitle: "High-End Engineering Solutions",
    servicesDesc: "We provide flawless diagnostics and guaranteed repair with original licensed diagnostic devices specific to your vehicle's make and model.",
    diagTitle: "Diagnostics with Original Equipment",
    diagDesc: "We ensure precise fault detection using brand-specific original service devices like ICOM for BMW/Mini, Star Diagnosis for Mercedes, ODIS for the VAG group, Clip for Renault, IDS/VCM for Ford, and VIDA for Volvo.",
    transTitle: "Transmission and Engine Rebuild",
    transDesc: "For the heart of premium vehicles—engine and transmission systems (e.g., Volvo Aisin transmissions)—we provide long-lasting, guaranteed solutions using only 100% original OEM parts.",
    vipTitle: "VIP Transfer Fleets (Night Service)",
    vipDesc: "Don't let your operations halt during the tourist season! We offer special Night Shift Maintenance for your VIP Vito and Crafter fleets. Drop it off at night, continue your work safely in the morning.",
    expatBadge: "VIP Tourist & Expat Services",
    expatTitle: "We Speak English, Russian, Arabic & Ukrainian",
    reviewsTitle: "What Our Customers Say (Google Reviews)",
    reviewsDesc: "Real customer experiences and our 5-star service quality.",
    faultsTitle: "Our Expertise: Chronic Faults",
    faultsDesc: "Premium vehicle faults we recently solved and our guaranteed repair methods.",
    faultsBtn: "View All Fault Solutions →",
    faultsModels: "Models:",
    specialServicesTitle: "Our Special Services",
    contactTitle: "Contact & Location",
    contactInfoTitle: "Our Contact Information",
    contactAddress: "Tasyaka District, Yeni Sanayi Sitesi, 264. Street, No: 1, 48300 Fethiye/Mugla",
    contactPhone1: "Phone (Ibrahim Bekic):",
    contactPhone2: "Landline:",
    contactHours: "Monday - Saturday (08:30 - 19:30)",
    contactWhatsappBtn: "WhatsApp Support Line",
    faqTitle: "Frequently Asked Questions",
    seoBlockTitle: "Fethiye Auto Repair and Premium Vehicle Specialist",
    seoBlockP1: "At Bursali Auto Repair in Fethiye industrial site, we offer authorized service quality specifically for German brand vehicles (BMW, Mercedes-Benz, Audi, Porsche, Volkswagen) and premium segment cars. Our goal is to be a transparent and professional maintenance and repair center where premium vehicle owners in and around Fethiye can safely entrust their vehicles.",
    seoBlockP2: "Modern cars have complex electronic systems and sensitive engine dynamics. Therefore, instead of ordinary diagnostic tools, we use original licensed devices used only by authorized services, such as PIWIS for Porsche and ODIS for the VAG group. Thanks to this equipment, we completely eliminate trial-and-error methods, saving you both time and unnecessary part replacement costs with precise fault detection.",
    seoBlockP3: "Our services are not limited to mechanical repair. We are by your side the moment your car breaks down with our 24/7 emergency tow truck and roadside assistance service in Fethiye. We rescue your premium vehicle with zero damage risk and tow it to our 24/7 camera-secured parking lot. In addition, we perform critical operations such as periodic maintenance, heavy maintenance, automatic transmission rebuild (Aisin, ZF, etc.), engine rebuild, and DPF (Diesel Particulate Filter) cleaning under guarantee, using original or high-end OEM spare parts. We are proud to work with an international team that can communicate in English, Russian, Arabic, and Ukrainian for our foreign guests in Fethiye.",
    footerAddress: "Yeni Sanayi Sitesi, Fethiye / Mugla",
    footerAbout: "About Us",
    footerPricing: "Pricing Policy",
    footerFaults: "Fault Solutions",
    footerCopyright: "© {year} Bursali Auto Repair. All rights reserved."
  },
  TrustBadges: {
    originalParts: "Original Parts Guarantee",
    noHiddenFees: "No Hidden Fees",
    transparentPricing: "Transparent Pricing"
  },
  SEO: {
    brandServiceTitle: "Fethiye {brand} Service | Original Parts & Guaranteed Repair",
    brandServiceDesc: "The best {brand} specialist in Fethiye. Professional engine, transmission and electronic diagnostics for {brand}. 24/7 Roadside Assistance.",
    transmissionTitle: "Fethiye Automatic Transmission Repair | Guaranteed Rebuild",
    transmissionDesc: "Guaranteed automatic transmission repair in Fethiye. DSG, ZF, Aisin diagnostics and rebuild services with original parts."
  },
  SanalUstaTeaser: {
    q1: "Check engine light is on, what should I do?",
    q2: "AC is not cooling, what could be the reason?",
    q3: "Transmission is knocking, is it dangerous?",
    cta: "Ask AI Mechanic - Free"
  },
  Metadata: {
    title: "Bursali Auto Repair Fethiye | Premium Car & Engine Specialist",
    description: "English speaking mechanic in Fethiye. Guaranteed BMW, Mercedes, Porsche, and Audi repair with ISTA, XENTRY, PIWIS, and ODIS. 24/7 VIP tow truck and roadside assistance."
  }
};

const ru = {
  ...en,
  HomePage: {
    ...en.HomePage,
    title: "Специалист по премиум автомобилям",
    subtitle: "Мы сочетаем 40-летний опыт традиционной немецкой механики двигателей с новейшими диагностическими устройствами на базе ИИ. Ремонт премиум-класса в Фетхие. Гарантированный ремонт BMW, Mercedes, Porsche и Audi с использованием ISTA, XENTRY, PIWIS и ODIS.",
    heroBadge: "👑 40 ЛЕТ МАСТЕРСТВА С 1986 ГОДА",
    heroTitlePrefix: "Автосервис Bursali в Фетхие:",
    btnEmergency: "Экстренная помощь на дороге",
    btnWhatsapp: "Связаться через WhatsApp",
    towBadge: "🛡️ Круглосуточная экстренная служба 24/7",
    towTitle: "🛡️ Круглосуточная помощь на дороге и VIP-эвакуатор",
    btnTowCall: "Вызвать эвакуатор",
    btnTowWhatsapp: "📍 Отправить геолокацию в WhatsApp",
    trustTitle: "Почему нам доверяют?",
    trustDesc: "40 лет честного мастерства от отца к сыну в сочетании со стандартами авторизованного сервиса для немецких автомобилей.",
    servicesTitle: "Инженерные решения премиум-класса",
    servicesDesc: "Мы обеспечиваем точную диагностику и гарантированный ремонт с использованием оригинальных диагностических устройств для вашей марки автомобиля.",
    diagTitle: "Диагностика на оригинальном оборудовании",
    transTitle: "Капитальный ремонт АКПП и двигателей",
    vipTitle: "Обслуживание VIP-фургонов (Ночная смена)",
    expatBadge: "VIP-услуги для туристов и экспатов",
    expatTitle: "Мы говорим на английском, русском, арабском и украинском языках",
    reviewsTitle: "Отзывы клиентов (Google)",
    specialServicesTitle: "Наши специальные услуги",
    contactTitle: "Контакты и местоположение",
    faqTitle: "Часто задаваемые вопросы",
    seoBlockTitle: "Фетхие Автосервис и специалист по автомобилям премиум-класса",
    footerAbout: "О нас",
    footerPricing: "Прозрачные цены",
    footerFaults: "Решения проблем"
  },
  Metadata: {
    title: "Автосервис Bursali в Фетхие | Специалист по премиум автомобилям",
    description: "Русскоговорящий механик в Фетхие. Ремонт BMW, Mercedes, Porsche и Audi. Круглосуточный эвакуатор 24/7."
  }
};

const uk = {
  ...ru,
  HomePage: {
    ...ru.HomePage,
    title: "Спеціаліст з преміум автомобілів",
    heroBadge: "👑 40 РОКІВ МАЙСТЕРНОСТІ З 1986 РОКУ",
    btnEmergency: "Екстрена допомога на дорозі",
    btnWhatsapp: "Зв'язатися через WhatsApp",
    towTitle: "🛡️ Цілодобова допомога на дорозі та VIP-евакуатор 24/7",
    btnTowCall: "Викликати евакуатор",
    expatTitle: "Ми розмовляємо англійською, російською, арабською та українською мовами",
    contactTitle: "Контакти та локація"
  },
  Metadata: {
    title: "Автосервіс Bursali у Фетхіє | Преміум автомобілі",
    description: "Україномовний механік у Фетхіє. Ремонт BMW, Mercedes, Porsche та Audi. Цілодобовий евакуатор 24/7."
  }
};

const ar = {
  ...en,
  HomePage: {
    ...en.HomePage,
    title: "متخصص السيارات الفاخرة",
    subtitle: "نحن نجمع بين 40 عامًا من الخبرة في ميكانيكا المحركات الألمانية التقليدية مع أحدث أجهزة التشخيص المدعومة بالذكاء الاصطناعي. إصلاح سيارات مضمون لسيارات BMW و Mercedes و Porsche و Audi في فتحية.",
    heroBadge: "👑 إرث من الإتقان لمدة 40 عامًا منذ عام 1986",
    heroTitlePrefix: "مركز صيانة بورصالي في فتحية:",
    btnEmergency: "المساعدة الطارئة على الطريق",
    btnWhatsapp: "تواصل عبر الواتساب",
    towTitle: "🛡️ مساعدة على الطريق وسحب سيارات VIP على مدار 24/7",
    btnTowCall: "اتصل بشاحنة السحب",
    trustTitle: "لماذا تثق بنا؟",
    servicesTitle: "حلول هندسية متطورة",
    expatTitle: "نحن نتحدث الإنجليزية والروسية والعربية والأوكرانية",
    reviewsTitle: "ماذا يقول عملاؤنا (مراجعات جوجل)",
    contactTitle: "اتصل بنا والموقع",
    faqTitle: "الأسئلة المتداولة",
    seoBlockTitle: "فتحية لإصلاح السيارات ومتخصص السيارات الفاخرة",
    footerAbout: "معلومات عنا",
    footerPricing: "الأسعار",
    footerFaults: "حلول الأعطال"
  },
  Metadata: {
    title: "مركز صيانة بورصالي فتحية | متخصص السيارات الفاخرة",
    description: "ميكانيكي يتحدث العربية في فتحية. إصلاح مضمون لسيارات BMW، مرسيدس، بورش، وأودي. مساعدة على الطريق وسحب سيارات على مدار 24/7."
  }
};

const outDir = path.join(__dirname, '../messages');
fs.writeFileSync(path.join(outDir, 'tr.json'), JSON.stringify(tr, null, 2));
fs.writeFileSync(path.join(outDir, 'en.json'), JSON.stringify(en, null, 2));
fs.writeFileSync(path.join(outDir, 'ru.json'), JSON.stringify(ru, null, 2));
fs.writeFileSync(path.join(outDir, 'uk.json'), JSON.stringify(uk, null, 2));
fs.writeFileSync(path.join(outDir, 'ar.json'), JSON.stringify(ar, null, 2));

console.log("Translations generated!");
