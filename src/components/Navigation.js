import HamburgerMenu from './HamburgerMenu';

export default function Navigation({ locale }) {
  const getLinkClass = (path) => '';

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <a href={`/${locale}`} className="logo">
          BURSALI OTO SERVİS
        </a>
        
        {/* Hamburger Icon (Mobile Only) */}
        <HamburgerMenu />
        
        {/* Desktop and Mobile Menu Links */}
        <div className="nav-links">
          
          <a href={`/${locale}/ariza-cozumleri`} aria-label="Arıza Çözümleri" className="nav-link" data-path={`/${locale}/ariza-cozumleri`}>
            {locale === 'tr' ? 'Arıza Çözümleri' : 'Troubleshooting'}
          </a>
          
          <a href={`/${locale}/sanal-usta`} aria-label="Sanal Usta" className="nav-link" data-path={`/${locale}/sanal-usta`} style={{
            fontWeight: 900,
            textTransform: 'uppercase',
            animation: 'blink-sanal-usta 1.5s infinite alternate'
          }}>
            {locale === 'tr' ? 'SANAL USTA' : 'VIRTUAL MASTER'}
          </a>

          <a href={`/${locale}/kutuphane`} aria-label="Kütüphane" className="nav-link" data-path={`/${locale}/kutuphane`}>
            {locale === 'tr' ? 'Kütüphane' : 'Library'}
          </a>

          <a href={`/${locale}/vip-garaj`} aria-label="VIP Garaj" className="nav-link" data-path={`/${locale}/vip-garaj`}>
            {locale === 'tr' ? 'VIP Garaj' : 'VIP Garage'}
          </a>
          
          <a href={`/${locale}/hakkimizda`} aria-label="Hakkımızda" className="nav-link" data-path={`/${locale}/hakkimizda`}>
            {locale === 'tr' ? 'Hakkımızda' : 'About Us'}
          </a>

          <a href={`/${locale}/seffaf-fiyatlandirma`} aria-label="Şeffaf Fiyatlandırma" className="nav-link" data-path={`/${locale}/seffaf-fiyatlandirma`}>
            {locale === 'tr' ? 'Fiyatlandırma' : 'Pricing'}
          </a>
          
        </div>
      </div>
      {/* Vanilla JS ile active link highlight (hydrate gerektirmez) */}
      <script dangerouslySetInnerHTML={{__html: `
        document.addEventListener('DOMContentLoaded', () => {
          const links = document.querySelectorAll('.nav-links .nav-link');
          const currentPath = window.location.pathname;
          links.forEach(link => {
            const path = link.getAttribute('data-path');
            if (currentPath === path || currentPath.startsWith(path + '/')) {
              link.classList.add('active');
            }
          });
        });
      `}} />
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
