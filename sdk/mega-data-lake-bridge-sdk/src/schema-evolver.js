import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class SchemaEvolver {
  constructor() { this._versions = []; this._current = null; }
  define(schema) { if (!schema || typeof schema !== 'object') throw new Error('Schema must be an object'); const version = { versionId: crypto.randomUUID(), schema: { ...schema }, version: this._versions.length + 1, createdAt: Date.now() }; this._versions.push(version); this._current = version; return version; }
  evolve(migration) { if (!this._current) throw new Error('No schema defined'); const newSchema = migration(structuredClone(this._current.schema)); const version = { versionId: crypto.randomUUID(), schema: newSchema, version: this._versions.length + 1, createdAt: Date.now(), phiCompatibility: PHI / (PHI + 1) }; this._versions.push(version); this._current = version; return version; }
  getCurrent() { return this._current; }
  getHistory() { return [...this._versions]; }
  rollback() { if (this._versions.length < 2) throw new Error('Cannot rollback'); this._versions.pop(); this._current = this._versions[this._versions.length - 1]; return this._current; }
}
