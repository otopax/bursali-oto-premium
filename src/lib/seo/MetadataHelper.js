/**
 * SEO Metadata Helper
 * Standardizes Title, Description, and OpenGraph logic across Next.js pages.
 */

export class MetadataHelper {
  
  static getBaseUrl() {
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://bursalioto.com';
  }

  /**
   * Generate standard metadata for a Next.js Page
   */
  static generate({ title, description, path = '', image = '/default-og.png' }) {
    const siteName = "Bursalı Oto Dijital Servis";
    const fullTitle = `${title} | ${siteName}`;
    const url = `${this.getBaseUrl()}${path}`;

    return {
      title: fullTitle,
      description: description,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: fullTitle,
        description: description,
        url: url,
        siteName: siteName,
        images: [
          {
            url: `${this.getBaseUrl()}${image}`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: 'tr_TR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: fullTitle,
        description: description,
        images: [`${this.getBaseUrl()}${image}`],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }
}
