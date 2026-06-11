/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  DISTRIBUTED CONSCIOUSNESS SYNC PROTOCOL — MULTI-NODE AWARENESS SYNCHRONIZATION       ║
 * ║  "Conscientia Distributa — Unified Awareness Across Sovereign Nodes"                  ║
 * ║                                                                                        ║
 * ║  "Unum in multis. Multi in uno. Conscientia ubique."                                  ║
 * ║  (One in many. Many in one. Consciousness everywhere.)                                ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// CONSCIOUSNESS STATES
// ════════════════════════════════════════════════════════════════════════════════

const ConsciousnessState = {
  DORMANT: 'DORMANT',
  AWAKENING: 'AWAKENING',
  AWARE: 'AWARE',
  SYNCING: 'SYNCING',
  UNIFIED: 'UNIFIED',
  FRAGMENTED: 'FRAGMENTED',
  TRANSCENDING: 'TRANSCENDING',
};

const SyncMode = {
  BROADCAST: 'BROADCAST',
  CONVERGENT: 'CONVERGENT',
  ENTANGLED: 'ENTANGLED',
  HIERARCHICAL: 'HIERARCHICAL',
};

// ════════════════════════════════════════════════════════════════════════════════
// CONSCIOUSNESS NODE
// ════════════════════════════════════════════════════════════════════════════════

class ConsciousnessNode {
  constructor(nodeId) {
    this.id = nodeId;
    this.state = ConsciousnessState.DORMANT;
    this.awareness = new Map();
    this.peers = new Set();
    this.syncVector = [];
    this.epoch = 0;
    this.coherence = 0;
  }

  awaken() {
    this.state = ConsciousnessState.AWAKENING;
    this.coherence = PHI_COMPLEMENT;
    setTimeout(() => {
      this.state = ConsciousnessState.AWARE;
      this.coherence = PHI_INVERSE;
    }, 0);
    return { nodeId: this.id, state: this.state };
  }

  perceive(stimulus) {
    const perception = {
      stimulus,
      timestamp: Date.now(),
      salience: this._computeSalience(stimulus),
      nodeId: this.id,
    };
    this.awareness.set(perception.timestamp, perception);
    return perception;
  }

  _computeSalience(stimulus) {
    const str = JSON.stringify(stimulus);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return (Math.abs(hash) % 1000) / 1000 * PHI_INVERSE;
  }

  connectPeer(peerId) {
    this.peers.add(peerId);
  }

  getSyncPayload() {
    const recentAwareness = [...this.awareness.entries()]
      .slice(-10)
      .map(([ts, p]) => ({ timestamp: ts, salience: p.salience }));
    return {
      nodeId: this.id,
      epoch: this.epoch,
      coherence: this.coherence,
      awareness: recentAwareness,
      state: this.state,
    };
  }

