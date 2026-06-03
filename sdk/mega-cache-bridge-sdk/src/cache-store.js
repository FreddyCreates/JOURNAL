import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class CacheStore {
  constructor(config = {}) { this.maxSize = config.maxSize ?? 10000; this.defaultTtl = config.defaultTtl ?? 300000; this._store = new Map(); this._stats = { hits: 0, misses: 0, sets: 0 }; }
  set(key, value, ttl) { if (this._store.size >= this.maxSize) this._evictOne(); this._store.set(key, { value, expiresAt: Date.now() + (ttl ?? this.defaultTtl), accessCount: 0 }); this._stats.sets++; return { key, stored: true }; }
  get(key) { const entry = this._store.get(key); if (!entry || Date.now() > entry.expiresAt) { this._stats.misses++; this._store.delete(key); return { hit: false }; } entry.accessCount++; this._stats.hits++; return { hit: true, value: entry.value, phiWeight: PHI / (PHI + 1) }; }
  delete(key) { return this._store.delete(key); }
  _evictOne() { const oldest = this._store.keys().next().value; if (oldest) this._store.delete(oldest); }
  getStats() { const total = this._stats.hits + this._stats.misses; return { ...this._stats, hitRate: total > 0 ? this._stats.hits / total : 0, size: this._store.size }; }
  flush() { this._store.clear(); }
}
