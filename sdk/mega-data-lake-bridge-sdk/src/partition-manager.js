import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class PartitionManager {
  constructor(config = {}) { this.maxPartitions = config.maxPartitions ?? 256; this._partitions = new Map(); }
  create(key, config = {}) { if (this._partitions.size >= this.maxPartitions) throw new Error('Max partitions reached'); const p = { partitionId: crypto.randomUUID(), key, strategy: config.strategy ?? 'hash', size: 0, createdAt: Date.now() }; this._partitions.set(p.partitionId, p); return p; }
  assign(partitionId, data) { const p = this._partitions.get(partitionId); if (!p) throw new Error('Partition not found'); p.size += JSON.stringify(data).length; return { partitionId, size: p.size, phiBalance: Math.min(1, p.size / (1024 * PHI)) }; }
  rebalance() { const partitions = [...this._partitions.values()]; const avgSize = partitions.reduce((s, p) => s + p.size, 0) / (partitions.length || 1); return { partitions: partitions.length, avgSize, phiOptimal: avgSize * (PHI / (PHI + 1)) }; }
  getPartitions() { return [...this._partitions.values()]; }
  drop(partitionId) { return this._partitions.delete(partitionId); }
}
