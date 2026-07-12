const business = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  "@id": "https://www.bursaliotoservis.com/#business",
  name: "Bursalı Oto Servis",
  description:
    "Fethiye premium oto servis. PIWIS ve ODIS ile garantili BMW, Mercedes, Porsche tamiri. 7/24 VIP yol yardım ve orijinal yedek parça güvencesi.",
  url: "https://www.bursaliotoservis.com",
  telephone: "+905548812021",
  image: "https://www.bursaliotoservis.com/bg.png",
  priceRange: "$$$",
  foundingDate: "1986",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Taşyaka Mahallesi, Yeni Sanayi Sitesi, 264. Sokak, No: 1",
    addressLocality: "Fethiye",
    addressRegion: "Muğla",
    postalCode: "48300",
    addressCountry: "TR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "36.618641",
    longitude: "29.131750",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "08:30",
      closes: "19:30",
    },
  ],
  areaServed: { "@type": "City", name: "Fethiye" },
  knowsLanguage: ["tr", "en", "ru", "uk", "ar"],
  sameAs: [
    "https://instagram.com/bursaliotoservis",
    "https://facebook.com/bursaliotoservis",
    "https://twitter.com/bursalioto",
    "https://linkedin.com/company/bursaliotoservis",
    "https://youtube.com/bursaliotoservis",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Hizmetler",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "BMW, Mercedes, Porsche özel servis (PIWIS/ODIS diagnostik)" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "7/24 acil oto çekici ve yol yardım" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Otomatik şanzıman revizyonu (Aisin, ZF)" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Motor revizyonu ve DPF temizliği" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "VIP filo gece vardiyası bakımı" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "İngilizce/Rusça/Arapça/Ukraynaca konuşan usta" } },
    ],
  },
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
