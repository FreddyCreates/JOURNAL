import crypto from 'node:crypto';
const PHI = 1.618033988749895;

export class LoadBalancer {
  constructor(config = {}) {
    this.algorithm = config.algorithm ?? 'least-connections';
    this._backends = new Map();
  }

  addBackend(name, config = {}) {
    this._backends.set(name, { name, connections: 0, maxConnections: config.maxConnections ?? 100, healthy: true });
    return { name, added: true };
  }

  route() {
    const healthy = [...this._backends.values()].filter(b => b.healthy);
    if (healthy.length === 0) throw new Error('No healthy backends');
    let selected;
    if (this.algorithm === 'least-connections') {
      selected = healthy.sort((a, b) => a.connections - b.connections)[0];
    } else {
      selected = healthy[Math.floor(Math.random() * healthy.length)];
    }
    selected.connections++;
    const phiLoad = selected.connections / selected.maxConnections * (PHI / (PHI + 1));
    return { backend: selected.name, connections: selected.connections, phiLoad };
  }

  release(name) {
    const b = this._backends.get(name);
    if (!b) throw new Error('Backend not found');
    if (b.connections > 0) b.connections--;
    return { name, connections: b.connections };
  }

  markUnhealthy(name) {
    const b = this._backends.get(name);
    if (!b) throw new Error('Backend not found');
    b.healthy = false;
    return { name, healthy: false };
  }

  markHealthy(name) {
    const b = this._backends.get(name);
    if (!b) throw new Error('Backend not found');
    b.healthy = true;
    return { name, healthy: true };
  }

  getStatus() { return [...this._backends.values()]; }
}
