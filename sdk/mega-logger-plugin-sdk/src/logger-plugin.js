import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class LoggerPlugin {
  constructor(config = {}) { this.name = config.name ?? 'logger'; this._interceptors = []; this._logCount = 0; }
  addInterceptor(fn) { if (typeof fn !== 'function') throw new TypeError('fn must be a function'); this._interceptors.push(fn); return { interceptorCount: this._interceptors.length }; }
  process(log) { let result = { ...log }; for (const interceptor of this._interceptors) result = interceptor(result); this._logCount++; return { ...result, processed: true, phiEnriched: PHI / (PHI + 1) }; }
  getLogCount() { return this._logCount; }
}
