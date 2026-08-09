import Image from 'next/image';

export default function Gallery() {
  const visibleCount = 6;
  
  const photos = Array.from({ length: visibleCount }, (_, i) => {
    const num = (i + 1).toString().padStart(2, '0');
    return `/gallery/bursali-oto-servis-fethiye-${num}.jpeg`;
  });

  return (
    <div className="container overflow-x-hidden max-w-full">
      <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--text-light)' }}>Servisimizden Kareler</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {photos.map((src, index) => (
          <div key={index} style={{ 
            position: 'relative', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            aspectRatio: '16 / 9', 
            background: '#18181b',
            border: '1px solid rgba(255,255,255,0.08)' 
          }}>
            <Image 
              src={src} 
              alt={`Bursalı Oto Servis Fethiye Galeri Fotoğrafı ${index + 1}`}
              title={`Fethiye Premium Oto Servis Galerisi - Fotoğraf ${index + 1}`}
              fill
              quality={80}
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
            />
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '1.5rem', width: '100%' }}>
        <a href="https://www.google.com/maps/place/BURSALI+OTO+SERV%C4%B0S/@36.6217,29.1164,15z" className="btn btn-gold" target="_blank" rel="noopener noreferrer" title="Bursalı Oto Servis Google Haritalar" style={{ padding: '1rem 3rem', display: 'inline-block', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none' }}>
          Tüm Fotoğrafları Haritalar'da Gör
        </a>
      </div>
    </div>
  );
}
