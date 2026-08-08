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

/**
 * Smart Title Truncation Helper
 * Truncates title to maxLen (default 60 chars) preserving word boundaries,
 * key entity keywords, and brand suffix without cutting mid-word or breaking sense.
 */
export function limitTitle(title, maxLen = 60) {
  if (!title || title.length <= maxLen) return title;

  const parts = title.split(' | ');
  if (parts.length > 1) {
    const brand = parts[parts.length - 1];
    const mainTitle = parts.slice(0, -1).join(' | ');
    const brandSuffix = ` | ${brand}`;
    
    if (brandSuffix.length >= maxLen - 10) {
      return truncateWords(title, maxLen);
    }
    
    const allowedMainLen = maxLen - brandSuffix.length;
    const truncatedMain = truncateWords(mainTitle, allowedMainLen);
    return `${truncatedMain}${brandSuffix}`;
  }

  return truncateWords(title, maxLen);
}

function truncateWords(str, maxLen) {
  if (str.length <= maxLen) return str;
  const words = str.split(' ');
  let result = '';
  for (const word of words) {
    if ((result + (result ? ' ' : '') + word).length > maxLen) {
      break;
    }
    result += (result ? ' ' : '') + word;
  }
  return result || str.substring(0, maxLen);
}

export function buildSEOContract({ locale, path, title, description, image = `${SITE_URL}/bg.png` }) {
  const canonical = buildCanonical(locale, path);
  const formattedTitle = limitTitle(title, 60);

  const ogLocaleMap = {
    tr: 'tr_TR',
    en: 'en_GB',
    ru: 'ru_RU',
    uk: 'uk_UA',
    ar: 'ar_SA',
  };

  return {
    title: formattedTitle,
    description,
    alternates: {
      canonical: canonical.canonical,
      languages: canonical.languages,
    },
    openGraph: {
      title: formattedTitle,
      description,
      url: canonical.canonical,
      siteName: 'Bursalı Oto Servis Fethiye',
      locale: ogLocaleMap[locale] || 'tr_TR',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: formattedTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: formattedTitle,
      description,
      images: [image],
    },
  };
}

export { SITE_URL, LOCALES, DEFAULT_LOCALE };
