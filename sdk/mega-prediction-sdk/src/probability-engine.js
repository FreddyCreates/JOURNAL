import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class ProbabilityEngine {
  constructor(config = {}) {
    this.precision = config.precision ?? 6;
    this.phiBayesian = config.phiBayesian ?? true;
    this.priorStrength = config.priorStrength ?? PHI;
    this._distribution = new Map();
    this._updateCount = 0;
    this._uniform();
  }

  _uniform() {
    this._distribution.clear();
    for (let i = 0; i < 10; i++) this._distribution.set(`state_${i}`, 0.1);
  }

  setPrior(distribution) {
    this._distribution.clear();
    const entries = Object.entries(distribution);
    for (const [key, value] of entries) this._distribution.set(key, value);
    return { states: this._distribution.size, set: true };
  }

  update(evidence) {
    this._updateCount++;
    const priorWeight = Math.pow(PHI, -this._updateCount);
    const keys = [...this._distribution.keys()];
    const evidenceKey = typeof evidence === 'string' ? evidence : (evidence.state ?? keys[0]);

    let total = 0;
    for (const [key, prob] of this._distribution) {
      const likelihood = key === evidenceKey ? PHI : 1.0;
      const updated = prob * priorWeight + likelihood * (1 - priorWeight);
      this._distribution.set(key, updated);
      total += updated;
    }
    for (const [key, prob] of this._distribution) this._distribution.set(key, prob / total);

    const posterior = Object.fromEntries(this._distribution);
    return { posterior, likelihood: PHI, priorWeight, confidence: 1 - priorWeight };
  }

  sample(n = 1) {
    const entries = [...this._distribution.entries()];
    const samples = [];
    for (let i = 0; i < n; i++) {
      let r = Math.random();
      for (const [key, prob] of entries) {
        r -= prob;
        if (r <= 0) { samples.push(key); break; }
      }
      if (samples.length <= i) samples.push(entries[entries.length - 1][0]);
    }
    return samples;
  }

  getDistribution() { return Object.fromEntries(this._distribution); }

  entropy() {
    let h = 0;
    for (const prob of this._distribution.values()) {
      if (prob > 0) h -= prob * Math.log2(prob);
    }
    return parseFloat(h.toFixed(this.precision));
  }

  reset() { this._updateCount = 0; this._uniform(); }
}
