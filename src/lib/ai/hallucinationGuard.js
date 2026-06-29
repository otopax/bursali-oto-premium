/**
 * Enterprise Hallucination Guard
 * Protects users from potentially dangerous synthesized AI outputs.
 */

export function checkHallucination(responseText, toolsUsed) {
  const flags = {
    isHallucinated: false,
    confidenceScore: 100,
    warning: null
  };

  const text = responseText.toLowerCase();

  // If the AI gives specific numbers like torque (Nm) or wiring colors but didn't use any tools, it's highly likely a hallucination
  const hasTechnicalData = text.match(/\b(nm|tork|volt|amper|kablo)\b/);
  
  if (hasTechnicalData && toolsUsed === 0) {
    flags.isHallucinated = true;
    flags.confidenceScore = 40;
    flags.warning = "DİKKAT: Bu teknik değerler sistem veritabanından bağımsız olarak yapay zeka tarafından üretilmiş olabilir. Lütfen tamir öncesi servis manuelini teyit ediniz.";
  }

  // If AI admits it doesn't know
  if (text.includes('veritabanımda') && text.includes('yok')) {
    flags.confidenceScore = 90; // It's confident it doesn't know, which is good
  }

  return flags;
}
