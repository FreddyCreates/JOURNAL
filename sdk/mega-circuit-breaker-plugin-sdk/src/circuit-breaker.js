import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class CircuitBreaker {
  constructor(config = {}) { this.failureThreshold = config.failureThreshold ?? 5; this.resetTimeout = config.resetTimeout ?? 30000; this._state = 'closed'; this._failures = 0; this._lastFailure = 0; this._stats = { successes: 0, failures: 0, rejected: 0 }; }
  execute(fn) { if (this._state === 'open') { if (Date.now() - this._lastFailure > this.resetTimeout) { this._state = 'half-open'; } else { this._stats.rejected++; throw new Error('Circuit is open'); } } try { const result = fn(); this._onSuccess(); return result; } catch (e) { this._onFailure(); throw e; } }
  _onSuccess() { this._failures = 0; this._state = 'closed'; this._stats.successes++; }
  _onFailure() { this._failures++; this._lastFailure = Date.now(); this._stats.failures++; if (this._failures >= this.failureThreshold) this._state = 'open'; }
  getState() { return this._state; }
  getStats() { return { ...this._stats, state: this._state, phiHealth: this._state === 'closed' ? PHI / (PHI + 1) : 0 }; }
  reset() { this._state = 'closed'; this._failures = 0; }
}
