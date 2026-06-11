/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  EMERGENT BEHAVIOR SYNTHESIS PROTOCOL — COMPLEX PATTERNS FROM SIMPLE RULES            ║
 * ║  "Synthesis Emergens — Order Rising From The Interactions of Simple Agents"           ║
 * ║                                                                                        ║
 * ║  "Ex simplicibus complexa surgunt. Ordo ex interactione. Totum plus partibus."        ║
 * ║  (Complex things arise from simple ones. Order from interaction. The whole exceeds.)  ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// EMERGENCE STATES
// ════════════════════════════════════════════════════════════════════════════════

const EmergenceState = {
  CHAOTIC: 'CHAOTIC',
  NUCLEATING: 'NUCLEATING',
  FORMING: 'FORMING',
  EMERGING: 'EMERGING',
  STABLE_PATTERN: 'STABLE_PATTERN',
  COMPLEXIFYING: 'COMPLEXIFYING',
  META_EMERGENT: 'META_EMERGENT',
};

const RuleType = {
  ATTRACTION: 'ATTRACTION',
  REPULSION: 'REPULSION',
  ALIGNMENT: 'ALIGNMENT',
  COHESION: 'COHESION',
  SEPARATION: 'SEPARATION',
  IMITATION: 'IMITATION',
};

// ════════════════════════════════════════════════════════════════════════════════
// SIMPLE AGENT
// ════════════════════════════════════════════════════════════════════════════════

class SimpleAgent {
  constructor(id) {
    this.id = id;
    this.position = { x: Math.random() * 100, y: Math.random() * 100 };
    this.velocity = { x: (Math.random() - 0.5) * PHI, y: (Math.random() - 0.5) * PHI };
    this.state = 0;
    this.neighbors = [];
    this.rules = [];
  }

  addRule(type, strength = PHI_COMPLEMENT) {
    this.rules.push({ type, strength });
  }

  perceive(agents, radius = PHI * 10) {
    this.neighbors = agents.filter(a => {
      if (a.id === this.id) return false;
      const dx = a.position.x - this.position.x;
      const dy = a.position.y - this.position.y;
      return Math.sqrt(dx * dx + dy * dy) < radius;
    });
  }

