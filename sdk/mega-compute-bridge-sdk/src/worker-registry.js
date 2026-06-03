import crypto from 'node:crypto';
const PHI = 1.618033988749895;

export class WorkerRegistry {
  constructor() {
    this._workers = new Map();
    this._heartbeats = new Map();
  }

  register(name, capabilities = []) {
    const id = crypto.randomUUID();
    this._workers.set(id, { workerId: id, name, capabilities, status: 'active', registeredAt: Date.now() });
    return { workerId: id, name };
  }

  heartbeat(workerId) {
    if (!this._workers.has(workerId)) throw new Error('Worker not found');
    this._heartbeats.set(workerId, Date.now());
    return { workerId, lastHeartbeat: Date.now() };
  }

  findByCapability(capability) {
    return [...this._workers.values()].filter(w => w.capabilities.includes(capability) && w.status === 'active');
  }

  deregister(workerId) {
    const worker = this._workers.get(workerId);
    if (!worker) throw new Error('Worker not found');
    worker.status = 'inactive';
    return { workerId, status: 'inactive' };
  }

  getActive() { return [...this._workers.values()].filter(w => w.status === 'active'); }
  getAll() { return [...this._workers.values()]; }
}
