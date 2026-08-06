import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Inter } from 'next/font/google';
import '../globals.css';
import Providers from '@/components/Providers';
import ClientWidgets from '@/components/ClientWidgets';
import Navigation from '@/components/Navigation';
import StructuredData from '@/components/StructuredData';
// BUILD FIX (Next.js 15): Server Component'te dynamic(..,{ssr:false}) YASAK.
// GoogleAnalytics zaten 'use client' + consent-guard'lı; normal import edilir (SSR'da zararsız).
import GoogleAnalytics from '@/components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter', display: 'swap', preload: true });

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

export const revalidate = 86400; // 1 day ISR Cache for all nested pages unless opted out

export function generateStaticParams() {
  return [{locale: 'tr'}, {locale: 'en'}, {locale: 'ru'}, {locale: 'uk'}, {locale: 'ar'}];
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
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
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        'tr': `${SITE_URL}/tr`,
        'en': `${SITE_URL}/en`,
        'ru': `${SITE_URL}/ru`,
        'uk': `${SITE_URL}/uk`,
        'ar': `${SITE_URL}/ar`,
        'x-default': `${SITE_URL}/tr`,
      },
    },
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
    icons: {
      icon: '/favicon.ico',
      apple: '/bg.png',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [`${SITE_URL}/bg.png`],
    },
  };
}


export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://static.cloudflareinsights.com" />
        <link rel="dns-prefetch" href="https://static.cloudflareinsights.com" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="AI Agent Specification" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="Full AI Agent Knowledge Base" />
        <script type="speculationrules" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            prefetch: [{
              source: "document",
              where: {
                and: [
                  { href_matches: "/*" },
                  { not: { href_matches: "/api/*" } },
                  { not: { href_matches: "*/login*" } }
                ]
              },
              eagerness: "moderate"
            }]
          })
        }} />
      </head>
      <body className="mobile-padded-body">
        <style dangerouslySetInnerHTML={{__html: `
          @media (max-width: 768px) {
            .mobile-padded-body {
              padding-bottom: calc(70px + env(safe-area-inset-bottom));
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
            0% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 0.9; }
          }
        `}} />
        <ClientWidgets locale={locale} />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-3SNV6H5568"} />
      </body>
    </html>
  );
}
