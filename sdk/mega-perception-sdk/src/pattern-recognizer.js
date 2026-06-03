import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class PatternRecognizer {
  constructor(config = {}) {
    this._patterns = config.patternLibrary ?? new Map();
    this.matchThreshold = config.matchThreshold ?? 0.75;
    this.phiScoring = config.phiScoring ?? true;
    this._stats = { recognitions: 0, matches: 0 };
  }

  registerPattern(name, template) {
    const patternId = crypto.randomUUID();
    const complexity = (Array.isArray(template) ? template.length : JSON.stringify(template).length) * PHI;
    const entry = { patternId, name, template, complexity, registered: Date.now() };
    this._patterns.set(name, entry);
    return { patternId, name, complexity, registered: entry.registered };
  }

  recognize(input) {
    this._stats.recognitions++;
    const inputStr = JSON.stringify(input);
    const matches = [];

    for (const [name, pattern] of this._patterns) {
      const templateStr = JSON.stringify(pattern.template);
      const overlap = this._computeSimilarity(inputStr, templateStr);
      const phiAdjustedScore = overlap * PHI / (PHI + 1);
      if (overlap >= this.matchThreshold) {
        matches.push({ patternId: pattern.patternId, name, score: overlap, phiAdjustedScore });
        this._stats.matches++;
      }
    }

    matches.sort((a, b) => b.score - a.score);
    return { matches, bestMatch: matches[0] ?? null, confidence: matches[0]?.score ?? 0 };
  }

  _computeSimilarity(a, b) {
    const setA = new Set(a.split(''));
    const setB = new Set(b.split(''));
    const intersection = [...setA].filter(x => setB.has(x)).length;
    const union = new Set([...setA, ...setB]).size;
    return union > 0 ? intersection / union : 0;
  }

  getPatterns() {
    return [...this._patterns.values()].map(p => ({ patternId: p.patternId, name: p.name, complexity: p.complexity }));
  }

  removePattern(name) {
    return this._patterns.delete(name);
  }

  getStats() {
    return { ...this._stats, patternCount: this._patterns.size };
  }
}
