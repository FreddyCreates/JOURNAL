import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class LoadBalancer {
  constructor(config = {}) {
    this.strategy = config.strategy ?? 'phi-weighted-round-robin';
    this.maxLoad = config.maxLoad ?? 100;
    this.rebalanceThreshold = config.rebalanceThreshold ?? PHI;
    this._nodes = new Map();
    this._roundRobinIndex = 0;
  }

  addNode(nodeConfig) {
    const nodeId = crypto.randomUUID();
    const capacity = nodeConfig.capacity ?? this.maxLoad;
    const phiWeight = Math.pow(PHI, -(this._nodes.size));
    const node = { nodeId, capacity, currentLoad: 0, phiWeight, requests: 0, addedAt: Date.now() };
    this._nodes.set(nodeId, node);
    return { nodeId, capacity, currentLoad: 0, phiWeight };
  }

  route(request) {
    if (this._nodes.size === 0) throw new Error('No nodes available');
    const nodes = [...this._nodes.values()].filter(n => n.currentLoad < n.capacity);
    if (nodes.length === 0) throw new Error('All nodes at capacity');
    const node = nodes[this._roundRobinIndex % nodes.length];
    this._roundRobinIndex++;
    node.currentLoad++;
    node.requests++;
    const requestId = crypto.randomUUID();
    return { nodeId: node.nodeId, requestId, loadAfter: node.currentLoad };
  }

  getNodeLoad(nodeId) {
    const node = this._nodes.get(nodeId);
    if (!node) return undefined;
    return { nodeId, currentLoad: node.currentLoad, capacity: node.capacity, utilization: node.currentLoad / node.capacity };
  }

  rebalance() {
    const nodes = [...this._nodes.values()];
    const totalLoad = nodes.reduce((s, n) => s + n.currentLoad, 0);
    const avgLoad = totalLoad / (nodes.length || 1);
    for (const node of nodes) node.currentLoad = Math.round(avgLoad);
    return { nodesRebalanced: nodes.length, avgLoad, totalLoad };
  }

  removeNode(nodeId) { return this._nodes.delete(nodeId); }

  getMetrics() {
    const nodes = [...this._nodes.values()];
    const totalLoad = nodes.reduce((s, n) => s + n.currentLoad, 0);
    const totalCapacity = nodes.reduce((s, n) => s + n.capacity, 0);
    return { nodeCount: nodes.length, totalLoad, totalCapacity, utilization: totalCapacity > 0 ? totalLoad / totalCapacity : 0 };
  }
}
