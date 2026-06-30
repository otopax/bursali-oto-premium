import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { DataAccessLayer } from '@/lib/dataAccessLayer';

// Desteklenen markalar (Sadece lüks ve popüler olanlara özel SEO sayfası)
const SUPPORTED_BRANDS = [
  'bmw', 'mercedes', 'mercedes-benz', 'porsche', 'audi', 'vw', 'volkswagen', 
  'land-rover', 'range-rover', 'volvo', 'mini', 'skoda', 'seat'
];

export async function generateMetadata({ params }) {
  const { locale, marka } = await params;
  
  if (!SUPPORTED_BRANDS.includes(marka.toLowerCase())) {
    return { title: 'Servis | Bursalı Oto' };
  }

  const capitalizedMarka = marka.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `Fethiye ${capitalizedMarka} Servis | Uzman Bakım ve Orijinal Cihazlı Tamir`,
    description: `Fethiye ve bölgesinde ${capitalizedMarka} aracınız için garantili bakım, şanzıman tamiri ve orijinal PIWIS/ODIS/XENTRY arıza tespiti. ${capitalizedMarka} özel servis.`,
    alternates: {
      canonical: `https://www.bursaliotoservis.com/${locale}/${marka}-servis-fethiye`
    },
    openGraph: {
      title: `Fethiye ${capitalizedMarka} Özel Servis`,
      description: `Premium ${capitalizedMarka} aracınızın Fethiye'deki güvenilir adresi.`,
    }
  };
}

export default async function BrandServicePage({ params }) {
  const { locale, marka } = await params;
  
  if (!SUPPORTED_BRANDS.includes(marka.toLowerCase())) {
    notFound();
  }

  const t = await getTranslations('Index');
  const capitalizedMarka = marka.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // JSON-LD Schema (Agresif SEO)
  const schema = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": `Fethiye ${capitalizedMarka} Servis - Bursalı Oto`,
    "description": `Fethiye'de profesyonel ${capitalizedMarka} tamir, bakım ve şanzıman revizyon hizmetleri.`,
    "brand": {
      "@type": "Brand",
      "name": capitalizedMarka
    },
    "areaServed": {
      "@type": "City",
      "name": "Fethiye"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "87"
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-16">
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="glass-panel p-8 md:p-16 text-center border-b-4" style={{ borderColor: 'var(--accent-gold)' }}>
          <div className="inline-block px-4 py-1 rounded-full mb-6 text-sm font-bold tracking-widest uppercase bg-yellow-500/10 text-[var(--accent-gold)] border border-[var(--accent-gold)] border-opacity-30">
            PREMIUM {capitalizedMarka} UZMANI
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
            Fethiye <span style={{ color: 'var(--accent-gold)' }}>{capitalizedMarka}</span> Servisi
          </h1>
          <p className="text-xl text-[var(--text-muted)] max-w-3xl mx-auto leading-relaxed">
            {capitalizedMarka} aracınızın sahip olduğu üst düzey mühendisliği anlayan, fabrika standartlarında 
            bilgisayarlı orijinal arıza tespiti ve garantili onarım yapan Fethiye'deki tek adres.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href={`/${locale}/sanal-usta`} className="btn btn-gold text-lg py-3 px-8">
              🤖 Sanal Usta ile {capitalizedMarka} Arızası Sor
            </a>
            <a href="tel:+905548812021" className="btn btn-primary text-lg py-3 px-8">
              📞 Randevu Al
            </a>
          </div>
        </div>
      </section>

      {/* Services Breakdown */}
      <section className="container mx-auto px-4 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Neden Bizi Seçmelisiniz?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-panel p-8 border border-white/5 hover:border-[var(--accent-gold)] transition-all">
            <div className="text-4xl mb-4">💻</div>
            <h3 className="text-xl font-bold mb-3 text-white">Orijinal Cihazlı Tespit</h3>
            <p className="text-[var(--text-muted)]">
              Sıradan OBD cihazlarıyla değil, {capitalizedMarka} markasının fabrikasyon (yetkili servis) 
              cihaz yazılımları ile hatasız arıza teşhisi yapıyoruz. Deneme yanılma yok.
            </p>
          </div>

          <div className="glass-panel p-8 border border-white/5 hover:border-[var(--accent-gold)] transition-all">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold mb-3 text-white">Orijinal Yedek Parça</h3>
            <p className="text-[var(--text-muted)]">
              Premium aracınıza Asya menşeli yan sanayi parça takmıyoruz. %100 Orijinal (OEM) logolu 
              parçalarla, aracınızın performansını ve garantisini koruyoruz.
            </p>
          </div>

          <div className="glass-panel p-8 border border-white/5 hover:border-[var(--accent-gold)] transition-all">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-bold mb-3 text-white">Şanzıman ve Motor</h3>
            <p className="text-[var(--text-muted)]">
              Ağır bakım, zincir değişimi ve otomatik şanzıman (DSG, ZF, S-Tronic vb.) revizyonlarında 
              bölgenin referans merkeziyiz. Kusursuz vites geçişleri garanti.
            </p>
          </div>

        </div>
      </section>

      {/* SEO Content Text */}
      <section className="container mx-auto px-4 mb-16">
        <div className="glass-panel p-8 bg-black/40">
           <h3 className="text-2xl font-bold mb-4">Fethiye ve Çevresi {capitalizedMarka} Çekici & Yol Yardım</h3>
           <p className="text-gray-300 leading-relaxed mb-4">
             Seydikemer, Ölüdeniz, Göcek veya Kalkan bölgesinde {capitalizedMarka} aracınızla yolda kalırsanız, 
             premium araç taşıma standartlarına (hava süspansiyon vb. kurallarına) uygun olarak aracınızı çekici ile 
             bulunduğunuz konumdan alıyor ve güvenle servisimize getiriyoruz. {capitalizedMarka} tamiri uzmanlık ister, 
             sıradan ustalara teslim etmeyin.
           </p>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </main>
  );
}
