/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  FRACTAL DECISION TREE PROTOCOL — SELF-SIMILAR BRANCHING INTELLIGENCE                 ║
 * ║  "Arbor Fractalis — Decisions That Mirror Themselves At Every Scale"                   ║
 * ║                                                                                        ║
 * ║  "Pars totum reflectit. Ramus arborem continet. Decisio infinita est."               ║
 * ║  (The part reflects the whole. The branch contains the tree. Decision is infinite.)   ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// DECISION STATES
// ════════════════════════════════════════════════════════════════════════════════

const DecisionState = {
  PENDING: 'PENDING',
  EVALUATING: 'EVALUATING',
  BRANCHING: 'BRANCHING',
  CONVERGING: 'CONVERGING',
  DECIDED: 'DECIDED',
  DEFERRED: 'DEFERRED',
  RECURSIVE: 'RECURSIVE',
};

const BranchStrategy = {
  BINARY: 'BINARY',
  TERNARY: 'TERNARY',
  PHI_SPLIT: 'PHI_SPLIT',
  FRACTAL: 'FRACTAL',
  MONTE_CARLO: 'MONTE_CARLO',
};

// ════════════════════════════════════════════════════════════════════════════════
// FRACTAL NODE
// ════════════════════════════════════════════════════════════════════════════════

class FractalNode {
  constructor(question, depth = 0, maxDepth = 8) {
    this.question = question;
    this.depth = depth;
    this.maxDepth = maxDepth;
    this.branches = [];
    this.score = 0;
    this.state = DecisionState.PENDING;
    this.metadata = { createdAt: Date.now() };
  }

  branch(options) {
    if (this.depth >= this.maxDepth) {
      this.state = DecisionState.DECIDED;
      return this;
    }

    this.state = DecisionState.BRANCHING;
    for (const option of options) {
      const child = new FractalNode(
        option.question || `${this.question} → ${option.label}`,
        this.depth + 1,
        this.maxDepth
      );
      child.score = option.score || 0;
      this.branches.push({ node: child, label: option.label, weight: option.weight || 1 });
    }
    return this;
  }

  evaluate(evaluator) {
    this.state = DecisionState.EVALUATING;
    this.score = evaluator(this.question, this.depth);
    for (const branch of this.branches) {
      branch.node.evaluate(evaluator);
    }
    this.state = this.branches.length > 0 ? DecisionState.BRANCHING : DecisionState.DECIDED;
    return this.score;
  }

  getBestPath() {
    if (this.branches.length === 0) return [{ question: this.question, score: this.score }];
    const best = this.branches.reduce((a, b) =>
      (a.node.score * a.weight) > (b.node.score * b.weight) ? a : b
    );
    return [{ question: this.question, score: this.score }, ...best.node.getBestPath()];
  }

  getTreeSize() {
    let count = 1;
    for (const branch of this.branches) {
      count += branch.node.getTreeSize();
    }
    return count;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// FRACTAL DECISION ENGINE
// ════════════════════════════════════════════════════════════════════════════════

class FractalDecisionEngine {
  constructor(config = {}) {
    this.strategy = config.strategy || BranchStrategy.PHI_SPLIT;
    this.maxDepth = config.maxDepth || 8;
    this.explorationFactor = config.explorationFactor || PHI_INVERSE;
    this.trees = [];
    this.decisions = [];
  }

  createTree(rootQuestion) {
    const root = new FractalNode(rootQuestion, 0, this.maxDepth);
    this.trees.push(root);
    return root;
  }

  autoExpand(root, generator, depth = 0) {
    if (depth >= this.maxDepth) return root;

    const options = generator(root.question, depth);
    if (!options || options.length === 0) return root;

    root.branch(options);

    for (const branch of root.branches) {
      if (Math.random() < this.explorationFactor) {
        this.autoExpand(branch.node, generator, depth + 1);
      }
    }

    return root;
  }

  decide(root, evaluator) {
    root.evaluate(evaluator);
    const path = root.getBestPath();
    const decision = {
      question: root.question,
      path,
      confidence: this._computeConfidence(root),
      treeSize: root.getTreeSize(),
      timestamp: Date.now(),
    };
    this.decisions.push(decision);
    return decision;
  }

  _computeConfidence(root) {
    if (root.branches.length === 0) return 1.0;
    const scores = root.branches.map(b => b.node.score * b.weight);
    const max = Math.max(...scores);
    const secondMax = scores.length > 1
      ? scores.filter(s => s !== max).reduce((a, b) => Math.max(a, b), 0)
      : 0;
    const gap = max - secondMax;
    return Math.min(gap * PHI_INVERSE + PHI_COMPLEMENT, 1.0);
  }

  phiSplit(root, evaluator) {
    const score = evaluator(root.question, root.depth);
    root.score = score;

    if (root.depth >= this.maxDepth) return;

    const splitPoint = score * PHI_INVERSE;
    root.branch([
      { label: 'PHI_MAJOR', question: `${root.question} [major]`, score: splitPoint * PHI, weight: PHI },
      { label: 'PHI_MINOR', question: `${root.question} [minor]`, score: splitPoint, weight: PHI_INVERSE },
    ]);

    for (const branch of root.branches) {
      this.phiSplit(branch.node, evaluator);
    }
  }

  getDecisionHistory() {
    return this.decisions.map(d => ({
      question: d.question,
      confidence: d.confidence,
      treeSize: d.treeSize,
      pathLength: d.path.length,
    }));
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  FractalDecisionEngine,
  FractalNode,
  DecisionState,
  BranchStrategy,
};

export default {
  PROTOCOL_ID: 'PROTO-FDT-001',
  PROTOCOL_NAME: 'Fractal Decision Tree Protocol',
  DOCTRINE: 'Pars totum reflectit. Ramus arborem continet. Decisio infinita est.',
  DOCTRINE_EN: 'The part reflects the whole. The branch contains the tree. Decision is infinite.',

  DecisionState,
  BranchStrategy,
  FractalNode,
  FractalDecisionEngine,
};
