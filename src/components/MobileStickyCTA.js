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
      // Show the CTA after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show it on sanal-usta now because it's consolidated
  if (!isVisible) return null;

  return (
    <div className="mobile-only" style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      width: '100%',
      backgroundColor: 'rgba(20, 20, 20, 0.95)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(212, 175, 55, 0.3)',
      zIndex: 9998,
      padding: '12px 10px',
      paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
      gap: '8px',
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.8)',
      animation: 'slideUp 0.3s ease-out forwards'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(150%); }
          to { transform: translateY(0); }
        }
      `}} />
      
      <a 
        href="tel:+905548812021" 
        aria-label="Hemen Ara"
        onClick={() => trackEvent('mobil_sticky_tel_tikla', { location: 'sticky_bar' })}
        style={{
          backgroundColor: '#991b1b', // Dark red
          color: 'white',
          padding: '10px 0',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '0.85rem',
          textDecoration: 'none',
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: '4px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>📞</span> 
        <span className="hidden min-[360px]:inline">Ara</span>
      </a>

      <a 
        href="https://wa.me/905548812021" 
        aria-label="WhatsApp"
        onClick={() => trackEvent('mobil_sticky_wa_tikla', { location: 'sticky_bar' })}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          backgroundColor: '#166534', // Dark green
          color: 'white',
          padding: '10px 0',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '0.85rem',
          textDecoration: 'none',
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: '4px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>💬</span> 
        <span className="hidden min-[360px]:inline">WhatsApp</span>
      </a>

      <a 
        href="tel:+905548812021" 
        onClick={() => trackEvent('mobil_sticky_cekici_tikla', { location: 'sticky_bar' })}
        style={{
          backgroundColor: '#e11d48', // Bright red
          color: 'white',
          padding: '10px 0',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '0.85rem',
          textDecoration: 'none',
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: '4px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>🚨</span> 
        <span className="hidden min-[360px]:inline">Çekici</span>
      </a>

      <Link 
        href="/tr/sanal-usta" 
        style={{
          backgroundColor: '#b45309', // Dark orange/gold
          color: 'white',
          padding: '10px 0',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '0.85rem',
          textDecoration: 'none',
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: '4px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>🤖</span> 
        <span className="hidden min-[360px]:inline">Usta</span>
      </Link>
    </div>
  );
}
