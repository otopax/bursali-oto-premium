import { buildCanonical } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const titles = {
    tr: 'VIP Garaj - Canlı Servis & Takip Portalı | Bursalı Oto Servis',
    en: 'VIP Garage - Live Vehicle Tracking Portal | Bursali Auto Repair',
    ru: 'VIP Гараж - Онлайн Отслеживание Ремонта | Bursali Auto Repair',
    uk: 'VIP Гараж - Онлайн Відстеження Ремонту | Bursali Auto Repair',
    ar: 'كراج VIP - بوابة متابعة الصيانة الحية | Bursali Auto Repair',
  };

  const descriptions = {
    tr: 'Aracınızın servis durumunu, canlı lifteki halini ve bakım karnesini plakanızla sorgulayın.',
    en: 'Track your vehicle repair status, live lift photos and service history with your license plate.',
    ru: 'Отслеживайте статус ремонта вашего авто и историю обслуживания по госномеру.',
    uk: 'Відстежуйте статус ремонту вашого авто та історію обслуговування за держномером.',
    ar: 'تابع حالة صيانة سيارتك وسجل الخدمات المنجزة مباشرة باستخدام رقم اللوحة.',
  };

  return {
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
    alternates: buildCanonical(locale, '/vip-garaj'),
  };
}

export default function VipGarageLayout({ children }) {
  return <>{children}</>;
}
