import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class TrustScorer {
  constructor(config = {}) { this.decayRate = config.decayRate ?? 0.01; this._scores = new Map(); this._events = []; }
  initialize(entityId, baseScore = 0.5) { this._scores.set(entityId, { score: baseScore, lastUpdated: Date.now() }); return { entityId, score: baseScore }; }
  boost(entityId, amount) { const entry = this._scores.get(entityId); if (!entry) throw new Error('Entity not found'); entry.score = Math.min(1, entry.score + amount * (PHI / (PHI + 1))); entry.lastUpdated = Date.now(); this._events.push({ entityId, type: 'boost', amount, timestamp: Date.now() }); return { entityId, score: entry.score }; }
  penalize(entityId, amount) { const entry = this._scores.get(entityId); if (!entry) throw new Error('Entity not found'); entry.score = Math.max(0, entry.score - amount); entry.lastUpdated = Date.now(); this._events.push({ entityId, type: 'penalize', amount, timestamp: Date.now() }); return { entityId, score: entry.score }; }
  getScore(entityId) { const entry = this._scores.get(entityId); if (!entry) throw new Error('Entity not found'); return { entityId, score: entry.score, phiWeighted: entry.score * (PHI / (PHI + 1)) }; }
  getEvents() { return [...this._events]; }
}
