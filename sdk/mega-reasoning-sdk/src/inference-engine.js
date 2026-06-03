import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class InferenceEngine {
  constructor(config = {}) {
    this.maxInferenceDepth = config.maxInferenceDepth ?? 12;
    this.phiWeighting = config.phiWeighting ?? true;
    this.contradictionTolerance = config.contradictionTolerance ?? 0;
    this._facts = [];
    this._rules = [];
    this._inferenceCount = 0;
  }

  addFact(fact) {
    const entry = { factId: crypto.randomUUID(), fact, addedAt: Date.now(), index: this._facts.length };
    this._facts.push(entry);
    return { ...entry };
  }

  addRule(condition, conclusion, confidence = 1.0) {
    const ruleId = crypto.randomUUID();
    const phiWeight = confidence * PHI / (PHI + 1);
    const entry = { ruleId, condition, conclusion, confidence, phiWeight };
    this._rules.push(entry);
    return { ...entry };
  }

  infer(query) {
    this._inferenceCount++;
    const proofPath = [];
    let depth = 0;
    let confidence = 0;
    let answer = null;

    // Check direct facts
    const directFact = this._facts.find(f => f.fact === query || (typeof f.fact === 'object' && JSON.stringify(f.fact) === JSON.stringify(query)));
    if (directFact) {
      return { answer: true, confidence: 1.0, proofPath: [{ type: 'fact', value: directFact.fact }], inferenceDepth: 0, rulesApplied: 0 };
    }

    // Apply rules (forward chaining)
    let rulesApplied = 0;
    for (const rule of this._rules) {
      if (depth >= this.maxInferenceDepth) break;
      const conditionMet = this._facts.some(f => f.fact === rule.condition || JSON.stringify(f.fact) === JSON.stringify(rule.condition));
      if (conditionMet && (rule.conclusion === query || JSON.stringify(rule.conclusion) === JSON.stringify(query))) {
        proofPath.push({ type: 'rule', ruleId: rule.ruleId, condition: rule.condition, conclusion: rule.conclusion });
        confidence = rule.confidence * Math.pow(PHI, -depth);
        answer = true;
        rulesApplied++;
        depth++;
      }
    }

    return { answer, confidence, proofPath, inferenceDepth: depth, rulesApplied };
  }

  getFacts() { return [...this._facts]; }
  getRules() { return [...this._rules]; }
  getStats() { return { factCount: this._facts.length, ruleCount: this._rules.length, inferencesRun: this._inferenceCount, avgDepth: 1 }; }
}
