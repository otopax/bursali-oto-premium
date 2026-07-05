import { getTranslations } from 'next-intl/server';
import { buildCanonical } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations('SanalUstaTeaser');

  return {
    title: locale === 'tr' ? 'Sanal Usta - Yapay Zeka Oto Teşhis | Bursalı Oto Servis' : 'AI Mechanic Diagnostic | Bursalı Oto Servis',
    description: locale === 'tr' ? 'Arızanızı yazın, Bursalı Oto Sanal Usta 40 yıllık tecrübesiyle anında teşhis koysun. Ücretsiz AI oto servis danışmanınız.' : 'Describe your car issue and let our AI Mechanic diagnose it instantly. Free AI auto service consultant.',
    alternates: buildCanonical(locale, 'sanal-usta'),
    openGraph: {
      title: 'Sanal Usta - Yapay Zeka Oto Teşhis',
      description: 'Yapay Zeka destekli ücretsiz oto arıza tespit sistemi.',
      url: `https://www.bursaliotoservis.com/${locale}/sanal-usta`,
      type: 'website',
    }
  };
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
