import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class MetricsAggregator {
  constructor(config = {}) {
    this.windowSize = config.windowSize ?? 60000;
    this.phiWeight = config.phiWeight ?? PHI;
    this._metrics = new Map();
    this._snapshots = [];
  }

  record(name, value) {
    if (typeof name !== 'string' || name.length === 0) throw new Error('Metric name required');
    if (typeof value !== 'number') throw new TypeError('Value must be a number');
    if (!this._metrics.has(name)) this._metrics.set(name, []);
    this._metrics.get(name).push({ value, timestamp: Date.now() });
    return { name, value, recorded: true };
  }

  aggregate(name) {
    const points = this._metrics.get(name);
    if (!points || points.length === 0) throw new Error(`No data for metric "${name}"`);
    const values = points.map(p => p.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const phiMean = avg * (this.phiWeight / (this.phiWeight + 1));
    return { name, count: values.length, sum, avg, min, max, phiMean };
  }

  snapshot() {
    const metrics = {};
    for (const [name] of this._metrics) {
      metrics[name] = this.aggregate(name);
    }
    const snap = { snapshotId: crypto.randomUUID(), timestamp: Date.now(), metrics };
    this._snapshots.push(snap);
    return snap;
  }

  getMetricNames() { return [...this._metrics.keys()]; }
  getSnapshots() { return [...this._snapshots]; }
  reset() { this._metrics.clear(); this._snapshots = []; }
}
