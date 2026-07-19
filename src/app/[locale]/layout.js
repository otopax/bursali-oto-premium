import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Inter, Outfit } from 'next/font/google';
import '../globals.css';
import dynamic from 'next/dynamic';
import TopBanner from '@/components/TopBanner';
import Providers from '@/components/Providers';
import GoogleAnalytics from '@/components/GoogleAnalytics';

import HreflangTags from '@/components/HreflangTags';

const Chatbot = dynamic(() => import('@/components/Chatbot'));
const WhatsAppButton = dynamic(() => import('@/components/WhatsAppButton'));
const CookieConsent = dynamic(() => import('@/components/CookieConsent'));
const MobileStickyCTA = dynamic(() => import('@/components/MobileStickyCTA'));

import { businessData } from '@/lib/business';
import Navigation from '@/components/Navigation';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';


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
  maximumScale: 5,
  userScalable: true,
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const localeMap = {
    tr: 'tr_TR', en: 'en_GB', ru: 'ru_RU', uk: 'uk_UA', ar: 'ar_AE'
  };

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      template: '%s | Bursalı Oto Servis',
      default: t('title')
    },
    description: t('description'),
    authors: [{ name: 'Bursalı Oto Servis' }],
    publisher: 'Bursalı Oto Servis',
    robots: 'index, follow',
    openGraph: {
      title: t('title'),
      description: t('description'),
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
      title: t('title'),
      description: t('description'),
      images: [`${SITE_URL}/bg.png`],
    },
  };
}

import StructuredData from '@/components/StructuredData';

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <HreflangTags />
      </head>
      <body className="mobile-padded-body">
        <style dangerouslySetInnerHTML={{__html: `
          @media (max-width: 768px) {
            .mobile-padded-body {
              padding-bottom: calc(70px + env(safe-area-inset-bottom)) !important;
            }
          }
        `}} />
        <StructuredData />

        <Navigation locale={locale} />
        <Providers>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </Providers>
        <Analytics />
        <SpeedInsights />
        
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
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-3SNV6H5568"} />
      </body>
    </html>
  );
}
