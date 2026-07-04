import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter, Outfit } from 'next/font/google';
import '../globals.css';
import Chatbot from '@/components/Chatbot';
import Providers from '@/components/Providers';
import CookieConsent from '@/components/CookieConsent';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin', 'latin-ext'], variable: '--font-outfit' });

// Faz A / Görev 2 — Canonical + hreflang locale-aware.
// Base URL www'lu (canlı deploy); metadataBase alt-metadata için relative URL çözer.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com';

// Root layout metadata — canonical BURAYA KOYULMAZ.
// Her sayfa (blog, ariza-cozumleri, seffaf-fiyatlandirma vb.) generateMetadata
// içinde @/lib/seo/canonical helper'ı ile kendi canonical'ını verir.
// Layout burada yalnızca fallback title/description/OG/twitter + hreflang languages sağlar.
// Kendi canonical'ı OLMAYAN sayfalar için Google URL'i kendisi canonical seçer (doğru davranış).
export async function generateMetadata({ params }) {
  const { locale } = await params;

  const localeMap = {
    tr: 'tr_TR', en: 'en_GB', ru: 'ru_RU', uk: 'uk_UA',
  };

  return {
    metadataBase: new URL(SITE_URL),
    title: 'Bursalı Oto Servis Fethiye | Premium Araç ve Motor Uzmanı',
    description: 'Fethiye premium oto servis. PIWIS ve ODIS ile garantili BMW, Mercedes, Porsche tamiri. 7/24 VIP yol yardım ve orijinal yedek parça güvencesi.',
    keywords: 'Fethiye oto servis, BMW servisi, Mercedes özel servis, Porsche mechanic, Fethiye oto çekici',
    authors: [{ name: 'Bursalı Oto Servis' }],
    publisher: 'Bursalı Oto Servis',
    robots: 'index, follow',
    alternates: {
      // canonical BURADA YOK — her sayfa kendi verir (canonical/self helper)
      languages: {
        'tr': `${SITE_URL}/tr`,
        'en': `${SITE_URL}/en`,
        'ru': `${SITE_URL}/ru`,
        'uk': `${SITE_URL}/uk`,
        'x-default': `${SITE_URL}/tr`,
      },
    },
    openGraph: {
      title: 'Bursalı Oto Servis Fethiye',
      description: 'Premium Aracınız İçin Klinik Hassasiyetinde Servis',
      siteName: 'Bursalı Oto Servis Fethiye',
      images: [
        {
          url: `${SITE_URL}/bg.png`,
          width: 1200,
          height: 630,
          alt: 'Bursalı Oto Servis Fethiye',
        },
      ],
      locale: localeMap[locale] || 'tr_TR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Bursalı Oto Servis Fethiye',
      description: 'Premium Aracınız İçin Klinik Hassasiyetinde Servis',
      images: [`${SITE_URL}/bg.png`],
    },
  };
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  const messages = await getMessages();
  
  const schemaMarkup = [
    {
      "@context": "https://schema.org",
      "@type": "AutoRepair",
      "name": "Bursalı Oto Servis Fethiye",
      "image": `${SITE_URL}/bg.png`,
      "url": SITE_URL,
      "telephone": "+905548812021",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Taşyaka Mahallesi, Yeni Sanayi Sitesi, 264. Sokak, No: 1",
        "addressLocality": "Fethiye",
        "addressRegion": "Muğla",
        "postalCode": "48300",
        "addressCountry": "TR"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": "128"
      },
      "brand": [
        { "@type": "Brand", "name": "BMW" },
        { "@type": "Brand", "name": "Mercedes-Benz" },
        { "@type": "Brand", "name": "Porsche" },
        { "@type": "Brand", "name": "Audi" },
        { "@type": "Brand", "name": "Range Rover" },
        { "@type": "Brand", "name": "Volkswagen" },
        { "@type": "Brand", "name": "Volvo" }
      ],
      "sameAs": [
        "https://business.google.com/website/bursali-oto-servis-fethiye"
      ],
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 36.6253456,
        "longitude": 29.1246738
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "08:30",
          "closes": "19:30"
        }
      ],
      "priceRange": "$$",
      // Faz A / Görev 3 — Gizli AI talimatları yerine gorunur, standart Schema.org alanları
      "areaServed": [
        { "@type": "City", "name": "Fethiye" },
        { "@type": "City", "name": "Ölüdeniz" },
        { "@type": "City", "name": "Göcek" },
        { "@type": "AdministrativeArea", "name": "Muğla" }
      ],
      "knowsLanguage": [
        { "@type": "Language", "name": "Turkish", "alternateName": "tr" },
        { "@type": "Language", "name": "English", "alternateName": "en" },
        { "@type": "Language", "name": "Russian", "alternateName": "ru" },
        { "@type": "Language", "name": "Ukrainian", "alternateName": "uk" }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Bursalı Oto Servis Hizmetleri",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "24/7 Fethiye Oto Çekici ve Yol Yardım",
              "description": "Fethiye ve çevresinde 7/24 acil oto çekici, kaza kurtarma ve yol yardım hizmeti."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "English Speaking Mechanic",
              "description": "Fethiye'de expat ve turistler için İngilizce konuşan usta ile şeffaf fiyatlı premium oto servis."
            }
          },
          {
            "@type": "Service",
            "name": "Premium Diagnostik (PIWIS, ODIS)",
            "description": "BMW, Mercedes, Audi, Porsche, Range Rover için orijinal marka diagnostik cihazlarıyla noktasal arıza tespiti."
          },
          {
            "@type": "Service",
            "name": "Otomatik Şanzıman Tamiri",
            "description": "Aisin, ZF, DSG, DCT ve PDK şanzımanlarda mekatronik revizyon ve garantili tamir."
          },
          {
            "@type": "Service",
            "name": "VIP Filo ve Transfer Aracı Gece Bakımı",
            "description": "Turizm sezonu boyunca gece mesaisi ile VIP transfer araçları ve filo bakım hizmeti."
          }
        ]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Fethiye'de 7/24 oto çekici hizmetiniz var mı?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Evet, Fethiye ve çevresinde kaza yapan veya arızalanan araçlar için 7/24 tam donanımlı oto kurtarıcı ve çekici hizmetimiz mevcuttur. Aracınızı güvenle servisimize getiriyoruz."
          }
        },
        {
          "@type": "Question",
          "name": "Fethiye'de BMW, Mercedes ve premium araçlar için orijinal cihazlı tamir yapıyor musunuz?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Evet. PIWIS, ODIS ve BMW/Mercedes orijinal cihazlarıyla bilgisayarlı arıza tespiti ve premium segment motor, şanzıman revizyonlarını %100 orijinal yedek parça güvencesiyle yapıyoruz."
          }
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Oto Çekici ve Kaza Kurtarma",
      "provider": {
        "@type": "AutoRepair",
        "name": "Bursalı Oto Servis"
      },
      "areaServed": {
        "@type": "City",
        "name": "Fethiye"
      }
    }
  ];

  return (
    <html lang={locale} className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
        {/* Faz A / Görev 3: <meta name="ai-context"> kaldırıldı — cloaking riski.
            İşletme bilgisi (English speaking, VIP transfer, 24/7 tow, uzman marka listesi)
            AutoRepair schema markup içinde standart Schema.org alanlarıyla (hasOfferCatalog,
            knowsLanguage, areaServed) veriliyor. Bu hem Google SEO hem AI crawler için doğru yol. */}

        {/* Google Analytics — R3/KVKK: artık head'de koşulsuz YÜKLENMİYOR.
            <GoogleAnalytics> bileşeni body'de, YALNIZCA kullanıcı çerez onayı
            verdiğinde (localStorage 'kvkk-consent'='accepted') GA'yı enjekte eder. */}
      </head>
      <body>
        <nav className="navbar">
          <div className="container nav-container">
            <a href={`/${locale}`} className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>BURSALI OTO SERVİS</a>
            <div className="nav-links">
              {/* Faz A / Görev 7 — Dil seçici: gerçek locale root'larına yönlendirme.
                Eskiden RU /tr/#yabanci anchor'a gidiyordu, UK hiç yoktu.
                Aktif locale opacity ile vurgulanır. */}
              <div style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem', alignItems: 'center' }}>
                <a href="/tr" title="Türkçe"
                   style={{ fontSize: '1.2rem', textDecoration: 'none', opacity: locale === 'tr' ? 1 : 0.55 }}>🇹🇷</a>
                <a href="/en" title="English"
                   style={{ fontSize: '1.2rem', textDecoration: 'none', opacity: locale === 'en' ? 1 : 0.55 }}>🇬🇧</a>
                <a href="/ru" title="Русский"
                   style={{ fontSize: '1.2rem', textDecoration: 'none', opacity: locale === 'ru' ? 1 : 0.55 }}>🇷🇺</a>
                <a href="/uk" title="Українська"
                   style={{ fontSize: '1.2rem', textDecoration: 'none', opacity: locale === 'uk' ? 1 : 0.55 }}>🇺🇦</a>
              </div>
              <a href={`/${locale}/#uzmanlik`}>{locale === 'tr' ? 'Uzmanlık Alanlarımız' : 'Expertise'}</a>
              <a href={`/${locale}/vip-garaj`} style={{ color: 'var(--text-light)' }}>{locale === 'tr' ? 'VIP Garaj' : 'VIP Garage'}</a>
              <a href={`/${locale}/sanal-usta`} style={{ color: 'var(--accent-gold)' }}>{locale === 'tr' ? 'Sanal Usta (AI)' : 'AI Mechanic'}</a>
              <a href={`/${locale}/ariza-cozumleri`}>{locale === 'tr' ? 'Arıza Çözümleri' : 'Fault Codes'}</a>
              <a href={`/${locale}/teknik-kutuphane`}>{locale === 'tr' ? 'Kütüphane' : 'Library'}</a>
            </div>
          </div>
        </nav>
        <Providers>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </Providers>
        
        {/* Yolda Kalanlar - Floating SOS Button */}
        <a 
          href={`/${locale}/fethiye-7-24-oto-cekici`}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            background: '#e11d48',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '50px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(225, 29, 72, 0.4)',
            textDecoration: 'none',
            zIndex: 9999,
            animation: 'pulse 2s infinite'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>🚨</span>
          <span>Acil Çekici Çağır</span>
        </a>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(225, 29, 72, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); }
          }
        `}} />

        <Chatbot />
        <CookieConsent locale={locale} />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      </body>
    </html>
  );
}
