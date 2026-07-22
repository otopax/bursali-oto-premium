/**
 * @interface IAiProvider
 * Abstracts the LLM and Embedding services to allow easy swapping of providers (e.g. OpenAI, Anthropic, Google).
 */
export class IAiProvider {
  /**
   * Streams a text response from the LLM.
   * @param {Object} params
   * @param {string} params.systemPrompt
   * @param {Array} params.messages
   * @param {Object} params.tools
   * @param {Function} params.onFinish
   */
  streamResponse({ systemPrompt, messages, tools, onFinish }) {
    throw new Error('Not implemented');
  }

  /**
   * Generates a vector embedding for a given text.
   * @param {string} text
   * @returns {Promise<number[]>}
   */
  async generateEmbedding(text) {
    throw new Error('Not implemented');
  }
}
