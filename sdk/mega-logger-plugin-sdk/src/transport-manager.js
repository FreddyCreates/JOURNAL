import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class TransportManager {
  constructor() { this._transports = new Map(); this._delivered = []; }
  register(name, handler) { if (typeof handler !== 'function') throw new TypeError('handler must be a function'); this._transports.set(name, { name, handler, enabled: true }); return { name, registered: true }; }
  send(log) { let delivered = 0; for (const [name, transport] of this._transports) { if (transport.enabled) { transport.handler(log); delivered++; } } this._delivered.push({ logId: log.logId ?? crypto.randomUUID(), transports: delivered, phiReach: delivered / (this._transports.size || 1) * (PHI / (PHI + 1)), timestamp: Date.now() }); return { delivered }; }
  disable(name) { const t = this._transports.get(name); if (!t) throw new Error('Transport not found'); t.enabled = false; return { name, enabled: false }; }
  enable(name) { const t = this._transports.get(name); if (!t) throw new Error('Transport not found'); t.enabled = true; return { name, enabled: true }; }
  getTransports() { return [...this._transports.keys()]; }
}
