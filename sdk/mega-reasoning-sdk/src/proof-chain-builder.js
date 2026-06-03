import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class ProofChainBuilder {
  constructor(config = {}) {
    this.maxChainLength = config.maxChainLength ?? 20;
    this.requireCompleteness = config.requireCompleteness ?? true;
    this.phiConfidenceDecay = config.phiConfidenceDecay ?? (1 / PHI);
    this._proofs = new Map();
  }

  startProof(theorem) {
    const proofId = crypto.randomUUID();
    const proof = { proofId, theorem, status: 'building', steps: [], startedAt: Date.now() };
    this._proofs.set(proofId, proof);
    return { proofId, theorem, status: 'building', steps: [] };
  }

  addStep(proofId, step, justification) {
    const proof = this._proofs.get(proofId);
    if (!proof) throw new Error(`Proof ${proofId} not found`);
    if (proof.steps.length >= this.maxChainLength) throw new Error('Max chain length reached');
    const depth = proof.steps.length;
    const confidence = Math.pow(this.phiConfidenceDecay, depth);
    const entry = { stepId: crypto.randomUUID(), step, justification, depth, confidence, addedAt: Date.now() };
    proof.steps.push(entry);
    return { ...entry, totalSteps: proof.steps.length };
  }

  verify(proofId) {
    const proof = this._proofs.get(proofId);
    if (!proof) throw new Error(`Proof ${proofId} not found`);
    const gaps = [];
    for (let i = 1; i < proof.steps.length; i++) {
      if (!proof.steps[i].justification) gaps.push(i);
    }
    const totalConfidence = proof.steps.reduce((s, st) => s + st.confidence, 0);
    const strength = proof.steps.length > 0 ? totalConfidence / proof.steps.length : 0;
    const isValid = gaps.length === 0 && proof.steps.length > 0;
    return { proofId, isValid, confidence: totalConfidence, gaps, strength };
  }

  getProof(proofId) {
    const p = this._proofs.get(proofId);
    return p ? { ...p, steps: [...p.steps] } : undefined;
  }

  getProofs() { return [...this._proofs.values()].map(p => ({ proofId: p.proofId, theorem: p.theorem, status: p.status, stepCount: p.steps.length })); }

  abandon(proofId) {
    const proof = this._proofs.get(proofId);
    if (!proof) throw new Error(`Proof ${proofId} not found`);
    proof.status = 'abandoned';
    return { proofId, status: 'abandoned' };
  }
}
