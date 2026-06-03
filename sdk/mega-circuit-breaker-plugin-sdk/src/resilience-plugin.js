import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class ResiliencePlugin {
  constructor(config = {}) { this.name = config.name ?? 'resilience'; this._policies = new Map(); this._events = []; }
  addPolicy(name, type) { this._policies.set(name, { name, type, active: true, createdAt: Date.now() }); return { name, type }; }
  recordEvent(policyName, event) { const record = { eventId: crypto.randomUUID(), policy: policyName, event, phiResilience: PHI / (PHI + 1), timestamp: Date.now() }; this._events.push(record); return record; }
  getActivePolicies() { return [...this._policies.values()].filter(p => p.active); }
  getEvents() { return [...this._events]; }
}
