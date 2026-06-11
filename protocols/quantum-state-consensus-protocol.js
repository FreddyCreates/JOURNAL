/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  QUANTUM STATE CONSENSUS PROTOCOL — DISTRIBUTED STATE AGREEMENT VIA PHI-ENTANGLEMENT ║
 * ║  "Consensus Quantica — Agreement Through Entangled States"                            ║
 * ║                                                                                        ║
 * ║  "Omnes nodi concordant. Veritas una est. Consensus est harmonia."                    ║
 * ║  (All nodes agree. Truth is one. Consensus is harmony.)                               ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// CONSENSUS STATES
// ════════════════════════════════════════════════════════════════════════════════

const ConsensusState = {
  PROPOSING: 'PROPOSING',
  ENTANGLING: 'ENTANGLING',
  SUPERPOSITION: 'SUPERPOSITION',
  COLLAPSING: 'COLLAPSING',
  AGREED: 'AGREED',
  DIVERGED: 'DIVERGED',
  RECOVERING: 'RECOVERING',
};

const VoteWeight = {
  SOVEREIGN: PHI,
  VALIDATOR: 1.0,
  OBSERVER: PHI_INVERSE,
  PROVISIONAL: PHI_COMPLEMENT,
};

// ════════════════════════════════════════════════════════════════════════════════
// QUANTUM STATE VECTOR
// ════════════════════════════════════════════════════════════════════════════════

class QuantumStateVector {
  constructor(dimensions = 8) {
    this.dimensions = dimensions;
    this.amplitudes = new Array(dimensions).fill(0).map(() => ({
      real: Math.random() * PHI_COMPLEMENT,
      imaginary: Math.random() * PHI_COMPLEMENT,
    }));
    this.collapsed = false;
    this.collapsedIndex = -1;
    this.entangledWith = [];
    this.createdAt = Date.now();
  }

  normalize() {
    const norm = Math.sqrt(
      this.amplitudes.reduce((sum, a) => sum + a.real * a.real + a.imaginary * a.imaginary, 0)
    );
    if (norm > 0) {
      this.amplitudes = this.amplitudes.map(a => ({
        real: a.real / norm,
        imaginary: a.imaginary / norm,
      }));
    }
    return this;
  }

  probability(index) {
    const a = this.amplitudes[index];
    return a.real * a.real + a.imaginary * a.imaginary;
  }

  collapse() {
    if (this.collapsed) return this.collapsedIndex;

    this.normalize();
    const r = Math.random();
    let cumulative = 0;

    for (let i = 0; i < this.dimensions; i++) {
      cumulative += this.probability(i);
      if (r <= cumulative) {
        this.collapsed = true;
        this.collapsedIndex = i;
        return i;
      }
    }

    this.collapsed = true;
    this.collapsedIndex = this.dimensions - 1;
    return this.collapsedIndex;
  }

  entangle(other) {
    this.entangledWith.push(other);
    other.entangledWith.push(this);
    // PHI-weighted interference
    for (let i = 0; i < Math.min(this.dimensions, other.dimensions); i++) {
      this.amplitudes[i].real += other.amplitudes[i].real * PHI_COMPLEMENT;
      other.amplitudes[i].real += this.amplitudes[i].real * PHI_COMPLEMENT;
    }
    this.normalize();
    other.normalize();
    return this;
  }

