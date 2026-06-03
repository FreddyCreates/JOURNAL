import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class PerceptualMemoryBuffer {
  constructor(config = {}) {
    this.bufferSize = config.bufferSize ?? 128;
    this.retentionDecay = config.retentionDecay ?? (1 / PHI);
    this.consolidationThreshold = config.consolidationThreshold ?? 0.7;
    this._buffer = [];
    this._consolidated = [];
  }

  buffer(perception) {
    const entry = {
      entryId: crypto.randomUUID(),
      perception,
      strength: 1.0,
      timestamp: Date.now()
    };
    this._buffer.push(entry);
    if (this._buffer.length > this.bufferSize) this._buffer.shift();
    return { entryId: entry.entryId, bufferPosition: this._buffer.length - 1, strength: entry.strength };
  }

  recall(query) {
    const queryStr = JSON.stringify(query);
    const now = Date.now();
    return this._buffer
      .map(entry => {
        const age = (now - entry.timestamp) / 1000;
        const recencyWeight = Math.pow(PHI, -age / 60);
        const relevance = this._computeRelevance(entry.perception, query);
        return { ...entry, recencyWeight, relevance, score: relevance * recencyWeight };
      })
      .filter(e => e.score > 0.1)
      .sort((a, b) => b.score - a.score);
  }

  _computeRelevance(perception, query) {
    const a = JSON.stringify(perception);
    const b = JSON.stringify(query);
    const common = [...new Set(a)].filter(c => b.includes(c)).length;
    return common / Math.max(new Set(a).size, new Set(b).size, 1);
  }

  consolidate() {
    const toConsolidate = this._buffer.filter(e => e.strength >= this.consolidationThreshold);
    this._consolidated.push(...toConsolidate);
    this._buffer = this._buffer.filter(e => e.strength < this.consolidationThreshold);
    return { consolidated: toConsolidate.length, remaining: this._buffer.length };
  }

  getBufferState() {
    return {
      buffered: this._buffer.length,
      consolidated: this._consolidated.length,
      oldestEntry: this._buffer[0]?.timestamp ?? null,
      newestEntry: this._buffer[this._buffer.length - 1]?.timestamp ?? null
    };
  }

  flush() {
    const count = this._buffer.length;
    this._buffer = [];
    return { flushed: count };
  }
}
