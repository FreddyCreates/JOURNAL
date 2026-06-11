/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  COLLECTIVE MEMORY WEAVING PROTOCOL — SHARED KNOWLEDGE FABRIC CONSTRUCTION            ║
 * ║  "Textura Memoriae — Weaving Individual Memories Into Collective Wisdom"              ║
 * ║                                                                                        ║
 * ║  "Fila memoriae texuntur. Sapientia collectiva surgit. Unum scit quod omnes sciunt." ║
 * ║  (Memory threads are woven. Collective wisdom rises. One knows what all know.)       ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// WEAVING STATES
// ════════════════════════════════════════════════════════════════════════════════

const WeavingState = {
  GATHERING: 'GATHERING',
  SPINNING: 'SPINNING',
  WEAVING: 'WEAVING',
  BINDING: 'BINDING',
  COMPLETE: 'COMPLETE',
  UNRAVELING: 'UNRAVELING',
  REPAIRING: 'REPAIRING',
};

const ThreadType = {
  EPISODIC: 'EPISODIC',
  SEMANTIC: 'SEMANTIC',
  PROCEDURAL: 'PROCEDURAL',
  EMOTIONAL: 'EMOTIONAL',
  SENSORY: 'SENSORY',
};

// ════════════════════════════════════════════════════════════════════════════════
// MEMORY THREAD
// ════════════════════════════════════════════════════════════════════════════════

class MemoryThread {
  constructor(id, type, content) {
    this.id = id;
    this.type = type;
    this.content = content;
    this.strength = 1.0;
    this.connections = [];
    this.weavings = 0;
    this.createdAt = Date.now();
    this.lastAccessed = Date.now();
  }

  connect(other, strength = PHI_COMPLEMENT) {
    this.connections.push({ threadId: other.id, strength, timestamp: Date.now() });
    other.connections.push({ threadId: this.id, strength, timestamp: Date.now() });
  }

  access() {
    this.lastAccessed = Date.now();
    this.strength *= (1 + PHI_COMPLEMENT * 0.1);
    if (this.strength > PHI * PHI) this.strength = PHI * PHI;
  }

  decay(rate = PHI_COMPLEMENT * 0.001) {
    const timeSinceAccess = Date.now() - this.lastAccessed;
    const decayFactor = rate * (timeSinceAccess / 1000);
    this.strength *= Math.max(1 - decayFactor, PHI_COMPLEMENT * 0.1);
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// COLLECTIVE MEMORY WEAVER
// ════════════════════════════════════════════════════════════════════════════════

class CollectiveMemoryWeaver {
  constructor(config = {}) {
    this.threads = new Map();
    this.fabric = [];
    this.state = WeavingState.GATHERING;
    this.weavingPatterns = [];
    this.totalWeaves = 0;
    this.cohesion = 0;
    this.retrievalThreshold = config.retrievalThreshold || PHI_COMPLEMENT;
  }

  addThread(id, type, content) {
    const thread = new MemoryThread(id, type, content);
    this.threads.set(id, thread);
    this._autoConnect(thread);
    return thread;
  }

  _autoConnect(newThread) {
    for (const [, existing] of this.threads) {
      if (existing.id === newThread.id) continue;
      const similarity = this._contentSimilarity(newThread.content, existing.content);
      if (similarity > PHI_COMPLEMENT) {
        newThread.connect(existing, similarity);
      }
    }
  }

  _contentSimilarity(a, b) {
    const strA = JSON.stringify(a).toLowerCase();
    const strB = JSON.stringify(b).toLowerCase();
    const wordsA = new Set(strA.split(/\W+/));
    const wordsB = new Set(strB.split(/\W+/));
    const intersection = [...wordsA].filter(w => wordsB.has(w));
    const union = new Set([...wordsA, ...wordsB]);
    return union.size > 0 ? intersection.length / union.size : 0;
  }

  weave() {
    this.state = WeavingState.SPINNING;
    const clusters = this._identifyClusters();

    this.state = WeavingState.WEAVING;
    for (const cluster of clusters) {
      const pattern = this._createWeavingPattern(cluster);
      this.weavingPatterns.push(pattern);
      this.fabric.push({
        pattern,
        threads: cluster.map(t => t.id),
        strength: cluster.reduce((s, t) => s + t.strength, 0) / cluster.length,
        timestamp: Date.now(),
      });
    }

    this.state = WeavingState.BINDING;
    this.totalWeaves++;
    this._computeCohesion();
    this.state = WeavingState.COMPLETE;

    return { weaves: this.totalWeaves, patterns: this.weavingPatterns.length, cohesion: this.cohesion };
  }

  _identifyClusters() {
    const visited = new Set();
    const clusters = [];

    for (const [, thread] of this.threads) {
      if (visited.has(thread.id)) continue;
      const cluster = [thread];
      visited.add(thread.id);

      for (const conn of thread.connections) {
        const connected = this.threads.get(conn.threadId);
        if (connected && !visited.has(connected.id) && conn.strength > PHI_COMPLEMENT) {
          cluster.push(connected);
          visited.add(connected.id);
        }
      }
      if (cluster.length > 1) clusters.push(cluster);
    }
    return clusters;
  }

  _createWeavingPattern(cluster) {
    return {
      size: cluster.length,
      types: [...new Set(cluster.map(t => t.type))],
      averageStrength: cluster.reduce((s, t) => s + t.strength, 0) / cluster.length,
      connectivity: cluster.reduce((s, t) => s + t.connections.length, 0) / cluster.length,
    };
  }

  _computeCohesion() {
    if (this.threads.size < 2) { this.cohesion = 0; return; }
    const totalConnections = [...this.threads.values()].reduce((s, t) => s + t.connections.length, 0);
    const maxConnections = this.threads.size * (this.threads.size - 1);
    this.cohesion = totalConnections / maxConnections;
  }

  recall(query) {
    const queryStr = JSON.stringify(query).toLowerCase();
    const results = [];

    for (const [, thread] of this.threads) {
      const relevance = this._contentSimilarity(query, thread.content);
      if (relevance > this.retrievalThreshold) {
        thread.access();
        results.push({ thread: thread.id, content: thread.content, relevance, strength: thread.strength });
      }
    }

    return results.sort((a, b) => b.relevance * b.strength - a.relevance * a.strength);
  }

  tick() {
    for (const [, thread] of this.threads) {
      thread.decay();
    }
    this._computeCohesion();
  }

  getWeavingReport() {
    return {
      state: this.state,
      threads: this.threads.size,
      fabricLayers: this.fabric.length,
      totalWeaves: this.totalWeaves,
      cohesion: this.cohesion,
      threadTypes: [...new Set([...this.threads.values()].map(t => t.type))],
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  CollectiveMemoryWeaver,
  MemoryThread,
  WeavingState,
  ThreadType,
};

export default {
  PROTOCOL_ID: 'PROTO-CMW-001',
  PROTOCOL_NAME: 'Collective Memory Weaving Protocol',
  DOCTRINE: 'Fila memoriae texuntur. Sapientia collectiva surgit. Unum scit quod omnes sciunt.',
  DOCTRINE_EN: 'Memory threads are woven. Collective wisdom rises. One knows what all know.',

  WeavingState,
  ThreadType,
  MemoryThread,
  CollectiveMemoryWeaver,
};
