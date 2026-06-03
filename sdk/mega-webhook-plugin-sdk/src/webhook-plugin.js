import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class WebhookPlugin {
  constructor(config = {}) { this.name = config.name ?? 'webhooks'; this._hooks = new Map(); this._dispatches = []; }
  on(event, url) { if (!this._hooks.has(event)) this._hooks.set(event, []); this._hooks.get(event).push({ url, createdAt: Date.now() }); return { event, url, hookCount: this._hooks.get(event).length }; }
  dispatch(event, payload) { const hooks = this._hooks.get(event) || []; const dispatched = hooks.map(h => ({ url: h.url, event, payload, dispatchId: crypto.randomUUID() })); const record = { event, dispatched: dispatched.length, phiCoverage: PHI / (PHI + 1), timestamp: Date.now() }; this._dispatches.push(record); return { ...record, deliveries: dispatched }; }
  getHooks(event) { return this._hooks.get(event) ?? []; }
  getDispatches() { return [...this._dispatches]; }
}
