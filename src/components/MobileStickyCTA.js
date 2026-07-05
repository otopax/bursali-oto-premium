"use client";

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/tracking';

export default function MobileStickyCTA() {
  const [isVisible, setIsVisible] = useState(false);

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

  if (!isVisible) return null;

  return (
    <div className="md:hidden" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(212, 175, 55, 0.3)',
      zIndex: 9998,
      padding: '10px 16px',
      display: 'flex',
      gap: '12px',
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
      animation: 'slideUp 0.3s ease-out forwards'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}} />
      <a 
        href="tel:+905548812021" 
        onClick={() => trackEvent('mobil_sticky_tel_tikla', { location: 'sticky_bar' })}
        style={{
          flex: 1,
          backgroundColor: '#e11d48',
          color: 'white',
          textAlign: 'center',
          padding: '12px 0',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <span>📞</span> Hemen Ara
      </a>
      <a 
        href="https://wa.me/905548812021" 
        onClick={() => trackEvent('mobil_sticky_wa_tikla', { location: 'sticky_bar' })}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          flex: 1,
          backgroundColor: '#25D366',
          color: 'white',
          textAlign: 'center',
          padding: '12px 0',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <span>💬</span> WhatsApp
      </a>
    </div>
  );
}
