import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class FacetEngine {
  constructor() { this._facets = new Map(); }
  defineFacet(name, extractor) { if (typeof extractor !== 'function') throw new TypeError('extractor must be a function'); this._facets.set(name, extractor); return { name, facetCount: this._facets.size }; }
  compute(documents) { const results = {}; for (const [name, extractor] of this._facets) { const buckets = {}; for (const doc of documents) { const value = extractor(doc); const key = String(value ?? 'null'); buckets[key] = (buckets[key] ?? 0) + 1; } results[name] = { buckets, totalBuckets: Object.keys(buckets).length, phiDistribution: PHI / (PHI + 1) }; } return results; }
  getFacets() { return [...this._facets.keys()]; }
  removeFacet(name) { return this._facets.delete(name); }
}
