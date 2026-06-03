import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class DomainFusionEngine {
  constructor(config = {}) {
    this._domains = new Map();
    this.fusionStrategy = config.fusionStrategy ?? 'phi-weighted';
    this.overlapThreshold = config.overlapThreshold ?? 0.3;
  }

  registerDomain(name, schema) {
    const domainId = crypto.randomUUID();
    const entry = { domainId, name, schema, concepts: schema.concepts ?? [], registeredAt: Date.now() };
    this._domains.set(name, entry);
    return { domainId, name, conceptCount: entry.concepts.length };
  }

  findOverlaps(domainA, domainB) {
    const a = this._domains.get(domainA);
    const b = this._domains.get(domainB);
    if (!a || !b) throw new Error('Domain not found');
    const overlaps = [];
    for (const ca of a.concepts) {
      for (const cb of b.concepts) {
        if (ca === cb || (typeof ca === 'string' && typeof cb === 'string' && ca.toLowerCase() === cb.toLowerCase())) {
          overlaps.push({ concept: ca, strengthA: 1.0, strengthB: 1.0, fusionPotential: PHI / (PHI + 1) });
        }
      }
    }
    return { overlaps, overlapScore: overlaps.length / Math.max(a.concepts.length, b.concepts.length, 1) };
  }

  fuse(domains, concept) {
    const contributors = [];
    for (const d of domains) {
      const domain = this._domains.get(d);
      if (domain && domain.concepts.includes(concept)) contributors.push(d);
    }
    const novelty = contributors.length > 1 ? Math.min(1.0, contributors.length / PHI) : 0;
    const phiHarmony = novelty * PHI / (PHI + 1);
    return { fusedConcept: `${concept}[fused]`, contributors, novelty, phiHarmony };
  }

  getDomains() { return [...this._domains.values()].map(d => ({ name: d.name, conceptCount: d.concepts.length })); }
  getDomainStats() {
    const stats = {};
    for (const [name, d] of this._domains) stats[name] = { concepts: d.concepts.length };
    return stats;
  }
}
