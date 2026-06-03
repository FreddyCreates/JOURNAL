import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class EventFilter {
  constructor() { this._filters = new Map(); this._stats = { passed: 0, blocked: 0 }; }
  addFilter(name, predicate) { if (typeof predicate !== 'function') throw new TypeError('predicate must be a function'); this._filters.set(name, predicate); return { name, filterCount: this._filters.size }; }
  apply(event) { for (const [name, pred] of this._filters) { if (!pred(event)) { this._stats.blocked++; return { passed: false, blockedBy: name, phiScore: 0 }; } } this._stats.passed++; return { passed: true, phiScore: PHI / (PHI + 1) }; }
  getStats() { return { ...this._stats, total: this._stats.passed + this._stats.blocked }; }
  removeFilter(name) { return this._filters.delete(name); }
}
