/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  GRAVITATIONAL STATE BINDING PROTOCOL — MASS-PROPORTIONAL STATE COHERENCE             ║
 * ║  "Gravitas Cohaerens — Binding Intelligence Through Gravitational Attraction"         ║
 * ║                                                                                        ║
 * ║  "Massa trahit massam. Intellectus ligat intellectum. Gravitas regnat."               ║
 * ║  (Mass attracts mass. Intelligence binds intelligence. Gravity rules.)                ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// BINDING STATES
// ════════════════════════════════════════════════════════════════════════════════

const BindingState = {
  UNBOUND: 'UNBOUND',
  ATTRACTING: 'ATTRACTING',
  ORBITING: 'ORBITING',
  BOUND: 'BOUND',
  LOCKED: 'LOCKED',
  DECAYING: 'DECAYING',
  COLLAPSED: 'COLLAPSED',
};

const GravityWell = {
  SOVEREIGN: PHI * PHI,
  PRIMARY: PHI,
  SECONDARY: 1.0,
  TERTIARY: PHI_INVERSE,
  PERIPHERAL: PHI_COMPLEMENT,
};

// ════════════════════════════════════════════════════════════════════════════════
// STATE MASS CALCULATOR
// ════════════════════════════════════════════════════════════════════════════════

class StateMassCalculator {
  constructor() {
    this.massRegistry = new Map();
    this.gravitationalConstant = PHI_INVERSE;
  }

  registerState(stateId, data) {
    const mass = this._computeMass(data);
    this.massRegistry.set(stateId, {
      id: stateId,
      mass,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      boundTo: [],
      createdAt: Date.now(),
    });
    return mass;
  }

  _computeMass(data) {
    const serialized = JSON.stringify(data);
    const entropy = this._shannonEntropy(serialized);
    const complexity = serialized.length * PHI_COMPLEMENT;
    return (entropy * complexity) / PHI;
  }

  _shannonEntropy(str) {
    const freq = {};
    for (const ch of str) {
      freq[ch] = (freq[ch] || 0) + 1;
    }
    const len = str.length;
    let entropy = 0;
    for (const count of Object.values(freq)) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }
    return entropy;
  }

  getGravitationalForce(stateA, stateB) {
    const a = this.massRegistry.get(stateA);
    const b = this.massRegistry.get(stateB);
    if (!a || !b) return 0;
    const distance = this._distance(a.position, b.position) || 1;
    return (this.gravitationalConstant * a.mass * b.mass) / (distance * distance);
  }

  _distance(p1, p2) {
    return Math.sqrt(
      (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2 + (p2.z - p1.z) ** 2
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// GRAVITATIONAL BINDING ENGINE
// ════════════════════════════════════════════════════════════════════════════════

class GravitationalBindingEngine {
  constructor(config = {}) {
    this.bindingThreshold = config.bindingThreshold || PHI_INVERSE;
    this.decayRate = config.decayRate || PHI_COMPLEMENT * 0.01;
    this.maxOrbitalDistance = config.maxOrbitalDistance || PHI * 100;
    this.calculator = new StateMassCalculator();
    this.bindings = new Map();
    this.wells = [];
    this.epoch = 0;
  }

  createGravityWell(wellId, strength = GravityWell.PRIMARY) {
    const well = {
      id: wellId,
      strength,
      capturedStates: [],
      createdAt: Date.now(),
      stability: 1.0,
    };
    this.wells.push(well);
    return well;
  }

  ingestState(stateId, data) {
    const mass = this.calculator.registerState(stateId, data);
    this._evaluateBindings(stateId);
    return { stateId, mass, bindings: this.bindings.get(stateId) || [] };
  }

  _evaluateBindings(stateId) {
    const candidates = [];
    for (const well of this.wells) {
      const force = this._wellAttraction(stateId, well);
      if (force > this.bindingThreshold) {
        candidates.push({ well, force });
      }
    }
    candidates.sort((a, b) => b.force - a.force);
    if (candidates.length > 0) {
      const strongest = candidates[0];
      this._bind(stateId, strongest.well);
    }
  }

  _wellAttraction(stateId, well) {
    const state = this.calculator.massRegistry.get(stateId);
    if (!state) return 0;
    return (state.mass * well.strength * PHI_INVERSE) / (this.epoch + 1);
  }

  _bind(stateId, well) {
    well.capturedStates.push(stateId);
    if (!this.bindings.has(stateId)) {
      this.bindings.set(stateId, []);
    }
    this.bindings.get(stateId).push(well.id);
  }

  tick() {
    this.epoch++;
    for (const well of this.wells) {
      well.stability *= (1 - this.decayRate);
      if (well.stability < PHI_COMPLEMENT) {
        well.capturedStates = well.capturedStates.filter(() => Math.random() > this.decayRate);
      }
    }
    return { epoch: this.epoch, activeWells: this.wells.length };
  }

  getBindingMap() {
    const map = {};
    for (const [stateId, wellIds] of this.bindings) {
      map[stateId] = {
        boundTo: wellIds,
        mass: this.calculator.massRegistry.get(stateId)?.mass || 0,
        state: wellIds.length > 0 ? BindingState.BOUND : BindingState.UNBOUND,
      };
    }
    return map;
  }

  dissolveWell(wellId) {
    const idx = this.wells.findIndex(w => w.id === wellId);
    if (idx === -1) return false;
    const well = this.wells[idx];
    for (const stateId of well.capturedStates) {
      const bindings = this.bindings.get(stateId) || [];
      this.bindings.set(stateId, bindings.filter(id => id !== wellId));
    }
    this.wells.splice(idx, 1);
    return true;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  GravitationalBindingEngine,
  StateMassCalculator,
  BindingState,
  GravityWell,
};

export default {
  PROTOCOL_ID: 'PROTO-GSB-001',
  PROTOCOL_NAME: 'Gravitational State Binding Protocol',
  DOCTRINE: 'Massa trahit massam. Intellectus ligat intellectum. Gravitas regnat.',
  DOCTRINE_EN: 'Mass attracts mass. Intelligence binds intelligence. Gravity rules.',

  BindingState,
  GravityWell,
  StateMassCalculator,
  GravitationalBindingEngine,
};
