import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter, Outfit } from 'next/font/google';
import '../globals.css';
import dynamic from 'next/dynamic';
import TopBanner from '@/components/TopBanner';
import Providers from '@/components/Providers';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const Chatbot = dynamic(() => import('@/components/Chatbot'));
const WhatsAppButton = dynamic(() => import('@/components/WhatsAppButton'));
const CookieConsent = dynamic(() => import('@/components/CookieConsent'));
const MobileStickyCTA = dynamic(() => import('@/components/MobileStickyCTA'));
import SecurityShield from '@/components/SecurityShield';
import { businessData } from '@/lib/business';
import Navigation from '@/components/Navigation';

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
export const viewport = {
  themeColor: '#09090b', // var(--bg-dark)
  width: 'device-width',
  initialScale: 1,
};

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
  
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": businessData.name,
    "image": businessData.image,
    "url": businessData.url,
    "telephone": businessData.telephone,
    "priceRange": businessData.priceRange,
    "address": {
      "@type": "PostalAddress",
      ...businessData.address
    },
    "geo": {
      "@type": "GeoCoordinates",
      ...businessData.geo
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      ...businessData.openingHoursSpecification[0]
    },
    "areaServed": businessData.areaServed,
    "knowsLanguage": businessData.knowsLanguage.map(lang => ({
      "@type": "Language",
      "name": lang === "tr" ? "Turkish" : lang === "en" ? "English" : lang === "ru" ? "Russian" : lang === "uk" ? "Ukrainian" : lang === "ar" ? "Arabic" : lang,
      "alternateName": lang
    })),
    "sameAs": businessData.sameAs,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Bursalı Oto Servis Hizmetleri",
      "itemListElement": businessData.makesOffer.map(offer => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": offer.name,
          "description": offer.description
        }
      }))
    }
  };

  return (
    <html lang={locale} className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      </head>
      <body>
        <SecurityShield />
        <Navigation locale={locale} />
        <Providers>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </Providers>
        
        {/* Yolda Kalanlar - Floating SOS Button (Desktop only) */}
        <a 
          href={`/${locale}/fethiye-7-24-oto-cekici`}
          className="desktop-only items-center gap-2"
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            background: '#e11d48',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '50px',
            fontWeight: 'bold',
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
        <WhatsAppButton />
        <MobileStickyCTA />
        <Chatbot />
        <CookieConsent locale={locale} />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      </body>
    </html>
  );
}
