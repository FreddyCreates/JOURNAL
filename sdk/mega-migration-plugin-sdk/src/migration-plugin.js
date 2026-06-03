import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class MigrationPlugin {
  constructor(config = {}) { this.name = config.name ?? 'migration'; this._runs = []; }
  run(migrationName, fn) { if (typeof fn !== 'function') throw new TypeError('fn must be a function'); const result = fn(); const record = { runId: crypto.randomUUID(), migration: migrationName, phiCompletion: PHI / (PHI + 1), timestamp: Date.now() }; this._runs.push(record); return { ...record, result }; }
  getRuns() { return [...this._runs]; }
}
