import { getTranslations } from 'next-intl/server';
import { buildSEOContract } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const titles = {
    tr: 'Sanal Usta - Yapay Zeka Oto Teşhis | Bursalı Oto Servis',
    en: 'AI Mechanic Diagnostic Assistant | Bursali Auto Repair',
    ru: 'AI Автомеханик Онлайн Диагностика | Bursali Auto Repair',
    uk: 'AI Автомеханік Онлайн Діагностика | Bursali Auto Repair',
    ar: 'الميكانيكي الافتراضي للتشخيص الذكي | Bursali Auto Repair',
  };

  const descriptions = {
    tr: 'Arızanızı yazın, Bursalı Oto Sanal Usta 50 yıllık tecrübesiyle anında teşhis koysun. Ücretsiz AI danışman.',
    en: 'Describe your car issue and let our AI Mechanic diagnose it instantly with 50 years of expertise.',
    ru: 'Опишите проблему, и наш онлайн AI автомеханик мгновенно проведет диагностику.',
    uk: 'Опишіть проблему з авто, і наш онлайн AI автомеханік миттєво проведе діагностику.',
    ar: 'اكتب أعطال سيارتك وسيقوم الميكانيكي الافتراضي بالتشخيص الفوري بناءً على خبرة 50 عاماً.',
  };

  return buildSEOContract({
    locale,
    path: '/sanal-usta',
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
  });
}

export default function SanalUstaLayout({ children }) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Sanal Usta nedir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sanal Usta, Bursalı Oto Servis'in 40 yıllık mekanik tecrübesiyle eğitilmiş yapay zeka tabanlı bir arıza teşhis asistanıdır."
        }
      },
      {
        "@type": "Question",
        "name": "Sanal Usta hizmeti ücretli mi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sanal Usta'yı kullanmak tamamen ücretsizdir. Misafir kullanıcılar belirli bir kota dahilinde soru sorabilirler."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
