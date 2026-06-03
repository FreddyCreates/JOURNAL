import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class EvictionPolicy {
  constructor(config = {}) { this.policy = config.policy ?? 'lru'; this.maxSize = config.maxSize ?? 1000; this._entries = new Map(); this._evictions = 0; }
  track(key) { this._entries.set(key, { lastAccess: Date.now(), accessCount: (this._entries.get(key)?.accessCount ?? 0) + 1 }); return { key, tracked: true }; }
  shouldEvict() { return this._entries.size >= this.maxSize; }
  evict() { if (this._entries.size === 0) return null; let victim = null; if (this.policy === 'lru') { let oldest = Infinity; for (const [k, v] of this._entries) { if (v.lastAccess < oldest) { oldest = v.lastAccess; victim = k; } } } else if (this.policy === 'lfu') { let minFreq = Infinity; for (const [k, v] of this._entries) { if (v.accessCount < minFreq) { minFreq = v.accessCount; victim = k; } } } if (victim) { this._entries.delete(victim); this._evictions++; } return { evicted: victim, totalEvictions: this._evictions, phiPressure: this._entries.size / this.maxSize * (PHI / (PHI + 1)) }; }
  getSize() { return this._entries.size; }
  getEvictions() { return this._evictions; }
}
