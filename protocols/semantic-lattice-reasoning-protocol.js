/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  SEMANTIC LATTICE REASONING PROTOCOL — HIERARCHICAL MEANING COMPUTATION               ║
 * ║  "Reticulum Semanticum — Reasoning Through Lattices of Connected Meaning"             ║
 * ║                                                                                        ║
 * ║  "Significatio ordinatur. Reticulum comprehendit. Ratio structuram sequitur."         ║
 * ║  (Meaning is ordered. The lattice comprehends. Reason follows structure.)             ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// REASONING STATES
// ════════════════════════════════════════════════════════════════════════════════

const ReasoningState = {
  IDLE: 'IDLE',
  PARSING: 'PARSING',
  LATTICE_BUILDING: 'LATTICE_BUILDING',
  TRAVERSING: 'TRAVERSING',
  INFERRING: 'INFERRING',
  CONCLUDED: 'CONCLUDED',
  UNCERTAIN: 'UNCERTAIN',
};

const RelationType = {
  IS_A: 'IS_A',
  HAS_A: 'HAS_A',
  PART_OF: 'PART_OF',
  CAUSES: 'CAUSES',
  IMPLIES: 'IMPLIES',
  CONTRADICTS: 'CONTRADICTS',
  ANALOGOUS: 'ANALOGOUS',
};

// ════════════════════════════════════════════════════════════════════════════════
// SEMANTIC NODE
// ════════════════════════════════════════════════════════════════════════════════

class SemanticNode {
  constructor(concept, embedding = null) {
    this.concept = concept;
    this.embedding = embedding || this._generateEmbedding(concept);
    this.parents = new Set();
    this.children = new Set();
    this.relations = [];
    this.activationLevel = 0;
  }

