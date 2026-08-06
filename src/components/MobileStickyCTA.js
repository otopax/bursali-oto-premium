"use client";

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/tracking';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function MobileStickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  const locale = (pathname?.split('/')[1] && ['tr', 'en', 'ru', 'uk', 'ar'].includes(pathname.split('/')[1])) 
    ? pathname.split('/')[1] 
    : 'tr';

  return (
    <div className="mobile-only" style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      zIndex: 9990,
      backgroundColor: 'rgba(9, 9, 11, 0.95)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(212, 175, 55, 0.3)',
      padding: '10px 12px calc(10px + env(safe-area-inset-bottom)) 12px',
      boxShadow: '0 -10px 25px rgba(0,0,0,0.8)',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1.2fr',
        gap: '8px',
        maxWidth: '500px',
        margin: '0 auto',
      }}>
        <a 
          href="https://wa.me/905548812021?text=Merhaba,%20web%20sitenizden%20ula%C5%9F%C4%B1yorum." 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => trackEvent('mobile_cta_click', { type: 'whatsapp' })}
          style={{
            backgroundColor: '#25D366',
            color: 'white',
            padding: '10px 0',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)'
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>💬</span>
          <span>WhatsApp</span>
        </a>

        <a 
          href="tel:+905548812021"
          onClick={() => trackEvent('mobile_cta_click', { type: 'call' })}
          style={{
            backgroundColor: '#e11d48',
            color: 'white',
            padding: '10px 0',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            boxShadow: '0 4px 10px rgba(225, 29, 72, 0.3)'
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>🚨</span>
          <span>Çekici</span>
        </a>

        <Link 
          href={`/${locale}/sanal-usta`} 
          style={{
            backgroundColor: '#b45309',
            color: 'white',
            padding: '10px 0',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            boxShadow: '0 4px 10px rgba(180, 83, 9, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>🤖</span>
          <span>Sanal Usta</span>
        </Link>
      </div>
    </div>
  );
}
