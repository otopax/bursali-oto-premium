import { describe, it, expect } from 'vitest';

/**
 * Validate Schema.org JSON-LD structures for TechArticle, FAQPage, BreadcrumbList, AutoRepair, and HowTo
 */
describe('Schema.org JSON-LD Validation Suite', () => {
  
  it('should validate TechArticle schema structure', () => {
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: 'P2433 Arıza Kodu Çözümü',
      description: 'Audi 2.0 TDI İkinci Hava Enjeksiyon Sensörü Arızası',
      image: {
        '@type': 'ImageObject',
        url: 'https://www.bursaliotoservis.com/bg.png',
        width: 1200,
        height: 630
      },
      author: {
        '@type': 'Organization',
        name: 'Bursalı Oto Servis Uzman Ekibi',
        url: 'https://www.bursaliotoservis.com'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Bursalı Oto Servis',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.bursaliotoservis.com/logo.png'
        }
      },
      datePublished: '2026-08-01T08:00:00.000Z',
      dateModified: '2026-08-09T12:00:00.000Z'
    };

    expect(articleSchema['@context']).toBe('https://schema.org');
    expect(articleSchema['@type']).toBe('TechArticle');
    expect(articleSchema.headline).toBeTruthy();
    expect(articleSchema.description).toBeTruthy();
    expect(articleSchema.author.name).toBe('Bursalı Oto Servis Uzman Ekibi');
    expect(articleSchema.publisher.name).toBe('Bursalı Oto Servis');
    expect(articleSchema.publisher.logo.url).toMatch(/^https:\/\//);
    expect(articleSchema.image.url).toMatch(/^https:\/\//);
  });

  it('should validate FAQPage schema structure', () => {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'P2433 arıza kodu nedir?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'İkinci Hava Enjeksiyon Sistemi Akış/Basınç Sensörü yüksek volt sinyali arızasıdır.'
          }
        }
      ]
    };

    expect(faqSchema['@type']).toBe('FAQPage');
    expect(Array.isArray(faqSchema.mainEntity)).toBe(true);
    expect(faqSchema.mainEntity.length).toBeGreaterThan(0);
    expect(faqSchema.mainEntity[0]['@type']).toBe('Question');
    expect(faqSchema.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
    expect(faqSchema.mainEntity[0].acceptedAnswer.text).toBeTruthy();
  });

  it('should validate BreadcrumbList schema structure', () => {
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.bursaliotoservis.com/tr' },
        { '@type': 'ListItem', position: 2, name: 'Kütüphane', item: 'https://www.bursaliotoservis.com/tr/kutuphane' },
        { '@type': 'ListItem', position: 3, name: 'Audi', item: 'https://www.bursaliotoservis.com/tr/kutuphane/audi' }
      ]
    };

    expect(breadcrumbSchema['@type']).toBe('BreadcrumbList');
    expect(breadcrumbSchema.itemListElement.length).toBe(3);
    expect(breadcrumbSchema.itemListElement[0].position).toBe(1);
    expect(breadcrumbSchema.itemListElement[0].item).toMatch(/^https:\/\//);
  });

  it('should validate AutoRepair schema structure', () => {
    const autoRepairSchema = {
      '@context': 'https://schema.org',
      '@type': 'AutoRepair',
      name: 'Bursalı Oto Servis',
      image: 'https://www.bursaliotoservis.com/logo.png',
      url: 'https://www.bursaliotoservis.com',
      telephone: '+905548812021',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Taşyaka Mahallesi, 264. Sokak No:1',
        addressLocality: 'Fethiye',
        addressRegion: 'Muğla',
        postalCode: '48300',
        addressCountry: 'TR'
      },
      priceRange: '$$'
    };

    expect(autoRepairSchema['@type']).toBe('AutoRepair');
    expect(autoRepairSchema.telephone).toBe('+905548812021');
    expect(autoRepairSchema.address.addressCountry).toBe('TR');
  });

  it('should validate HowTo schema structure', () => {
    const howToSchema = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'P2433 Arızası Nasıl Onarılır?',
      description: 'Adım adım lisanslı cihaz ile arıza teşhis ve tamir süreci',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Diyagnoz Testi',
          text: 'ODIS / VCDS cihazı ile ölçüm blogları taranır.'
        }
      ]
    };

    expect(howToSchema['@type']).toBe('HowTo');
    expect(howToSchema.step.length).toBeGreaterThan(0);
    expect(howToSchema.step[0]['@type']).toBe('HowToStep');
  });
});
