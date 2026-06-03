import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class SlidingWindow {
  constructor(config = {}) { this.windowMs = config.windowMs ?? 60000; this.maxRequests = config.maxRequests ?? 100; this._windows = new Map(); }
  record(clientId) { const now = Date.now(); if (!this._windows.has(clientId)) this._windows.set(clientId, []); const window = this._windows.get(clientId); window.push(now); const cutoff = now - this.windowMs; const active = window.filter(t => t > cutoff); this._windows.set(clientId, active); const allowed = active.length <= this.maxRequests; return { allowed, count: active.length, remaining: Math.max(0, this.maxRequests - active.length), phiLoad: active.length / this.maxRequests * (PHI / (PHI + 1)) }; }
  getCount(clientId) { const now = Date.now(); const window = this._windows.get(clientId) ?? []; return window.filter(t => t > now - this.windowMs).length; }
  reset(clientId) { this._windows.delete(clientId); return { clientId, reset: true }; }
}
