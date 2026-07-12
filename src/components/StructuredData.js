import { businessData } from '@/lib/business';

const business = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  "@id": `${businessData.url}/#business`,
  name: businessData.name,
  description: businessData.description,
  url: businessData.url,
  telephone: businessData.telephone,
  image: businessData.image,
  priceRange: businessData.priceRange,
  address: {
    "@type": "PostalAddress",
    ...businessData.address
  },
  geo: {
    "@type": "GeoCoordinates",
    ...businessData.geo
  },
  openingHoursSpecification: businessData.openingHoursSpecification.map(oh => ({
    "@type": "OpeningHoursSpecification",
    ...oh
  })),
  areaServed: businessData.areaServed.map(area => ({
    "@type": "City",
    name: area
  })),
  knowsLanguage: businessData.knowsLanguage,
  sameAs: businessData.sameAs,
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Hizmetler",
    itemListElement: businessData.makesOffer.map(offer => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: offer.name, description: offer.description }
    }))
  }
};

const faq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Fethiye'de arıza yapan premium aracım için nasıl çekici çağırabilirim?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "İletişim numaramızdan veya WhatsApp üzerinden konum atmanız yeterlidir. 7/24 aktif premium oto kurtarma aracımızla, aracınızın markası ne olursa olsun (BMW, Porsche, Mercedes vb.) sıfır hasar riskiyle bulunduğunuz noktadan alıp kameralı güvenli otoparkımıza çekiyoruz.",
      },
    },
    {
      "@type": "Question",
      name: "Orijinal parça garantisi veriyor musunuz?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Evet. Premium segment Alman araçlarında (Audi, Volkswagen, Mercedes, BMW, Porsche) motor ve şanzıman revizyonları dahil tüm işlemlerde %100 orijinal (OEM) yedek parça kullanıyoruz.",
      },
    },
    {
      "@type": "Question",
      name: "Arıza tespiti için hangi cihazları kullanıyorsunuz?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Deneme yanılma yöntemini reddediyoruz. Porsche için PIWIS, Volkswagen grubu (Audi, Seat, Skoda, VW) için ODIS, BMW/Mini için ICOM, Mercedes için Star Diagnosis gibi markaya özel orijinal lisanslı cihazlarla noktasal arıza tespiti yapıyoruz.",
      },
    },
  ],
};

export default function StructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}
