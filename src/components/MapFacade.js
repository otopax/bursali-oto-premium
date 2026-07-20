"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function MapFacade() {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load slightly before it comes into view
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative', 
        borderRadius: '16px', 
        overflow: 'hidden',
        minHeight: '320px',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isLoaded ? 'auto' : 'pointer'
      }}
      onClick={() => !isLoaded && setIsLoaded(true)}
    >
      {!isLoaded ? (
        <div style={{ textAlign: 'center', zIndex: 10 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
          <p style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>Haritayı Yüklemek İçin Tıklayın</p>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>Google Maps</p>
        </div>
      ) : (
        <iframe 
          title="Bursalı Oto Servis Fethiye Harita Konumu"
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12762.651717887754!2d29.1246738!3d36.6253456!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14c043e0988089bf%3A0x8f2d593f0b2f6385!2sBURSALI%20OTO%20SERV%C4%B0S!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str" 
          width="100%" 
          height="100%" 
          style={{ border: 0, position: 'absolute', top: 0, left: 0 }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade">
        </iframe>
      )}
    </div>
  );
}
