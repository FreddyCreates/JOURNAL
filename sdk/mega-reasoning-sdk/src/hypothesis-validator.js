import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class HypothesisValidator {
  constructor(config = {}) {
    this.evidenceThreshold = config.evidenceThreshold ?? (PHI / (PHI + 1));
    this.falsificationEnabled = config.falsificationEnabled ?? true;
    this.bayesianUpdate = config.bayesianUpdate ?? true;
    this._hypotheses = new Map();
  }

  propose(hypothesis, priorConfidence = 0.5) {
    const hypothesisId = crypto.randomUUID();
    const entry = { hypothesisId, hypothesis, confidence: priorConfidence, evidence: [], status: 'testing', createdAt: Date.now() };
    this._hypotheses.set(hypothesisId, entry);
    return { hypothesisId, hypothesis, confidence: priorConfidence, evidence: [], status: 'testing' };
  }

  addEvidence(hypothesisId, evidence, supports = true) {
    const hyp = this._hypotheses.get(hypothesisId);
    if (!hyp) throw new Error(`Hypothesis ${hypothesisId} not found`);
    hyp.evidence.push({ evidence, supports, addedAt: Date.now() });
    // Phi-Bayesian update
    const factor = supports ? PHI / (PHI + 1) : 1 / (PHI + 1);
    hyp.confidence = hyp.confidence * factor + (supports ? 1 : 0) * (1 - factor);
    hyp.confidence = Math.min(1.0, Math.max(0, hyp.confidence));
    return { hypothesisId, newConfidence: hyp.confidence, evidenceCount: hyp.evidence.length };
  }

  evaluate(hypothesisId) {
    const hyp = this._hypotheses.get(hypothesisId);
    if (!hyp) throw new Error(`Hypothesis ${hypothesisId} not found`);
    const verdict = hyp.confidence >= this.evidenceThreshold ? 'supported' :
      hyp.confidence < (1 - this.evidenceThreshold) ? 'refuted' : 'inconclusive';
    const phiStrength = hyp.confidence * PHI;
    return { hypothesisId, verdict, confidence: hyp.confidence, evidenceCount: hyp.evidence.length, phiStrength };
  }

  getHypothesis(hypothesisId) {
    const h = this._hypotheses.get(hypothesisId);
    return h ? { ...h, evidence: [...h.evidence] } : undefined;
  }

  getAll() { return [...this._hypotheses.values()].map(h => ({ ...h, evidence: [...h.evidence] })); }
}
