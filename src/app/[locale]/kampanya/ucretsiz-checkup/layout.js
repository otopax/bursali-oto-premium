import { buildCanonical } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const titles = {
    tr: 'Ücretsiz Bilgisayarlı Arıza Tespiti Kampanyası | Bursalı Oto Servis',
    en: 'Free Computerized Auto Diagnostic Campaign | Bursali Auto Repair',
    ru: 'Акция: Бесплатная Компьютерная Диагностика | Bursali Auto Repair',
    uk: 'Акція: Безкоштовна Комп\'ютерна Діагностика | Bursali Auto Repair',
    ar: 'حملة تشخيص أعطال الكمبيوتر المجانية | Bursali Auto Repair',
  };

  const descriptions = {
    tr: 'İlk kez gelen müşterilerimize özel orijinal cihazlarla ücretsiz bilgisayarlı arıza tespiti ve check-up kampanyası.',
    en: 'Free computerized fault diagnosis and check-up with original licensed tools for first-time customers in Fethiye.',
    ru: 'Бесплатная компьютерная диагностика авто в Фетхие для новых клиентов.',
    uk: 'Безкоштовна комп\'ютерна діагностика авто у Фетхіє для нових клієнтів.',
    ar: 'فحص وتشخيص أعطال السيارات بالكمبيوتر مجاناً للعملاء الجدد في فتحية.',
  };

  return {
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
    alternates: buildCanonical(locale, '/kampanya/ucretsiz-checkup'),
  };
}

export default function CampaignLayout({ children }) {
  return <>{children}</>;
}
