'use client';

import { usePathname } from 'next/navigation';

export default function Navigation({ locale }) {
  const pathname = usePathname();
  
  // Helper to determine if a link is active
  const isActive = (path) => {
    return pathname === `/${locale}${path}` || pathname.startsWith(`/${locale}${path}/`);
  };

  const getLinkStyle = (path) => ({
    fontWeight: isActive(path) ? 'bold' : 'normal',
    color: isActive(path) ? 'var(--primary)' : 'var(--text-light)',
    borderBottom: isActive(path) ? '2px solid var(--primary)' : '2px solid transparent',
    paddingBottom: '4px',
    transition: 'all 0.3s ease'
  });

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <a href={`/${locale}`} className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>BURSALI OTO SERVİS</a>
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
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          
          {/* Arıza Çözümleri (combined with Blog) */}
          <a 
            href={`/${locale}/ariza-cozumleri`} 
            aria-label="Arıza Çözümleri"
            style={getLinkStyle('/ariza-cozumleri')}
          >
            {locale === 'tr' ? 'Arıza Çözümleri' : 'Troubleshooting'}
          </a>
          
          {/* Sanal Usta - In the middle, ALL CAPS */}
          <a 
            href={`/${locale}/sanal-usta`} 
            aria-label="Sanal Usta"
            className="blink-sanal-usta"
            style={{ 
              ...getLinkStyle('/sanal-usta'),
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderBottom: 'none' // Remove border so it looks more like a badge/button
            }}
          >
            {locale === 'tr' ? 'SANAL USTA' : 'VIRTUAL MASTER'}
          </a>

          {/* Kütüphane */}
          <a 
            href={`/${locale}/kutuphane`} 
            aria-label="Kütüphane"
            style={getLinkStyle('/kutuphane')}
          >
            {locale === 'tr' ? 'Kütüphane' : 'Library'}
          </a>

          {/* VIP Garaj - Rightmost */}
          <a 
            href={`/${locale}/vip-garaj`} 
            aria-label="VIP Garaj"
            style={getLinkStyle('/vip-garaj')}
          >
            {locale === 'tr' ? 'VIP Garaj' : 'VIP Garage'}
          </a>
          
        </div>
      </div>
    </nav>
  );
}
