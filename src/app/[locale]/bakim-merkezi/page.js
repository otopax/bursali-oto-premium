import Link from 'next/link';
import BakimHesaplaForm from './BakimHesaplaForm';

import { buildSEOContract } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const titles = {
    tr: 'Otomotiv Bilgi & Bakım Merkezi | Bursalı Oto Servis',
    en: 'Auto Maintenance & Diagnostics Hub | Bursali Auto Repair',
    ru: 'Центр Обслуживания и Диагностики Авто | Bursali Auto Repair',
    uk: 'Центр Обслуговування та Діагностики Авто | Bursali Auto Repair',
    ar: 'مركز صيانة وتخيص السيارات | Bursali Auto Repair',
  };

  const descriptions = {
    tr: 'Ücretsiz VIN çözücü, periyodik bakım hesaplayıcı, OBD2 arıza kodu sorgulama ve tahmini onarım maliyeti hesaplama.',
    en: 'Free VIN decoder, periodic maintenance calculator, OBD2 fault code lookup and estimated repair cost calculator in Fethiye.',
    ru: 'Бесплатный VIN декодер, калькулятор ТО и поиск кодов ошибок OBD2.',
    uk: 'Безкоштовний VIN декодер, калькулятор ТО та пошук кодів помилок OBD2.',
    ar: 'فك تشفير VIN المجاني ومحاسب الصيانة الدورية والبحث عن رموز الأعطال.',
  };

  return {
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
    ...buildSEOContract({ locale, path: '/bakim-merkezi', title: titles[locale] || titles.tr, description: descriptions[locale] || descriptions.tr })
  };
}

export default async function MaintenanceCenterPage({ params }) {
  const { locale } = await params;

  const tools = [
    {
      id: 'maintenance-calc',
      title: 'Bakım Hesaplayıcı',
      desc: 'Aracınızın markası ve kilometresine göre değişmesi gereken parçaları görün.',
      icon: '⚙️',
      link: `/${locale}/bakim-merkezi/bmw/60000` // Örnek link, UI'da seçilebilir hale gelecek
    },
    {
      id: 'vin-decoder',
      title: 'VIN Decoder',
      desc: 'Şasi numarasını girin, aracınızın fabrika çıkış verilerini ve kronik arızalarını görün.',
      icon: '🔍',
      link: `/${locale}/sanal-usta`
    },
    {
      id: 'obd-checker',
      title: 'OBD Arıza Kodu Sorgulama',
      desc: 'P0171, P0420 gibi hata kodlarının ne anlama geldiğini ve çözümünü bulun.',
      icon: '💻',
      link: `/${locale}/ariza-cozumleri`
    },
    {
      id: 'sanal-usta',
      title: 'Yapay Zeka Sanal Usta',
      desc: 'Şikayetinizi yazın, yapay zeka saniyeler içinde teşhis koysun.',
      icon: '🤖',
      link: `/${locale}/sanal-usta`
    }
  ];

  return (
    <main style={{ minHeight: '100vh', paddingTop: '120px', backgroundColor: 'var(--bg-dark)' }}>
      <section className="container mx-auto px-4 max-w-6xl pb-20">
        <div className="text-center mb-12">
          <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-gold)', borderColor: 'var(--accent-gold)', marginBottom: '1rem', display: 'inline-block' }}>
            Ücretsiz Otomotiv Araçları
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Otomotiv Bilgi Merkezi</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Aracınızla ilgili ihtiyacınız olan tüm hesaplama ve teşhis araçları tek bir yerde. Fethiye'nin en teknolojik servisine hoş geldiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {tools.map(tool => (
            <Link href={tool.link} key={tool.id} className="glass-panel p-8 border border-white/5 rounded-2xl hover:border-[var(--accent-gold)] transition-colors group relative overflow-hidden block">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex items-start gap-4">
                <div className="text-5xl">{tool.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[var(--accent-gold)] transition-colors">{tool.title}</h2>
                  <p className="text-gray-400 leading-relaxed">{tool.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Temporary static maintenance calculator form */}
        <div className="mt-16 glass-panel p-8 border border-white/5 rounded-2xl max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Hızlı Bakım Hesapla</h2>
          <BakimHesaplaForm locale={locale} />
        </div>
      </section>
    </main>
  );
}
