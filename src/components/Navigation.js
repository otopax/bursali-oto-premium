import HamburgerMenu from './HamburgerMenu';
import Link from 'next/link';

export default function Navigation({ locale }) {
  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link href={`/${locale}`} className="logo">
          BURSALI OTO SERVİS
        </Link>
        
        {/* Hamburger Icon (Mobile Only) */}
        <HamburgerMenu />
        
        {/* Desktop and Mobile Menu Links */}
        <div className="nav-links">
          
          <Link href={`/${locale}/arac-katalogu`} aria-label="Arıza Çözümleri" className="nav-link">
            {locale === 'tr' ? 'Arıza Çözümleri' : 'Troubleshooting'}
          </Link>
          
          <Link href={`/${locale}/sanal-usta`} aria-label="Sanal Usta" className="nav-link" style={{
            fontWeight: 900,
            textTransform: 'uppercase',
            animation: 'blink-sanal-usta 1.5s infinite alternate'
          }}>
            {locale === 'tr' ? 'SANAL USTA' : 'VIRTUAL MASTER'}
          </Link>

          <Link href={`/${locale}/kutuphane`} aria-label="Kütüphane" className="nav-link">
            {locale === 'tr' ? 'Kütüphane' : 'Library'}
          </Link>

          <Link href={`/${locale}/vip-garaj`} aria-label="VIP Garaj" className="nav-link">
            {locale === 'tr' ? 'VIP Garaj' : 'VIP Garage'}
          </Link>
          
          <Link href={`/${locale}/hakkimizda`} aria-label="Hakkımızda" className="nav-link">
            {locale === 'tr' ? 'Hakkımızda' : 'About Us'}
          </Link>

          <Link href={`/${locale}/seffaf-fiyatlandirma`} aria-label="Şeffaf Fiyatlandırma" className="nav-link">
            {locale === 'tr' ? 'Fiyatlandırma' : 'Pricing'}
          </Link>
          
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