  _generateEmbedding(concept) {
    const str = typeof concept === 'string' ? concept : JSON.stringify(concept);
    const dim = 16;
    const embedding = new Array(dim).fill(0);
    for (let i = 0; i < str.length; i++) {
      embedding[i % dim] += str.charCodeAt(i) * PHI_COMPLEMENT / 100;
    }
    const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0)) || 1;
    return embedding.map(v => v / norm);
  }

  relateTo(other, relation) {
    this.relations.push({ target: other.concept, type: relation, strength: PHI_INVERSE });
    if (relation === RelationType.IS_A) {
      this.parents.add(other.concept);
      other.children.add(this.concept);
    }
  }

  similarity(other) {
    let dot = 0;
    for (let i = 0; i < this.embedding.length; i++) {
      dot += (this.embedding[i] || 0) * (other.embedding[i] || 0);
    }
    return dot;
  }

  activate(level = PHI_INVERSE) {
    this.activationLevel = Math.min(this.activationLevel + level, PHI);
    return this.activationLevel;
  }

  decay(rate = PHI_COMPLEMENT * 0.1) {
    this.activationLevel *= (1 - rate);
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// SEMANTIC LATTICE ENGINE
// ════════════════════════════════════════════════════════════════════════════════

class SemanticLatticeEngine {
  constructor(config = {}) {
    this.nodes = new Map();
    this.state = ReasoningState.IDLE;
    this.inferences = [];
    this.activationThreshold = config.activationThreshold || PHI_COMPLEMENT;
    this.spreadingFactor = config.spreadingFactor || PHI_INVERSE;
  }

  addConcept(concept, embedding = null) {
    const node = new SemanticNode(concept, embedding);
    this.nodes.set(concept, node);
    return node;
  }

  relate(conceptA, conceptB, relation) {
    const nodeA = this.nodes.get(conceptA);
    const nodeB = this.nodes.get(conceptB);
    if (!nodeA || !nodeB) return null;
    nodeA.relateTo(nodeB, relation);
    return { from: conceptA, to: conceptB, relation };
  }

  query(concept) {
    this.state = ReasoningState.PARSING;
    const node = this.nodes.get(concept);
    if (!node) return { found: false };

    this.state = ReasoningState.TRAVERSING;
    node.activate(1.0);
    this._spreadActivation(node);

    const activated = [...this.nodes.values()]
      .filter(n => n.activationLevel > this.activationThreshold)
      .sort((a, b) => b.activationLevel - a.activationLevel)
      .map(n => ({ concept: n.concept, activation: n.activationLevel }));

    this._decayAll();
    this.state = ReasoningState.CONCLUDED;
    return { found: true, concept, related: activated };
  }

  _spreadActivation(sourceNode) {
    const visited = new Set([sourceNode.concept]);
    const queue = [sourceNode];
    let depth = 0;
    const maxDepth = 3;

    while (queue.length > 0 && depth < maxDepth) {
      const current = queue.shift();
      const spread = current.activationLevel * this.spreadingFactor * Math.pow(PHI_INVERSE, depth);

      for (const relation of current.relations) {
        const target = this.nodes.get(relation.target);
        if (target && !visited.has(target.concept)) {
          target.activate(spread * relation.strength);
          visited.add(target.concept);
          queue.push(target);
        }
      }
      depth++;
    }
  }

  _decayAll() {
    for (const [, node] of this.nodes) {
      node.decay();
    }
  }

  infer(conceptA, conceptB) {
    this.state = ReasoningState.INFERRING;
    const nodeA = this.nodes.get(conceptA);
    const nodeB = this.nodes.get(conceptB);
    if (!nodeA || !nodeB) return null;

    const similarity = nodeA.similarity(nodeB);
    const sharedParents = [...nodeA.parents].filter(p => nodeB.parents.has(p));
    const path = this._findPath(conceptA, conceptB);

    const inference = {
      from: conceptA,
      to: conceptB,
      similarity,
      sharedParents,
      pathLength: path ? path.length : Infinity,
      confidence: this._inferenceConfidence(similarity, sharedParents.length, path),
      timestamp: Date.now(),
    };

    this.inferences.push(inference);
    this.state = inference.confidence > PHI_INVERSE ? ReasoningState.CONCLUDED : ReasoningState.UNCERTAIN;
    return inference;
  }

  _findPath(startConcept, endConcept) {
    const visited = new Set();
    const queue = [[startConcept]];

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];
      if (current === endConcept) return path;
      if (visited.has(current) || path.length > 6) continue;
      visited.add(current);

      const node = this.nodes.get(current);
      if (!node) continue;
      for (const relation of node.relations) {
        if (!visited.has(relation.target)) {
          queue.push([...path, relation.target]);
        }
      }
    }
    return null;
  }

  _inferenceConfidence(similarity, sharedParents, path) {
    let confidence = similarity * PHI_COMPLEMENT;
    confidence += sharedParents * PHI_COMPLEMENT * 0.2;
    if (path) confidence += (1 / path.length) * PHI_COMPLEMENT;
    return Math.min(confidence, 1.0);
  }

  getLatticeReport() {
    return {
      state: this.state,
      concepts: this.nodes.size,
      relations: [...this.nodes.values()].reduce((s, n) => s + n.relations.length, 0),
      inferences: this.inferences.length,
      averageConfidence: this.inferences.length > 0
        ? this.inferences.reduce((s, i) => s + i.confidence, 0) / this.inferences.length
        : 0,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  SemanticLatticeEngine,
  SemanticNode,
  ReasoningState,
  RelationType,
};

export default {
  PROTOCOL_ID: 'PROTO-SLR-001',
  PROTOCOL_NAME: 'Semantic Lattice Reasoning Protocol',
  DOCTRINE: 'Significatio ordinatur. Reticulum comprehendit. Ratio structuram sequitur.',
  DOCTRINE_EN: 'Meaning is ordered. The lattice comprehends. Reason follows structure.',

  ReasoningState,
  RelationType,
  SemanticNode,
  SemanticLatticeEngine,
};
