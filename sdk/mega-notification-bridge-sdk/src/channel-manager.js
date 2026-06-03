import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class ChannelManager {
  constructor() { this._channels = new Map(); }
  register(name, config = {}) { this._channels.set(name, { name, type: config.type ?? 'push', enabled: true, createdAt: Date.now() }); return { name, type: config.type ?? 'push' }; }
  disable(name) { const ch = this._channels.get(name); if (!ch) throw new Error('Channel not found'); ch.enabled = false; return { name, enabled: false }; }
  enable(name) { const ch = this._channels.get(name); if (!ch) throw new Error('Channel not found'); ch.enabled = true; return { name, enabled: true }; }
  getActive() { return [...this._channels.values()].filter(c => c.enabled); }
  getAll() { return [...this._channels.values()]; }
}
