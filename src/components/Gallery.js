import Image from 'next/image';

export default function Gallery() {
  const visibleCount = 6;
  
  // Generate array of image paths: 01 to 06
  const photos = Array.from({ length: visibleCount }, (_, i) => {
    const num = (i + 1).toString().padStart(2, '0');
    return `/gallery/bursali-oto-servis-fethiye-${num}.jpeg`;
  });

  return (
    <div className="container overflow-x-hidden max-w-full">
      <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Servisimizden Kareler</h2>
      <div style={{ display: 'grid' }} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {photos.map((src, index) => (
          <div key={index} className="relative rounded-xl overflow-hidden bg-gray-800/50 aspect-video shadow-lg group">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800/0 via-gray-700/20 to-gray-800/0 animate-pulse z-0"></div>
            <Image 
              src={src} 
              alt={`Bursalı Oto Servis Fethiye ${index + 1}`}
              title={`Fethiye Premium Oto Servis Galerisi ${index + 1}`}
              fill
              quality={75}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 z-10" 
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '1.5rem', width: '100%' }}>
        <a href="https://www.google.com/maps/place/BURSALI+OTO+SERV%C4%B0S/@36.6217,29.1164,15z" className="btn btn-gold text-base py-3 font-bold bg-[#d4af37] text-black" target="_blank" rel="noopener noreferrer" title="Bursalı Oto Servis Google Haritalar" style={{ padding: '1rem 3rem', display: 'inline-block', borderRadius: '8px' }}>
          Tüm Fotoğrafları Haritalar'da Gör
        </a>
      </div>
    </div>
  );
}
