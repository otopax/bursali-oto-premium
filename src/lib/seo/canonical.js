/**
 * Ortak canonical + hreflang alternates helper (Faz A / Görev 2).
 * Her sayfanın generateMetadata'sında import edilir, aynı formatta
 * tam-URL canonical + 4 dil için alternates döndürür.
 *
 * Kullanım:
 *   import { buildCanonical } from '@/lib/seo/canonical';
 *   export async function generateMetadata({ params }) {
 *     const { locale } = await params;
 *     return {
 *       title: '...',
 *       alternates: buildCanonical(locale, '/blog'),
 *     };
 *   }
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com';
const LOCALES = ['tr', 'en', 'ru', 'uk'];
const DEFAULT_LOCALE = 'tr';

/**
 * @param {string} locale - Şu anki locale (tr, en, ru, uk)
 * @param {string} path - Locale sonrası path (/blog, /ariza-cozumleri/p0171 vb.). Baş "/" gerekir.
 * @returns {{ canonical: string, languages: Record<string,string> }}
 */
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

export { SITE_URL, LOCALES, DEFAULT_LOCALE };
