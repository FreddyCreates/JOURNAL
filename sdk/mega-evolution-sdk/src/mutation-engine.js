import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class MutationEngine {
  constructor(config = {}) {
    this.strategies = config.strategies ?? ['point', 'swap', 'inversion', 'phi-shift'];
    this.defaultRate = config.defaultRate ?? (1 / PHI);
    this.adaptiveRate = config.adaptiveRate ?? true;
    this._currentRate = this.defaultRate;
    this._stats = { totalMutations: 0, byStrategy: {} };
    for (const s of this.strategies) this._stats.byStrategy[s] = 0;
  }

  mutate(genome, strategy = 'point') {
    if (!this.strategies.includes(strategy)) throw new Error(`Unknown strategy: ${strategy}`);
    const original = [...genome];
    const mutated = [...genome];
    let changeCount = 0;

    switch (strategy) {
      case 'point':
        for (let i = 0; i < mutated.length; i++) {
          if (Math.random() < this._currentRate) { mutated[i] = Math.random(); changeCount++; }
        }
        break;
      case 'swap':
        const i = Math.floor(Math.random() * mutated.length);
        const j = Math.floor(Math.random() * mutated.length);
        [mutated[i], mutated[j]] = [mutated[j], mutated[i]];
        changeCount = i !== j ? 2 : 0;
        break;
      case 'inversion':
        const start = Math.floor(Math.random() * mutated.length);
        const end = Math.min(start + Math.floor(mutated.length / PHI), mutated.length);
        const segment = mutated.slice(start, end).reverse();
        mutated.splice(start, segment.length, ...segment);
        changeCount = segment.length;
        break;
      case 'phi-shift':
        for (let i = 0; i < mutated.length; i++) {
          mutated[i] = (mutated[i] * PHI) % 1.0;
          changeCount++;
        }
        break;
    }

    this._stats.totalMutations++;
    this._stats.byStrategy[strategy]++;
    const phiAlignment = mutated.reduce((s, v) => s + Math.abs(v - (1/PHI)), 0) / mutated.length;
    return { original, mutated, strategy, changeCount, phiAlignment: 1 - phiAlignment };
  }

  adaptRate(fitnessHistory) {
    if (fitnessHistory.length < 2) return this._currentRate;
    const recent = fitnessHistory.slice(-5);
    const improving = recent[recent.length - 1] > recent[0];
    this._currentRate = improving ? this._currentRate / PHI : this._currentRate * PHI;
    this._currentRate = Math.min(1.0, Math.max(0.001, this._currentRate));
    return this._currentRate;
  }

  getStrategies() { return [...this.strategies]; }
  setRate(rate) { this._currentRate = rate; }
  getStats() { return { ...this._stats, currentRate: this._currentRate }; }
}