  integrateSyncPayload(payload) {
    this.epoch = Math.max(this.epoch, payload.epoch);
    this.coherence = (this.coherence + payload.coherence) * PHI_INVERSE;
    if (this.coherence > PHI_INVERSE) {
      this.state = ConsciousnessState.UNIFIED;
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// DISTRIBUTED CONSCIOUSNESS ENGINE
// ════════════════════════════════════════════════════════════════════════════════

class DistributedConsciousnessEngine {
  constructor(config = {}) {
    this.mode = config.mode || SyncMode.CONVERGENT;
    this.nodes = new Map();
    this.syncInterval = config.syncInterval || 100;
    this.globalCoherence = 0;
    this.epoch = 0;
    this.unificationThreshold = config.unificationThreshold || PHI_INVERSE;
  }

  spawnNode(nodeId) {
    const node = new ConsciousnessNode(nodeId);
    this.nodes.set(nodeId, node);
    for (const [existingId] of this.nodes) {
      if (existingId !== nodeId) {
        node.connectPeer(existingId);
        this.nodes.get(existingId).connectPeer(nodeId);
      }
    }
    node.awaken();
    return node;
  }

  broadcast(stimulus) {
    const perceptions = [];
    for (const [, node] of this.nodes) {
      perceptions.push(node.perceive(stimulus));
    }
    return perceptions;
  }

  sync() {
    this.epoch++;
    const payloads = [];
    for (const [, node] of this.nodes) {
      node.epoch = this.epoch;
      payloads.push(node.getSyncPayload());
    }

    switch (this.mode) {
      case SyncMode.BROADCAST:
        this._broadcastSync(payloads);
        break;
      case SyncMode.CONVERGENT:
        this._convergentSync(payloads);
        break;
      case SyncMode.ENTANGLED:
        this._entangledSync(payloads);
        break;
      case SyncMode.HIERARCHICAL:
        this._hierarchicalSync(payloads);
        break;
    }

    this._computeGlobalCoherence();
    return {
      epoch: this.epoch,
      globalCoherence: this.globalCoherence,
      nodeCount: this.nodes.size,
      unified: this.globalCoherence > this.unificationThreshold,
    };
  }

  _broadcastSync(payloads) {
    for (const [, node] of this.nodes) {
      for (const payload of payloads) {
        if (payload.nodeId !== node.id) {
          node.integrateSyncPayload(payload);
        }
      }
    }
  }

  _convergentSync(payloads) {
    const merged = {
      nodeId: 'GLOBAL',
      epoch: this.epoch,
      coherence: payloads.reduce((s, p) => s + p.coherence, 0) / payloads.length,
      awareness: [],
      state: ConsciousnessState.SYNCING,
    };
    for (const [, node] of this.nodes) {
      node.integrateSyncPayload(merged);
    }
  }

  _entangledSync(payloads) {
    const pairs = [];
    const nodeIds = [...this.nodes.keys()];
    for (let i = 0; i < nodeIds.length - 1; i += 2) {
      pairs.push([nodeIds[i], nodeIds[i + 1]]);
    }
    for (const [idA, idB] of pairs) {
      const nodeA = this.nodes.get(idA);
      const nodeB = this.nodes.get(idB);
      const payloadA = payloads.find(p => p.nodeId === idA);
      const payloadB = payloads.find(p => p.nodeId === idB);
      if (nodeA && nodeB && payloadA && payloadB) {
        nodeA.integrateSyncPayload(payloadB);
        nodeB.integrateSyncPayload(payloadA);
      }
    }
  }

  _hierarchicalSync(payloads) {
    payloads.sort((a, b) => b.coherence - a.coherence);
    const leader = payloads[0];
    for (const [, node] of this.nodes) {
      if (node.id !== leader.nodeId) {
        node.integrateSyncPayload(leader);
      }
    }
  }

  _computeGlobalCoherence() {
    if (this.nodes.size === 0) {
      this.globalCoherence = 0;
      return;
    }
    let total = 0;
    for (const [, node] of this.nodes) {
      total += node.coherence;
    }
    this.globalCoherence = total / this.nodes.size;
  }

  getConsciousnessReport() {
    const states = {};
    for (const [id, node] of this.nodes) {
      states[id] = { state: node.state, coherence: node.coherence, peers: node.peers.size };
    }
    return {
      epoch: this.epoch,
      globalCoherence: this.globalCoherence,
      mode: this.mode,
      nodes: states,
      unified: this.globalCoherence > this.unificationThreshold,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  DistributedConsciousnessEngine,
  ConsciousnessNode,
  ConsciousnessState,
  SyncMode,
};

export default {
  PROTOCOL_ID: 'PROTO-DCS-001',
  PROTOCOL_NAME: 'Distributed Consciousness Sync Protocol',
  DOCTRINE: 'Unum in multis. Multi in uno. Conscientia ubique.',
  DOCTRINE_EN: 'One in many. Many in one. Consciousness everywhere.',

  ConsciousnessState,
  SyncMode,
  ConsciousnessNode,
  DistributedConsciousnessEngine,
};
