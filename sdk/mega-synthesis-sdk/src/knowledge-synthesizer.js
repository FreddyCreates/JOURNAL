import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class KnowledgeSynthesizer {
  constructor(config = {}) {
    this.maxSources = config.maxSources ?? 32;
    this.synthesisDepth = config.synthesisDepth ?? 5;
    this.phiWeighting = config.phiWeighting ?? true;
    this.coherenceThreshold = config.coherenceThreshold ?? 0.7;
    this._sources = new Map();
    this._insights = [];
  }

  addSource(domain, knowledge) {
    if (this._sources.size >= this.maxSources) throw new Error('Max sources reached');
    const sourceId = crypto.randomUUID();
    const fragments = Array.isArray(knowledge) ? knowledge.length : 1;
    const phiWeight = Math.pow(PHI, -this._sources.size);
    if (!this._sources.has(domain)) this._sources.set(domain, []);
    const entry = { sourceId, domain, knowledge, fragments, addedAt: Date.now(), phiWeight };
    this._sources.get(domain).push(entry);
    return { sourceId, domain, fragments, addedAt: entry.addedAt, phiWeight };
  }

  synthesize(query) {
    const synthesisId = crypto.randomUUID();
    const sources = [];
    const crossLinks = [];
    let totalWeight = 0;

    for (const [domain, entries] of this._sources) {
      for (const entry of entries) {
        sources.push({ domain, sourceId: entry.sourceId });
        totalWeight += entry.phiWeight;
      }
    }

    const domains = [...this._sources.keys()];
    for (let i = 0; i < domains.length; i++) {
      for (let j = i + 1; j < domains.length; j++) {
        crossLinks.push({ from: domains[i], to: domains[j], strength: Math.pow(PHI, -(i + j)) });
      }
    }

    const confidence = Math.min(1.0, totalWeight / (this.synthesisDepth * PHI));
    const phiCoherence = confidence * PHI / (PHI + 1);
    const insight = { query, confidence, sourceCount: sources.length, crossLinkCount: crossLinks.length };
    this._insights.push(insight);

    return { synthesisId, query, result: { insight: `Synthesized from ${sources.length} sources across ${domains.length} domains`, confidence, sources, crossLinks }, phiCoherence, timestamp: Date.now() };
  }

  getSources() {
    const result = {};
    for (const [domain, entries] of this._sources) result[domain] = entries.length;
    return result;
  }

  getInsights() { return [...this._insights]; }
  clear() { this._sources.clear(); this._insights = []; }
}
