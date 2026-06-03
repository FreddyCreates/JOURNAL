import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class QuotaManager {
  constructor() { this._quotas = new Map(); this._usage = new Map(); }
  setQuota(entityId, limit) { this._quotas.set(entityId, { limit, setAt: Date.now() }); this._usage.set(entityId, 0); return { entityId, limit }; }
  consume(entityId, amount = 1) { const quota = this._quotas.get(entityId); if (!quota) throw new Error(`No quota for "${entityId}"`); const used = (this._usage.get(entityId) ?? 0) + amount; this._usage.set(entityId, used); const allowed = used <= quota.limit; return { allowed, used, limit: quota.limit, remaining: Math.max(0, quota.limit - used), phiUtilization: used / quota.limit * (PHI / (PHI + 1)) }; }
  getUsage(entityId) { return { entityId, used: this._usage.get(entityId) ?? 0, limit: this._quotas.get(entityId)?.limit ?? 0 }; }
  resetUsage(entityId) { this._usage.set(entityId, 0); return { entityId, reset: true }; }
}
