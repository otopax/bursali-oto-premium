import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { buildSEOContract } from '@/lib/seo/canonical';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const ALLOWED_BRANDS = ['bmw', 'mercedes', 'audi', 'porsche', 'volvo', 'volkswagen', 'skoda', 'seat'];

export async function generateMetadata({ params }) {
  const { locale, servis } = await params;
  
  // Extract brand from something like "bmw-servisi"
  const brand = servis.replace('-servisi', '').toLowerCase();
  
  if (!ALLOWED_BRANDS.includes(brand)) {
    return { title: 'Servis Bulunamadı' };
  }

  const TitleBrand = brand.charAt(0).toUpperCase() + brand.slice(1);

  return {
    title: `Fethiye ${TitleBrand} Servisi | Özel Servis ve Tamir`,
    description: `Fethiye'de ${TitleBrand} marka aracınız için profesyonel, garantili özel servis, periyodik bakım ve arıza onarım hizmeti.`,
    ...buildSEOContract({ locale, path: `/fethiye/${servis}`, title: `Fethiye ${TitleBrand} Servisi`, description: `Fethiye ${TitleBrand} özel servisi.` })
  };
}

export default async function FethiyeBrandServicePage({ params }) {
  const { locale, servis } = await params;
  setRequestLocale(locale);
  
  const brand = servis.replace('-servisi', '').toLowerCase();
  
  if (!ALLOWED_BRANDS.includes(brand)) {
    notFound();
  }

  const TitleBrand = brand.charAt(0).toUpperCase() + brand.slice(1);

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', background: '#09090b', color: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <Link href={`/${locale}/fethiye`} style={{ color: 'var(--accent-gold)', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>
          &larr; Tüm Fethiye Servisleri
        </Link>
        <h1 style={{ fontSize: '3rem', color: '#fff' }}>Fethiye <span style={{ color: 'var(--accent-gold)' }}>{TitleBrand}</span> Özel Servisi</h1>
        <p style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: '1.8' }}>
          Bursalı Oto Servis, Fethiye ve çevre bölgelerde {TitleBrand} kullanıcılarına en yüksek standartlarda yetkili servis kalitesinde özel servis hizmeti sağlamaktadır. 
          En güncel arıza tespit (DTC) cihazlarımız ve {TitleBrand} marka araçlarda uzmanlaşmış teknisyenlerimizle aracınızın performansını ve güvenliğini garanti altına alıyoruz.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '8px', border: '1px solid #333' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>{TitleBrand} Periyodik Bakım</h3>
            <p style={{ color: '#aaa' }}>Orijinal ve OEM onaylı yedek parçalar kullanarak {TitleBrand} aracınızın uzun ömürlü ve performanslı kalmasını sağlıyoruz.</p>
          </div>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '8px', border: '1px solid #333' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Arıza Tespiti ve Onarımı</h3>
            <p style={{ color: '#aaa' }}>Araç kataloğumuzdaki binlerce hata kodu tecrübesiyle, {TitleBrand} aracınızdaki elektriksel ve mekanik arızaları nokta atışı tespit edip onarıyoruz.</p>
          </div>
        </div>

        <div style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(255, 215, 0, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
          <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>Fethiye'de {TitleBrand} İçin Bize Ulaşın</h2>
          <p style={{ color: '#ddd', marginBottom: '1.5rem' }}>Taşyaka, 264. Sk. Sanayi Sitesi 1/2, 48300 Fethiye/Muğla adresindeyiz. Hemen randevu almak veya yol yardım talep etmek için arayın.</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>📞 +90 554 881 20 21</p>
        </div>
      </div>
    </main>
  );
}
