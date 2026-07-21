"use client";

import dynamic from 'next/dynamic';

// Optimize CLS by ensuring wrappers or components handle their own min-height if needed.
const Chatbot = dynamic(() => import('@/components/Chatbot'), { ssr: false });
const WhatsAppButton = dynamic(() => import('@/components/WhatsAppButton'), { ssr: false });
const CookieConsent = dynamic(() => import('@/components/CookieConsent'), { ssr: false });
const MobileStickyCTA = dynamic(() => import('@/components/MobileStickyCTA'), { ssr: false });

export default function ClientWidgets({ locale }) {
  return (
    <>
      <WhatsAppButton />
      <MobileStickyCTA />
      <Chatbot />
      <CookieConsent locale={locale} />
    </>
  );
}
