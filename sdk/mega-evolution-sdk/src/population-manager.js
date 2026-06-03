import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class PopulationManager {
  constructor(config = {}) {
    this.capacity = config.capacity ?? 128;
    this.diversityThreshold = config.diversityThreshold ?? 0.3;
    this.selectionPressure = config.selectionPressure ?? PHI;
    this._members = [];
  }

  add(genome, fitness) {
    if (this._members.length >= this.capacity) throw new Error('Population at capacity');
    const memberId = crypto.randomUUID();
    const diversity = this._computeDiversity(genome);
    const entry = { memberId, genome: [...genome], fitness, diversity, addedAt: Date.now() };
    this._members.push(entry);
    this._members.sort((a, b) => b.fitness - a.fitness);
    const rank = this._members.findIndex(m => m.memberId === memberId);
    return { memberId, fitness, rank, diversity };
  }

  _computeDiversity(genome) {
    if (this._members.length === 0) return 1.0;
    const avgDist = this._members.reduce((sum, m) => {
      const dist = genome.reduce((s, g, i) => s + Math.pow(g - (m.genome[i] ?? 0), 2), 0);
      return sum + Math.sqrt(dist);
    }, 0) / this._members.length;
    return Math.min(1.0, avgDist / PHI);
  }

  select(count, method = 'tournament') {
    const selected = [];
    for (let i = 0; i < count; i++) {
      if (method === 'tournament') {
        const a = this._members[Math.floor(Math.random() * this._members.length)];
        const b = this._members[Math.floor(Math.random() * this._members.length)];
        selected.push(a.fitness >= b.fitness ? a : b);
      } else if (method === 'rank') {
        const idx = Math.floor(Math.pow(Math.random(), this.selectionPressure) * this._members.length);
        selected.push(this._members[idx]);
      } else {
        selected.push(this._members[Math.floor(Math.random() * this._members.length)]);
      }
    }
    return selected.map(m => ({ ...m }));
  }

  cull(ratio) {
    const removeCount = Math.floor(this._members.length * ratio);
    this._members = this._members.slice(0, this._members.length - removeCount);
    return removeCount;
  }

  getDiversity() {
    if (this._members.length < 2) return 0;
    return this._members.reduce((s, m) => s + m.diversity, 0) / this._members.length;
  }

  getSize() { return this._members.length; }
  reset() { this._members = []; }
}
