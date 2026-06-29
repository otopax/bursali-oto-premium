"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function Gallery() {
  const [visibleCount, setVisibleCount] = useState(6);
  const totalPhotos = 47;
  
  // Generate array of image paths: 01 to 47
  const photos = Array.from({ length: totalPhotos }, (_, i) => {
    const num = (i + 1).toString().padStart(2, '0');
    return `/gallery/bursali-oto-servis-fethiye-${num}.jpeg`;
  });

  const handleLoadMore = () => {
    // Load 6 more photos each time
    setVisibleCount(prev => Math.min(prev + 6, totalPhotos));
  };

  return (
    <div className="container">
      <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Servisimizden Kareler</h2>
      <div className="photo-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {photos.slice(0, visibleCount).map((src, index) => (
          <div key={index} className="photo-item" style={{ borderRadius: '12px', overflow: 'hidden', height: '300px', position: 'relative' }}>
            <Image 
              src={src} 
              alt={`Bursalı Oto Servis Fethiye ${index + 1}`} 
              fill
              style={{ objectFit: 'cover' }} 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>
      
      {visibleCount < totalPhotos && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            onClick={handleLoadMore} 
            className="btn btn-gold" 
            style={{ padding: '1rem 3rem', fontSize: '1.2rem', cursor: 'pointer', border: 'none', background: 'var(--accent-gold)', color: 'black', fontWeight: 'bold' }}
          >
            Daha Fazla Fotoğraf Yükle ({totalPhotos - visibleCount} Kaldı) ⬇️
          </button>
        </div>
      )}
      
      {visibleCount === totalPhotos && (
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-light)' }}>
          Tüm fotoğrafları görüntülediniz. 
          <br /><br />
          <a href="https://www.google.com/maps/place/BURSALI+OTO+SERV%C4%B0S/@36.6217,29.1164,15z" className="btn btn-primary" target="_blank" rel="noreferrer" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Google Haritalar'da Bizi İnceleyin
          </a>
        </p>
      )}
    </div>
  );
}
