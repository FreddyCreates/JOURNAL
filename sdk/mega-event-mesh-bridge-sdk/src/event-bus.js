import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class EventBus {
  constructor(config = {}) { this.maxSubscribers = config.maxSubscribers ?? 1000; this._subscribers = new Map(); this._published = []; }
  subscribe(topic, handler) { if (typeof handler !== 'function') throw new TypeError('handler must be a function'); if (!this._subscribers.has(topic)) this._subscribers.set(topic, []); const subs = this._subscribers.get(topic); if (subs.length >= this.maxSubscribers) throw new Error('Max subscribers reached'); const subId = crypto.randomUUID(); subs.push({ subId, handler }); return { subId, topic }; }
  publish(topic, event) { const subs = this._subscribers.get(topic) || []; const delivered = subs.length; for (const sub of subs) sub.handler(event); const record = { eventId: crypto.randomUUID(), topic, delivered, phiReach: Math.min(1, delivered / (this.maxSubscribers * (PHI / (PHI + 1)))), timestamp: Date.now() }; this._published.push(record); return record; }
  unsubscribe(topic, subId) { const subs = this._subscribers.get(topic); if (!subs) return false; const idx = subs.findIndex(s => s.subId === subId); if (idx === -1) return false; subs.splice(idx, 1); return true; }
  getTopics() { return [...this._subscribers.keys()]; }
  getPublished() { return [...this._published]; }
}
