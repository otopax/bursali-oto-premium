'use client';

export default function TrustBadges({ locale }) {
  const badges = [
    {
      id: 'warranty',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      ),
      title: locale === 'tr' ? '1 Yıl Garanti' : '1-Year Warranty',
      description: locale === 'tr' 
        ? 'Tüm mekanik onarımlarda ve yedek parçalarda yasal garanti' 
        : 'Legal guarantee on all mechanical repairs and spare parts',
    },
    {
      id: 'parts',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
          <path d="M2 12h20"/>
        </svg>
      ),
      title: locale === 'tr' ? '%100 Orijinal Parça' : '100% Genuine Parts',
      description: locale === 'tr'
        ? 'Sadece OEM ve lisanslı birinci kalite yedek parça kullanımı'
        : 'Exclusive use of OEM and licensed first-quality spare parts',
    },
    {
      id: 'pricing',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
          <line x1="7" y1="15" x2="7.01" y2="15"/>
          <line x1="11" y1="15" x2="13" y2="15"/>
        </svg>
      ),
      title: locale === 'tr' ? 'Şeffaf Fiyatlandırma' : 'No Hidden Fees',
      description: locale === 'tr'
        ? 'Sürpriz maliyet yok. İşleme başlamadan önce kesin fiyat onayı.'
        : 'No surprise costs. Final price approval before any work begins.',
    },
    {
      id: 'security',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
      title: locale === 'tr' ? '7/24 Güvenli Otopark' : '24/7 Secure Parking',
      description: locale === 'tr'
        ? 'Aracınız kamera sistemleriyle izlenen özel alanımızda güvende.'
        : 'Your vehicle is safe in our private area monitored by CCTV.',
    }
  ];

  return (
    <div className="trust-badges-container" style={{ margin: '4rem 0' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .trust-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }
        .trust-card {
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.8));
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 12px;
          padding: 2rem 1.5rem;
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .trust-card:hover {
          transform: translateY(-5px);
          border-color: rgba(212, 175, 55, 0.5);
          box-shadow: 0 10px 30px -10px rgba(212, 175, 55, 0.2);
        }
        .trust-icon {
          color: var(--accent-gold);
          margin-bottom: 1rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(212, 175, 55, 0.1);
          padding: 1rem;
          border-radius: 50%;
        }
        .trust-title {
          color: #f8fafc;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.8rem;
        }
        .trust-desc {
          color: #94a3b8;
          font-size: 0.9rem;
          line-height: 1.5;
        }
      `}} />

      <div className="trust-grid">
        {badges.map((badge) => (
          <div key={badge.id} className="trust-card">
            <div className="trust-icon">
              {badge.icon}
            </div>
            <h4 className="trust-title">{badge.title}</h4>
            <p className="trust-desc">{badge.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
