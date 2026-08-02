import { businessData } from '@/lib/business';

export default function StructuredData({ breadcrumbs = [], video = null, reviews = null, product = null, techArticle = null }) {
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(emergencyService) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      {breadcrumbData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />}
      {videoData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoData) }} />}
      {reviewData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewData) }} />}
      {productData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productData) }} />}
      {techArticleData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleData) }} />}
    </>
  );
}
