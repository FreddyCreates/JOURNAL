/**
 * @medina/production-intelligence-sdk — Protocol Unified Engine
 * 
 * UNIFIED INTELLIGENCE ENGINE
 * Commercial-grade integration of PROTO-231, PROTO-232, PROTO-233
 * Quantum Coherence × Temporal Reasoning × Swarm Intelligence
 * 
 * This engine creates a unified intelligence substrate that combines:
 * - Quantum superposition for parallel possibility exploration
 * - Temporal reasoning for causal inference and prediction
 * - Swarm intelligence for distributed optimization and consensus
 * 
 * @module @medina/production-intelligence-sdk/core/protocol-unified-engine
 * @copyright Medina Intelligence Systems — All Rights Reserved
 * @license PROPRIETARY — Commercial Use License Required
 */

import {
  PHI,
  PHI_INVERSE,
  PHI_SQUARED,
  PHI_CUBED,
  TWO_PI,
  TIME_SCALES,
  SWARM_CONSTANTS,
  QUANTUM_CONSTANTS,
  phiScale,
  phiDecay
} from './phi-constants.js';

// ════════════════════════════════════════════════════════════════════════════════
// COMPLEX NUMBER OPERATIONS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Complex number for quantum amplitude representation
 */
export class Complex {
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

  magnitude() { return Math.sqrt(this.real ** 2 + this.imag ** 2); }
  phase() { return Math.atan2(this.imag, this.real); }
  conjugate() { return new Complex(this.real, -this.imag); }
  
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

  probability() { return this.magnitude() ** 2; }
}

// ════════════════════════════════════════════════════════════════════════════════
// QUANTUM COGNITIVE STATE
// ════════════════════════════════════════════════════════════════════════════════

/**
 * QuantumCognitiveState — Superposition of cognitive possibilities
 */
export class QuantumCognitiveState {
  constructor(dimensions = QUANTUM_CONSTANTS.DEFAULT_DIMENSIONS) {
    this.dimensions = dimensions;
    this.amplitudes = Array.from({ length: dimensions }, () => new Complex(0, 0));
    this.amplitudes[0] = new Complex(1, 0);
    this.coherenceTime = QUANTUM_CONSTANTS.DEFAULT_COHERENCE_TIME;
    this.lastMeasurement = Date.now();
    this.entanglements = new Map();
  }

  applySuperposition(indices) {
    if (!Array.isArray(indices)) indices = [indices];
    const amplitude = 1 / Math.sqrt(indices.length + 1);
    
    this.amplitudes = this.amplitudes.map((_, i) => 
      indices.includes(i) || i === 0 ? new Complex(amplitude, 0) : new Complex(0, 0)
    );
  }

  applyPhaseRotation(index, phase) {
    if (index < this.dimensions) {
      const rotation = Complex.fromPolar(1, phase);
      this.amplitudes[index] = this.amplitudes[index].multiply(rotation);
    }
  }

