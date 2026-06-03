/**
 * PROTO-231: QUANTUM COHERENCE PROTOCOL — PRODUCTION GRADE
 * 
 * Commercial-grade quantum state management for intelligence systems.
 * Enterprise-ready with full observability, fault tolerance, and scaling.
 * 
 * @module @medina/production-intelligence-sdk/protocols/quantum-coherence
 * @copyright Medina Intelligence Systems — All Rights Reserved
 * @license PROPRIETARY — Commercial Use License Required
 * @version 2.0.0
 */

import { PHI, PHI_INVERSE, TWO_PI, QUANTUM_CONSTANTS } from '../core/phi-constants.js';

// ════════════════════════════════════════════════════════════════════════════════
// PROTOCOL METADATA
// ════════════════════════════════════════════════════════════════════════════════

export const PROTOCOL_ID = 'PROTO-231';
export const PROTOCOL_NAME = 'Quantum Coherence Protocol';
export const PROTOCOL_VERSION = '2.0.0';
export const PROTOCOL_TIER = 'ENTERPRISE';

// ════════════════════════════════════════════════════════════════════════════════
// QUANTUM STATE CLASS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Represents a quantum state with amplitude and phase
 */
export class QuantumState {
  /**
   * @param {number} dimensions - Number of dimensions
   * @param {Object} options - Configuration options
   */
  constructor(dimensions = QUANTUM_CONSTANTS.DEFAULT_DIMENSIONS, options = {}) {
    this.dimensions = dimensions;
    this.amplitudes = new Float64Array(dimensions);
    this.phases = new Float64Array(dimensions);
    this.coherenceTime = options.coherenceTime || QUANTUM_CONSTANTS.DEFAULT_COHERENCE_TIME;
    this.createdAt = Date.now();
    this.lastMeasurement = null;
    this.entanglements = new Map();
    this.metadata = options.metadata || {};
    
    // Initialize to ground state
    this.amplitudes[0] = 1.0;
  }

  /**
   * Get the probability of measuring each basis state
   * @returns {Float64Array} Probabilities
   */
  getProbabilities() {
    const probs = new Float64Array(this.dimensions);
    for (let i = 0; i < this.dimensions; i++) {
      probs[i] = this.amplitudes[i] * this.amplitudes[i];
    }
    return probs;
  }

  /**
   * Calculate state fidelity with another state
   * @param {QuantumState} other - Other state to compare
   * @returns {number} Fidelity [0, 1]
   */
  fidelity(other) {
    if (this.dimensions !== other.dimensions) {
      throw new Error('Dimension mismatch in fidelity calculation');
    }
    
    let overlap = 0;
    for (let i = 0; i < this.dimensions; i++) {
      const phaseDiff = this.phases[i] - other.phases[i];
      overlap += this.amplitudes[i] * other.amplitudes[i] * Math.cos(phaseDiff);
    }
    return overlap * overlap;
  }

  /**
   * Check if state is still coherent
   * @returns {boolean} True if coherent
   */
  isCoherent() {
    return (Date.now() - this.createdAt) < this.coherenceTime;
  }

  /**
   * Get remaining coherence time
   * @returns {number} Milliseconds remaining
   */
  remainingCoherence() {
    return Math.max(0, this.coherenceTime - (Date.now() - this.createdAt));
  }

  /**
   * Normalize the state
   */
  normalize() {
    let norm = 0;
    for (let i = 0; i < this.dimensions; i++) {
      norm += this.amplitudes[i] * this.amplitudes[i];
    }
    norm = Math.sqrt(norm);
    
    if (norm > QUANTUM_CONSTANTS.MIN_AMPLITUDE) {
      for (let i = 0; i < this.dimensions; i++) {
        this.amplitudes[i] /= norm;
      }
    }
  }

  /**
   * Apply a phase rotation
   * @param {number} index - Basis state index
   * @param {number} angle - Rotation angle in radians
   */
  applyPhase(index, angle) {
    if (index >= 0 && index < this.dimensions) {
      this.phases[index] = (this.phases[index] + angle) % TWO_PI;
    }
  }

  /**
   * Clone this state
   * @returns {QuantumState} Cloned state
   */
  clone() {
    const cloned = new QuantumState(this.dimensions, {
      coherenceTime: this.coherenceTime,
      metadata: { ...this.metadata }
    });
    cloned.amplitudes.set(this.amplitudes);
    cloned.phases.set(this.phases);
    return cloned;
  }

