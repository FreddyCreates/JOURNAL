import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class MetricExporter {
  constructor(config = {}) { this.batchSize = config.batchSize ?? 100; this._buffer = []; this._exports = []; }
  record(name, value, tags = {}) { this._buffer.push({ name, value, tags, timestamp: Date.now() }); if (this._buffer.length >= this.batchSize) return this.flush(); return { buffered: this._buffer.length }; }
  flush() { if (this._buffer.length === 0) return { exported: 0 }; const batch = { exportId: crypto.randomUUID(), metrics: [...this._buffer], count: this._buffer.length, phiVolume: Math.min(1, this._buffer.length / this.batchSize * (PHI / (PHI + 1))), exportedAt: Date.now() }; this._exports.push(batch); this._buffer = []; return { exported: batch.count, exportId: batch.exportId }; }
  getExports() { return this._exports.map(e => ({ exportId: e.exportId, count: e.count })); }
  getBuffer() { return [...this._buffer]; }
}