  fidelity(other) {
    let overlap = 0;
    for (let i = 0; i < Math.min(this.dimensions, other.dimensions); i++) {
      overlap += this.amplitudes[i].real * other.amplitudes[i].real +
                 this.amplitudes[i].imaginary * other.amplitudes[i].imaginary;
    }
    return Math.abs(overlap);
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// CONSENSUS PROPOSAL
// ════════════════════════════════════════════════════════════════════════════════

class ConsensusProposal {
  constructor(proposerId, stateHash, payload) {
    this.proposalId = `QSC::${Date.now()}::${proposerId}`;
    this.proposerId = proposerId;
    this.stateHash = stateHash;
    this.payload = payload;
    this.votes = new Map();
    this.stateVector = new QuantumStateVector();
    this.status = ConsensusState.PROPOSING;
    this.quorumThreshold = PHI_INVERSE; // 61.8% agreement
    this.createdAt = Date.now();
    this.resolvedAt = null;
  }

  addVote(voterId, agree, weight = VoteWeight.VALIDATOR) {
    this.votes.set(voterId, {
      agree,
      weight,
      timestamp: Date.now(),
    });
    this.updateState();
    return this;
  }

  getWeightedAgreement() {
    let totalWeight = 0;
    let agreeWeight = 0;

    this.votes.forEach(vote => {
      totalWeight += vote.weight;
      if (vote.agree) agreeWeight += vote.weight;
    });

    return totalWeight > 0 ? agreeWeight / totalWeight : 0;
  }

  updateState() {
    const agreement = this.getWeightedAgreement();
    const voterCount = this.votes.size;

    if (voterCount < 3) {
      this.status = ConsensusState.ENTANGLING;
    } else if (agreement >= this.quorumThreshold) {
      this.status = ConsensusState.AGREED;
      this.resolvedAt = Date.now();
    } else if (agreement < PHI_COMPLEMENT && voterCount > 5) {
      this.status = ConsensusState.DIVERGED;
      this.resolvedAt = Date.now();
    } else {
      this.status = ConsensusState.SUPERPOSITION;
    }
  }

  getStatus() {
    return {
      proposalId: this.proposalId,
      status: this.status,
      agreement: this.getWeightedAgreement(),
      voterCount: this.votes.size,
      quorumThreshold: this.quorumThreshold,
      stateHash: this.stateHash,
      resolvedAt: this.resolvedAt,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// QUANTUM STATE CONSENSUS ENGINE
// ════════════════════════════════════════════════════════════════════════════════

class QuantumStateConsensusEngine {
  constructor(nodeId) {
    this.nodeId = nodeId;
    this.proposals = new Map();
    this.committedStates = [];
    this.peerNodes = new Map();
    this.localStateVector = new QuantumStateVector(16);
    this.consensusRound = 0;
    this.eventLog = [];
    this.maxLog = 500;
  }

  propose(stateHash, payload) {
    const proposal = new ConsensusProposal(this.nodeId, stateHash, payload);
    this.proposals.set(proposal.proposalId, proposal);
    this.logEvent('PROPOSAL_CREATED', { proposalId: proposal.proposalId, stateHash });
    return proposal;
  }

  vote(proposalId, agree) {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) return null;

    const weight = this.nodeId === proposal.proposerId
      ? VoteWeight.SOVEREIGN
      : VoteWeight.VALIDATOR;

    proposal.addVote(this.nodeId, agree, weight);

    if (proposal.status === ConsensusState.AGREED) {
      this.commitState(proposal);
    }

    return proposal.getStatus();
  }

  commitState(proposal) {
    this.committedStates.push({
      round: ++this.consensusRound,
      proposalId: proposal.proposalId,
      stateHash: proposal.stateHash,
      payload: proposal.payload,
      agreement: proposal.getWeightedAgreement(),
      committedAt: Date.now(),
    });
    this.logEvent('STATE_COMMITTED', {
      round: this.consensusRound,
      proposalId: proposal.proposalId,
    });
  }

  registerPeer(peerId, stateVector) {
    this.peerNodes.set(peerId, {
      stateVector,
      lastSeen: Date.now(),
      fidelity: this.localStateVector.fidelity(stateVector),
    });
  }

  getNetworkFidelity() {
    if (this.peerNodes.size === 0) return 1.0;
    const fidelities = Array.from(this.peerNodes.values()).map(p => p.fidelity);
    return fidelities.reduce((a, b) => a + b, 0) / fidelities.length;
  }

  logEvent(type, data) {
    this.eventLog.push({ type, data, timestamp: Date.now() });
    if (this.eventLog.length > this.maxLog) this.eventLog.shift();
  }

  getStatus() {
    return {
      nodeId: this.nodeId,
      consensusRound: this.consensusRound,
      activeProposals: this.proposals.size,
      committedStates: this.committedStates.length,
      peerCount: this.peerNodes.size,
      networkFidelity: this.getNetworkFidelity(),
      recentEvents: this.eventLog.slice(-10),
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  ConsensusState,
  VoteWeight,
  QuantumStateVector,
  ConsensusProposal,
  QuantumStateConsensusEngine,
};

export default {
  PROTOCOL_ID: 'PROTO-QSC-001',
  PROTOCOL_NAME: 'Quantum State Consensus Protocol',
  DOCTRINE: 'Omnes nodi concordant. Veritas una est. Consensus est harmonia.',
  DOCTRINE_EN: 'All nodes agree. Truth is one. Consensus is harmony.',

  ConsensusState,
  VoteWeight,
  QuantumStateVector,
  ConsensusProposal,
  QuantumStateConsensusEngine,
};
