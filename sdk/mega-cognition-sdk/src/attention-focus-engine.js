import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class AttentionFocusEngine {
  constructor(config = {}) {
    this.focusSlots = config.focusSlots ?? 7;
    this.decayRate = config.decayRate ?? (1 / PHI);
    this.boostFactor = config.boostFactor ?? PHI;
    this._targets = new Map();
  }

  focus(target, priority = 1.0) {
    const targetId = crypto.randomUUID();
    const entry = { targetId, target, priority, focusStrength: priority * this.boostFactor, timestamp: Date.now() };
    this._targets.set(targetId, entry);
    return { ...entry };
  }

  getTopFocus(n = this.focusSlots) {
    const sorted = [...this._targets.values()].sort((a, b) => b.focusStrength - a.focusStrength);
    return sorted.slice(0, n);
  }

  decay() {
    const removed = [];
    for (const [id, entry] of this._targets) {
      entry.focusStrength *= this.decayRate;
      if (entry.focusStrength < 0.01) {
        this._targets.delete(id);
        removed.push(id);
      }
    }
    return { remaining: this._targets.size, removed: removed.length };
  }

  boost(targetId) {
    const entry = this._targets.get(targetId);
    if (!entry) throw new Error(`Target ${targetId} not found`);
    entry.focusStrength *= this.boostFactor;
    return { targetId, focusStrength: entry.focusStrength };
  }

  getFocusState() {
    const targets = [...this._targets.values()];
    const totalStrength = targets.reduce((sum, t) => sum + t.focusStrength, 0);
    const dominant = targets.sort((a, b) => b.focusStrength - a.focusStrength)[0] ?? null;
    return { activeTargets: targets.length, totalStrength, dominantTarget: dominant };
  }

  clear() {
    this._targets.clear();
  }
}
