'use client';

import { useState } from 'react';
import { FaCar, FaWrench, FaTools, FaMicrochip, FaSearch } from 'react-icons/fa';

export default function LibraryInterface() {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('welcome');
  const [searchQuery, setSearchQuery] = useState('');

  const brands = [
    { id: 'bmw', name: 'BMW', icon: '🚙' },
    { id: 'mercedes', name: 'Mercedes-Benz', icon: '🚙' },
    { id: 'audi', name: 'Audi', icon: '🚙' },
    { id: 'porsche', name: 'Porsche', icon: '🏎️' },
    { id: 'volkswagen', name: 'Volkswagen', icon: '🚙' },
    { id: 'landrover', name: 'Land Rover', icon: '🚙' }
  ];

  const categories = [
    { id: 'fault_codes', name: 'Arıza Kodları (OBD-II)', icon: <FaWrench /> },
    { id: 'fuse_diagrams', name: 'Sigorta Şemaları', icon: <FaMicrochip /> },
    { id: 'maintenance', name: 'Periyodik Bakım', icon: <FaTools /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '80vh', fontFamily: 'monospace', background: '#050505', borderRadius: '16px', border: '1px solid #1f2937', overflow: 'hidden' }}>
      
      {/* Top Bar: Spotlight Search & Vehicle Selector */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #1f2937', background: 'rgba(20, 20, 25, 0.8)', backdropFilter: 'blur(10px)' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto 2rem auto' }}>
          <FaSearch style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} size={20} />
          <input 
            type="text" 
            placeholder="Kütüphanede ara... (Örn: P0171, N13 Silecek Sigortası)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem 1rem 1rem 3.5rem',
              fontSize: '1.2rem',
              background: '#09090b',
              border: '1px solid var(--accent-gold)',
              borderRadius: '999px',
              color: '#fff',
              outline: 'none',
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.1)'
            }}
          />
        </div>

        {/* Vehicle Selector */}
        <div>
          <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.8rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px' }}>Araç Seçin (Filtre)</div>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', justifyContent: 'center' }}>
            {brands.map(brand => (
              <button
                key={brand.id}
                onClick={() => setSelectedBrand(brand.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.8rem 1.5rem',
                  background: selectedBrand === brand.id ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)',
                  color: selectedBrand === brand.id ? '#000' : '#fff',
                  border: `1px solid ${selectedBrand === brand.id ? 'var(--accent-gold)' : '#334155'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{brand.icon}</span>
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Split View Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Sidebar (Accordion) */}
        <div style={{ width: '300px', borderRight: '1px solid #1f2937', background: '#0a0a0c', overflowY: 'auto' }}>
          <div style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Teknik Veriler
          </div>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.2rem 1.5rem',
                background: selectedCategory === cat.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                color: selectedCategory === cat.id ? 'var(--accent-gold)' : '#cbd5e1',
                border: 'none',
                borderLeft: `4px solid ${selectedCategory === cat.id ? 'var(--accent-gold)' : 'transparent'}`,
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.2s ease'
              }}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
          
          {selectedBrand && (
            <div style={{ padding: '2rem 1rem', marginTop: '2rem', borderTop: '1px solid #1f2937' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', padding: '1rem', borderRadius: '8px', color: '#60a5fa', fontSize: '0.9rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Sistem Bağlantısı</span>
                Seçilen Araç: {brands.find(b => b.id === selectedBrand)?.name} <br/>
                Orijinal Cihaz: {
                  ['bmw'].includes(selectedBrand) ? 'ICOM' :
                  ['mercedes'].includes(selectedBrand) ? 'Star Diagnosis' :
                  ['volkswagen', 'audi', 'porsche'].includes(selectedBrand) ? 'ODIS/PIWIS' : 'Lisanslı Cihaz'
                }
              </div>
            </div>
          )}
        </div>

        {/* Right Content Area (Blueprint Aesthetic) */}
        <div style={{ flex: 1, background: '#050505', backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '30px 30px', position: 'relative', overflowY: 'auto' }}>
          
          <div style={{ padding: '3rem', maxWidth: '900px' }}>
            {selectedCategory === 'welcome' && (
              <div style={{ textAlign: 'center', marginTop: '4rem', color: '#475569' }}>
                <FaCar size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h2 style={{ fontSize: '2rem', color: '#94a3b8', marginBottom: '1rem' }}>Bursalı Oto Teknik Veritabanı</h2>
                <p>Lütfen önce üst kısımdan aracınızı seçin veya doğrudan arama yapın.</p>
              </div>
            )}

            {selectedCategory === 'fault_codes' && (
              <div>
                <h2 style={{ color: 'var(--accent-gold)', fontSize: '2rem', marginBottom: '2rem', borderBottom: '1px solid #1f2937', paddingBottom: '1rem' }}>
                  Arıza Kodları (OBD-II) Veritabanı
                </h2>
                {selectedBrand ? (
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1f2937', borderRadius: '12px', padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <strong style={{ color: '#fff', fontSize: '1.2rem' }}>P0171</strong>
                      <span style={{ color: '#ef4444' }}>Kritik Seviye</span>
                    </div>
                    <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>Sistem Çok Fakir (Bank 1). Oksijen sensörü (O2), kütle hava akış sensörü (MAF) veya yakıt enjektörlerinde arıza olabilir. {brands.find(b=>b.id===selectedBrand)?.name} araçlarda kronik MAF sensörü kirlenmesi sık görülür.</p>
                  </div>
                ) : (
                  <p style={{ color: '#94a3b8' }}>Verileri görmek için lütfen bir marka seçin.</p>
                )}
              </div>
            )}

            {selectedCategory === 'fuse_diagrams' && (
              <div>
                <h2 style={{ color: 'var(--accent-gold)', fontSize: '2rem', marginBottom: '2rem', borderBottom: '1px solid #1f2937', paddingBottom: '1rem' }}>
                  Sigorta Şemaları ve Röle Diyagramları
                </h2>
                {selectedBrand ? (
                  <div style={{ border: '1px solid #3b82f6', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ background: '#1e3a8a', color: '#fff', padding: '1rem', fontWeight: 'bold' }}>
                      {brands.find(b=>b.id===selectedBrand)?.name} Motor İçi Sigorta Kutusu
                    </div>
                    <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                      <FaMicrochip size={64} color="#3b82f6" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                      <p style={{ color: '#93c5fd' }}>İnteraktif şema verisi yükleniyor...</p>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#94a3b8' }}>Verileri görmek için lütfen bir marka seçin.</p>
                )}
              </div>
            )}

            {selectedCategory === 'maintenance' && (
              <div>
                <h2 style={{ color: 'var(--accent-gold)', fontSize: '2rem', marginBottom: '2rem', borderBottom: '1px solid #1f2937', paddingBottom: '1rem' }}>
                  Periyodik Bakım Spesifikasyonları
                </h2>
                <p style={{ color: '#94a3b8' }}>Bakım verileri entegre ediliyor...</p>
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}
