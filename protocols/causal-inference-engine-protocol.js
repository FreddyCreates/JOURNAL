/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  CAUSAL INFERENCE ENGINE PROTOCOL — SOVEREIGN CAUSE-AND-EFFECT REASONING              ║
 * ║  "Causalis Machina — Understanding Why Through Structural Causal Models"              ║
 * ║                                                                                        ║
 * ║  "Causa praecedit effectum. Intelligentia causam invenit. Veritas structuralis est."  ║
 * ║  (Cause precedes effect. Intelligence finds cause. Truth is structural.)              ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// CAUSAL STATES
// ════════════════════════════════════════════════════════════════════════════════

const CausalState = {
  OBSERVING: 'OBSERVING',
  HYPOTHESIZING: 'HYPOTHESIZING',
  INTERVENING: 'INTERVENING',
  VALIDATING: 'VALIDATING',
  CONFIRMED: 'CONFIRMED',
  REFUTED: 'REFUTED',
  CONFOUNDED: 'CONFOUNDED',
};

const CausalRelation = {
  DIRECT: 'DIRECT',
  INDIRECT: 'INDIRECT',
  CONFOUNDED: 'CONFOUNDED',
  SPURIOUS: 'SPURIOUS',
  BIDIRECTIONAL: 'BIDIRECTIONAL',
};

// ════════════════════════════════════════════════════════════════════════════════
// CAUSAL NODE
// ════════════════════════════════════════════════════════════════════════════════

class CausalNode {
  constructor(name, domain) {
    this.name = name;
    this.domain = domain;
    this.parents = [];
    this.children = [];
    this.observations = [];
    this.mechanism = null;
  }

  setMechanism(fn) {
    this.mechanism = fn;
  }

  addParent(node) {
    this.parents.push(node);
    node.children.push(this);
  }

  observe(value) {
    this.observations.push({ value, timestamp: Date.now() });
  }

  generate(parentValues) {
    if (this.mechanism) {
      return this.mechanism(parentValues);
    }
    return parentValues.reduce((s, v) => s + v * PHI_INVERSE, 0);
  }

  intervene(value) {
    this.parents = [];
    this.mechanism = () => value;
    return { node: this.name, intervention: value };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// CAUSAL GRAPH
// ════════════════════════════════════════════════════════════════════════════════

class CausalGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = [];
  }

  addNode(name, domain = 'continuous') {
    const node = new CausalNode(name, domain);
    this.nodes.set(name, node);
    return node;
  }

  addEdge(parentName, childName, relation = CausalRelation.DIRECT) {
    const parent = this.nodes.get(parentName);
    const child = this.nodes.get(childName);
    if (!parent || !child) return null;
    child.addParent(parent);
    const edge = { parent: parentName, child: childName, relation, strength: PHI_INVERSE };
    this.edges.push(edge);
    return edge;
  }

  topologicalSort() {
    const visited = new Set();
    const order = [];
    const visit = (name) => {
      if (visited.has(name)) return;
      visited.add(name);
      const node = this.nodes.get(name);
      for (const parent of node.parents) {
        visit(parent.name);
      }
      order.push(name);
    };
    for (const [name] of this.nodes) visit(name);
    return order;
  }

  simulate(interventions = {}) {
    const order = this.topologicalSort();
    const values = {};

    for (const name of order) {
      if (interventions[name] !== undefined) {
        values[name] = interventions[name];
      } else {
        const node = this.nodes.get(name);
        const parentValues = node.parents.map(p => values[p.name] || 0);
        values[name] = node.generate(parentValues);
      }
    }
    return values;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// CAUSAL INFERENCE ENGINE
// ════════════════════════════════════════════════════════════════════════════════

class CausalInferenceEngine {
  constructor(config = {}) {
    this.graph = new CausalGraph();
    this.state = CausalState.OBSERVING;
    this.hypotheses = [];
    this.experiments = [];
    this.confidenceThreshold = config.confidenceThreshold || PHI_INVERSE;
  }

  defineVariable(name, domain) {
    return this.graph.addNode(name, domain);
  }

  hypothesize(causeName, effectName, relation = CausalRelation.DIRECT) {
    this.state = CausalState.HYPOTHESIZING;
    const hypothesis = {
      cause: causeName,
      effect: effectName,
      relation,
      confidence: 0,
      evidence: [],
      timestamp: Date.now(),
    };
    this.hypotheses.push(hypothesis);
    this.graph.addEdge(causeName, effectName, relation);
    return hypothesis;
  }

  intervene(nodeName, value) {
    this.state = CausalState.INTERVENING;
    const node = this.graph.nodes.get(nodeName);
    if (!node) return null;
    const result = node.intervene(value);
    const simulated = this.graph.simulate({ [nodeName]: value });
    const experiment = {
      intervention: result,
      outcome: simulated,
      timestamp: Date.now(),
    };
    this.experiments.push(experiment);
    return experiment;
  }

  estimateCausalEffect(causeName, effectName, interventionValue = 1) {
    const baseline = this.graph.simulate();
    const intervened = this.graph.simulate({ [causeName]: interventionValue });
    const effect = (intervened[effectName] || 0) - (baseline[effectName] || 0);
    return {
      cause: causeName,
      effect: effectName,
      causalEffect: effect,
      baseline: baseline[effectName] || 0,
      intervened: intervened[effectName] || 0,
    };
  }

  validate(hypothesis) {
    this.state = CausalState.VALIDATING;
    const effect = this.estimateCausalEffect(hypothesis.cause, hypothesis.effect);
    hypothesis.confidence = Math.min(Math.abs(effect.causalEffect) * PHI, 1.0);

    if (hypothesis.confidence > this.confidenceThreshold) {
      this.state = CausalState.CONFIRMED;
      hypothesis.evidence.push({ type: 'intervention', result: effect });
    } else {
      this.state = CausalState.REFUTED;
    }
    return hypothesis;
  }

  getInferenceReport() {
    return {
      state: this.state,
      variables: this.graph.nodes.size,
      edges: this.graph.edges.length,
      hypotheses: this.hypotheses.length,
      confirmed: this.hypotheses.filter(h => h.confidence > this.confidenceThreshold).length,
      experiments: this.experiments.length,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  CausalInferenceEngine,
  CausalGraph,
  CausalNode,
  CausalState,
  CausalRelation,
};

export default {
  PROTOCOL_ID: 'PROTO-CIE-001',
  PROTOCOL_NAME: 'Causal Inference Engine Protocol',
  DOCTRINE: 'Causa praecedit effectum. Intelligentia causam invenit. Veritas structuralis est.',
  DOCTRINE_EN: 'Cause precedes effect. Intelligence finds cause. Truth is structural.',

  CausalState,
  CausalRelation,
  CausalNode,
  CausalGraph,
  CausalInferenceEngine,
};
