'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';

const BRAND_LOGOS = {
  'BMW': 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg',
  'Mercedes-Benz': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg',
  'Audi': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg',
  'Porsche': 'https://upload.wikimedia.org/wikipedia/de/2/2d/Porsche_Wappen.svg',
  'Volkswagen': 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg',
  'Land Rover': 'https://upload.wikimedia.org/wikipedia/en/4/4a/LandRover.svg',
  'Volvo': 'https://upload.wikimedia.org/wikipedia/commons/2/29/Volvo-Iron-Mark-Black.svg',
  'Opel': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Opel_logo_2020.svg'
};

export default function FaultsClientView({ locale, initialFaults }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Seçili marka state'i
  const [selectedBrand, setSelectedBrand] = useState(null);

  // 1. Markalara Göre Gruplama ve Sayılarına Göre Sıralama (Çok olan başa)
  // Bu tüm makaleler üzerinden yapılır (Arama yapılmadan)
  const groupedBrands = useMemo(() => {
    const groups = {};
    initialFaults.forEach(fault => {
      const brand = fault.brand || 'Diğer';
      if (!groups[brand]) {
        groups[brand] = [];
      }
      groups[brand].push(fault);
    });

    const sortedGroups = Object.keys(groups).map(brandName => ({
      name: brandName,
      logo: BRAND_LOGOS[brandName] || null,
      faults: groups[brandName]
    })).sort((a, b) => b.faults.length - a.faults.length);

    return sortedGroups;
  }, [initialFaults]);

  // 2. Filtreleme (Arama ve Seçili Markaya Göre)
  const filteredFaults = useMemo(() => {
    let result = initialFaults;
    
    if (selectedBrand) {
      result = result.filter(fault => fault.brand === selectedBrand);
    }

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(fault => 
        fault.title?.toLowerCase().includes(lowerSearch) ||
        fault.model?.toLowerCase().includes(lowerSearch) ||
        fault.brand?.toLowerCase().includes(lowerSearch)
      );
    }
    
    return result;
  }, [initialFaults, searchTerm, selectedBrand]);

  return (
    <>
      {/* Arama Modülü */}
      <div style={{ maxWidth: '600px', margin: '0 auto 3rem auto', position: 'relative' }}>
        <input 
          type="text" 
          placeholder="Arıza kodu, marka veya model arayın..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '1.2rem 1.5rem 1.2rem 3rem',
            fontSize: '1.1rem',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50px',
            color: 'white',
            outline: 'none',
            backdropFilter: 'blur(10px)',
            transition: 'border-color 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-gold)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
        />
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" height="24" 
          viewBox="0 0 24 24" 
          fill="none" stroke="currentColor" 
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
          style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>

      {/* Marka Izgarası (Görseldeki gibi Logolu Kartlar) */}
      <div style={{ marginBottom: '4rem' }}>
        <style dangerouslySetInnerHTML={{__html: `
          .brands-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          @media (min-width: 640px) {
            .brands-grid { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
          }
          @media (min-width: 1024px) {
            .brands-grid { grid-template-columns: repeat(5, 1fr); }
          }
          .brand-box {
            display: flex;
            align-items: center;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 0.75rem 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          /* Dark mode adaptation if the site is dark */
          .dark-theme-override .brand-box {
            background: rgba(30, 41, 59, 0.6);
            border-color: rgba(255, 255, 255, 0.1);
            color: #f8fafc;
          }
          .brand-box:hover, .brand-box.active {
            border-color: #d4af37;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(212, 175, 55, 0.15);
          }
          .brand-box.active {
            background: rgba(212, 175, 55, 0.05);
          }
          .brand-box-logo {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 1rem;
            border-right: 1px solid rgba(0,0,0,0.1);
            padding-right: 1rem;
          }
          .dark-theme-override .brand-box-logo {
            border-right-color: rgba(255,255,255,0.1);
          }
          .brand-box-logo img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
          .brand-box-name {
            font-weight: 600;
            font-size: 0.95rem;
            color: #0f172a;
          }
          .dark-theme-override .brand-box-name {
            color: #f8fafc;
          }
          .brand-box-count {
            margin-left: auto;
            background: #f1f5f9;
            color: #64748b;
            font-size: 0.75rem;
            padding: 2px 6px;
            border-radius: 12px;
            font-weight: 700;
          }
          .dark-theme-override .brand-box-count {
            background: rgba(255,255,255,0.1);
            color: #cbd5e1;
          }
        `}} />
        
        {/* We wrap with a class to apply dark mode styles properly without breaking global styles */}
        <div className="brands-grid dark-theme-override">
          <div 
            className={`brand-box ${selectedBrand === null ? 'active' : ''}`}
            onClick={() => setSelectedBrand(null)}
          >
            <div className="brand-box-name" style={{ marginLeft: '1rem' }}>TÜM MARKALAR</div>
            <div className="brand-box-count">{initialFaults.length}</div>
          </div>
          
          {groupedBrands.map(group => (
            <div 
              key={group.name} 
              className={`brand-box ${selectedBrand === group.name ? 'active' : ''}`}
              onClick={() => setSelectedBrand(group.name)}
            >
              <div className="brand-box-logo">
                {group.logo ? (
                  <img 
                    src={group.logo} 
                    alt={group.name} 
                    style={{ filter: (group.name === 'Volvo' || group.name === 'Audi') ? 'invert(1)' : 'none' }} 
                  />
                ) : (
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>{group.name.charAt(0)}</span>
                )}
              </div>
              <div className="brand-box-name">{group.name.toUpperCase()}</div>
              <div className="brand-box-count">{group.faults.length}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Arıza Listesi */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
          {selectedBrand ? `${selectedBrand} Arıza Çözümleri` : 'Tüm Arıza Çözümleri'}
        </h2>
        
        {filteredFaults.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0', background: 'rgba(15,23,42,0.4)', borderRadius: '16px' }}>
            Aradığınız kritere uygun arıza çözümü bulunamadı.
          </div>
        ) : (
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {filteredFaults.map((fault) => (
              <Link 
                key={fault.id} 
                href={`/${locale}/ariza-cozumleri/${fault.id}`}
                className="glass-panel hover-gold-border"
                style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', textDecoration: 'none', transition: 'all 0.3s', borderRadius: '16px' }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '4px 10px', 
                    background: 'rgba(212, 175, 55, 0.1)', 
                    fontSize: '0.75rem', 
                    fontWeight: '700', 
                    color: 'var(--accent-gold)', 
                    borderRadius: '12px',
                    textTransform: 'uppercase'
                  }}>
                    {fault.brand}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                  {fault.title}
                </h3>
                {fault.model && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
                    {fault.model}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
