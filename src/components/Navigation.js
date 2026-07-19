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

  const getLinkStyle = (path) => ({
    fontWeight: isActive(path) ? 'bold' : 'normal',
    color: isActive(path) ? 'var(--primary)' : 'var(--text-light)',
    borderBottom: isActive(path) ? '2px solid var(--primary)' : '2px solid transparent',
    paddingBottom: '4px',
    transition: 'all 0.3s ease',
    minHeight: '48px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '0.75rem 1rem'
  });

  return (
    <nav className="navbar" style={{ position: 'fixed', width: '100%', top: 0, zIndex: 1000, background: 'var(--bg-dark)' }}>
      <div className="container nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href={`/${locale}`} className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>BURSALI OTO SERVİS</a>
        
        {/* Hamburger Icon (Mobile Only) */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden flex items-center justify-center p-2 text-white bg-transparent border-none outline-none"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Menüyü Kapat" : "Menüyü Aç"}
          style={{ width: '48px', height: '48px' }}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes blink-sanal-usta {
            0% { opacity: 1; color: #ffb700; text-shadow: 0 0 5px rgba(255, 183, 0, 0.5); }
            50% { opacity: 0.6; color: #ff4500; text-shadow: 0 0 15px rgba(255, 69, 0, 0.9); }
            100% { opacity: 1; color: #ffb700; text-shadow: 0 0 5px rgba(255, 183, 0, 0.5); }
          }
          .blink-sanal-usta {
            animation: blink-sanal-usta 1.5s infinite alternate;
          }
        `}} />
        
        {/* Desktop and Mobile Menu Links */}
        <div className={`nav-links w-full md:w-auto md:flex items-center gap-6 ${isOpen ? 'flex flex-col absolute top-[64px] left-0 bg-[#09090b] border-b border-gray-800 pb-6 pt-4' : 'hidden md:flex'}`}>
          
          <a href={`/${locale}/ariza-cozumleri`} aria-label="Arıza Çözümleri" style={getLinkStyle('/ariza-cozumleri')}>
            {locale === 'tr' ? 'Arıza Çözümleri' : 'Troubleshooting'}
          </a>
          
          <a href={`/${locale}/sanal-usta`} aria-label="Sanal Usta" className="blink-sanal-usta" style={{ 
            ...getLinkStyle('/sanal-usta'), 
            fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: 'none' 
          }}>
            {locale === 'tr' ? 'SANAL USTA' : 'VIRTUAL MASTER'}
          </a>

          <a href={`/${locale}/kutuphane`} aria-label="Kütüphane" style={getLinkStyle('/kutuphane')}>
            {locale === 'tr' ? 'Kütüphane' : 'Library'}
          </a>

          <a href={`/${locale}/vip-garaj`} aria-label="VIP Garaj" style={getLinkStyle('/vip-garaj')}>
            {locale === 'tr' ? 'VIP Garaj' : 'VIP Garage'}
          </a>
          
          <a href={`/${locale}/hakkimizda`} aria-label="Hakkımızda" style={getLinkStyle('/hakkimizda')}>
            {locale === 'tr' ? 'Hakkımızda' : 'About Us'}
          </a>

          <a href={`/${locale}/seffaf-fiyatlandirma`} aria-label="Şeffaf Fiyatlandırma" style={getLinkStyle('/seffaf-fiyatlandirma')}>
            {locale === 'tr' ? 'Fiyatlandırma' : 'Pricing'}
          </a>
          
        </div>
      </div>
    </nav>
  );
}
