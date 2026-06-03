import crypto from 'node:crypto';
const PHI = 1.618033988749895;

export class DagScheduler {
  constructor() {
    this._nodes = new Map();
    this._edges = [];
    this._executed = [];
  }

  addNode(name, task) {
    if (this._nodes.has(name)) throw new Error(`Node "${name}" already exists`);
    this._nodes.set(name, { name, task, dependencies: [] });
    return { name, added: true };
  }

  addEdge(from, to) {
    if (!this._nodes.has(from)) throw new Error(`Node "${from}" not found`);
    if (!this._nodes.has(to)) throw new Error(`Node "${to}" not found`);
    this._nodes.get(to).dependencies.push(from);
    this._edges.push({ from, to });
    return { from, to, edgeCount: this._edges.length };
  }

  getExecutionOrder() {
    const visited = new Set();
    const order = [];
    const visit = (name) => {
      if (visited.has(name)) return;
      visited.add(name);
      const node = this._nodes.get(name);
      for (const dep of node.dependencies) visit(dep);
      order.push(name);
    };
    for (const name of this._nodes.keys()) visit(name);
    return order;
  }

  execute(context = {}) {
    const order = this.getExecutionOrder();
    const results = {};
    for (const name of order) {
      const node = this._nodes.get(name);
      results[name] = typeof node.task === 'function' ? node.task({ ...context, ...results }) : { name, done: true };
    }
    const phiScore = Math.min(1, order.length / (this._nodes.size || 1) * (PHI / (PHI + 1)));
    const run = { runId: crypto.randomUUID(), nodesExecuted: order.length, phiScore, order, timestamp: Date.now() };
    this._executed.push(run);
    return { ...run, results };
  }

  getNodes() { return [...this._nodes.keys()]; }
  getEdges() { return [...this._edges]; }
}
