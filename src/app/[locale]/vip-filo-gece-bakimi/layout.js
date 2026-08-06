import { buildSEOContract } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const titles = {
    tr: 'VIP Filo Gece Bakımı & Turizm Servisi | Bursalı Oto Servis',
    en: 'VIP Fleet Night-Shift Service & Maintenance | Bursali Auto Repair',
    ru: 'VIP Ночное Обслуживание Туристических Авто | Bursali Auto Repair',
    uk: 'VIP Нічне Обслуговування Туристичних Авто | Bursali Auto Repair',
    ar: 'خدمة الصيانة الليلية لأسطول نقل VIP | Bursali Auto Repair',
  };

  const descriptions = {
    tr: 'Fethiye VIP Vito, Sprinter ve Transporter filolarına özel gece vardiyalı kesintisiz bakım servisi.',
    en: 'Uninterrupted night-shift vehicle maintenance for VIP Vito, Sprinter and Transporter fleets in Fethiye.',
    ru: 'Ночное обслуживание VIP автотранспорта в Фетхие без простоя бизнеса.',
    uk: 'Нічне обслуговування VIP автотранспорту у Фетхіє без простою бізнесу.',
    ar: 'خدمة الصيانة الليلية لأسطول النقل والسياحة في فتحية دون تعطيل العمل.',
  };

  return {
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
    ...buildSEOContract({ locale, path: '/vip-filo-gece-bakimi', title: titles[locale] || titles.tr, description: descriptions[locale] || descriptions.tr })
  };
}

export default function VipFleetLayout({ children }) {
  return <>{children}</>;
}
