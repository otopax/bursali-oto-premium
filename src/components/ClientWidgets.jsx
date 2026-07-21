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
    // We want to achieve zero TBT by delaying the hydration of non-critical widgets
    // until the user interacts with the page (or a fallback timeout).
    const handleInteraction = () => {
      setLoadWidgets(true);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('scroll', handleInteraction, { passive: true });
    window.addEventListener('mousemove', handleInteraction, { passive: true });
    window.addEventListener('touchstart', handleInteraction, { passive: true });
    window.addEventListener('keydown', handleInteraction, { passive: true });

    // Fallback if the user doesn't interact for 5 seconds
    const timer = setTimeout(handleInteraction, 5000);

    return () => {
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      clearTimeout(timer);
    };
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
