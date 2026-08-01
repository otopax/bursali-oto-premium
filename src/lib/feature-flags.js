import { Logger } from '@/lib/observability/Logger';

/**
 * Feature Flags Servisi (Ortam Değişkenleri & Fail-Open Tabanlı)
 * 
 * @param {string} flagName - Okunacak flag'in adı (örn: "ai_v2_enabled")
 * @param {boolean} defaultValue - Bulunamazsa dönülecek varsayılan değer
 * @returns {Promise<boolean>}
 */
export async function getFeatureFlag(flagName, defaultValue = false) {
  const envKey = `FF_${flagName.toUpperCase()}`;
  const envValue = process.env[envKey] === 'true';

  if (process.env[envKey] !== undefined) {
    return envValue;
  }

  return defaultValue;
}

/**
 * Birden fazla flag'i aynı anda okumak için
 */
export async function getFeatureFlags(flagNames) {
  const results = {};
  await Promise.all(
    flagNames.map(async (flagName) => {
      results[flagName] = await getFeatureFlag(flagName);
    })
  );
  return results;
}
