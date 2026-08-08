'use client';

// KVKK/GDPR: Google Analytics YALNIZCA kullanıcı çerez onayı verdiğinde yüklenir (R3).
// Onay 'accepted' değilse hiçbir GA scripti/çerezi enjekte edilmez.
// CookieConsent bileşeni onay değişince 'kvkk-consent-changed' event'i yayar.

import Script from 'next/script';
import { useEffect, useState } from 'react';

export default function GoogleAnalytics({ gaId }) {
  const [allowed, setAllowed] = useState(false);
  
  // Eğer env boş gelirse hardcoded fallback kullan
  const effectiveGaId = gaId || "G-3SNV6H5568";

  useEffect(() => {
    if (!effectiveGaId) return;
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

  if (!effectiveGaId || !allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${effectiveGaId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${effectiveGaId}', { page_path: window.location.pathname });
          `,
        }}
      />
    </>
  );
}
