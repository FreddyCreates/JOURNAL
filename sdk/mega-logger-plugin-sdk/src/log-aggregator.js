import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class LogAggregator {
  constructor() { this._buckets = new Map(); }
  add(log) { const key = log.level ?? 'unknown'; if (!this._buckets.has(key)) this._buckets.set(key, []); this._buckets.get(key).push(log); return { level: key, count: this._buckets.get(key).length }; }
  getSummary() { const summary = {}; for (const [level, logs] of this._buckets) { summary[level] = { count: logs.length, phiDensity: logs.length / (logs.length + PHI) }; } return summary; }
  getByLevel(level) { return this._buckets.get(level) ?? []; }
  getTotal() { let total = 0; for (const logs of this._buckets.values()) total += logs.length; return total; }
  clear() { this._buckets.clear(); }
}
