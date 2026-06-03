/**
 * @medina/backend-intelligence-engines — QuantumCoherenceProtocol
 *
 * PROTO-231: Quantum Coherence Protocol
 * Models quantum-inspired coherence in cognitive systems using
 * superposition states, entanglement, and decoherence dynamics.
 *
 * Brain analog: Quantum effects in microtubules (Penrose-Hameroff theory)
 *
 * @module @medina/backend-intelligence-engines/quantum-coherence-protocol
 */

// ════════════════════════════════════════════════════════════════════════════
// PHI-ENCODED CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const PHI_INVERSE = 1 / PHI;
const PHI_SQUARED = PHI * PHI;
const TWO_PI = 2 * Math.PI;
const PLANCK_COGNITIVE = 0.01; // Cognitive "Planck constant" for discretization

// ════════════════════════════════════════════════════════════════════════════
// QUANTUM STATE REPRESENTATION
// ════════════════════════════════════════════════════════════════════════════

/**
 * Complex number representation for quantum amplitudes
 */
class Complex {
  constructor(real = 0, imag = 0) {
    this.real = real;
    this.imag = imag;
  }

  static fromPolar(magnitude, phase) {
    return new Complex(
      magnitude * Math.cos(phase),
      magnitude * Math.sin(phase)
    );
  }

  magnitude() {
    return Math.sqrt(this.real ** 2 + this.imag ** 2);
  }

  phase() {
    return Math.atan2(this.imag, this.real);
  }

  conjugate() {
    return new Complex(this.real, -this.imag);
  }

  multiply(other) {
    return new Complex(
      this.real * other.real - this.imag * other.imag,
      this.real * other.imag + this.imag * other.real
    );
  }

  add(other) {
    return new Complex(this.real + other.real, this.imag + other.imag);
  }

  scale(factor) {
    return new Complex(this.real * factor, this.imag * factor);
  }

