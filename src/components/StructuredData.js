import { businessData } from '@/lib/business';

export default function StructuredData({ breadcrumbs = [], video = null, reviews = null, product = null, techArticle = null, showFaq = false, showEmergency = false }) {
  const business = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": `${businessData.url}/#business`,
    name: "Bursalı Oto Servis Fethiye",
    description: businessData.description,
    url: businessData.url,
    telephone: "+90-554-881-20-21",
    image: businessData.image,
    priceRange: "₺₺",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Taşyaka, 264. Sk. Sanayi Sitesi 1/2",
      addressLocality: "Fethiye",
      addressRegion: "Muğla",
      postalCode: "48300",
      addressCountry: "TR"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 36.6257216,
      longitude: 29.1368531
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:30",
        closes: "19:30"
      }
    ],
    areaServed: [
      { "@type": "City", name: "Fethiye" },
      { "@type": "City", name: "Göcek" },
      { "@type": "City", name: "Ölüdeniz" },
      { "@type": "City", name: "Kalkan" }
    ],
    knowsLanguage: ["tr", "en", "ru", "uk"],
    sameAs: [
      "https://www.google.com/maps/place/BURSALI+OTO+SERV%C4%B0S/@36.6257216,29.1368531,16z/data=!3m1!4b1!4m6!3m5!1s0x14c043f908136bf7:0x197e3d1803a1d0c6!8m2!3d36.6257216!4d29.1368531!16s%2Fg%2F1hc1n_p_t"
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Hizmetler",
      itemListElement: businessData.makesOffer.map(offer => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: offer.name, description: offer.description }
      }))
    }
  };

  const emergencyService = showEmergency ? {
    "@context": "https://schema.org",
    "@type": "EmergencyService",
    "@id": `${businessData.url}/#emergency`,
    name: `${businessData.name} - 7/24 Acil Oto Çekici ve Yol Yardım`,
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
  } : null;

  const faq = showFaq ? {
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
  } : null;

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

  const videoData = video ? {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    contentUrl: video.contentUrl,
    embedUrl: video.embedUrl
  } : null;

  const reviewData = reviews ? {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    itemReviewed: {
      "@type": "AutoRepair",
      name: businessData.name
    },
    ratingValue: reviews.ratingValue,
    reviewCount: reviews.reviewCount
  } : null;

  const productData = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand
    },
    offers: {
      "@type": "Offer",
      url: product.url,
      priceCurrency: product.priceCurrency || "TRY",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  } : null;

  const techArticleData = techArticle ? {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: techArticle.title,
    description: techArticle.description,
    articleBody: techArticle.content || techArticle.description,
    author: {
      "@type": "Organization",
      name: businessData.name
    },
    publisher: {
      "@type": "Organization",
      name: businessData.name,
      logo: {
        "@type": "ImageObject",
        url: businessData.image
      }
    },
    dependencies: techArticle.code ? `DTC Fault Code ${techArticle.code}` : undefined
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }} />
      {emergencyService && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(emergencyService) }} />}
      {faq && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />}
      {breadcrumbData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />}
      {videoData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoData) }} />}
      {reviewData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewData) }} />}
      {productData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productData) }} />}
      {techArticleData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleData) }} />}
    </>
  );
}

