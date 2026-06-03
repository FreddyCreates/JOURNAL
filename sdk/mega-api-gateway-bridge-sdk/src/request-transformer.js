import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class RequestTransformer {
  constructor() { this._transforms = []; this._history = []; }
  addTransform(name, fn) { if (typeof fn !== 'function') throw new TypeError('transform must be a function'); this._transforms.push({ name, fn }); return { name, transformCount: this._transforms.length }; }
  transform(request) { let result = { ...request }; for (const t of this._transforms) result = t.fn(result); const record = { transformId: crypto.randomUUID(), transformsApplied: this._transforms.length, phiFidelity: PHI / (PHI + 1), timestamp: Date.now() }; this._history.push(record); return { ...record, result }; }
  getHistory() { return [...this._history]; }
  clear() { this._transforms = []; }
}
