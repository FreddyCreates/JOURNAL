import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class RelevanceScorer {
  constructor(config = {}) { this.boostFactors = config.boostFactors ?? {}; }
  score(document, query) { const docStr = JSON.stringify(document).toLowerCase(); const terms = query.toLowerCase().match(/[a-z0-9]+/g) || []; let matchCount = 0; for (const term of terms) { if (docStr.includes(term)) matchCount++; } const termCoverage = terms.length > 0 ? matchCount / terms.length : 0; const phiRelevance = termCoverage * (PHI / (PHI + 1)); let boosted = phiRelevance; for (const [field, factor] of Object.entries(this.boostFactors)) { if (document[field] && JSON.stringify(document[field]).toLowerCase().includes(query.toLowerCase())) boosted *= factor; } return { score: Math.min(1, boosted), termCoverage, matchCount, phiRelevance }; }
  setBoost(field, factor) { this.boostFactors[field] = factor; return { field, factor }; }
}
