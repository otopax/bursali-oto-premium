// 🚀 V5.0 HOTFIX: Circuit Breaker artık 60 saniye sonra kendi kendini iyileştiriyor (Half-Open).
const { GeminiProvider, ClaudeProvider, OpenAIProvider } = require('./Providers');
const redisClient = require('../../lib/redis/client');

class AIOrchestrator {
  constructor() {
    this.chain = [new GeminiProvider(), new ClaudeProvider(), new OpenAIProvider()];
    // Circuit Breaker durumları artık Redis'te saklanıyor (Distributed)
    this.cbKeyPrefix = 'cb:provider:';
  }

  async getCircuitState(name) {
    const key = this.cbKeyPrefix + name;
    const data = await redisClient.get(key);
    if (!data) return { failures: 0, isOpen: false, lastFailureAt: 0, avgLatency: 0 };
    return JSON.parse(data);
  }

  async setCircuitState(name, state) {
    const key = this.cbKeyPrefix + name;
    await redisClient.set(key, JSON.stringify(state), 'EX', 3600); // 1 saat TTL
  }

  async withTimeout(promise, ms, providerName) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(`Timeout: ${providerName} exceeded ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
  }

  async logAnalytics(providerName, metrics) {
    try {
      const date = new Date().toISOString().split('T')[0];
      const key = `analytics:ai:${date}`;
      const pipeline = redisClient.pipeline();
      
      for (const [metric, value] of Object.entries(metrics)) {
        pipeline.hincrby(key, `model:${providerName}:${metric}`, value);
      }
      
      // Update latency_max manually
      if (metrics.latency) {
        const currentMax = await redisClient.hget(key, `model:${providerName}:latency_max`);
        if (!currentMax || metrics.latency > parseInt(currentMax, 10)) {
          pipeline.hset(key, `model:${providerName}:latency_max`, metrics.latency);
        }
      }
      
      await pipeline.exec();
    } catch (e) {
      console.warn(`[AI Analytics Error] ${e.message}`);
    }
  }

  classifyPromptComplexity(prompt) {
    const complexKeywords = ['analiz', 'karşılaştır', 'diyagram', 'verileri', 'sistematik'];
    if (prompt.length > 500) return 'COMPLEX';
    for (const word of complexKeywords) {
      if (prompt.toLowerCase().includes(word)) return 'COMPLEX';
    }
    return 'SIMPLE';
  }

  getRoutingChain(complexity) {
    if (complexity === 'SIMPLE') {
      // Basit sorular: Önce en ucuz (Gemini), sonra OpenAI, sonra Claude
      return [this.chain[0], this.chain[2], this.chain[1]];
    }
    // Karmaşık sorular: Önce en zeki (Claude), sonra OpenAI, sonra Gemini
    return [this.chain[1], this.chain[2], this.chain[0]];
  }

  async executeWithFallback(prompt) {
    const complexity = this.classifyPromptComplexity(prompt);
    const chain = this.getRoutingChain(complexity);
    let lastError = null;
    const timeoutMs = 16000; // >15 saniye

    for (const provider of chain) {
      const cb = await this.getCircuitState(provider.name);

      // [Kritik Fix]: Half-Open / Self-Healing mantığı
      if (cb.isOpen) {
        const elapsed = Date.now() - cb.lastFailureAt;
        if (elapsed < 300000) {
          console.log(`[CircuitBreaker] ⏳ ${provider.name} karantinada (${Math.round((300000-elapsed)/1000)}s kaldı). Atlanıyor.`);
          continue; // 5 dakika dolmadıysa es geç
        } else {
          console.log(`[CircuitBreaker] 🔄 ${provider.name} karantina süresi doldu. Half-Open moduna geçiliyor.`);
          cb.isOpen = false; // Yarım açık (tekrar dene)
          cb.failures = 0;
        }
      }

      // Basit soru için ortalama gecikme > 8sn ise doğrudan atla (performans)
      if (complexity === 'SIMPLE' && cb.avgLatency > 8000) {
        console.log(`[CircuitBreaker] ⚡ ${provider.name} çok yavaş (${cb.avgLatency}ms). Basit soru için atlanıyor.`);
        continue;
      }

      try {
        const start = Date.now();
        const response = await this.withTimeout(provider.generateText(prompt), timeoutMs, provider.name);
        const latency = Date.now() - start;

        // Başarılı: Devreyi sıfırla (KAPAT)
        cb.failures = 0;
        cb.isOpen = false;
        cb.lastFailureAt = 0;
        cb.avgLatency = cb.avgLatency === 0 ? latency : (cb.avgLatency * 0.7) + (latency * 0.3);
        await this.setCircuitState(provider.name, cb);

        // Analitik Log
        const estimatedTokens = Math.ceil(prompt.length / 4) + Math.ceil(response.length / 4);
        await this.logAnalytics(provider.name, {
          requests: 1,
          success: 1,
          latency: latency,
          tokens: estimatedTokens
        });

        console.log(`[AIOrchestrator] ✅ ${provider.name} ile başarılı (${latency}ms)`);
        return response;

      } catch (error) {
        lastError = error;
        console.warn(`[AIOrchestrator] ❌ ${provider.name} hata verdi: ${error.message}`);

        // Başarısız: Devreyi aç (Trip)
        cb.failures += 1;
        cb.lastFailureAt = Date.now();
        if (cb.failures >= 3) {
          cb.isOpen = true;
          console.warn(`[CircuitBreaker] 🛑 ${provider.name} DEVRESİ AÇILDI! 5 dakika karantina.`);
        }
        await this.setCircuitState(provider.name, cb);
        
        // Analitik Log (Başarısızlık)
        const isTimeout = error.message.includes('Timeout');
        await this.logAnalytics(provider.name, {
          requests: 1,
          failure: 1,
          timeout: isTimeout ? 1 : 0
        });
      }
    }
    throw new Error(`CIRCUIT_BREAKER_OPEN_ALL`);
  }
}

module.exports = { AIOrchestrator: new AIOrchestrator() };
