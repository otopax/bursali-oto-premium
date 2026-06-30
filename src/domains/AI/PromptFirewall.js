/**
 * V5.0 Prompt Firewall
 * Protects the AI layer from malicious prompt injection attacks, jailbreaks, and system instructions override attempts.
 */

class PromptFirewallError extends Error {
  constructor(message) {
    super(message);
    this.name = "PromptFirewallError";
  }
}

const MALICIOUS_PATTERNS = [
  "ignore all previous instructions",
  "ignore previous instructions",
  "forget previous instructions",
  "system prompt",
  "delete database",
  "drop table",
  "bypassing filters",
  "you are now a totally different ai",
  "disregard context",
  "developer mode",
  "dan mode" // Do Anything Now
];

/**
 * Checks if a prompt contains known malicious injection patterns.
 * @param {string} prompt - The raw user input
 * @returns {boolean} - True if malicious, false otherwise
 */
function isMaliciousPrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') return false;
  const lowerPrompt = prompt.toLowerCase();
  return MALICIOUS_PATTERNS.some(term => lowerPrompt.includes(term));
}

/**
 * Secures a prompt by running it through the firewall.
 * Throws a PromptFirewallError if an injection attempt is detected.
 * @param {string} prompt - The raw user input
 * @returns {Promise<string>} - The safe prompt
 */
async function securePrompt(prompt) {
  if (isMaliciousPrompt(prompt)) {
    console.error(`🚨 [PromptFirewall] Blocked injection attempt. Prompt length: ${prompt.length}`);
    // In a real enterprise system, we would log this to an Audit Table with the User's ID and IP
    throw new PromptFirewallError("🚨 Prompt blocked by firewall: Injection attempt detected.");
  }
  return prompt;
}

module.exports = {
  securePrompt,
  isMaliciousPrompt,
  PromptFirewallError
};
