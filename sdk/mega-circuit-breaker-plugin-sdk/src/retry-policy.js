const PHI = 1.618033988749895;
export class RetryPolicy {
  constructor(config = {}) { this.maxRetries = config.maxRetries ?? 3; this.backoffBase = config.backoffBase ?? 100; this.backoffFactor = config.backoffFactor ?? PHI; this._attempts = []; }
  execute(fn) { let lastError; for (let attempt = 0; attempt <= this.maxRetries; attempt++) { try { const result = fn(); this._attempts.push({ attempt, success: true, timestamp: Date.now() }); return { result, attempts: attempt + 1, phiResilience: 1 / (attempt + 1) * (PHI / (PHI + 1)) }; } catch (e) { lastError = e; this._attempts.push({ attempt, success: false, timestamp: Date.now() }); } } throw lastError; }
  getDelay(attempt) { return Math.min(30000, this.backoffBase * Math.pow(this.backoffFactor, attempt)); }
  getAttempts() { return [...this._attempts]; }
}
