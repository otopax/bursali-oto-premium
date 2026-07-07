const fs = require('fs');
const path = require('path');
const dns = require('dns');
// Fix for Node.js fetch failing on some IPv6 networks
dns.setDefaultResultOrder('ipv4first');

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

// Setup Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
const MODEL_NAME = 'gemini-2.5-flash'; // Projedeki varsayılan geniş limitli modele geçildi

/**
 * Sends a screenshot and prompt to Gemini to determine the next action.
 * @param {string} base64Screenshot 
 * @param {string} taskDescription 
 * @param {object} elementMap 
 */
async function getNextAction(base64Screenshot, taskDescription, elementMap) {
  const prompt = `
You are an autonomous Web Browser Agent. Your goal is to complete the following task:
"${taskDescription}"

I have provided a screenshot of the current browser window. 
I have injected red labels with numbers over all clickable elements.
Here is the mapping of Element ID to their coordinates (for your reference, though you only need to output the ID):
${JSON.stringify(elementMap, null, 2)}

Based on the task and the screenshot, what is your next action?
You must respond with ONLY a valid JSON object in the following format:

If you need to click an element:
{
  "action": "click",
  "elementId": 12,
  "reason": "Clicking the login button"
}

If you need to type into an element (you must click it first or just specify the elementId to click and type):
{
  "action": "type",
  "elementId": 5,
  "text": "my text to type",
  "reason": "Entering the username"
}

If you need to press a key (like Enter):
{
  "action": "keypress",
  "key": "Enter",
  "reason": "Submitting the form"
}

If the task is complete:
{
  "action": "done",
  "reason": "The profile is updated."
}

Do not include markdown blocks, just the raw JSON object.
`;

  let retries = 3;
  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { mimeType: 'image/png', data: base64Screenshot } }
            ]
          }
        ]
      });

      let rawText = response.text || '';
      // Clean up markdown code blocks if any
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(rawText);
    } catch (error) {
      if (error.message && error.message.includes('429')) {
        console.log(`[⏳] Gemini API limitine takıldık (Ücretsiz Tarife). 40 saniye bekleniyor...`);
        await new Promise(r => setTimeout(r, 40000));
        retries--;
      } else {
        console.error("Gemini API Error:", error.message);
        throw error;
      }
    }
  }
  throw new Error("Maksimum yeniden deneme sayısına ulaşıldı.");
}

module.exports = { getNextAction };
