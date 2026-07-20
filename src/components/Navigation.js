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
    return `whitespace-nowrap px-4 py-3 md:px-3 md:py-2 transition-colors duration-200 border-b-2 md:border-b-2 border-b-white/5 ${
      isActive(path) 
        ? 'font-bold text-[#ffb700] md:border-b-[#ffb700] bg-white/5 md:bg-transparent' 
        : 'font-medium text-gray-300 md:border-b-transparent hover:text-[#ffb700] hover:bg-white/5 md:hover:bg-transparent'
    }`;
  };

  return (
    <nav className="fixed w-full top-0 z-[1000] bg-[#1a1a1a] shadow-lg border-b border-white/10">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <a href={`/${locale}`} className="text-xl md:text-2xl font-bold text-white no-underline whitespace-nowrap tracking-wide">
          BURSALI OTO SERVİS
        </a>
        
        {/* Hamburger Icon (Mobile Only) */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden p-2 text-white focus:outline-none"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Menüyü Kapat" : "Menüyü Aç"}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
        
        {/* Desktop and Mobile Menu Links */}
        <div className={`
          absolute top-16 left-0 w-full bg-[#1a1a1a] flex-col shadow-2xl
          md:static md:w-auto md:bg-transparent md:flex-row md:flex md:gap-4 md:shadow-none
          ${isOpen ? 'flex' : 'hidden'}
        `}>
          
          <a href={`/${locale}/ariza-cozumleri`} aria-label="Arıza Çözümleri" className={getLinkClass('/ariza-cozumleri')}>
            {locale === 'tr' ? 'Arıza Çözümleri' : 'Troubleshooting'}
          </a>
          
          <a href={`/${locale}/sanal-usta`} aria-label="Sanal Usta" className={`
            whitespace-nowrap px-4 py-3 md:px-3 md:py-2 transition-colors duration-200 font-black uppercase tracking-wider
            animate-[blink-sanal-usta_1.5s_infinite_alternate] border-b border-b-white/5 md:border-none
          `}>
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
      `}} />
    </nav>
  );
}
