/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  SOVEREIGN MESH FEDERATION PROTOCOL — MULTI-ORGANISM INTERCONNECTION FABRIC           ║
 * ║  "Foederatio Retis — Sovereign Organisms United Through Mesh Federation"              ║
 * ║                                                                                        ║
 * ║  "Foederati sumus. Nexus nos ligat. Libertas in unitate."                             ║
 * ║  (We are federated. The nexus binds us. Freedom in unity.)                            ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// FEDERATION TYPES
// ════════════════════════════════════════════════════════════════════════════════

const FederationRole = {
  SOVEREIGN: 'SOVEREIGN',       // Full autonomy, can propose governance
  MEMBER: 'MEMBER',             // Participates in federation decisions
  OBSERVER: 'OBSERVER',         // Read-only access to federation state
  CANDIDATE: 'CANDIDATE',       // Pending membership approval
  SUSPENDED: 'SUSPENDED',       // Temporarily restricted
};

const MeshTopology = {
  FULL_MESH: 'FULL_MESH',       // Every node connects to every other
  STAR: 'STAR',                 // Hub-and-spoke
  RING: 'RING',                 // Circular connections
  TREE: 'TREE',                 // Hierarchical
  HYBRID: 'HYBRID',             // Mixed topology
};

const FederationEvent = {
  NODE_JOINED: 'NODE_JOINED',
  NODE_LEFT: 'NODE_LEFT',
  NODE_SUSPENDED: 'NODE_SUSPENDED',
  GOVERNANCE_PROPOSAL: 'GOVERNANCE_PROPOSAL',
  GOVERNANCE_VOTE: 'GOVERNANCE_VOTE',
  GOVERNANCE_ENACTED: 'GOVERNANCE_ENACTED',
  RESOURCE_SHARED: 'RESOURCE_SHARED',
  THREAT_DETECTED: 'THREAT_DETECTED',
  TOPOLOGY_CHANGED: 'TOPOLOGY_CHANGED',
};

// ════════════════════════════════════════════════════════════════════════════════
// MESH NODE
// ════════════════════════════════════════════════════════════════════════════════

class MeshNode {
  constructor(nodeId, role = FederationRole.MEMBER) {
    this.nodeId = nodeId;
    this.role = role;
    this.connections = new Map();
    this.capabilities = new Set();
    this.resources = new Map();
    this.reputation = PHI_INVERSE; // Start at φ⁻¹
    this.uptime = 0;
    this.lastSeen = Date.now();
    this.joinedAt = Date.now();
    this.metadata = {};
  }

  connect(otherNode) {
    if (this.connections.has(otherNode.nodeId)) return this;

    const link = {
      targetId: otherNode.nodeId,
      latency: Math.random() * 100,
      bandwidth: PHI_INVERSE + Math.random() * PHI_COMPLEMENT,
      established: Date.now(),
      quality: 1.0,
    };

    this.connections.set(otherNode.nodeId, link);
    otherNode.connections.set(this.nodeId, {
      ...link,
      targetId: this.nodeId,
    });

    return this;
  }

  disconnect(nodeId) {
    this.connections.delete(nodeId);
    return this;
  }

  addCapability(capability) {
    this.capabilities.add(capability);
    return this;
  }

  shareResource(resourceId, resource) {
    this.resources.set(resourceId, {
      ...resource,
      sharedAt: Date.now(),
      sharedBy: this.nodeId,
    });
    return this;
  }

  updateReputation(delta) {
    this.reputation = Math.max(0, Math.min(1, this.reputation + delta));
    return this;
  }

