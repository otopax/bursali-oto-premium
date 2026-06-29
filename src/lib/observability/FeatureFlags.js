/**
 * Enterprise Feature Flag Management
 * Allows safely turning features on/off without redeploying code.
 * (Can be integrated with LaunchDarkly in the future)
 */

class FeatureFlags {
  
  static flags = {
    ENABLE_AI_CORE: process.env.FF_ENABLE_AI_CORE === 'true' || true,
    ENABLE_OCR_VISION: process.env.FF_ENABLE_OCR_VISION === 'true' || false,
    ENABLE_CRAWLER_BOTS: process.env.FF_ENABLE_CRAWLER_BOTS === 'true' || true,
    ENABLE_SOCIAL_RADAR: process.env.FF_ENABLE_SOCIAL_RADAR === 'true' || false,
    ENABLE_SAAS_PAYWALL: process.env.FF_ENABLE_SAAS_PAYWALL === 'true' || false
  };

  /**
   * Check if a feature is enabled
   * @param {string} flagName 
   * @returns {boolean}
   */
  static isEnabled(flagName) {
    return this.flags[flagName] === true;
  }

  /**
   * Dynamically toggle a feature (Admin only operation)
   * @param {string} flagName 
   * @param {boolean} value 
   */
  static toggle(flagName, value) {
    if (this.flags.hasOwnProperty(flagName)) {
      this.flags[flagName] = value;
      console.log(`[FeatureFlag] ${flagName} is now ${value ? 'ENABLED' : 'DISABLED'}`);
    }
  }
}

module.exports = { FeatureFlags };
