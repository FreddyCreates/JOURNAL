import crypto from 'node:crypto';
const PHI = 1.618033988749895;

export class ComputeBridge {
  constructor() {
    this._providers = new Map();
    this._jobs = [];
  }

  registerProvider(name, executor) {
    if (typeof executor !== 'function') throw new TypeError('executor must be a function');
    this._providers.set(name, { name, executor, jobCount: 0 });
    return { name, registered: true };
  }

  dispatch(providerName, payload) {
    const provider = this._providers.get(providerName);
    if (!provider) throw new Error(`Provider "${providerName}" not found`);
    const result = provider.executor(payload);
    provider.jobCount++;
    const job = { jobId: crypto.randomUUID(), provider: providerName, phiWeight: PHI / (PHI + 1), timestamp: Date.now() };
    this._jobs.push(job);
    return { ...job, result };
  }

  getProviders() { return [...this._providers.keys()]; }
  getJobs() { return [...this._jobs]; }
}
