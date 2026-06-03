import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class ConsensusProtocol {
  constructor(config = {}) {
    this.quorumThreshold = config.quorumThreshold ?? (PHI / (PHI + 1));
    this.votingTimeout = config.votingTimeout ?? 5000;
    this.rounds = config.rounds ?? 3;
    this._proposals = new Map();
  }

  propose(proposal) {
    const proposalId = crypto.randomUUID();
    const entry = { proposalId, proposal, status: 'voting', startedAt: Date.now(), votes: [], requiredVotes: 3 };
    this._proposals.set(proposalId, entry);
    return { proposalId, proposal, status: 'voting', startedAt: entry.startedAt, requiredVotes: entry.requiredVotes };
  }

  vote(proposalId, agentId, decision) {
    const prop = this._proposals.get(proposalId);
    if (!prop) throw new Error(`Proposal ${proposalId} not found`);
    prop.votes.push({ agentId, decision, votedAt: Date.now() });
    const accepts = prop.votes.filter(v => v.decision === 'accept').length;
    const rejects = prop.votes.filter(v => v.decision === 'reject').length;
    return { proposalId, totalVotes: prop.votes.length, accepts, rejects };
  }

  resolve(proposalId) {
    const prop = this._proposals.get(proposalId);
    if (!prop) throw new Error(`Proposal ${proposalId} not found`);
    const total = prop.votes.length;
    const accepts = prop.votes.filter(v => v.decision === 'accept').length;
    const quorumMet = total >= prop.requiredVotes;
    const decision = !quorumMet ? 'pending' : (accepts / total >= this.quorumThreshold ? 'accepted' : 'rejected');
    prop.status = decision;
    return { proposalId, decision, votes: total, quorumMet };
  }

  getProposal(proposalId) {
    const p = this._proposals.get(proposalId);
    return p ? { ...p, votes: [...p.votes] } : undefined;
  }

  getHistory() { return [...this._proposals.values()].map(p => ({ ...p, votes: [...p.votes] })); }
}
