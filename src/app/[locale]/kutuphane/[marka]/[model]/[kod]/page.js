import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { buildSEOContract } from '@/lib/seo/canonical';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: 'Arıza Çözümleri | Bursalı Oto Servis',
    description: 'Arıza kodları ve onarım rehberleri yakında eklenecektir.',
    ...buildSEOContract({ locale, path: '/kutuphane', title: 'Arıza Çözümleri', description: 'Yakında.' })
  };
}

export default async function EmptyFaultPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', background: '#09090b', color: '#fff', textAlign: 'center' }}>
      <h1>Arıza Çözümleri</h1>
      <p style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>Arıza kodları ve onarım rehberleri veritabanımız güncellenmektedir. Yakında aktif edilecektir.</p>
      <div style={{ marginTop: '3rem' }}>
        <Link href={"/" + locale + "/ariza-cozumleri"} style={{ color: 'var(--accent-gold)' }}>&larr; Araç Kataloğuna Dön</Link>
      </div>
    </main>
  );
}
