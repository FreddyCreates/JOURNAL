import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class ResponseCache {
  constructor(config = {}) { this.maxSize = config.maxSize ?? 1000; this.ttl = config.ttl ?? 60000; this._cache = new Map(); this._stats = { hits: 0, misses: 0 }; }
  set(key, value) { if (this._cache.size >= this.maxSize) { const oldest = this._cache.keys().next().value; this._cache.delete(oldest); } this._cache.set(key, { value, expiresAt: Date.now() + this.ttl }); return { key, cached: true }; }
  get(key) { const entry = this._cache.get(key); if (!entry || Date.now() > entry.expiresAt) { this._stats.misses++; this._cache.delete(key); return { hit: false, phiScore: 0 }; } this._stats.hits++; return { hit: true, value: entry.value, phiScore: PHI / (PHI + 1) }; }
  invalidate(key) { return this._cache.delete(key); }
  getStats() { const total = this._stats.hits + this._stats.misses; return { ...this._stats, hitRate: total > 0 ? this._stats.hits / total : 0, size: this._cache.size }; }
  flush() { this._cache.clear(); }
}