  act() {
    let fx = 0, fy = 0;
    for (const rule of this.rules) {
      const force = this._applyRule(rule);
      fx += force.x;
      fy += force.y;
    }
    this.velocity.x += fx * PHI_COMPLEMENT;
    this.velocity.y += fy * PHI_COMPLEMENT;
    const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    if (speed > PHI) {
      this.velocity.x = (this.velocity.x / speed) * PHI;
      this.velocity.y = (this.velocity.y / speed) * PHI;
    }
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  _applyRule(rule) {
    if (this.neighbors.length === 0) return { x: 0, y: 0 };
    let fx = 0, fy = 0;

    switch (rule.type) {
      case RuleType.COHESION: {
        const cx = this.neighbors.reduce((s, n) => s + n.position.x, 0) / this.neighbors.length;
        const cy = this.neighbors.reduce((s, n) => s + n.position.y, 0) / this.neighbors.length;
        fx = (cx - this.position.x) * rule.strength;
        fy = (cy - this.position.y) * rule.strength;
        break;
      }
      case RuleType.SEPARATION: {
        for (const n of this.neighbors) {
          const dx = this.position.x - n.position.x;
          const dy = this.position.y - n.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          fx += (dx / dist) * rule.strength / dist;
          fy += (dy / dist) * rule.strength / dist;
        }
        break;
      }
      case RuleType.ALIGNMENT: {
        const avgVx = this.neighbors.reduce((s, n) => s + n.velocity.x, 0) / this.neighbors.length;
        const avgVy = this.neighbors.reduce((s, n) => s + n.velocity.y, 0) / this.neighbors.length;
        fx = (avgVx - this.velocity.x) * rule.strength;
        fy = (avgVy - this.velocity.y) * rule.strength;
        break;
      }
      case RuleType.ATTRACTION: {
        const cx2 = this.neighbors.reduce((s, n) => s + n.position.x, 0) / this.neighbors.length;
        const cy2 = this.neighbors.reduce((s, n) => s + n.position.y, 0) / this.neighbors.length;
        fx = (cx2 - this.position.x) * rule.strength * PHI_INVERSE;
        fy = (cy2 - this.position.y) * rule.strength * PHI_INVERSE;
        break;
      }
    }
    return { x: fx, y: fy };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EMERGENT BEHAVIOR ENGINE
// ════════════════════════════════════════════════════════════════════════════════

class EmergentBehaviorEngine {
  constructor(config = {}) {
    this.agentCount = config.agentCount || 50;
    this.agents = [];
    this.state = EmergenceState.CHAOTIC;
    this.epoch = 0;
    this.patterns = [];
    this.complexityHistory = [];
  }

  initialize(rules = []) {
    const defaultRules = rules.length > 0 ? rules : [
      { type: RuleType.COHESION, strength: PHI_COMPLEMENT },
      { type: RuleType.SEPARATION, strength: PHI_COMPLEMENT * 2 },
      { type: RuleType.ALIGNMENT, strength: PHI_COMPLEMENT },
    ];

    this.agents = Array.from({ length: this.agentCount }, (_, i) => {
      const agent = new SimpleAgent(i);
      for (const rule of defaultRules) {
        agent.addRule(rule.type, rule.strength);
      }
      return agent;
    });

    return { agents: this.agents.length, rules: defaultRules.length };
  }

  step() {
    this.epoch++;
    for (const agent of this.agents) {
      agent.perceive(this.agents);
    }
    for (const agent of this.agents) {
      agent.act();
    }
    const complexity = this._measureComplexity();
    this.complexityHistory.push(complexity);
    this._detectPatterns(complexity);
    this._updateState(complexity);
    return { epoch: this.epoch, complexity, state: this.state };
  }

  _measureComplexity() {
    const clusters = this._detectClusters();
    const velocityAlignment = this._measureAlignment();
    return {
      clusters: clusters.length,
      alignment: velocityAlignment,
      entropy: this._spatialEntropy(),
      score: clusters.length * PHI_COMPLEMENT + velocityAlignment * PHI_INVERSE,
    };
  }

  _detectClusters() {
    const visited = new Set();
    const clusters = [];
    const threshold = PHI * 5;

    for (const agent of this.agents) {
      if (visited.has(agent.id)) continue;
      const cluster = [agent];
      visited.add(agent.id);
      const queue = [agent];

      while (queue.length > 0) {
        const current = queue.shift();
        for (const other of this.agents) {
          if (visited.has(other.id)) continue;
          const dx = current.position.x - other.position.x;
          const dy = current.position.y - other.position.y;
          if (Math.sqrt(dx * dx + dy * dy) < threshold) {
            cluster.push(other);
            visited.add(other.id);
            queue.push(other);
          }
        }
      }
      if (cluster.length > 1) clusters.push(cluster);
    }
    return clusters;
  }

  _measureAlignment() {
    if (this.agents.length < 2) return 0;
    let totalAlignment = 0;
    for (const agent of this.agents) {
      const speed = Math.sqrt(agent.velocity.x ** 2 + agent.velocity.y ** 2) || 1;
      totalAlignment += Math.abs(agent.velocity.x / speed);
    }
    return totalAlignment / this.agents.length;
  }

  _spatialEntropy() {
    const gridSize = 10;
    const grid = new Array(gridSize * gridSize).fill(0);
    for (const agent of this.agents) {
      const gx = Math.min(Math.floor(agent.position.x / 10), gridSize - 1);
      const gy = Math.min(Math.floor(agent.position.y / 10), gridSize - 1);
      if (gx >= 0 && gy >= 0) grid[gy * gridSize + gx]++;
    }
    let entropy = 0;
    for (const count of grid) {
      if (count > 0) {
        const p = count / this.agents.length;
        entropy -= p * Math.log2(p);
      }
    }
    return entropy;
  }

  _detectPatterns(complexity) {
    if (complexity.clusters > 2 && complexity.alignment > PHI_INVERSE) {
      this.patterns.push({ type: 'flock', epoch: this.epoch, complexity });
    }
  }

  _updateState(complexity) {
    if (complexity.score < 0.2) this.state = EmergenceState.CHAOTIC;
    else if (complexity.score < 0.4) this.state = EmergenceState.NUCLEATING;
    else if (complexity.score < 0.6) this.state = EmergenceState.FORMING;
    else if (complexity.score < 0.8) this.state = EmergenceState.EMERGING;
    else if (complexity.score < 1.0) this.state = EmergenceState.STABLE_PATTERN;
    else if (complexity.score < PHI) this.state = EmergenceState.COMPLEXIFYING;
    else this.state = EmergenceState.META_EMERGENT;
  }

  getEmergenceReport() {
    return {
      state: this.state,
      epoch: this.epoch,
      agents: this.agents.length,
      patterns: this.patterns.length,
      latestComplexity: this.complexityHistory[this.complexityHistory.length - 1] || null,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  EmergentBehaviorEngine,
  SimpleAgent,
  EmergenceState,
  RuleType,
};

export default {
  PROTOCOL_ID: 'PROTO-EBS-001',
  PROTOCOL_NAME: 'Emergent Behavior Synthesis Protocol',
  DOCTRINE: 'Ex simplicibus complexa surgunt. Ordo ex interactione. Totum plus partibus.',
  DOCTRINE_EN: 'Complex things arise from simple ones. Order from interaction. The whole exceeds.',

  EmergenceState,
  RuleType,
  SimpleAgent,
  EmergentBehaviorEngine,
};