  getStatus() {
    return {
      nodeId: this.nodeId,
      role: this.role,
      connections: this.connections.size,
      capabilities: Array.from(this.capabilities),
      reputation: this.reputation,
      uptime: Date.now() - this.joinedAt,
      resourceCount: this.resources.size,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// FEDERATION GOVERNANCE
// ════════════════════════════════════════════════════════════════════════════════

class FederationGovernance {
  constructor() {
    this.proposals = new Map();
    this.enactedPolicies = [];
    this.votingThreshold = PHI_INVERSE; // 61.8% for passage
  }

  propose(proposerId, policy) {
    const proposal = {
      proposalId: `FGP::${Date.now()}::${proposerId}`,
      proposerId,
      policy,
      votes: new Map(),
      status: 'OPEN',
      createdAt: Date.now(),
      expiresAt: Date.now() + 86400000, // 24h voting window
    };
    this.proposals.set(proposal.proposalId, proposal);
    return proposal;
  }

  vote(proposalId, voterId, approve, weight = 1.0) {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.status !== 'OPEN') return null;

    proposal.votes.set(voterId, { approve, weight, timestamp: Date.now() });
    this.checkProposal(proposal);
    return proposal;
  }

  checkProposal(proposal) {
    if (Date.now() > proposal.expiresAt) {
      proposal.status = 'EXPIRED';
      return;
    }

    let totalWeight = 0;
    let approveWeight = 0;
    proposal.votes.forEach(v => {
      totalWeight += v.weight;
      if (v.approve) approveWeight += v.weight;
    });

    if (totalWeight > 0 && approveWeight / totalWeight >= this.votingThreshold) {
      proposal.status = 'ENACTED';
      this.enactedPolicies.push(proposal.policy);
    } else if (totalWeight > 0 && (totalWeight - approveWeight) / totalWeight > (1 - this.votingThreshold)) {
      proposal.status = 'REJECTED';
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// SOVEREIGN MESH FEDERATION
// ════════════════════════════════════════════════════════════════════════════════

class SovereignMeshFederation {
  constructor(federationId) {
    this.federationId = federationId;
    this.nodes = new Map();
    this.topology = MeshTopology.HYBRID;
    this.governance = new FederationGovernance();
    this.eventLog = [];
    this.sharedResources = new Map();
    this.federationCoherence = 0;
    this.createdAt = Date.now();
    this.maxEvents = 500;
  }

  addNode(node) {
    this.nodes.set(node.nodeId, node);
    this.emitEvent(FederationEvent.NODE_JOINED, { nodeId: node.nodeId, role: node.role });
    this.updateTopology();
    return this;
  }

  removeNode(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return this;

    // Disconnect from all peers
    node.connections.forEach((_, peerId) => {
      const peer = this.nodes.get(peerId);
      if (peer) peer.disconnect(nodeId);
    });

    this.nodes.delete(nodeId);
    this.emitEvent(FederationEvent.NODE_LEFT, { nodeId });
    this.updateTopology();
    return this;
  }

  suspendNode(nodeId, reason) {
    const node = this.nodes.get(nodeId);
    if (!node) return this;

    node.role = FederationRole.SUSPENDED;
    node.updateReputation(-0.2);
    this.emitEvent(FederationEvent.NODE_SUSPENDED, { nodeId, reason });
    return this;
  }

  updateTopology() {
    const nodeCount = this.nodes.size;

    if (nodeCount <= 5) {
      this.topology = MeshTopology.FULL_MESH;
      // Connect all to all
      const nodes = Array.from(this.nodes.values());
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          nodes[i].connect(nodes[j]);
        }
      }
    } else if (nodeCount <= 20) {
      this.topology = MeshTopology.HYBRID;
    } else {
      this.topology = MeshTopology.TREE;
    }

    this.emitEvent(FederationEvent.TOPOLOGY_CHANGED, { topology: this.topology, nodeCount });
  }

  shareResource(fromNodeId, resourceId, resource) {
    const node = this.nodes.get(fromNodeId);
    if (!node) return null;

    node.shareResource(resourceId, resource);
    this.sharedResources.set(resourceId, {
      ...resource,
      providerId: fromNodeId,
      sharedAt: Date.now(),
    });

    this.emitEvent(FederationEvent.RESOURCE_SHARED, { fromNodeId, resourceId });
    node.updateReputation(0.01 * PHI_INVERSE);
    return this;
  }

  calculateCoherence() {
    const nodes = Array.from(this.nodes.values());
    if (nodes.length < 2) { this.federationCoherence = 1; return; }

    // Average connection quality
    let totalQuality = 0;
    let connectionCount = 0;

    nodes.forEach(node => {
      node.connections.forEach(conn => {
        totalQuality += conn.quality;
        connectionCount++;
      });
    });

    const avgQuality = connectionCount > 0 ? totalQuality / connectionCount : 0;

    // Average reputation
    const avgReputation = nodes.reduce((s, n) => s + n.reputation, 0) / nodes.length;

    // φ-weighted coherence
    this.federationCoherence = avgQuality * PHI_INVERSE + avgReputation * PHI_COMPLEMENT;
  }

  emitEvent(type, data) {
    this.eventLog.push({ type, data, timestamp: Date.now() });
    if (this.eventLog.length > this.maxEvents) this.eventLog.shift();
  }

  getStatus() {
    this.calculateCoherence();
    return {
      federationId: this.federationId,
      nodeCount: this.nodes.size,
      topology: this.topology,
      coherence: this.federationCoherence,
      sharedResources: this.sharedResources.size,
      activeProposals: this.governance.proposals.size,
      enactedPolicies: this.governance.enactedPolicies.length,
      recentEvents: this.eventLog.slice(-10),
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  FederationRole,
  MeshTopology,
  FederationEvent,
  MeshNode,
  FederationGovernance,
  SovereignMeshFederation,
};

export default {
  PROTOCOL_ID: 'PROTO-SMF-001',
  PROTOCOL_NAME: 'Sovereign Mesh Federation Protocol',
  DOCTRINE: 'Foederati sumus. Nexus nos ligat. Libertas in unitate.',
  DOCTRINE_EN: 'We are federated. The nexus binds us. Freedom in unity.',

  FederationRole,
  MeshTopology,
  FederationEvent,
  MeshNode,
  FederationGovernance,
  SovereignMeshFederation,
};
