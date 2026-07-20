'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navigation({ locale }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // Helper to determine if a link is active
  const isActive = (path) => {
    return pathname === `/${locale}${path}` || pathname.startsWith(`/${locale}${path}/`);
  };

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const getLinkClass = (path) => {
    let baseClass = isActive(path) ? 'active' : '';
    return baseClass;
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <a href={`/${locale}`} className="logo">
          BURSALI OTO SERVİS
        </a>
        
        {/* Hamburger Icon (Mobile Only) */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="hamburger-icon"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Menüyü Kapat" : "Menüyü Aç"}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
        
        {/* Desktop and Mobile Menu Links */}
        <div className={`nav-links ${isOpen ? 'mobile-open' : ''}`}>
          
          <a href={`/${locale}/ariza-cozumleri`} aria-label="Arıza Çözümleri" className={getLinkClass('/ariza-cozumleri')}>
            {locale === 'tr' ? 'Arıza Çözümleri' : 'Troubleshooting'}
          </a>
          
          <a href={`/${locale}/sanal-usta`} aria-label="Sanal Usta" style={{
            fontWeight: 900,
            textTransform: 'uppercase',
            animation: 'blink-sanal-usta 1.5s infinite alternate'
          }} className={getLinkClass('/sanal-usta')}>
            {locale === 'tr' ? 'SANAL USTA' : 'VIRTUAL MASTER'}
          </a>

          <a href={`/${locale}/kutuphane`} aria-label="Kütüphane" className={getLinkClass('/kutuphane')}>
            {locale === 'tr' ? 'Kütüphane' : 'Library'}
          </a>

          <a href={`/${locale}/vip-garaj`} aria-label="VIP Garaj" className={getLinkClass('/vip-garaj')}>
            {locale === 'tr' ? 'VIP Garaj' : 'VIP Garage'}
          </a>
          
          <a href={`/${locale}/hakkimizda`} aria-label="Hakkımızda" className={getLinkClass('/hakkimizda')}>
            {locale === 'tr' ? 'Hakkımızda' : 'About Us'}
          </a>

          <a href={`/${locale}/seffaf-fiyatlandirma`} aria-label="Şeffaf Fiyatlandırma" className={getLinkClass('/seffaf-fiyatlandirma')}>
            {locale === 'tr' ? 'Fiyatlandırma' : 'Pricing'}
          </a>
          
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blink-sanal-usta {
          0% { opacity: 1; color: #ffb700; text-shadow: 0 0 5px rgba(255, 183, 0, 0.5); }
          50% { opacity: 0.6; color: #ff4500; text-shadow: 0 0 15px rgba(255, 69, 0, 0.9); }
          100% { opacity: 1; color: #ffb700; text-shadow: 0 0 5px rgba(255, 183, 0, 0.5); }
        }
        .nav-links a.active {
          color: #ffb700;
          font-weight: bold;
        }
      `}} />
    </nav>
  );
}
