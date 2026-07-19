import { businessData } from '@/lib/business';

export default function StructuredData({ breadcrumbs = [] }) {
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

  const emergencyService = {
    "@context": "https://schema.org",
    "@type": "EmergencyService",
    "@id": `${businessData.url}/#emergency`,
    name: "7/24 Acil Oto Çekici ve Yol Yardım",
    description: "Fethiye ve çevresinde premium araçlar için 7/24 acil çekici ve yol yardım hizmeti.",
    url: `${businessData.url}/tr/fethiye-7-24-oto-cekici`,
    telephone: businessData.telephone,
    address: {
      "@type": "PostalAddress",
      ...businessData.address
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59"
    }
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: businessData.faq.map(item => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  const breadcrumbData = breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((bc, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: bc.name,
      item: bc.url
    }))
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(emergencyService) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      {breadcrumbData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
      )}
    </>
  );
}
