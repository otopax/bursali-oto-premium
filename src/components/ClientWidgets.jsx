"use client";

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Optimize CLS by ensuring wrappers or components handle their own min-height if needed.
const Chatbot = dynamic(() => import('@/components/Chatbot'), { ssr: false });
const WhatsAppButton = dynamic(() => import('@/components/WhatsAppButton'), { ssr: false });
const CookieConsent = dynamic(() => import('@/components/CookieConsent'), { ssr: false });
const MobileStickyCTA = dynamic(() => import('@/components/MobileStickyCTA'), { ssr: false });

export default function ClientWidgets({ locale }) {
  const [loadWidgets, setLoadWidgets] = useState(false);

  useEffect(() => {
    // Tarayıcı boşta (idle) olduğunda yükle (React 19 optimizasyonu)
    const load = () => setLoadWidgets(true);
    
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(load);
    } else {
      const timer = setTimeout(load, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <CookieConsent locale={locale} />
      {loadWidgets && (
        <>
          <WhatsAppButton />
          <MobileStickyCTA />
          <Chatbot />
        </>
      )}
    </>
  );
}
