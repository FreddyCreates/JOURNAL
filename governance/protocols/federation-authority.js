/**
 * Federation Authority Protocol
 * 
 * Governs inter-organism federation: membership, trust networks,
 * cross-organism consensus, shared governance, and authority delegation.
 * 
 * Protocol ID: GOV-FEDERATION-001
 * Layer: Governance Macro
 * Authority: NEXUS + CIVOS PRIME
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

export class FederationAuthorityProtocol {
  constructor() {
    this.id = 'GOV-FEDERATION-001';
    this.name = 'Federation Authority Protocol';
    this.version = '1.0.0';
    this.status = 'ACTIVE';
    this.members = new Map();
    this.treaties = [];
    this.sharedPolicies = [];
    this.votes = [];
  }

  /**
   * Add a federation member
   */
  addMember(memberId, profile) {
    if (this.members.has(memberId)) {
      return { success: false, reason: 'Member already exists' };
    }
    const member = {
      id: memberId,
      name: profile.name || memberId,
      type: profile.type || 'organism', // organism, service, agent
      trustLevel: profile.trustLevel || 0.5,
      status: 'pending',
      joinedAt: null,
      capabilities: profile.capabilities || [],
      endpoint: profile.endpoint || null,
      votingPower: profile.votingPower || 1,
    };
    this.members.set(memberId, member);
    return { success: true, member };
  }

  /**
   * Approve member into federation
   */
  approveMember(memberId) {
    const member = this.members.get(memberId);
    if (!member) return { success: false, reason: 'Member not found' };
    member.status = 'active';
    member.joinedAt = new Date().toISOString();
    return { success: true, member };
  }

  /**
   * Suspend a federation member
   */
  suspendMember(memberId, reason) {
    const member = this.members.get(memberId);
    if (!member) return { success: false, reason: 'Member not found' };
    member.status = 'suspended';
    member.suspendedAt = new Date().toISOString();
    member.suspensionReason = reason;
    return { success: true };
  }

  /**
   * Create a treaty (agreement between members)
   */
  createTreaty(treaty) {
    const t = {
      id: `TREATY-${Date.now()}-${this.treaties.length}`,
      name: treaty.name,
      parties: treaty.parties || [],
      terms: treaty.terms || [],
      status: 'proposed',
      createdAt: new Date().toISOString(),
      ratifiedAt: null,
      votes: [],
    };
    this.treaties.push(t);
    return { success: true, treaty: t };
  }

  /**
   * Vote on a treaty
   */
  voteTreaty(treatyId, memberId, vote) {
    const treaty = this.treaties.find(t => t.id === treatyId);
    if (!treaty) return { success: false, reason: 'Treaty not found' };
    const member = this.members.get(memberId);
    if (!member || member.status !== 'active') {
      return { success: false, reason: 'Member not active' };
    }

    treaty.votes.push({
      memberId,
      vote, // 'approve', 'reject', 'abstain'
      votingPower: member.votingPower,
      timestamp: new Date().toISOString(),
    });

    // Check if quorum reached (φ⁻¹ of total voting power)
    const totalPower = [...this.members.values()]
      .filter(m => m.status === 'active')
      .reduce((sum, m) => sum + m.votingPower, 0);
    const approvePower = treaty.votes
      .filter(v => v.vote === 'approve')
      .reduce((sum, v) => sum + v.votingPower, 0);

    if (approvePower / totalPower >= PHI_INV) {
      treaty.status = 'ratified';
      treaty.ratifiedAt = new Date().toISOString();
    }

    return { success: true, currentStatus: treaty.status };
  }

  /**
   * Add a shared policy across federation
   */
  addSharedPolicy(policy) {
    const p = {
      id: `SHARED-${Date.now()}`,
      name: policy.name,
      scope: policy.scope || 'federation-wide',
      rules: policy.rules || [],
      enforcedBy: policy.enforcedBy || 'all',
      createdAt: new Date().toISOString(),
    };
    this.sharedPolicies.push(p);
    return { success: true, policy: p };
  }

  /**
   * Get federation health
   */
  getFederationHealth() {
    const members = [...this.members.values()];
    const active = members.filter(m => m.status === 'active');
    const avgTrust = active.length > 0 
      ? active.reduce((s, m) => s + m.trustLevel, 0) / active.length 
      : 0;

    return {
      totalMembers: members.length,
      activeMembers: active.length,
      averageTrust: avgTrust,
      treaties: this.treaties.length,
      ratifiedTreaties: this.treaties.filter(t => t.status === 'ratified').length,
      sharedPolicies: this.sharedPolicies.length,
      status: avgTrust >= PHI_INV ? 'healthy' : 'fragile',
    };
  }

  /**
   * Update trust level for a member
   */
  updateTrust(memberId, newTrust) {
    const member = this.members.get(memberId);
    if (!member) return { success: false, reason: 'Member not found' };
    member.trustLevel = Math.max(0, Math.min(1, newTrust));
    return { success: true, trustLevel: member.trustLevel };
  }

  /**
   * Get cross-organism consensus status
   */
  getConsensusStatus(topic) {
    const activeMembers = [...this.members.values()].filter(m => m.status === 'active');
    return {
      topic,
      totalVoters: activeMembers.length,
      quorumThreshold: PHI_INV,
      requiredVotes: Math.ceil(activeMembers.length * PHI_INV),
    };
  }
}

export default FederationAuthorityProtocol;