  entangle(other, strength = PHI_INVERSE) {
    const id = `ent_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.entanglements.set(id, { partner: other, strength, createdAt: Date.now() });
    other.entanglements.set(id, { partner: this, strength, createdAt: Date.now() });
    
    for (let i = 0; i < Math.min(this.dimensions, other.dimensions); i++) {
      const avgPhase = (this.amplitudes[i].phase() + other.amplitudes[i].phase()) / 2;
      const phiPhase = avgPhase * PHI;
      this.applyPhaseRotation(i, (phiPhase - this.amplitudes[i].phase()) * strength);
      other.applyPhaseRotation(i, (phiPhase - other.amplitudes[i].phase()) * strength);
    }
    return id;
  }

  measure() {
    this._applyDecoherence();
    const probabilities = this.amplitudes.map(a => a.probability());
    const total = probabilities.reduce((s, p) => s + p, 0);
    const normalized = probabilities.map(p => p / total);
    
    let cumulative = 0;
    const random = Math.random();
    let measured = 0;
    
    for (let i = 0; i < normalized.length; i++) {
      cumulative += normalized[i];
      if (random < cumulative) { measured = i; break; }
    }

    this.amplitudes = this.amplitudes.map((_, i) => 
      i === measured ? new Complex(1, 0) : new Complex(0, 0)
    );
    
    this._propagateCollapse(measured);
    this.lastMeasurement = Date.now();

    return {
      state: measured,
      probability: normalized[measured],
      coherenceRemaining: this._getCoherenceLevel(),
      entanglementCount: this.entanglements.size
    };
  }

  inspect() {
    const probabilities = this.amplitudes.map(a => a.probability());
    const total = probabilities.reduce((s, p) => s + p, 0);
    return {
      probabilities: probabilities.map(p => p / total),
      phases: this.amplitudes.map(a => a.phase()),
      coherenceLevel: this._getCoherenceLevel(),
      entropy: this._calculateEntropy(probabilities.map(p => p / total))
    };
  }

  _normalize() {
    const total = this.amplitudes.reduce((s, a) => s + a.probability(), 0);
    if (total > 0) {
      const factor = 1 / Math.sqrt(total);
      this.amplitudes = this.amplitudes.map(a => a.scale(factor));
    }
  }

  _applyDecoherence() {
    const elapsed = Date.now() - this.lastMeasurement;
    const factor = Math.exp(-elapsed / this.coherenceTime);
    for (let i = 0; i < this.dimensions; i++) {
      const mag = this.amplitudes[i].magnitude();
      const phase = this.amplitudes[i].phase();
      const diffusion = (1 - factor) * (Math.random() - 0.5) * TWO_PI * 0.1;
      this.amplitudes[i] = Complex.fromPolar(mag, phase + diffusion);
    }
  }

  _getCoherenceLevel() {
    return Math.exp(-(Date.now() - this.lastMeasurement) / this.coherenceTime);
  }

  _propagateCollapse(measured) {
    for (const [, ent] of this.entanglements) {
      const partner = ent.partner;
      for (let i = 0; i < partner.dimensions; i++) {
        const factor = i === measured ? 1 + ent.strength * PHI : 1 - ent.strength * PHI_INVERSE;
        partner.amplitudes[i] = partner.amplitudes[i].scale(factor);
      }
      partner._normalize();
    }
  }

  _calculateEntropy(probs) {
    return -probs.reduce((s, p) => p > 0 ? s + p * Math.log2(p) : s, 0);
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// TEMPORAL EVENT SYSTEM
// ════════════════════════════════════════════════════════════════════════════════

/**
 * TemporalEvent — Time-stamped cognitive event with causal links
 */
export class TemporalEvent {
  constructor(data, timestamp = Date.now()) {
    this.id = `evt_${timestamp}_${Math.random().toString(36).slice(2, 8)}`;
    this.data = data;
    this.timestamp = timestamp;
    this.duration = data.duration || 0;
    this.causalLinks = new Set();
    this.effects = new Set();
    this.confidence = data.confidence || 1.0;
    this.salience = data.salience || PHI_INVERSE;
  }

  precedes(other) { return this.timestamp + this.duration <= other.timestamp; }
  overlaps(other) {
    return this.timestamp < other.timestamp + other.duration &&
           other.timestamp < this.timestamp + this.duration;
  }
  temporalDistance(other) { return Math.abs(this.timestamp - other.timestamp); }
  addCausalLink(eventId, strength = PHI_INVERSE) {
    this.causalLinks.add({ eventId, strength, createdAt: Date.now() });
  }
}

/**
 * TemporalMemoryBuffer — Time-ordered event sequence with phi-decay
 */
export class TemporalMemoryBuffer {
  constructor(config = {}) {
    this.maxSize = config.maxSize || 1000;
    this.decayRate = config.decayRate || PHI_INVERSE / 1000;
    this.events = [];
    this.eventIndex = new Map();
  }

  add(event) {
    this.events.push(event);
    this.eventIndex.set(event.id, event);
    while (this.events.length > this.maxSize) {
      const removed = this.events.shift();
      this.eventIndex.delete(removed.id);
    }
    this.events.sort((a, b) => a.timestamp - b.timestamp);
  }

  get(eventId) { return this.eventIndex.get(eventId); }
  
  queryRange(startTime, endTime) {
    return this.events.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
  }

  getRecentWithDecay(count = 10) {
    const now = Date.now();
    return this.events.slice(-count).map(e => ({
      ...e,
      decayedSalience: e.salience * Math.exp(-this.decayRate * (now - e.timestamp))
    }));
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// SWARM PARTICLE SYSTEM
// ════════════════════════════════════════════════════════════════════════════════

/**
 * SwarmParticle — Individual agent in swarm optimization
 */
export class SwarmParticle {
  constructor(dimensions, bounds) {
    this.id = `particle_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    this.dimensions = dimensions;
    this.bounds = bounds;
    
    this.position = Array.from({ length: dimensions }, (_, i) =>
      bounds[i].min + Math.random() * (bounds[i].max - bounds[i].min)
    );
    this.velocity = Array.from({ length: dimensions }, (_, i) =>
      (Math.random() - 0.5) * (bounds[i].max - bounds[i].min) * 0.1
    );
    
    this.personalBest = [...this.position];
    this.personalBestFitness = -Infinity;
    this.fitness = -Infinity;
    this.age = 0;
  }

