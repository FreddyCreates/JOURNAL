import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class DeductionOracle {
  constructor(config = {}) {
    this.oracleDepth = config.oracleDepth ?? 7;
    this.certaintyThreshold = config.certaintyThreshold ?? 0.9;
    this.phiAmplification = config.phiAmplification ?? PHI;
    this._axioms = [];
    this._history = [];
  }

  query(premises, question) {
    const deductionPath = [];
    let certainty = 1.0;

    for (let i = 0; i < Math.min(premises.length, this.oracleDepth); i++) {
      certainty *= Math.pow(PHI, -0.1);
      deductionPath.push({ step: i, premise: premises[i], contribution: certainty });
    }

    const phiResonance = certainty * this.phiAmplification / (this.phiAmplification + 1);
    const answer = certainty >= this.certaintyThreshold ? 'definitive' : certainty > 0.5 ? 'probable' : 'uncertain';
    const isDefinitive = certainty >= this.certaintyThreshold;

    const entry = { question, answer, certainty, premises: [...premises], timestamp: Date.now() };
    this._history.push(entry);

    return { answer, certainty, deductionPath, phiResonance, isDefinitive };
  }

  addAxiom(axiom) {
    const entry = { axiomId: crypto.randomUUID(), axiom, addedAt: Date.now() };
    this._axioms.push(entry);
    return { ...entry };
  }

  getAxioms() { return [...this._axioms]; }
  getDeductionHistory() { return [...this._history]; }

  assessConsistency() {
    const contradictions = [];
    for (let i = 0; i < this._axioms.length; i++) {
      for (let j = i + 1; j < this._axioms.length; j++) {
        const a = JSON.stringify(this._axioms[i].axiom);
        const b = JSON.stringify(this._axioms[j].axiom);
        if (a === b) contradictions.push({ axiomA: i, axiomB: j, type: 'duplicate' });
      }
    }
    return { isConsistent: contradictions.length === 0, contradictions };
  }
}
