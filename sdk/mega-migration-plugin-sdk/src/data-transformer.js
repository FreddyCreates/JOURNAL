import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class DataTransformer {
  constructor() { this._transformations = []; }
  transform(records, transformFn) { if (!Array.isArray(records)) throw new Error('records must be an array'); if (typeof transformFn !== 'function') throw new TypeError('transformFn must be a function'); const transformed = records.map(transformFn); const record = { transformId: crypto.randomUUID(), inputCount: records.length, outputCount: transformed.length, phiFidelity: PHI / (PHI + 1), timestamp: Date.now() }; this._transformations.push(record); return { ...record, data: transformed }; }
  getHistory() { return [...this._transformations]; }
}
