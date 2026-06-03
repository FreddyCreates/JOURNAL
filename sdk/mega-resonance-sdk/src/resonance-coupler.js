import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class ResonanceCoupler {
  constructor(config = {}) {
    this.couplingStrength = config.couplingStrength ?? PHI;
    this.maxCouplings = config.maxCouplings ?? 32;
    this.resonanceThreshold = config.resonanceThreshold ?? 0.618;
    this._couplings = new Map();
  }

  couple(systemA, systemB) {
    if (this._couplings.size >= this.maxCouplings) throw new Error('Max couplings reached');
    const couplingId = crypto.randomUUID();
    const resonance = Math.abs(Math.sin((systemA.frequency ?? 1) / (systemB.frequency ?? 1) * Math.PI));
    const stable = resonance >= this.resonanceThreshold;
    const entry = { couplingId, systems: [systemA, systemB], strength: this.couplingStrength, resonance, stable };
    this._couplings.set(couplingId, entry);
    return { ...entry };
  }

  decouple(couplingId) { return this._couplings.delete(couplingId); }

  getResonance(couplingId) {
    const c = this._couplings.get(couplingId);
    if (!c) return null;
    return { couplingId, resonance: c.resonance, stable: c.stable, strength: c.strength };
  }

  getCouplings() { return [...this._couplings.values()]; }

  getStrongest() {
    let best = null;
    for (const c of this._couplings.values()) {
      if (!best || c.resonance > best.resonance) best = c;
    }
    return best;
  }

  optimizeCouplings() {
    let optimized = 0;
    for (const c of this._couplings.values()) {
      c.strength = c.resonance * PHI;
      optimized++;
    }
    return { optimized, avgStrength: this._couplings.size > 0 ? [...this._couplings.values()].reduce((s, c) => s + c.strength, 0) / this._couplings.size : 0 };
  }
}
