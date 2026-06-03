import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class DecisionEngine {
  constructor(config = {}) {
    this.maxOptions = config.maxOptions ?? 16;
    this.evaluationDepth = config.evaluationDepth ?? 5;
    this.phiBias = config.phiBias ?? PHI;
    this.riskTolerance = config.riskTolerance ?? 0.5;
    this._options = new Map();
    this._decisions = [];
  }

  addOption(option, metadata = {}) {
    if (this._options.size >= this.maxOptions) throw new Error('Max options reached');
    const optionId = crypto.randomUUID();
    this._options.set(optionId, { optionId, option, metadata, addedAt: Date.now() });
    return { optionId, option, metadata, addedAt: Date.now() };
  }

  evaluate() {
    const rankings = [];
    for (const [id, opt] of this._options) {
      const reward = (opt.metadata.reward ?? 0.5) * this.phiBias;
      const risk = opt.metadata.risk ?? 0.5;
      const score = reward * (1 - risk * (1 - this.riskTolerance));
      const phiAlignment = 1 - Math.abs(score - (1 / PHI));
      rankings.push({ optionId: id, score, phiAlignment, risk, reward });
    }
    rankings.sort((a, b) => b.score - a.score);
    const recommended = rankings[0]?.optionId ?? null;
    const confidence = rankings.length > 1 ? (rankings[0].score - rankings[1].score) / rankings[0].score : 1.0;
    return { rankings, recommended, confidence, evaluationTime: Date.now() };
  }

  decide() {
    const evaluation = this.evaluate();
    if (!evaluation.recommended) throw new Error('No options to decide from');
    const decision = { decisionId: crypto.randomUUID(), chosen: evaluation.recommended, rationale: evaluation.rankings.slice(0, 3), confidence: evaluation.confidence, timestamp: Date.now() };
    this._decisions.push(decision);
    return { ...decision };
  }

  getOptions() { return [...this._options.values()]; }
  getDecisionHistory() { return [...this._decisions]; }
  clear() { this._options.clear(); }
}