  update(globalBest, weights = SWARM_CONSTANTS) {
    const r1 = Math.random(), r2 = Math.random();
    
    for (let i = 0; i < this.dimensions; i++) {
      const cognitive = weights.COGNITIVE_WEIGHT * r1 * (this.personalBest[i] - this.position[i]);
      const social = weights.SOCIAL_WEIGHT * r2 * (globalBest[i] - this.position[i]);
      
      this.velocity[i] = weights.INERTIA_WEIGHT * this.velocity[i] + cognitive + social;
      
      const maxVel = (this.bounds[i].max - this.bounds[i].min) * 0.2;
      this.velocity[i] = Math.max(-maxVel, Math.min(maxVel, this.velocity[i]));
      
      this.position[i] += this.velocity[i];
      
      if (this.position[i] < this.bounds[i].min) {
        this.position[i] = this.bounds[i].min;
        this.velocity[i] *= -0.5;
      } else if (this.position[i] > this.bounds[i].max) {
        this.position[i] = this.bounds[i].max;
        this.velocity[i] *= -0.5;
      }
    }
    this.age++;
  }

  evaluate(fitnessFunction) {
    this.fitness = fitnessFunction(this.position);
    if (this.fitness > this.personalBestFitness) {
      this.personalBest = [...this.position];
      this.personalBestFitness = this.fitness;
    }
  }
}

/**
 * PheromoneTrailSystem — ACO pheromone management
 */
export class PheromoneTrailSystem {
  constructor(nodes, config = {}) {
    this.nodeCount = nodes;
    this.decayRate = config.decayRate || SWARM_CONSTANTS.PHEROMONE_DECAY;
    this.minPheromone = config.minPheromone || 0.01;
    this.maxPheromone = config.maxPheromone || 10;
    
    this.trails = Array.from({ length: nodes }, () =>
      Array.from({ length: nodes }, () => 1.0)
    );
  }

  deposit(from, to, amount) {
    if (from < this.nodeCount && to < this.nodeCount) {
      this.trails[from][to] = Math.min(
        this.maxPheromone,
        this.trails[from][to] + amount
      );
    }
  }

  evaporate() {
    for (let i = 0; i < this.nodeCount; i++) {
      for (let j = 0; j < this.nodeCount; j++) {
        this.trails[i][j] = Math.max(
          this.minPheromone,
          this.trails[i][j] * (1 - this.decayRate)
        );
      }
    }
  }

  getPheromone(from, to) {
    return this.trails[from]?.[to] || 0;
  }

