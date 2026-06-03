import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class CacheCluster {
  constructor(config = {}) { this.replicas = config.replicas ?? 3; this._nodes = new Map(); }
  addNode(name) { this._nodes.set(name, { name, keys: new Set(), joinedAt: Date.now() }); return { name, nodeCount: this._nodes.size }; }
  removeNode(name) { return this._nodes.delete(name); }
  assign(key) { const nodes = [...this._nodes.keys()]; if (nodes.length === 0) throw new Error('No nodes in cluster'); const hash = key.split('').reduce((h, c) => h + c.charCodeAt(0), 0); const primary = nodes[hash % nodes.length]; const replicas = []; for (let i = 1; i <= Math.min(this.replicas, nodes.length - 1); i++) replicas.push(nodes[(hash + i) % nodes.length]); this._nodes.get(primary).keys.add(key); return { key, primary, replicas, phiDistribution: PHI / (PHI + 1) }; }
  getNodes() { return [...this._nodes.keys()]; }
  getNodeStats() { return [...this._nodes.values()].map(n => ({ name: n.name, keyCount: n.keys.size })); }
}
