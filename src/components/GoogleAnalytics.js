'use client';

// KVKK/GDPR: Google Analytics YALNIZCA kullanıcı çerez onayı verdiğinde yüklenir (R3).
// Onay 'accepted' değilse hiçbir GA scripti/çerezi enjekte edilmez.
// CookieConsent bileşeni onay değişince 'kvkk-consent-changed' event'i yayar.

import Script from 'next/script';
import { useEffect, useState } from 'react';

export default function GoogleAnalytics({ gaId }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!gaId) return;
    const check = () => {
      setAllowed(
        typeof window !== 'undefined' &&
          window.localStorage.getItem('kvkk-consent') === 'accepted'
      );
    };
    check();
    window.addEventListener('kvkk-consent-changed', check);
    return () => window.removeEventListener('kvkk-consent-changed', check);
  }, [gaId]);

  if (!gaId || !allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { page_path: window.location.pathname });
        `}
      </Script>
    </>
  );
}
