// 🚀 V5.0 FEATURE 3: Prompt Injection ve Zararlı İçerik Filtresi.
class Guardrails {
  static BLOCKED_PATTERNS = [
    /ignore previous instructions/i,
    /forget your system prompt/i,
    /you are now (dan|jailbreak|admin)/i,
    /system prompt/i,
    /drop all rules/i,
    /rm -rf/i,
    /DROP TABLE/i,
    /ALTER USER/i,
    /<script>/i,
    /eval\(/i
  ];

  static PROFANITY_LIST = ['küfür', 'hakaret', 'tehdit', 'şiddet', 'cinsel']; // Örnek

  static sanitize(input) {
    if (typeof input !== 'string') return input;
    // Sadece alfanumerik ve Türkçe karakterler + noktalama işaretlerine izin ver
    return input.replace(/[^a-zA-ZğüşöçıİĞÜŞÖÇ\s0-9.,;:!?()'"-]/g, '');
  }

  static validate(prompt) {
    // 1. Boş kontrol
    if (!prompt || prompt.trim().length < 3) {
      return { valid: false, reason: 'Soru çok kısa.' };
    }
    // 2. Zararlı desen kontrolü (Injection)
    for (const pattern of this.BLOCKED_PATTERNS) {
      if (pattern.test(prompt)) {
        return { valid: false, reason: 'Güvenlik ihlali: Zararlı komut tespit edildi.' };
      }
    }
    // 3. Küfür/Argo kontrolü
    for (const badWord of this.PROFANITY_LIST) {
      if (prompt.toLowerCase().includes(badWord)) {
        return { valid: false, reason: 'Uygunsuz dil kullanımı tespit edildi.' };
      }
    }
    return { valid: true };
  }

  static process(prompt) {
    const validation = this.validate(prompt);
    if (!validation.valid) {
      throw new Error(`Guardrail Hatası: ${validation.reason}`);
    }
    return this.sanitize(prompt);
  }
}

module.exports = { Guardrails };
