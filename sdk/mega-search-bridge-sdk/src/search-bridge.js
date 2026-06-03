import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class SearchBridge {
  constructor() { this._engines = new Map(); this._federated = []; }
  registerEngine(name, searchFn) { if (typeof searchFn !== 'function') throw new TypeError('searchFn must be a function'); this._engines.set(name, searchFn); return { name, engineCount: this._engines.size }; }
  search(engineName, query) { const fn = this._engines.get(engineName); if (!fn) throw new Error(`Engine "${engineName}" not found`); return fn(query); }
  federatedSearch(query) { const results = {}; for (const [name, fn] of this._engines) { results[name] = fn(query); } const record = { searchId: crypto.randomUUID(), query, engines: [...this._engines.keys()], phiCoverage: PHI / (PHI + 1), timestamp: Date.now() }; this._federated.push(record); return { ...record, results }; }
  getEngines() { return [...this._engines.keys()]; }
}
