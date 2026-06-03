import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class HealthMonitor {
  constructor(config = {}) { this.checkInterval = config.checkInterval ?? 10000; this._checks = new Map(); this._results = []; }
  register(name, checkFn) { if (typeof checkFn !== 'function') throw new TypeError('checkFn must be a function'); this._checks.set(name, checkFn); return { name, registered: true }; }
  check(name) { const checkFn = this._checks.get(name); if (!checkFn) throw new Error(`Health check "${name}" not found`); let healthy; try { healthy = checkFn(); } catch { healthy = false; } const result = { checkId: crypto.randomUUID(), name, healthy: !!healthy, phiVitality: healthy ? PHI / (PHI + 1) : 0, timestamp: Date.now() }; this._results.push(result); return result; }
  checkAll() { const results = {}; for (const name of this._checks.keys()) results[name] = this.check(name); return results; }
  getResults() { return [...this._results]; }
}
