/**
 * SUBSTRATE-012: Consensus Reality Protocol (CRP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * When multiple agents observe or compute, their outputs must achieve
 * consensus before being accepted as reality. No single agent can
 * unilaterally declare truth.
 *
 * Engines wired: MultiModelFusion + VotingEngine + QuorumGuard
 * Ring: Interface Ring | Placement: Substrate foundation
 * Wire: substrate-wire/crp
 * Enforcement: IMMUTABLE
 */

const PHI = 1.618033988749895;
const SUBSTRATE_SEAL = 'UNBREAKABLE::CRP::012';

class ConsensusRealityProtocol {
  #proposals;
  #quorumThreshold;

  constructor(quorumThreshold = 0.618) {
    this.#proposals = new Map();
    this.#quorumThreshold = quorumThreshold; // φ-inverse as default quorum
    this.protocolId = 'SUBSTRATE-012';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Submit a reality proposal — a claim about what is true.
   */
  propose(proposalId, agentId, claim) {
    if (!this.#proposals.has(proposalId)) {
      this.#proposals.set(proposalId, {
        proposalId,
        claim,
        votes: new Map(),
        createdAt: Date.now(),
        resolved: false,
        outcome: null,
        seal: SUBSTRATE_SEAL
      });
    }
    return this.vote(proposalId, agentId, true, 1.0);
  }

  /**
   * Vote on a proposal. Each agent gets one vote weighted by confidence.
   */
  vote(proposalId, agentId, agree, confidence = 1.0) {
    const proposal = this.#proposals.get(proposalId);
    if (!proposal) throw new Error(`Proposal ${proposalId} not found`);
    if (proposal.resolved) throw new Error(`Proposal ${proposalId} already resolved`);

    proposal.votes.set(agentId, { agree, confidence, timestamp: Date.now() });
    return { proposalId, agentId, recorded: true };
  }

  /**
   * Resolve a proposal — check if quorum is reached.
   * @param {number} totalAgents - Total participating agents
   */
  resolve(proposalId, totalAgents) {
    const proposal = this.#proposals.get(proposalId);
    if (!proposal) throw new Error(`Proposal ${proposalId} not found`);

    const votes = [...proposal.votes.values()];
    const participation = votes.length / totalAgents;

    if (participation < this.#quorumThreshold) {
      return { resolved: false, reason: 'QUORUM_NOT_MET', participation, required: this.#quorumThreshold };
    }

    const weightedAgree = votes.filter(v => v.agree).reduce((sum, v) => sum + v.confidence, 0);
    const weightedTotal = votes.reduce((sum, v) => sum + v.confidence, 0);
    const consensus = weightedAgree / weightedTotal;

    const accepted = consensus >= this.#quorumThreshold;
    proposal.resolved = true;
    proposal.outcome = { accepted, consensus, participation, seal: SUBSTRATE_SEAL };

    return proposal.outcome;
  }

  getProposal(proposalId) { return this.#proposals.get(proposalId); }
}

export { ConsensusRealityProtocol };
