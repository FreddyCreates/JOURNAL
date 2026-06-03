import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class PreferenceStore {
  constructor() { this._preferences = new Map(); }
  set(userId, prefs) { this._preferences.set(userId, { ...prefs, updatedAt: Date.now() }); return { userId, stored: true }; }
  get(userId) { const prefs = this._preferences.get(userId); if (!prefs) return { userId, preferences: {}, default: true }; return { userId, preferences: prefs, phiPersonalization: PHI / (PHI + 1) }; }
  shouldNotify(userId, channel, priority) { const prefs = this._preferences.get(userId); if (!prefs) return true; if (prefs.mutedChannels && prefs.mutedChannels.includes(channel)) return false; if (prefs.minPriority && priority === 'low') return false; return true; }
  delete(userId) { return this._preferences.delete(userId); }
}
