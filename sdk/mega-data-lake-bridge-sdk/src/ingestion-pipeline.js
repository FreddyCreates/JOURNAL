import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class IngestionPipeline {
  constructor(config = {}) { this.batchSize = config.batchSize ?? 100; this._buffer = []; this._batches = []; }
  ingest(record) { if (!record) throw new Error('Record required'); this._buffer.push({ ...record, ingestedAt: Date.now() }); if (this._buffer.length >= this.batchSize) return this.flush(); return { buffered: this._buffer.length, flushed: false }; }
  flush() { if (this._buffer.length === 0) return { flushed: false, count: 0 }; const batch = { batchId: crypto.randomUUID(), records: [...this._buffer], count: this._buffer.length, phiThroughput: Math.min(1, this._buffer.length / this.batchSize * (PHI / (PHI + 1))), flushedAt: Date.now() }; this._batches.push(batch); this._buffer = []; return { flushed: true, count: batch.count, batchId: batch.batchId }; }
  getBuffer() { return [...this._buffer]; }
  getBatches() { return this._batches.map(b => ({ batchId: b.batchId, count: b.count })); }
}
