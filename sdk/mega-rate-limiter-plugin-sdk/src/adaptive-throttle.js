const PHI = 1.618033988749895;
export class AdaptiveThrottle {
  constructor(config = {}) { this.baseDelay = config.baseDelay ?? 100; this.maxDelay = config.maxDelay ?? 10000; this.backoffFactor = config.backoffFactor ?? PHI; this._clients = new Map(); }
  getDelay(clientId) { const state = this._clients.get(clientId) ?? { failures: 0, delay: this.baseDelay }; return { clientId, delay: state.delay, failures: state.failures, phiBackoff: state.delay / this.maxDelay * (PHI / (PHI + 1)) }; }
  recordFailure(clientId) { const state = this._clients.get(clientId) ?? { failures: 0, delay: this.baseDelay }; state.failures++; state.delay = Math.min(this.maxDelay, state.delay * this.backoffFactor); this._clients.set(clientId, state); return { clientId, delay: state.delay, failures: state.failures }; }
  recordSuccess(clientId) { const state = this._clients.get(clientId) ?? { failures: 0, delay: this.baseDelay }; state.failures = Math.max(0, state.failures - 1); state.delay = Math.max(this.baseDelay, state.delay / this.backoffFactor); this._clients.set(clientId, state); return { clientId, delay: state.delay, failures: state.failures }; }
  reset(clientId) { this._clients.delete(clientId); return { clientId, reset: true }; }
}
