import { describe, it, expect } from 'vitest';

/**
 * PDF Generator Validation for Turkish Characters and Spacing Format
 */
describe('Automated PDF Generator & Text Format Validation', () => {

  function sanitizeTurkishPdfText(text) {
    if (!text) return '';
    // Normalize Turkish characters for PDF fonts if necessary or verify UTF-8 encoding
    return text
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function validatePdfMetadata(title, author, subject) {
    return {
      isValidTitle: typeof title === 'string' && title.length > 5,
      isValidAuthor: typeof author === 'string' && author.length > 3,
      isValidSubject: typeof subject === 'string' && subject.length > 5,
      hasValidSpacing: !/\s{2,}/.test(title)
    };
  }

  it('should correctly sanitize Turkish characters without breaking string integrity', () => {
    const rawText = 'Bursalı Oto Servis Fethiye - Şanzıman ve Motor Revizyonu Kılavuzu (İçerik Güvenli)';
    const sanitized = sanitizeTurkishPdfText(rawText);

    expect(sanitized).toBe('Bursali Oto Servis Fethiye - Sanziman ve Motor Revizyonu Kilavuzu (Icerik Guvenli)');
    expect(sanitized).not.toContain('  '); // No double spaces
  });

  it('should validate PDF document title and metadata fields', () => {
    const metadata = validatePdfMetadata(
      'P2433 Arıza Kodu İkinci Hava Enjeksiyon Bülteni',
      'Bursalı Oto Servis',
      'Teknik Servis Bülteni TSB'
    );

    expect(metadata.isValidTitle).toBe(true);
    expect(metadata.isValidAuthor).toBe(true);
    expect(metadata.isValidSubject).toBe(true);
    expect(metadata.hasValidSpacing).toBe(true);
  });

  it('should verify TSB PDF link formatting regex', () => {
    const sampleNote = 'When found in 2.0T engines see https://static.nhtsa.gov/odi/tsbs/2019/MC-10159350-0001.pdf NHTSA';
    const pdfRegex = /(https?:\/\/[^\s]+\.pdf)/gi;
    const match = sampleNote.match(pdfRegex);

    expect(match).not.toBeNull();
    expect(match[0]).toBe('https://static.nhtsa.gov/odi/tsbs/2019/MC-10159350-0001.pdf');
  });
});
