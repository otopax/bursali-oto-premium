const { GoogleGenAI } = require('@google/genai');

/**
 * Multimodal OCR Processor
 * Uses Google Gemini 2.5 Flash Vision capabilities to extract and translate text from images.
 */
class OCRProcessor {
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
  }

  /**
   * Processes a base64 image (wiring diagram, fault screen) and extracts structured data.
   * @param {string} base64Image - The image file encoded as base64 string
   * @param {string} mimeType - e.g., 'image/jpeg' or 'image/png'
   * @returns {Promise<Object>}
   */
  async extractTextFromImage(base64Image, mimeType = 'image/jpeg') {
    const prompt = `Sen uzman bir otomotiv teşhis uzmanısın. Ekteki görseli (bu bir arıza ekranı, sigorta kutusu veya kablo şeması olabilir) analiz et. 
Lütfen şu formatta JSON döndür:
{
  "extractedText": "Görselden okuyabildiğin tüm metinler (İngilizce/Japonca vs. olabilir)",
  "translatedSummary": "Bu metinlerin veya şemanın Türkçe özeti",
  "identifiedFaultCodes": ["Eğer görselde bir P kodu veya hata numarası varsa liste halinde"],
  "technicalDetails": "Eğer sigorta amperi (örn: 15A), voltaj, veya spesifik bir parça adı geçiyorsa buraya yaz"
}`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          prompt,
          { inlineData: { data: base64Image, mimeType: mimeType } }
        ]
      });

      const text = response.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse JSON", rawText: text };

    } catch (error) {
      console.error("[OCRProcessor] Vision AI Error:", error.message);
      throw new Error("Görsel analiz edilemedi: " + error.message);
    }
  }
}

module.exports = { OCRProcessor: new OCRProcessor() };
