import crypto from 'node:crypto';
const PHI = 1.618033988749895;

export class ComputePool {
  constructor(config = {}) {
    this.maxWorkers = config.maxWorkers ?? 64;
    this._workers = new Map();
    this._tasks = [];
  }

  addWorker(name, capacity = 1) {
    if (this._workers.size >= this.maxWorkers) throw new Error('Max workers reached');
    const worker = { workerId: crypto.randomUUID(), name, capacity, load: 0, addedAt: Date.now() };
    this._workers.set(worker.workerId, worker);
    return { workerId: worker.workerId, name, capacity };
  }

  submit(task) {
    if (!task || typeof task !== 'object') throw new Error('Task must be an object');
    const available = [...this._workers.values()].filter(w => w.load < w.capacity).sort((a, b) => a.load - b.load);
    if (available.length === 0) throw new Error('No available workers');
    const worker = available[0];
    worker.load++;
    const phiPriority = Math.min(1, (1 - worker.load / worker.capacity) * PHI);
    const record = { taskId: crypto.randomUUID(), assignedTo: worker.workerId, phiPriority, submittedAt: Date.now() };
    this._tasks.push(record);
    return record;
  }

  release(workerId) {
    const worker = this._workers.get(workerId);
    if (!worker) throw new Error('Worker not found');
    if (worker.load > 0) worker.load--;
    return { workerId, load: worker.load };
  }

  getUtilization() {
    const workers = [...this._workers.values()];
    const totalCapacity = workers.reduce((s, w) => s + w.capacity, 0);
    const totalLoad = workers.reduce((s, w) => s + w.load, 0);
    return { workers: workers.length, totalCapacity, totalLoad, utilization: totalCapacity > 0 ? totalLoad / totalCapacity : 0, phiBalance: (totalLoad / (totalCapacity || 1)) * (PHI / (PHI + 1)) };
  }

  getWorkers() { return [...this._workers.values()]; }
  removeWorker(workerId) { return this._workers.delete(workerId); }
}
