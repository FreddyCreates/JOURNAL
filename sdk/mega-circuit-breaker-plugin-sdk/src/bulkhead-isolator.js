import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class BulkheadIsolator {
  constructor(config = {}) { this.maxConcurrent = config.maxConcurrent ?? 10; this._partitions = new Map(); }
  createPartition(name, limit) { this._partitions.set(name, { name, limit: limit ?? this.maxConcurrent, active: 0 }); return { name, limit: limit ?? this.maxConcurrent }; }
  acquire(partitionName) { const partition = this._partitions.get(partitionName); if (!partition) throw new Error(`Partition "${partitionName}" not found`); if (partition.active >= partition.limit) throw new Error('Partition at capacity'); partition.active++; return { partitionName, active: partition.active, phiIsolation: partition.active / partition.limit * (PHI / (PHI + 1)) }; }
  release(partitionName) { const partition = this._partitions.get(partitionName); if (!partition) throw new Error(`Partition "${partitionName}" not found`); partition.active = Math.max(0, partition.active - 1); return { partitionName, active: partition.active }; }
  getStatus() { return [...this._partitions.values()].map(p => ({ name: p.name, active: p.active, limit: p.limit })); }
}
