/**
 * SUBSTRATE-025: Quorum Decision Protocol (QDP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * Critical decisions require quorum — a minimum number of independent
 * agents must agree before irreversible actions are taken. No single
 * point of authority for destructive operations.
 *
 * Engines wired: QuorumEngine + VotingMechanism + DecisionGuard
 * Ring: Sovereign Ring | Placement: Substrate foundation
 * Wire: substrate-wire/qdp
 * Enforcement: IMMUTABLE
 */

const PHI = 1.618033988749895;
const SUBSTRATE_SEAL = 'UNBREAKABLE::QDP::025';

class QuorumDecisionProtocol {
  #decisions;
  #quorumRules;

  constructor() {
    this.#decisions = new Map();
    this.#quorumRules = new Map();
    this.protocolId = 'SUBSTRATE-025';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
    this._loadDefaultRules();
  }

  _loadDefaultRules() {
    const rules = [
      { actionType: 'RELEASE', minVoters: 3, threshold: 0.618 },
      { actionType: 'DELETE', minVoters: 3, threshold: 0.80 },
      { actionType: 'IDENTITY_CHANGE', minVoters: 4, threshold: 0.90 },
      { actionType: 'CONSTITUTIONAL_AMENDMENT', minVoters: 5, threshold: 0.95 },
      { actionType: 'HALT', minVoters: 1, threshold: 0.50 },  // Emergency can be fast
      { actionType: 'DEPLOY', minVoters: 2, threshold: 0.618 }
    ];
    for (const rule of rules) {
      this.#quorumRules.set(rule.actionType, Object.freeze(rule));
    }
  }

  /**
   * Propose a decision that requires quorum.
   */
  propose(decisionId, actionType, proposer, details) {
    const rule = this.#quorumRules.get(actionType);
    if (!rule) throw new Error(`No quorum rule for action type: ${actionType}`);

    const decision = {
      decisionId,
      actionType,
      proposer,
      details,
      votes: new Map(),
      rule,
      resolved: false,
      outcome: null,
      proposedAt: Date.now(),
      seal: SUBSTRATE_SEAL
    };
    this.#decisions.set(decisionId, decision);
    return { decisionId, proposed: true, required: rule.minVoters, threshold: rule.threshold };
  }

  /**
   * Cast a vote on a pending decision.
   */
  vote(decisionId, voterId, approve, reason) {
    const decision = this.#decisions.get(decisionId);
    if (!decision) throw new Error(`Decision ${decisionId} not found`);
    if (decision.resolved) throw new Error(`Decision ${decisionId} already resolved`);

    decision.votes.set(voterId, { approve, reason, timestamp: Date.now() });
    return { decisionId, voterId, recorded: true, totalVotes: decision.votes.size };
  }

  /**
   * Attempt to resolve the decision.
   */
  resolve(decisionId) {
    const decision = this.#decisions.get(decisionId);
    if (!decision) throw new Error(`Decision ${decisionId} not found`);

    const { minVoters, threshold } = decision.rule;
    const votes = [...decision.votes.values()];

    if (votes.length < minVoters) {
      return { resolved: false, reason: 'INSUFFICIENT_VOTERS', have: votes.length, need: minVoters };
    }

    const approvals = votes.filter(v => v.approve).length;
    const ratio = approvals / votes.length;
    const approved = ratio >= threshold;

    decision.resolved = true;
    decision.outcome = { approved, ratio, approvals, total: votes.length, seal: SUBSTRATE_SEAL };
    return decision.outcome;
  }

  getDecision(decisionId) { return this.#decisions.get(decisionId); }
  getQuorumRules() { return [...this.#quorumRules.values()]; }
}

export { QuorumDecisionProtocol };
