import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class FlagManager {
  constructor() { this._flags = new Map(); }
  create(name, config = {}) { if (this._flags.has(name)) throw new Error(`Flag "${name}" already exists`); const flag = { flagId: crypto.randomUUID(), name, enabled: config.enabled ?? false, rolloutPercentage: config.rolloutPercentage ?? 0, createdAt: Date.now() }; this._flags.set(name, flag); return flag; }
  isEnabled(name, context = {}) { const flag = this._flags.get(name); if (!flag) return false; if (!flag.enabled) return false; if (flag.rolloutPercentage >= 100) return true; const hash = (context.userId ?? '').split('').reduce((h, c) => h + c.charCodeAt(0), 0) % 100; return hash < flag.rolloutPercentage; }
  toggle(name) { const flag = this._flags.get(name); if (!flag) throw new Error(`Flag "${name}" not found`); flag.enabled = !flag.enabled; return { name, enabled: flag.enabled }; }
  setRollout(name, percentage) { const flag = this._flags.get(name); if (!flag) throw new Error(`Flag "${name}" not found`); flag.rolloutPercentage = Math.min(100, Math.max(0, percentage)); return { name, rolloutPercentage: flag.rolloutPercentage }; }
  getAll() { return [...this._flags.values()]; }
  delete(name) { return this._flags.delete(name); }
}