  /**
   * Serialize state for transmission
   * @returns {Object} Serialized state
   */
  serialize() {
    return {
      dimensions: this.dimensions,
      amplitudes: Array.from(this.amplitudes),
      phases: Array.from(this.phases),
      coherenceTime: this.coherenceTime,
      createdAt: this.createdAt,
      metadata: this.metadata
    };
  }

  /**
   * Deserialize from transmission format
   * @param {Object} data - Serialized data
   * @returns {QuantumState} Restored state
   */
  static deserialize(data) {
    const state = new QuantumState(data.dimensions, {
      coherenceTime: data.coherenceTime,
      metadata: data.metadata
    });
    state.amplitudes.set(data.amplitudes);
    state.phases.set(data.phases);
    state.createdAt = data.createdAt;
    return state;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// QUANTUM GATE OPERATIONS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Collection of quantum gate operations
 */
export const QuantumGates = {
  /**
   * Hadamard gate - creates superposition
   * @param {QuantumState} state - Input state
   * @param {number} target - Target qubit index
   * @returns {QuantumState} Transformed state
   */
  hadamard(state, target) {
    const result = state.clone();
    const sqrt2inv = 1 / Math.sqrt(2);
    
    // Apply H gate transformation
    const stride = 1 << target;
    for (let i = 0; i < state.dimensions; i += stride * 2) {
      for (let j = 0; j < stride && i + j + stride < state.dimensions; j++) {
        const a = result.amplitudes[i + j];
        const b = result.amplitudes[i + j + stride];
        result.amplitudes[i + j] = sqrt2inv * (a + b);
        result.amplitudes[i + j + stride] = sqrt2inv * (a - b);
      }
    }
    
    result.normalize();
    return result;
  },

  /**
   * Phase gate
   * @param {QuantumState} state - Input state
   * @param {number} target - Target qubit index
   * @param {number} angle - Phase angle
   * @returns {QuantumState} Transformed state
   */
  phase(state, target, angle) {
    const result = state.clone();
    const stride = 1 << target;
    
    for (let i = 0; i < state.dimensions; i++) {
      if ((i & stride) !== 0) {
        result.applyPhase(i, angle);
      }
    }
    
    return result;
  },

  /**
   * PHI gate - golden ratio rotation
   * @param {QuantumState} state - Input state
   * @param {number} target - Target qubit index
   * @returns {QuantumState} Transformed state
   */
  phiGate(state, target) {
    return QuantumGates.phase(state, target, TWO_PI * PHI_INVERSE);
  },

  /**
   * Controlled-NOT gate
   * @param {QuantumState} state - Input state
   * @param {number} control - Control qubit index
   * @param {number} target - Target qubit index
   * @returns {QuantumState} Transformed state
   */
  cnot(state, control, target) {
    const result = state.clone();
    const controlMask = 1 << control;
    const targetMask = 1 << target;
    
    for (let i = 0; i < state.dimensions; i++) {
      if ((i & controlMask) !== 0) {
        const j = i ^ targetMask;
        if (j < state.dimensions) {
          const temp = result.amplitudes[i];
          result.amplitudes[i] = result.amplitudes[j];
          result.amplitudes[j] = temp;
          
          const tempPhase = result.phases[i];
          result.phases[i] = result.phases[j];
          result.phases[j] = tempPhase;
        }
      }
    }
    
    return result;
  },

  /**
   * Rotation around X axis
   * @param {QuantumState} state - Input state
   * @param {number} target - Target qubit index
   * @param {number} angle - Rotation angle
   * @returns {QuantumState} Transformed state
   */
  rotateX(state, target, angle) {
    const result = state.clone();
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    const stride = 1 << target;
    
    for (let i = 0; i < state.dimensions; i += stride * 2) {
      for (let j = 0; j < stride && i + j + stride < state.dimensions; j++) {
        const a = result.amplitudes[i + j];
        const b = result.amplitudes[i + j + stride];
        result.amplitudes[i + j] = cos * a - sin * b;
        result.amplitudes[i + j + stride] = sin * a + cos * b;
      }
    }
    
    result.normalize();
    return result;
  },

  /**
   * Rotation around Y axis
   * @param {QuantumState} state - Input state
   * @param {number} target - Target qubit index
   * @param {number} angle - Rotation angle
   * @returns {QuantumState} Transformed state
   */
  rotateY(state, target, angle) {
    const result = state.clone();
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    const stride = 1 << target;
    
    for (let i = 0; i < state.dimensions; i += stride * 2) {
      for (let j = 0; j < stride && i + j + stride < state.dimensions; j++) {
        const a = result.amplitudes[i + j];
        const b = result.amplitudes[i + j + stride];
        result.amplitudes[i + j] = cos * a - sin * b;
        result.amplitudes[i + j + stride] = sin * a + cos * b;
      }
    }
    
    result.normalize();
    return result;
  },

  /**
   * Rotation around Z axis
   * @param {QuantumState} state - Input state
   * @param {number} target - Target qubit index
   * @param {number} angle - Rotation angle
   * @returns {QuantumState} Transformed state
   */
  rotateZ(state, target, angle) {
    return QuantumGates.phase(state, target, angle);
  }
};

// ════════════════════════════════════════════════════════════════════════════════
// QUANTUM COHERENCE PROTOCOL ENGINE
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Production-grade Quantum Coherence Protocol implementation
 */
export class QuantumCoherenceProtocol {
  /**
   * @param {Object} config - Protocol configuration
   */
  constructor(config = {}) {
    this.protocolId = PROTOCOL_ID;
    this.version = PROTOCOL_VERSION;
    
    // Configuration
    this.config = {
      defaultDimensions: config.defaultDimensions || QUANTUM_CONSTANTS.DEFAULT_DIMENSIONS,
      coherenceTime: config.coherenceTime || QUANTUM_CONSTANTS.DEFAULT_COHERENCE_TIME,
      maxStates: config.maxStates || 1000,
      enableTelemetry: config.enableTelemetry !== false,
      decoherenceModel: config.decoherenceModel || 'exponential',
      errorCorrection: config.errorCorrection !== false,
      ...config
    };

    // State management
    this.states = new Map();
    this.entanglementGraph = new Map();
    this.measurementHistory = [];
    
    // Telemetry
    this.telemetry = {
      statesCreated: 0,
      statesMeasured: 0,
      gatesApplied: 0,
      entanglementsCreated: 0,
      coherenceLosses: 0,
      errorsCorrected: 0
    };

    // Initialize timestamp
    this.startedAt = Date.now();
  }

  /**
   * Create a new quantum state
   * @param {string} id - State identifier
   * @param {Object} options - State options
   * @returns {QuantumState} Created state
   */
  createState(id, options = {}) {
    if (this.states.size >= this.config.maxStates) {
      this._pruneDecoherentStates();
    }

    const state = new QuantumState(
      options.dimensions || this.config.defaultDimensions,
      {
        coherenceTime: options.coherenceTime || this.config.coherenceTime,
        metadata: { id, ...options.metadata }
      }
    );

    this.states.set(id, state);
    this.telemetry.statesCreated++;

    return state;
  }

  /**
   * Get a state by ID
   * @param {string} id - State identifier
   * @returns {QuantumState|null} State or null
   */
  getState(id) {
    const state = this.states.get(id);
    if (state && !state.isCoherent()) {
      this.telemetry.coherenceLosses++;
      if (this.config.errorCorrection) {
        this._attemptErrorCorrection(state);
      }
    }
    return state || null;
  }

  /**
   * Apply a gate to a state
   * @param {string} stateId - State identifier
   * @param {string} gateName - Gate name
   * @param {Object} params - Gate parameters
   * @returns {QuantumState|null} Transformed state
   */
  applyGate(stateId, gateName, params = {}) {
    const state = this.getState(stateId);
    if (!state) return null;

    const gate = QuantumGates[gateName];
    if (!gate) {
      throw new Error(`Unknown gate: ${gateName}`);
    }

    const target = params.target || 0;
    let newState;

    if (gateName === 'cnot') {
      newState = gate(state, params.control || 0, target);
    } else if (['phase', 'rotateX', 'rotateY', 'rotateZ'].includes(gateName)) {
      newState = gate(state, target, params.angle || 0);
    } else {
      newState = gate(state, target);
    }

    this.states.set(stateId, newState);
    this.telemetry.gatesApplied++;

    return newState;
  }

  /**
   * Measure a quantum state
   * @param {string} stateId - State identifier
   * @returns {Object} Measurement result
   */
  measure(stateId) {
    const state = this.getState(stateId);
    if (!state) return null;

    const probs = state.getProbabilities();
    
    // Perform measurement (collapse)
    let r = Math.random();
    let outcome = 0;
    
    for (let i = 0; i < probs.length; i++) {
      r -= probs[i];
      if (r <= 0) {
        outcome = i;
        break;
      }
    }

    // Collapse state
    state.amplitudes.fill(0);
    state.amplitudes[outcome] = 1;
    state.phases.fill(0);
    state.lastMeasurement = {
      outcome,
      timestamp: Date.now(),
      probabilities: Array.from(probs)
    };

    this.measurementHistory.push({
      stateId,
      outcome,
      timestamp: Date.now()
    });

    this.telemetry.statesMeasured++;

    return {
      outcome,
      probability: probs[outcome],
      state: state.serialize()
    };
  }

  /**
   * Create entanglement between two states
   * @param {string} stateId1 - First state ID
   * @param {string} stateId2 - Second state ID
   * @param {number} strength - Entanglement strength [0, 1]
   * @returns {boolean} Success
   */
  entangle(stateId1, stateId2, strength = QUANTUM_CONSTANTS.DEFAULT_ENTANGLEMENT) {
    const state1 = this.getState(stateId1);
    const state2 = this.getState(stateId2);
    
    if (!state1 || !state2) return false;

    // Record entanglement
    state1.entanglements.set(stateId2, strength);
    state2.entanglements.set(stateId1, strength);

    // Update graph
    if (!this.entanglementGraph.has(stateId1)) {
      this.entanglementGraph.set(stateId1, new Set());
    }
    if (!this.entanglementGraph.has(stateId2)) {
      this.entanglementGraph.set(stateId2, new Set());
    }
    this.entanglementGraph.get(stateId1).add(stateId2);
    this.entanglementGraph.get(stateId2).add(stateId1);

    this.telemetry.entanglementsCreated++;

    return true;
  }

  /**
   * Compute coherence score for the entire system
   * @returns {number} System coherence [0, 1]
   */
  getSystemCoherence() {
    if (this.states.size === 0) return 1;

    let totalCoherence = 0;
    let count = 0;

    for (const state of this.states.values()) {
      const remaining = state.remainingCoherence();
      const coherence = remaining / state.coherenceTime;
      totalCoherence += coherence;
      count++;
    }

    return totalCoherence / count;
  }

  /**
   * Get protocol status and telemetry
   * @returns {Object} Status object
   */
  getStatus() {
    return {
      protocolId: this.protocolId,
      version: this.version,
      tier: PROTOCOL_TIER,
      uptime: Date.now() - this.startedAt,
      activeStates: this.states.size,
      entanglements: this.entanglementGraph.size,
      systemCoherence: this.getSystemCoherence(),
      telemetry: { ...this.telemetry },
      config: { ...this.config }
    };
  }

  /**
   * Export all states for persistence
   * @returns {Object} Exportable state
   */
  export() {
    const states = {};
    for (const [id, state] of this.states) {
      states[id] = state.serialize();
    }

    return {
      protocolId: this.protocolId,
      version: this.version,
      exportedAt: Date.now(),
      states,
      entanglementGraph: Object.fromEntries(
        Array.from(this.entanglementGraph.entries())
          .map(([k, v]) => [k, Array.from(v)])
      ),
      telemetry: this.telemetry
    };
  }

  /**
   * Import states from persistence
   * @param {Object} data - Exported data
   */
  import(data) {
    if (data.version !== this.version) {
      console.warn(`Version mismatch: ${data.version} vs ${this.version}`);
    }

    for (const [id, stateData] of Object.entries(data.states)) {
      this.states.set(id, QuantumState.deserialize(stateData));
    }

    if (data.entanglementGraph) {
      for (const [k, v] of Object.entries(data.entanglementGraph)) {
        this.entanglementGraph.set(k, new Set(v));
      }
    }
  }

  /**
   * Reset the protocol
   */
  reset() {
    this.states.clear();
    this.entanglementGraph.clear();
    this.measurementHistory = [];
    this.telemetry = {
      statesCreated: 0,
      statesMeasured: 0,
      gatesApplied: 0,
      entanglementsCreated: 0,
      coherenceLosses: 0,
      errorsCorrected: 0
    };
    this.startedAt = Date.now();
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Remove decoherent states
   * @private
   */
  _pruneDecoherentStates() {
    const toRemove = [];
    for (const [id, state] of this.states) {
      if (!state.isCoherent()) {
        toRemove.push(id);
      }
    }
    for (const id of toRemove) {
      this.states.delete(id);
      this.entanglementGraph.delete(id);
    }
  }

  /**
   * Attempt error correction on a state
   * @param {QuantumState} state - State to correct
   * @private
   */
  _attemptErrorCorrection(state) {
    // Simple error correction: renormalize and extend coherence
    state.normalize();
    state.createdAt = Date.now();
    this.telemetry.errorsCorrected++;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ════════════════════════════════════════════════════════════════════════════════

export default {
  PROTOCOL_ID,
  PROTOCOL_NAME,
  PROTOCOL_VERSION,
  PROTOCOL_TIER,
  QuantumState,
  QuantumGates,
  QuantumCoherenceProtocol
};
