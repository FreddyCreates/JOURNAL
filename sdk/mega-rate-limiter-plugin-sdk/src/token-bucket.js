const PHI = 1.618033988749895;
export class TokenBucket {
  constructor(config = {}) { this.capacity = config.capacity ?? 100; this.refillRate = config.refillRate ?? 10; this.refillInterval = config.refillInterval ?? 1000; this._tokens = this.capacity; this._lastRefill = Date.now(); }
  _refill() { const now = Date.now(); const elapsed = now - this._lastRefill; const tokensToAdd = Math.floor(elapsed / this.refillInterval) * this.refillRate; if (tokensToAdd > 0) { this._tokens = Math.min(this.capacity, this._tokens + tokensToAdd); this._lastRefill = now; } }
  consume(tokens = 1) { this._refill(); if (tokens > this._tokens) return { allowed: false, available: this._tokens, phiPressure: (1 - this._tokens / this.capacity) * (PHI / (PHI + 1)) }; this._tokens -= tokens; return { allowed: true, remaining: this._tokens, phiPressure: (1 - this._tokens / this.capacity) * (PHI / (PHI + 1)) }; }
  getStatus() { this._refill(); return { tokens: this._tokens, capacity: this.capacity, utilization: 1 - this._tokens / this.capacity }; }
  reset() { this._tokens = this.capacity; this._lastRefill = Date.now(); }
}
