import Link from 'next/link';
import { MaintenanceRepository } from '@/lib/repositories/MaintenanceRepository';

import { buildCanonical } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale, brand, mileage } = await params;
  const brandName = brand.toUpperCase();

  const titles = {
    tr: `${brandName} ${mileage} km Bakım Programı & Maliyeti | Bursalı Oto Servis`,
    en: `${brandName} ${mileage} km Service Schedule & Cost | Bursali Auto Repair`,
    ru: `${brandName} ${mileage} км График ТО и Стоимость | Bursali Auto Repair`,
    uk: `${brandName} ${mileage} км Графік ТО та Вартість | Bursali Auto Repair`,
    ar: `${brandName} ${mileage} كم جدول الصيانة والتكلفة | Bursali Auto Repair`,
  };

  const descriptions = {
    tr: `${brandName} aracınızın ${mileage} km periyodik/ağır bakımında değişmesi gereken parçalar, kullanılacak yağ spesifikasyonu ve tahmini maliyetleri.`,
    en: `${brandName} ${mileage} km service schedule, parts to replace, oil specifications and estimated repair cost at Bursali Auto Repair Fethiye.`,
    ru: `График ТО ${brandName} ${mileage} км, замена запчастей и стоимость в автосервисе Bursali Fethiye.`,
    uk: `Графік ТО ${brandName} ${mileage} км, заміна запчастин та вартість в автосервісі Bursali Fethiye.`,
    ar: `جدول صيانة ${brandName} ${mileage} كم والقطع الواجب استبدالها في ورشة بورصالي فتحية.`,
  };

  return {
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
    alternates: buildCanonical(locale, `/bakim-merkezi/${brand}/${mileage}`),
  };
}

export default async function MaintenanceResultPage({ params }) {
  const { locale, brand, mileage } = await params;
  
  const scheduleRes = await MaintenanceRepository.getSchedule(brand, null, parseInt(mileage));
  
  if (!scheduleRes.success) {
    return (
      <main style={{ minHeight: '100vh', paddingTop: '120px', backgroundColor: 'var(--bg-dark)' }} className="text-center">
        <h1 className="text-3xl text-white mb-4">Veri Bulunamadı</h1>
        <p className="text-gray-400 mb-8">{brand.toUpperCase()} {mileage} km için bakım tablosu henüz sistemimizde kayıtlı değil.</p>
        <Link href={`/${locale}/bakim-merkezi`} className="btn btn-outline px-6 py-2">Geri Dön</Link>
      </main>
    );
  }

  const items = scheduleRes.items;
  const brandName = brand.toUpperCase();

  return (
    <main style={{ minHeight: '100vh', paddingTop: '120px', backgroundColor: 'var(--bg-dark)' }}>
      <section className="container mx-auto px-4 max-w-4xl pb-20">
        
        <div className="mb-8">
          <Link href={`/${locale}/bakim-merkezi`} className="text-[var(--accent-gold)] hover:underline mb-4 inline-block">
            ← Bakım Merkezine Dön
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            {brandName} <span className="text-[var(--accent-gold)]">{mileage} km</span> Bakım Programı
          </h1>
          <p className="text-xl text-gray-400">
            Fethiye Bursalı Oto Servis'te bu bakım işlemi için yapılacak parça değişimleri ve kontroller aşağıda listelenmiştir.
          </p>
        </div>

        <div className="glass-panel p-0 border border-white/5 rounded-2xl overflow-hidden mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 text-white font-bold">İşlem / Parça</th>
                <th className="p-4 text-white font-bold">Önerilen Parça</th>
                <th className="p-4 text-white font-bold">Önem Derecesi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-gray-300">{item.item}</td>
                  <td className="p-4 text-[var(--accent-gold)]">{item.part}</td>
                  <td className="p-4">
                    {item.type === 'critical' && <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">Kritik</span>}
                    {item.type === 'routine' && <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">Rutin</span>}
                    {item.type === 'safety' && <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">Güvenlik</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gradient-to-r from-[var(--accent-gold)]/20 to-transparent p-8 rounded-2xl border border-[var(--accent-gold)]/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Bu bakımı yaptırmanız mı gerekiyor?</h3>
            <p className="text-gray-300">Yapay zeka asistanımız Sanal Usta ile hemen maliyet hesabı yapın veya doğrudan randevu alın.</p>
          </div>
          <div className="flex gap-4 shrink-0">
            <Link href={`/${locale}/sanal-usta`} className="btn btn-gold py-3 px-6 rounded-xl font-bold text-black">
              Sanal Usta'ya Sor
            </Link>
            <a href="tel:+905548812021" className="btn btn-outline py-3 px-6 rounded-xl font-bold">
              Hemen Ara
            </a>
          </div>
        </div>

      </section>
    </main>
  );
}
