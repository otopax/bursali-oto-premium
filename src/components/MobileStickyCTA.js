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
    <div className="mobile-only" style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'max-content',
      maxWidth: 'calc(100% - 100px)', // Leave space for chat widget on the right
      backgroundColor: 'rgba(20, 20, 20, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '50px',
      zIndex: 9998,
      padding: '8px',
      display: 'flex',
      gap: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
      animation: 'slideUp 0.3s ease-out forwards'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translate(-50%, 150%); }
          to { transform: translate(-50%, 0); }
        }
      `}} />
      <a 
        href="tel:+905548812021" 
        onClick={() => trackEvent('mobil_sticky_tel_tikla', { location: 'sticky_bar' })}
        style={{
          backgroundColor: '#991b1b', // Dark red
          color: 'white',
          padding: '12px 20px',
          borderRadius: '40px',
          fontWeight: 'bold',
          fontSize: '0.95rem',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' // Subtle dark shadow instead of neon
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>📞</span> 
        <span>Ara</span>
      </a>
      <a 
        href="https://wa.me/905548812021" 
        onClick={() => trackEvent('mobil_sticky_wa_tikla', { location: 'sticky_bar' })}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          backgroundColor: '#166534', // Dark green
          color: 'white',
          padding: '12px 20px',
          borderRadius: '40px',
          fontWeight: 'bold',
          fontSize: '0.95rem',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' // Subtle dark shadow instead of neon
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>💬</span> 
        <span>WhatsApp</span>
      </a>
    </div>
  );
}
