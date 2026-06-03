import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class TransformerPlugin {
  constructor(config = {}) { this.name = config.name ?? 'transformer'; this._transformers = new Map(); this._history = []; }
  register(name, fn) { if (typeof fn !== 'function') throw new TypeError('fn must be a function'); this._transformers.set(name, fn); return { name, registered: true }; }
  transform(transformerName, data) { const fn = this._transformers.get(transformerName); if (!fn) throw new Error(`Transformer "${transformerName}" not found`); const result = fn(data); const record = { transformId: crypto.randomUUID(), transformer: transformerName, phiQuality: PHI / (PHI + 1), timestamp: Date.now() }; this._history.push(record); return { ...record, result }; }
  getTransformers() { return [...this._transformers.keys()]; }
  getHistory() { return [...this._history]; }
}
