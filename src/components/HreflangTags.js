'use client';

import { usePathname } from 'next/navigation';

export default function HreflangTags() {
  const pathname = usePathname() || '/';
  // Remove the current locale prefix to get the generic path
  const pathWithoutLocale = pathname.replace(/^\/(tr|en|ru|uk|ar)/, '') || '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com';
  
  const locales = ['tr', 'en', 'ru', 'uk', 'ar'];
  
  return (
    <>
      {locales.map((l) => (
        <link key={l} rel="alternate" hrefLang={l} href={`${siteUrl}/${l}${pathWithoutLocale}`} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${siteUrl}/tr${pathWithoutLocale}`} />
    </>
  );
}
