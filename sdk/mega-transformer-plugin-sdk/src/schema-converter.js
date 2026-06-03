import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class SchemaConverter {
  constructor() { this._converters = new Map(); this._conversions = []; }
  register(fromFormat, toFormat, converter) { if (typeof converter !== 'function') throw new TypeError('converter must be a function'); this._converters.set(`${fromFormat}->${toFormat}`, converter); return { from: fromFormat, to: toFormat }; }
  convert(fromFormat, toFormat, data) { const key = `${fromFormat}->${toFormat}`; const converter = this._converters.get(key); if (!converter) throw new Error(`No converter for ${fromFormat} -> ${toFormat}`); const result = converter(data); const record = { conversionId: crypto.randomUUID(), from: fromFormat, to: toFormat, phiAccuracy: PHI / (PHI + 1), timestamp: Date.now() }; this._conversions.push(record); return { ...record, result }; }
  getConverters() { return [...this._converters.keys()]; }
}
