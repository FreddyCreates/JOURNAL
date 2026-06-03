import crypto from 'node:crypto';
const PHI = 1.618033988749895;

export class TaskDistributor {
  constructor(config = {}) {
    this.strategy = config.strategy ?? 'round-robin';
    this._targets = [];
    this._index = 0;
    this._distributions = [];
  }

  addTarget(name, weight = 1) {
    this._targets.push({ name, weight, taskCount: 0 });
    return { name, weight, targetCount: this._targets.length };
  }

  distribute(task) {
    if (this._targets.length === 0) throw new Error('No targets registered');
    let target;
    if (this.strategy === 'round-robin') {
      target = this._targets[this._index % this._targets.length];
      this._index++;
    } else if (this.strategy === 'weighted') {
      const totalWeight = this._targets.reduce((s, t) => s + t.weight, 0);
      const rand = Math.random() * totalWeight;
      let cumulative = 0;
      for (const t of this._targets) { cumulative += t.weight; if (rand <= cumulative) { target = t; break; } }
      target = target || this._targets[0];
    } else {
      target = this._targets[0];
    }
    target.taskCount++;
    const phiWeight = target.weight * (PHI / (PHI + 1));
    const record = { distributionId: crypto.randomUUID(), target: target.name, phiWeight, timestamp: Date.now() };
    this._distributions.push(record);
    return record;
  }

  getStats() { return this._targets.map(t => ({ name: t.name, taskCount: t.taskCount, weight: t.weight })); }
  getDistributions() { return [...this._distributions]; }
}