  probability() {
    return this.magnitude() ** 2;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// QUANTUM COGNITIVE STATE
// ════════════════════════════════════════════════════════════════════════════

/**
 * QuantumCognitiveState represents a superposition of cognitive states
 * Each basis state corresponds to a distinct thought or concept
 */
class QuantumCognitiveState {
  constructor(dimensions = 8) {
    this.dimensions = dimensions;
    this.amplitudes = Array.from({ length: dimensions }, () => new Complex(0, 0));
    // Initialize to ground state |0⟩
    this.amplitudes[0] = new Complex(1, 0);
    this.coherenceTime = 1000; // ms before decoherence
    this.lastMeasurement = Date.now();
    this.entanglements = new Map();
  }

  /**
   * Apply Hadamard-like gate to create superposition
   * @param {number} qubitIndex - Index of the cognitive qubit
   */
  applySuperposition(qubitIndex) {
    if (qubitIndex >= this.dimensions) return;
    
    const sqrt2Inv = 1 / Math.sqrt(2);
    const newAmplitudes = [...this.amplitudes];
    
    // Create superposition between |0⟩ and |qubitIndex⟩
    const a0 = this.amplitudes[0];
    const aQ = this.amplitudes[qubitIndex];
    
    newAmplitudes[0] = a0.scale(sqrt2Inv).add(aQ.scale(sqrt2Inv));
    newAmplitudes[qubitIndex] = a0.scale(sqrt2Inv).add(aQ.scale(-sqrt2Inv));
    
    this.amplitudes = newAmplitudes;
    this._normalize();
  }

  /**
   * Apply phase rotation (cognitive phase shift)
   * @param {number} index - State index
   * @param {number} phase - Phase angle in radians
   */
  applyPhaseRotation(index, phase) {
    if (index >= this.dimensions) return;
    
    const rotation = Complex.fromPolar(1, phase);
    this.amplitudes[index] = this.amplitudes[index].multiply(rotation);
  }

  /**
   * Create entanglement between two cognitive states
   * @param {QuantumCognitiveState} other - Other quantum state
   * @param {number} strength - Entanglement strength [0,1]
   */
  entangle(other, strength = PHI_INVERSE) {
    const entanglementId = `ent_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    this.entanglements.set(entanglementId, {
      partner: other,
      strength,
      createdAt: Date.now()
    });
    
    other.entanglements.set(entanglementId, {
      partner: this,
      strength,
      createdAt: Date.now()
    });

    // Apply entanglement effect: correlate phases
    for (let i = 0; i < Math.min(this.dimensions, other.dimensions); i++) {
      const avgPhase = (this.amplitudes[i].phase() + other.amplitudes[i].phase()) / 2;
      const phiPhase = avgPhase * PHI;
      
      this.applyPhaseRotation(i, (phiPhase - this.amplitudes[i].phase()) * strength);
      other.applyPhaseRotation(i, (phiPhase - other.amplitudes[i].phase()) * strength);
    }

    return entanglementId;
  }

  /**
   * Measure the quantum state (collapse superposition)
   * @returns {Object} Measurement result with state index and probability
   */
  measure() {
    // Apply decoherence based on time since last measurement
    this._applyDecoherence();
    
    // Calculate probabilities
    const probabilities = this.amplitudes.map(a => a.probability());
    const totalProb = probabilities.reduce((sum, p) => sum + p, 0);
    
    // Normalize probabilities
    const normalizedProbs = probabilities.map(p => p / totalProb);
    
    // Sample from distribution
    const random = Math.random();
    let cumulative = 0;
    let measuredState = 0;
    
    for (let i = 0; i < normalizedProbs.length; i++) {
      cumulative += normalizedProbs[i];
      if (random < cumulative) {
        measuredState = i;
        break;
      }
    }

    // Collapse to measured state
    this.amplitudes = this.amplitudes.map((_, i) => 
      i === measuredState ? new Complex(1, 0) : new Complex(0, 0)
    );

    // Propagate collapse to entangled states
    this._propagateCollapse(measuredState);

    this.lastMeasurement = Date.now();

    return {
      state: measuredState,
      probability: normalizedProbs[measuredState],
      coherenceRemaining: this._getCoherenceLevel(),
      entanglementCount: this.entanglements.size
    };
  }

  /**
   * Get the current superposition state without collapsing
   * @returns {Object} State information
   */
  inspect() {
    const probabilities = this.amplitudes.map(a => a.probability());
    const phases = this.amplitudes.map(a => a.phase());
    const totalProb = probabilities.reduce((sum, p) => sum + p, 0);
    
    return {
      probabilities: probabilities.map(p => p / totalProb),
      phases,
      coherenceLevel: this._getCoherenceLevel(),
      entanglements: Array.from(this.entanglements.keys()),
      entropy: this._calculateEntropy(probabilities.map(p => p / totalProb))
    };
  }

  _normalize() {
    const totalProb = this.amplitudes.reduce((sum, a) => sum + a.probability(), 0);
    if (totalProb > 0) {
      const normFactor = 1 / Math.sqrt(totalProb);
      this.amplitudes = this.amplitudes.map(a => a.scale(normFactor));
    }
  }

  _applyDecoherence() {
    const elapsed = Date.now() - this.lastMeasurement;
    const decoherenceFactor = Math.exp(-elapsed / this.coherenceTime);
    
    // Decoherence pushes state toward classical mixture
    // Reduce off-diagonal elements (phase coherence)
    for (let i = 0; i < this.dimensions; i++) {
      const currentMag = this.amplitudes[i].magnitude();
      const currentPhase = this.amplitudes[i].phase();
      
      // Phase diffusion
      const phaseDiffusion = (1 - decoherenceFactor) * (Math.random() - 0.5) * TWO_PI * 0.1;
      this.amplitudes[i] = Complex.fromPolar(currentMag, currentPhase + phaseDiffusion);
    }
  }

  _getCoherenceLevel() {
    const elapsed = Date.now() - this.lastMeasurement;
    return Math.exp(-elapsed / this.coherenceTime);
  }

  _propagateCollapse(measuredState) {
    for (const [id, entanglement] of this.entanglements) {
      const partner = entanglement.partner;
      const strength = entanglement.strength;
      
      // Partial collapse of entangled partner
      for (let i = 0; i < partner.dimensions; i++) {
        if (i === measuredState) {
          // Boost probability of correlated state
          const boost = 1 + strength * PHI;
          partner.amplitudes[i] = partner.amplitudes[i].scale(boost);
        } else {
          // Reduce probability of uncorrelated states
          const reduction = 1 - strength * PHI_INVERSE;
          partner.amplitudes[i] = partner.amplitudes[i].scale(reduction);
        }
      }
      partner._normalize();
    }
  }

  _calculateEntropy(probabilities) {
    return -probabilities.reduce((sum, p) => {
      if (p > 0) {
        return sum + p * Math.log2(p);
      }
      return sum;
    }, 0);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// QUANTUM COHERENCE PROTOCOL
// ════════════════════════════════════════════════════════════════════════════

/**
 * QuantumCoherenceProtocol manages quantum-inspired cognitive processing
 * Implements PROTO-231 for the organism substrate
 */
class QuantumCoherenceProtocol {
  constructor(config = {}) {
    this.protocolId = 'PROTO-231';
    this.name = 'Quantum Coherence Protocol';
    this.version = '1.0.0';
    
    this.config = {
      dimensions: config.dimensions || 16,
      coherenceTime: config.coherenceTime || 1000,
      entanglementThreshold: config.entanglementThreshold || PHI_INVERSE,
      maxEntanglements: config.maxEntanglements || 100,
      ...config
    };

    this.states = new Map();
    this.globalPhase = 0;
    this.coherenceMetrics = {
      totalMeasurements: 0,
      averageCoherence: 1,
      entanglementEvents: 0,
      collapseEvents: 0
    };
  }

  /**
   * Create a new quantum cognitive state
   * @param {string} stateId - Unique identifier for the state
   * @returns {QuantumCognitiveState} The created state
   */
  createState(stateId) {
    const state = new QuantumCognitiveState(this.config.dimensions);
    state.coherenceTime = this.config.coherenceTime;
    this.states.set(stateId, state);
    return state;
  }

  /**
   * Get or create a quantum state
   * @param {string} stateId - State identifier
   * @returns {QuantumCognitiveState} The state
   */
  getState(stateId) {
    if (!this.states.has(stateId)) {
      return this.createState(stateId);
    }
    return this.states.get(stateId);
  }

  /**
   * Prepare a superposition of cognitive possibilities
   * @param {string} stateId - State to prepare
   * @param {number[]} indices - Indices to include in superposition
   */
  prepareSuperposition(stateId, indices) {
    const state = this.getState(stateId);
    
    // Reset to ground state
    state.amplitudes = state.amplitudes.map(() => new Complex(0, 0));
    
    // Create equal superposition over specified indices
    const amplitude = 1 / Math.sqrt(indices.length);
    for (const idx of indices) {
      if (idx < state.dimensions) {
        state.amplitudes[idx] = new Complex(amplitude, 0);
      }
    }
  }

  /**
   * Apply cognitive interference between states
   * @param {string} stateId1 - First state
   * @param {string} stateId2 - Second state
   * @returns {Object} Interference pattern
   */
  applyInterference(stateId1, stateId2) {
    const state1 = this.getState(stateId1);
    const state2 = this.getState(stateId2);
    
    const interferencePattern = [];
    
    for (let i = 0; i < Math.min(state1.dimensions, state2.dimensions); i++) {
      // Constructive or destructive interference based on phase difference
      const phaseDiff = state1.amplitudes[i].phase() - state2.amplitudes[i].phase();
      const interference = Math.cos(phaseDiff);
      
      interferencePattern.push({
        index: i,
        phaseDifference: phaseDiff,
        interferenceType: interference > 0 ? 'constructive' : 'destructive',
        magnitude: Math.abs(interference)
      });
    }

    return {
      pattern: interferencePattern,
      dominantType: interferencePattern.filter(p => p.interferenceType === 'constructive').length > 
                    interferencePattern.length / 2 ? 'constructive' : 'destructive',
      averageMagnitude: interferencePattern.reduce((sum, p) => sum + p.magnitude, 0) / interferencePattern.length
    };
  }

  /**
   * Entangle two cognitive states
   * @param {string} stateId1 - First state
   * @param {string} stateId2 - Second state
   * @param {number} strength - Entanglement strength
   * @returns {string} Entanglement ID
   */
  entangleStates(stateId1, stateId2, strength = this.config.entanglementThreshold) {
    const state1 = this.getState(stateId1);
    const state2 = this.getState(stateId2);
    
    const entanglementId = state1.entangle(state2, strength);
    this.coherenceMetrics.entanglementEvents++;
    
    return entanglementId;
  }

  /**
   * Measure a quantum state and collapse superposition
   * @param {string} stateId - State to measure
   * @returns {Object} Measurement result
   */
  measureState(stateId) {
    const state = this.getState(stateId);
    const result = state.measure();
    
    this.coherenceMetrics.totalMeasurements++;
    this.coherenceMetrics.collapseEvents++;
    this.coherenceMetrics.averageCoherence = 
      (this.coherenceMetrics.averageCoherence * (this.coherenceMetrics.totalMeasurements - 1) + 
       result.coherenceRemaining) / this.coherenceMetrics.totalMeasurements;

    return {
      stateId,
      ...result,
      protocolId: this.protocolId
    };
  }

  /**
   * Apply quantum-inspired decision making
   * @param {string} stateId - State for decision
   * @param {Object[]} options - Decision options with weights
   * @returns {Object} Decision result
   */
  quantumDecision(stateId, options) {
    const state = this.getState(stateId);
    
    // Prepare superposition over options
    const indices = options.map((_, i) => i).filter(i => i < state.dimensions);
    this.prepareSuperposition(stateId, indices);
    
    // Apply phase rotations based on option weights
    for (let i = 0; i < options.length && i < state.dimensions; i++) {
      const weight = options[i].weight || 1;
      const phase = Math.log(weight) * PHI; // Phi-scaled phase
      state.applyPhaseRotation(i, phase);
    }

    // Measure to make decision
    const measurement = this.measureState(stateId);
    const selectedOption = options[measurement.state] || options[0];

    return {
      decision: selectedOption,
      confidence: measurement.probability,
      quantumAdvantage: measurement.coherenceRemaining > 0.5,
      alternatives: options.filter((_, i) => i !== measurement.state)
    };
  }

  /**
   * Get protocol metrics
   * @returns {Object} Protocol metrics
   */
  getMetrics() {
    return {
      protocolId: this.protocolId,
      name: this.name,
      version: this.version,
      activeStates: this.states.size,
      ...this.coherenceMetrics,
      config: this.config
    };
  }

  /**
   * Reset the protocol
   */
  reset() {
    this.states.clear();
    this.globalPhase = 0;
    this.coherenceMetrics = {
      totalMeasurements: 0,
      averageCoherence: 1,
      entanglementEvents: 0,
      collapseEvents: 0
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════

export {
  Complex,
  QuantumCognitiveState,
  QuantumCoherenceProtocol,
  PHI,
  PHI_INVERSE,
  PHI_SQUARED,
  TWO_PI,
  PLANCK_COGNITIVE
};
