import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class RateLimiterPlugin {
  constructor(config = {}) { this.name = config.name ?? 'rate-limiter'; this.defaultLimit = config.defaultLimit ?? 100; this._limiters = new Map(); this._blocked = []; }
  createLimiter(name, limit) { this._limiters.set(name, { requests: 0, limit: limit ?? this.defaultLimit, resetAt: Date.now() + 60000 }); return { name, limit: limit ?? this.defaultLimit }; }
  check(limiterName) { const limiter = this._limiters.get(limiterName); if (!limiter) throw new Error(`Limiter "${limiterName}" not found`); if (Date.now() > limiter.resetAt) { limiter.requests = 0; limiter.resetAt = Date.now() + 60000; } limiter.requests++; const allowed = limiter.requests <= limiter.limit; if (!allowed) this._blocked.push({ name: limiterName, timestamp: Date.now() }); return { allowed, requests: limiter.requests, limit: limiter.limit, phiPressure: limiter.requests / limiter.limit * (PHI / (PHI + 1)) }; }
  getBlocked() { return [...this._blocked]; }
}
