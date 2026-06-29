/**
 * Enterprise SEO Schema (JSON-LD) Generator
 * Helps Google understand the context of the pages.
 */

export class SchemaGenerator {
  
  /**
   * Generates a BreadcrumbList schema for navigation tracking
   */
  static breadcrumbs(items) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    };
  }

  /**
   * Generates FAQPage schema for Fault Code pages
   * Makes the page eligible for Google's "People Also Ask" rich snippets.
   */
  static faq(questionsAndAnswers) {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": questionsAndAnswers.map(qa => ({
        "@type": "Question",
        "name": qa.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": qa.answer
        }
      }))
    };
  }

  /**
   * Generates TechArticle schema for deep technical repair pages
   */
  static repairArticle(title, description, author = "Bursalı Oto Başmakinist") {
    return {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": title,
      "description": description,
      "author": {
        "@type": "Organization",
        "name": author
      },
      "publisher": {
        "@type": "Organization",
        "name": "Bursalı Oto Dijital Servis",
        "logo": {
          "@type": "ImageObject",
          "url": "https://bursalioto.com/logo.png"
        }
      }
    };
  }
}
