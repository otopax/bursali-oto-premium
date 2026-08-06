const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com';
const LOCALES = ['tr', 'en', 'ru', 'uk', 'ar'];
const DEFAULT_LOCALE = 'tr';

export function buildCanonical(locale, path = '') {
  const normalizedPath = path.startsWith('/') || path === '' ? path : `/${path}`;
  const languages = {};
  LOCALES.forEach((loc) => {
    languages[loc] = `${SITE_URL}/${loc}${normalizedPath}`;
  });
  languages['x-default'] = `${SITE_URL}/${DEFAULT_LOCALE}${normalizedPath}`;

  return {
    canonical: `${SITE_URL}/${locale}${normalizedPath}`,
    languages,
  };
}

export function buildSEOContract({ locale, path, title, description, image = `${SITE_URL}/bg.png` }) {
  const canonical = buildCanonical(locale, path);

  const ogLocaleMap = {
    tr: 'tr_TR',
    en: 'en_GB',
    ru: 'ru_RU',
    uk: 'uk_UA',
    ar: 'ar_SA',
  };

  return {
    title,
    description,
    alternates: {
      canonical: canonical.canonical,
      languages: canonical.languages,
    },
    openGraph: {
      title,
      description,
      url: canonical.canonical,
      siteName: 'Bursalı Oto Servis Fethiye',
      locale: ogLocaleMap[locale] || 'tr_TR',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export { SITE_URL, LOCALES, DEFAULT_LOCALE };
