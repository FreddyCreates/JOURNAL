import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class RateLimiter {
  constructor(config = {}) { this.maxRequests = config.maxRequests ?? 100; this.windowMs = config.windowMs ?? 60000; this._windows = new Map(); }
  check(clientId) { const now = Date.now(); let window = this._windows.get(clientId); if (!window || now - window.startedAt > this.windowMs) { window = { startedAt: now, count: 0 }; this._windows.set(clientId, window); } window.count++; const allowed = window.count <= this.maxRequests; const remaining = Math.max(0, this.maxRequests - window.count); const phiPressure = window.count / this.maxRequests * (PHI / (PHI + 1)); return { allowed, remaining, count: window.count, phiPressure }; }
  reset(clientId) { this._windows.delete(clientId); return { clientId, reset: true }; }
  getStatus(clientId) { const w = this._windows.get(clientId); return w ? { count: w.count, remaining: Math.max(0, this.maxRequests - w.count) } : { count: 0, remaining: this.maxRequests }; }
}
