import { get } from '@vercel/edge-config';

/**
 * Feature Flags Servisi
 * Vercel Edge Config'ten flag değerini okur. 
 * Eğer 500ms içinde cevap gelmezse veya bağlantı hatası olursa fail-open (process.env) olarak çalışır.
 * 
 * @param {string} flagName - Okunacak flag'in adı (örn: "ai_v2_enabled")
 * @param {boolean} defaultValue - Bulunamazsa dönülecek varsayılan değer
 * @returns {Promise<boolean>}
 */
export async function getFeatureFlag(flagName, defaultValue = false) {
  const envKey = `FF_${flagName.toUpperCase()}`;
  const envValue = process.env[envKey] === 'true';

  // Eğer Edge Config tanımlı değilse doğrudan env veya defaultValue dön.
  if (!process.env.EDGE_CONFIG) {
    return process.env[envKey] !== undefined ? envValue : defaultValue;
  }

  try {
    const fetchPromise = get(flagName);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Edge Config Timeout')), 500)
    );

    const value = await Promise.race([fetchPromise, timeoutPromise]);
    
    return value !== undefined ? value : defaultValue;
  } catch (error) {
    // Edge Config hatası, timeout veya connection failure:
    // Fail-open mantığı gereği env değişkenine dönüyoruz.
    console.warn(`Feature Flag Warning: Failed to read ${flagName} from Edge Config. Falling back to env. Reason: ${error.message}`);
    return process.env[envKey] !== undefined ? envValue : defaultValue;
  }
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
