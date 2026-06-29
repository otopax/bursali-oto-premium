/**
 * Data Normalization Engine
 * Cleans, sanitizes, and standardizes dirty data coming from various crawler sources.
 */

class Normalizer {
  
  /**
   * Converts any string into a clean, URL-friendly slug.
   * e.g., " Acura TLX 2.0! " -> "acura-tlx-2-0"
   */
  static slugify(text) {
    if (!text) return '';
    return text
      .toString()
      .normalize('NFD') // Split accents
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '') // Remove invalid chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Collapse multiple hyphens
  }

  /**
   * Standardizes Engine Codes.
   * e.g., "k20c1 " -> "K20C1"
   */
  static normalizeEngineCode(code) {
    if (!code) return null;
    return code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  }

  /**
   * Extracts standard Fault Code format from dirty text.
   * e.g., "I got error p0171 today" -> "P0171"
   */
  static extractFaultCode(text) {
    const match = text.match(/\b[PBUC]\d{4}\b/i);
    return match ? match[0].toUpperCase() : null;
  }
}

module.exports = { Normalizer };
