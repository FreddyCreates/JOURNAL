import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class JobScheduler {
  constructor(config = {}) { this.maxJobs = config.maxJobs ?? 1000; this._jobs = new Map(); this._completed = []; }
  schedule(name, runAt, handler) { if (this._jobs.size >= this.maxJobs) throw new Error('Max jobs reached'); if (typeof handler !== 'function') throw new TypeError('handler must be a function'); const job = { jobId: crypto.randomUUID(), name, runAt, handler, status: 'scheduled', scheduledAt: Date.now() }; this._jobs.set(job.jobId, job); return { jobId: job.jobId, name, runAt }; }
  execute(jobId) { const job = this._jobs.get(jobId); if (!job) throw new Error('Job not found'); const result = job.handler(); job.status = 'completed'; job.completedAt = Date.now(); job.phiPunctuality = PHI / (PHI + 1); this._jobs.delete(jobId); this._completed.push(job); return { jobId, status: 'completed', result }; }
  cancel(jobId) { const job = this._jobs.get(jobId); if (!job) throw new Error('Job not found'); this._jobs.delete(jobId); return { jobId, cancelled: true }; }
  getPending() { return [...this._jobs.values()].map(j => ({ jobId: j.jobId, name: j.name, runAt: j.runAt })); }
  getCompleted() { return this._completed.map(j => ({ jobId: j.jobId, name: j.name })); }
}