  getTransitionProbabilities(from, heuristics = null) {
    const pheromones = this.trails[from];
    const alpha = PHI;
    const beta = PHI_INVERSE;
    
    let probabilities = pheromones.map((p, i) => {
      const h = heuristics ? heuristics[i] : 1;
      return Math.pow(p, alpha) * Math.pow(h, beta);
    });
    
    const total = probabilities.reduce((s, p) => s + p, 0);
    return total > 0 ? probabilities.map(p => p / total) : probabilities.map(() => 1 / this.nodeCount);
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// UNIFIED PROTOCOL ENGINE
// ════════════════════════════════════════════════════════════════════════════════

/**
 * ProtocolUnifiedEngine — Commercial-grade unified intelligence engine
 * Integrates PROTO-231 (Quantum), PROTO-232 (Temporal), PROTO-233 (Swarm)
 */
export class ProtocolUnifiedEngine {
  constructor(config = {}) {
    this.engineId = `unified_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.version = '1.0.0';
    this.config = {
      quantumDimensions: config.quantumDimensions || QUANTUM_CONSTANTS.DEFAULT_DIMENSIONS,
      swarmSize: config.swarmSize || 50,
      temporalBufferSize: config.temporalBufferSize || 1000,
      enableQuantum: config.enableQuantum !== false,
      enableTemporal: config.enableTemporal !== false,
      enableSwarm: config.enableSwarm !== false,
      ...config
    };

    // Initialize subsystems
    this.quantumStates = new Map();
    this.temporalBuffer = new TemporalMemoryBuffer({ maxSize: this.config.temporalBufferSize });
    this.swarmParticles = [];
    this.pheromoneSystem = null;
    this.globalBest = null;
    this.globalBestFitness = -Infinity;

    // Metrics
    this.metrics = {
      quantumMeasurements: 0,
      temporalEvents: 0,
      swarmIterations: 0,
      decisions: 0,
      optimizations: 0,
      startTime: Date.now()
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUANTUM OPERATIONS (PROTO-231)
  // ─────────────────────────────────────────────────────────────────────────────

  createQuantumState(stateId) {
    const state = new QuantumCognitiveState(this.config.quantumDimensions);
    this.quantumStates.set(stateId, state);
    return state;
  }

  getQuantumState(stateId) {
    if (!this.quantumStates.has(stateId)) {
      return this.createQuantumState(stateId);
    }
    return this.quantumStates.get(stateId);
  }

  prepareSuperposition(stateId, options) {
    const state = this.getQuantumState(stateId);
    const indices = options.map((_, i) => i).filter(i => i < state.dimensions);
    state.applySuperposition(indices);
    
    // Apply phi-weighted phases based on option weights
    options.forEach((opt, i) => {
      if (i < state.dimensions && opt.weight) {
        state.applyPhaseRotation(i, Math.log(opt.weight) * PHI);
      }
    });
    
    return state.inspect();
  }

  measureQuantumState(stateId) {
    const state = this.getQuantumState(stateId);
    const result = state.measure();
    this.metrics.quantumMeasurements++;
    return result;
  }

  entangleStates(stateId1, stateId2, strength = PHI_INVERSE) {
    const state1 = this.getQuantumState(stateId1);
    const state2 = this.getQuantumState(stateId2);
    return state1.entangle(state2, strength);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEMPORAL OPERATIONS (PROTO-232)
  // ─────────────────────────────────────────────────────────────────────────────

  recordEvent(data, timestamp = Date.now()) {
    const event = new TemporalEvent(data, timestamp);
    this.temporalBuffer.add(event);
    this.metrics.temporalEvents++;
    return event;
  }

  queryTemporalRange(startTime, endTime) {
    return this.temporalBuffer.queryRange(startTime, endTime);
  }

  getRecentEvents(count = 10) {
    return this.temporalBuffer.getRecentWithDecay(count);
  }

  inferCausality(causeEventId, effectEventId, strength = PHI_INVERSE) {
    const cause = this.temporalBuffer.get(causeEventId);
    const effect = this.temporalBuffer.get(effectEventId);
    
    if (cause && effect && cause.precedes(effect)) {
      cause.addCausalLink(effectEventId, strength);
      effect.causalLinks.add({ eventId: causeEventId, strength, type: 'cause' });
      return true;
    }
    return false;
  }

  predictFromHistory(pattern, horizon = TIME_SCALES.EXTENDED) {
    const recent = this.temporalBuffer.getRecentWithDecay(20);
    const now = Date.now();
    
    // Find matching patterns in history
    const matches = recent.filter(e => 
      e.data && typeof pattern === 'function' ? pattern(e.data) : 
      JSON.stringify(e.data).includes(JSON.stringify(pattern))
    );

    if (matches.length === 0) {
      return { prediction: null, confidence: 0, horizon };
    }

    // Aggregate predictions based on effects of matching events
    const predictions = matches.flatMap(m => 
      Array.from(m.causalLinks).map(link => ({
        eventId: link.eventId,
        strength: link.strength * m.decayedSalience
      }))
    );

    const bestPrediction = predictions.sort((a, b) => b.strength - a.strength)[0];
    
    return {
      prediction: bestPrediction ? this.temporalBuffer.get(bestPrediction.eventId)?.data : null,
      confidence: bestPrediction?.strength || 0,
      horizon,
      basedOn: matches.length
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SWARM OPERATIONS (PROTO-233)
  // ─────────────────────────────────────────────────────────────────────────────

  initializeSwarm(dimensions, bounds, size = this.config.swarmSize) {
    this.swarmParticles = Array.from({ length: size }, () =>
      new SwarmParticle(dimensions, bounds)
    );
    this.globalBest = [...this.swarmParticles[0].position];
    this.globalBestFitness = -Infinity;
    return this.swarmParticles.length;
  }

  initializePheromones(nodeCount) {
    this.pheromoneSystem = new PheromoneTrailSystem(nodeCount);
    return this.pheromoneSystem;
  }

  swarmIteration(fitnessFunction) {
    if (this.swarmParticles.length === 0) return null;

    // Evaluate all particles
    for (const particle of this.swarmParticles) {
      particle.evaluate(fitnessFunction);
      
      if (particle.fitness > this.globalBestFitness) {
        this.globalBest = [...particle.position];
        this.globalBestFitness = particle.fitness;
      }
    }

    // Update all particles
    for (const particle of this.swarmParticles) {
      particle.update(this.globalBest);
    }

    this.metrics.swarmIterations++;

    return {
      globalBest: [...this.globalBest],
      globalBestFitness: this.globalBestFitness,
      averageFitness: this.swarmParticles.reduce((s, p) => s + p.fitness, 0) / this.swarmParticles.length,
      iteration: this.metrics.swarmIterations
    };
  }

  optimizeWithSwarm(fitnessFunction, maxIterations = 100, convergenceThreshold = 0.0001) {
    const history = [];
    let lastBest = -Infinity;
    let stagnation = 0;

    for (let i = 0; i < maxIterations; i++) {
      const result = this.swarmIteration(fitnessFunction);
      history.push(result);

      // Check convergence
      const improvement = result.globalBestFitness - lastBest;
      if (Math.abs(improvement) < convergenceThreshold) {
        stagnation++;
        if (stagnation > 10) break;
      } else {
        stagnation = 0;
      }
      lastBest = result.globalBestFitness;
    }

    this.metrics.optimizations++;

    return {
      solution: [...this.globalBest],
      fitness: this.globalBestFitness,
      iterations: history.length,
      converged: stagnation > 10,
      history
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UNIFIED DECISION MAKING
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Make a unified decision using all three protocols
   * @param {Object[]} options - Decision options with weights
   * @param {Object} context - Decision context
   * @returns {Object} Decision result
   */
  unifiedDecision(options, context = {}) {
    const decisionId = `decision_${Date.now()}`;
    
    // 1. QUANTUM PHASE: Explore possibilities in superposition
    let quantumResult = null;
    if (this.config.enableQuantum) {
      this.prepareSuperposition(decisionId, options);
      quantumResult = this.measureQuantumState(decisionId);
    }

    // 2. TEMPORAL PHASE: Consult historical patterns
    let temporalPrediction = null;
    if (this.config.enableTemporal && context.pattern) {
      temporalPrediction = this.predictFromHistory(context.pattern);
    }

    // 3. SWARM PHASE: Optimize if fitness function provided
    let swarmResult = null;
    if (this.config.enableSwarm && context.fitnessFunction && context.bounds) {
      this.initializeSwarm(options.length, context.bounds);
      swarmResult = this.optimizeWithSwarm(context.fitnessFunction, context.maxIterations || 50);
    }

    // SYNTHESIS: Combine results using phi-weighted voting
    const votes = new Array(options.length).fill(0);

    if (quantumResult) {
      votes[quantumResult.state] += PHI * quantumResult.probability;
    }

    if (temporalPrediction && temporalPrediction.prediction) {
      const matchingIdx = options.findIndex(o => 
        JSON.stringify(o) === JSON.stringify(temporalPrediction.prediction)
      );
      if (matchingIdx >= 0) {
        votes[matchingIdx] += PHI_INVERSE * temporalPrediction.confidence;
      }
    }

    if (swarmResult) {
      // Use swarm solution to weight options
      for (let i = 0; i < Math.min(options.length, swarmResult.solution.length); i++) {
        votes[i] += PHI_SQUARED * (swarmResult.solution[i] / 
          swarmResult.solution.reduce((s, v) => s + Math.abs(v), 1));
      }
    }

    // Select best option
    const bestIdx = votes.indexOf(Math.max(...votes));
    const totalVotes = votes.reduce((s, v) => s + v, 0);

    // Record decision event
    this.recordEvent({
      type: 'decision',
      decisionId,
      selectedOption: bestIdx,
      confidence: votes[bestIdx] / totalVotes,
      votes
    });

    this.metrics.decisions++;

    return {
      decisionId,
      selectedOption: options[bestIdx],
      selectedIndex: bestIdx,
      confidence: totalVotes > 0 ? votes[bestIdx] / totalVotes : 0,
      votes,
      quantumResult,
      temporalPrediction,
      swarmResult,
      protocolsUsed: {
        quantum: this.config.enableQuantum,
        temporal: this.config.enableTemporal,
        swarm: this.config.enableSwarm
      }
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ENGINE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  getMetrics() {
    return {
      engineId: this.engineId,
      version: this.version,
      uptime: Date.now() - this.metrics.startTime,
      ...this.metrics,
      quantumStatesActive: this.quantumStates.size,
      temporalEventsBuffered: this.temporalBuffer.events.length,
      swarmParticlesActive: this.swarmParticles.length,
      globalBestFitness: this.globalBestFitness
    };
  }

  reset() {
    this.quantumStates.clear();
    this.temporalBuffer = new TemporalMemoryBuffer({ maxSize: this.config.temporalBufferSize });
    this.swarmParticles = [];
    this.pheromoneSystem = null;
    this.globalBest = null;
    this.globalBestFitness = -Infinity;
    this.metrics = {
      quantumMeasurements: 0,
      temporalEvents: 0,
      swarmIterations: 0,
      decisions: 0,
      optimizations: 0,
      startTime: Date.now()
    };
  }

  exportState() {
    return {
      engineId: this.engineId,
      config: this.config,
      metrics: this.getMetrics(),
      quantumStateCount: this.quantumStates.size,
      temporalEventCount: this.temporalBuffer.events.length,
      swarmParticleCount: this.swarmParticles.length,
      globalBest: this.globalBest,
      globalBestFitness: this.globalBestFitness
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export default ProtocolUnifiedEngine;
