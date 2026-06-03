import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class QueryFederation {
  constructor() { this._sources = new Map(); this._queries = []; }
  addSource(name, executor) { if (typeof executor !== 'function') throw new TypeError('executor must be a function'); this._sources.set(name, { name, executor }); return { name, sourceCount: this._sources.size }; }
  query(sourceName, query) { const source = this._sources.get(sourceName); if (!source) throw new Error(`Source "${sourceName}" not found`); const result = source.executor(query); const record = { queryId: crypto.randomUUID(), source: sourceName, phiRelevance: PHI / (PHI + 1), timestamp: Date.now() }; this._queries.push(record); return { ...record, result }; }
  federatedQuery(query) { const results = {}; for (const [name, source] of this._sources) { results[name] = source.executor(query); } return { queryId: crypto.randomUUID(), sources: Object.keys(results), results, phiCoverage: this._sources.size / (this._sources.size + 1) * PHI }; }
  getSources() { return [...this._sources.keys()]; }
}
