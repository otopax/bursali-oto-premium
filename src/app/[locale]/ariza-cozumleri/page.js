import { getSortedPostsData } from '@/lib/blog';
import FaultsClientView from './FaultsClientView';

export const metadata = {
  title: 'Arıza Çözümleri | Bursalı Oto Servis Fethiye',
  description: 'Fethiye premium oto servis olarak karşılaştığımız kronik arızalar ve çözümleri.',
  alternates: {
    canonical: 'https://www.bursaliotoservis.com/ariza-cozumleri'
  }
};

export default async function ArizaCozumleriHub({ params }) {
  const { locale } = await params;
  const faults = getSortedPostsData(locale, 'faults'); // Using folder 'faults'

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', background: '#09090b' }}>
      <div className="container" style={{ margin: '0 auto', padding: '0 2rem', maxWidth: '1200px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center', color: 'var(--text-light)' }}>
          Kronik Arıza Çözümleri Merkezi
        </h1>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto', fontSize: '1.1rem' }}>
          Avrupa premium araç markalarının en sık karşılaşılan kronik arızalarını, kök nedenlerini ve servisimizde uyguladığımız kalıcı çözümleri inceleyin.
        </p>

        {/* Client Component'e veriyi aktarıyoruz */}
        <FaultsClientView locale={locale} initialFaults={faults} />
      </div>
    </main>
  );
}
