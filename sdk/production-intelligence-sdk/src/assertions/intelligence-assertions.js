/**
 * @medina/production-intelligence-sdk — Intelligence Assertions
 * 
 * COMMERCIAL-GRADE ASSERTION FRAMEWORK
 * Validates intelligence operations, protocol compliance, and system health
 * 
 * @module @medina/production-intelligence-sdk/assertions/intelligence-assertions
 * @copyright Medina Intelligence Systems — All Rights Reserved
 * @license PROPRIETARY — Commercial Use License Required
 */

import { PHI, PHI_INVERSE, PHI_SQUARED, QUANTUM_CONSTANTS, SWARM_CONSTANTS } from '../core/phi-constants.js';

// ════════════════════════════════════════════════════════════════════════════════
// ASSERTION RESULT
// ════════════════════════════════════════════════════════════════════════════════

/**
 * AssertionResult — Structured result of an assertion check
 */
export class AssertionResult {
  constructor(name, passed, message, details = {}) {
    this.name = name;
    this.passed = passed;
    this.message = message;
    this.details = details;
    this.timestamp = Date.now();
  }

  static pass(name, message, details = {}) {
    return new AssertionResult(name, true, message, details);
  }

  static fail(name, message, details = {}) {
    return new AssertionResult(name, false, message, details);
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// BASE ASSERTIONS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Assert that a value is defined
 */
export function assertDefined(value, name = 'value') {
  if (value === undefined || value === null) {
    return AssertionResult.fail('assertDefined', `${name} is not defined`, { value });
  }
  return AssertionResult.pass('assertDefined', `${name} is defined`, { value });
}

/**
 * Assert that a value equals expected
 */
export function assertEqual(actual, expected, name = 'value') {
  if (actual !== expected) {
    return AssertionResult.fail('assertEqual', `${name} does not equal expected`, { actual, expected });
  }
  return AssertionResult.pass('assertEqual', `${name} equals expected`, { actual, expected });
}

/**
 * Assert that a value is within a range
 */
export function assertInRange(value, min, max, name = 'value') {
  if (value < min || value > max) {
    return AssertionResult.fail('assertInRange', `${name} is out of range [${min}, ${max}]`, { value, min, max });
  }
  return AssertionResult.pass('assertInRange', `${name} is in range [${min}, ${max}]`, { value, min, max });
}

/**
 * Assert that a value is a valid probability [0, 1]
 */
export function assertProbability(value, name = 'probability') {
  return assertInRange(value, 0, 1, name);
}

/**
 * Assert that an array has expected length
 */
export function assertLength(array, expectedLength, name = 'array') {
  if (!Array.isArray(array)) {
    return AssertionResult.fail('assertLength', `${name} is not an array`, { type: typeof array });
  }
  if (array.length !== expectedLength) {
    return AssertionResult.fail('assertLength', `${name} has wrong length`, { actual: array.length, expected: expectedLength });
  }
  return AssertionResult.pass('assertLength', `${name} has correct length`, { length: array.length });
}

/**
 * Assert that probabilities sum to 1
 */
export function assertProbabilityDistribution(probabilities, tolerance = 0.001) {
  if (!Array.isArray(probabilities)) {
    return AssertionResult.fail('assertProbabilityDistribution', 'probabilities is not an array');
  }
  
  const sum = probabilities.reduce((s, p) => s + p, 0);
  if (Math.abs(sum - 1) > tolerance) {
    return AssertionResult.fail('assertProbabilityDistribution', 'probabilities do not sum to 1', { sum, tolerance });
  }
  
  for (let i = 0; i < probabilities.length; i++) {
    if (probabilities[i] < 0 || probabilities[i] > 1) {
      return AssertionResult.fail('assertProbabilityDistribution', `probability at index ${i} is invalid`, { value: probabilities[i] });
    }
  }
  
  return AssertionResult.pass('assertProbabilityDistribution', 'valid probability distribution', { sum });
}

// ════════════════════════════════════════════════════════════════════════════════
// QUANTUM ASSERTIONS (PROTO-231)
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Assert quantum state normalization
 */
export function assertQuantumNormalized(state, tolerance = 0.001) {
  if (!state || !state.amplitudes) {
    return AssertionResult.fail('assertQuantumNormalized', 'invalid quantum state');
  }
  
  const totalProb = state.amplitudes.reduce((s, a) => s + a.probability(), 0);
  
  if (Math.abs(totalProb - 1) > tolerance) {
    return AssertionResult.fail('assertQuantumNormalized', 'state is not normalized', { totalProbability: totalProb });
  }
  
  return AssertionResult.pass('assertQuantumNormalized', 'state is normalized', { totalProbability: totalProb });
}

/**
 * Assert quantum coherence level
 */
export function assertCoherenceLevel(state, minCoherence = 0.5) {
  if (!state || typeof state._getCoherenceLevel !== 'function') {
    return AssertionResult.fail('assertCoherenceLevel', 'invalid quantum state');
  }
  
  const coherence = state._getCoherenceLevel();
  
  if (coherence < minCoherence) {
    return AssertionResult.fail('assertCoherenceLevel', 'coherence level too low', { coherence, minCoherence });
  }
  
  return AssertionResult.pass('assertCoherenceLevel', 'coherence level acceptable', { coherence, minCoherence });
}

/**
 * Assert quantum entanglement exists
 */
export function assertEntangled(state1, state2) {
  if (!state1 || !state2) {
    return AssertionResult.fail('assertEntangled', 'invalid states');
  }
  
  const hasEntanglement = Array.from(state1.entanglements.values()).some(e => e.partner === state2);
  
  if (!hasEntanglement) {
    return AssertionResult.fail('assertEntangled', 'states are not entangled');
  }
  
  return AssertionResult.pass('assertEntangled', 'states are entangled');
}

/**
 * Assert quantum measurement result validity
 */
export function assertValidMeasurement(result, dimensions) {
  if (!result || typeof result.state !== 'number') {
    return AssertionResult.fail('assertValidMeasurement', 'invalid measurement result');
  }
  
  if (result.state < 0 || result.state >= dimensions) {
    return AssertionResult.fail('assertValidMeasurement', 'measured state out of bounds', { state: result.state, dimensions });
  }
  
  if (result.probability < 0 || result.probability > 1) {
    return AssertionResult.fail('assertValidMeasurement', 'invalid probability', { probability: result.probability });
  }
  
  return AssertionResult.pass('assertValidMeasurement', 'valid measurement result', result);
}

// ════════════════════════════════════════════════════════════════════════════════
// TEMPORAL ASSERTIONS (PROTO-232)
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Assert temporal ordering of events
 */
export function assertTemporalOrder(events) {
  if (!Array.isArray(events) || events.length < 2) {
    return AssertionResult.pass('assertTemporalOrder', 'insufficient events to check order');
  }
  
  for (let i = 1; i < events.length; i++) {
    if (events[i].timestamp < events[i-1].timestamp) {
      return AssertionResult.fail('assertTemporalOrder', 'events not in temporal order', {
        index: i,
        prev: events[i-1].timestamp,
        current: events[i].timestamp
      });
    }
  }
  
  return AssertionResult.pass('assertTemporalOrder', 'events in temporal order', { count: events.length });
}

/**
 * Assert causal link validity
 */
export function assertCausalLink(cause, effect) {
  if (!cause || !effect) {
    return AssertionResult.fail('assertCausalLink', 'invalid cause or effect');
  }
  
  if (!cause.precedes(effect)) {
    return AssertionResult.fail('assertCausalLink', 'cause does not precede effect', {
      causeTime: cause.timestamp,
      effectTime: effect.timestamp
    });
  }
  
  return AssertionResult.pass('assertCausalLink', 'valid causal link', {
    causeId: cause.id,
    effectId: effect.id,
    gap: effect.timestamp - cause.timestamp
  });
}

/**
 * Assert temporal buffer integrity
 */
export function assertBufferIntegrity(buffer, maxSize) {
  if (!buffer || !Array.isArray(buffer.events)) {
    return AssertionResult.fail('assertBufferIntegrity', 'invalid buffer');
  }
  
  if (buffer.events.length > maxSize) {
    return AssertionResult.fail('assertBufferIntegrity', 'buffer exceeds max size', {
      size: buffer.events.length,
      maxSize
    });
  }
  
  // Check index consistency
  for (const event of buffer.events) {
    if (!buffer.eventIndex.has(event.id)) {
      return AssertionResult.fail('assertBufferIntegrity', 'index missing event', { eventId: event.id });
    }
  }
  
  return AssertionResult.pass('assertBufferIntegrity', 'buffer integrity verified', {
    size: buffer.events.length,
    indexSize: buffer.eventIndex.size
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// SWARM ASSERTIONS (PROTO-233)
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Assert particle within bounds
 */
export function assertParticleInBounds(particle) {
  if (!particle || !particle.position || !particle.bounds) {
    return AssertionResult.fail('assertParticleInBounds', 'invalid particle');
  }
  
  for (let i = 0; i < particle.dimensions; i++) {
    if (particle.position[i] < particle.bounds[i].min || particle.position[i] > particle.bounds[i].max) {
      return AssertionResult.fail('assertParticleInBounds', 'particle out of bounds', {
        dimension: i,
        position: particle.position[i],
        bounds: particle.bounds[i]
      });
    }
  }
  
  return AssertionResult.pass('assertParticleInBounds', 'particle in bounds', { particleId: particle.id });
}

/**
 * Assert swarm convergence
 */
export function assertSwarmConvergence(history, threshold = 0.01) {
  if (!Array.isArray(history) || history.length < 2) {
    return AssertionResult.fail('assertSwarmConvergence', 'insufficient history');
  }
  
  const recent = history.slice(-5);
  const improvements = [];
  
  for (let i = 1; i < recent.length; i++) {
    improvements.push(Math.abs(recent[i].globalBestFitness - recent[i-1].globalBestFitness));
  }
  
  const avgImprovement = improvements.reduce((s, i) => s + i, 0) / improvements.length;
  
  if (avgImprovement > threshold) {
    return AssertionResult.fail('assertSwarmConvergence', 'swarm not converged', { avgImprovement, threshold });
  }
  
  return AssertionResult.pass('assertSwarmConvergence', 'swarm converged', { avgImprovement, threshold });
}

/**
 * Assert pheromone levels valid
 */
export function assertPheromoneLevels(pheromoneSystem, minLevel, maxLevel) {
  if (!pheromoneSystem || !pheromoneSystem.trails) {
    return AssertionResult.fail('assertPheromoneLevels', 'invalid pheromone system');
  }
  
  for (let i = 0; i < pheromoneSystem.nodeCount; i++) {
    for (let j = 0; j < pheromoneSystem.nodeCount; j++) {
      const level = pheromoneSystem.trails[i][j];
      if (level < minLevel || level > maxLevel) {
        return AssertionResult.fail('assertPheromoneLevels', 'pheromone level out of range', {
          from: i,
          to: j,
          level,
          minLevel,
          maxLevel
        });
      }
    }
  }
  
  return AssertionResult.pass('assertPheromoneLevels', 'pheromone levels valid', { nodeCount: pheromoneSystem.nodeCount });
}

// ════════════════════════════════════════════════════════════════════════════════
// PHI-ENCODING ASSERTIONS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Assert PHI ratio compliance
 */
export function assertPhiRatio(a, b, tolerance = 0.01) {
  if (b === 0) {
    return AssertionResult.fail('assertPhiRatio', 'cannot compute ratio with zero denominator');
  }
  
  const ratio = a / b;
  const isPhiRatio = Math.abs(ratio - PHI) < tolerance || Math.abs(ratio - PHI_INVERSE) < tolerance;
  
  if (!isPhiRatio) {
    return AssertionResult.fail('assertPhiRatio', 'ratio is not PHI-compliant', { ratio, PHI, tolerance });
  }
  
  return AssertionResult.pass('assertPhiRatio', 'PHI-compliant ratio', { ratio });
}

/**
 * Assert PHI-scaled sequence
 */
export function assertPhiScaled(sequence, baseValue, tolerance = 0.01) {
  if (!Array.isArray(sequence) || sequence.length < 2) {
    return AssertionResult.fail('assertPhiScaled', 'insufficient sequence elements');
  }
  
  for (let i = 0; i < sequence.length; i++) {
    const expected = baseValue * (PHI ** i);
    if (Math.abs(sequence[i] - expected) / expected > tolerance) {
      return AssertionResult.fail('assertPhiScaled', 'sequence not PHI-scaled', {
        index: i,
        actual: sequence[i],
        expected
      });
    }
  }
  
  return AssertionResult.pass('assertPhiScaled', 'sequence is PHI-scaled', { length: sequence.length, baseValue });
}

// ════════════════════════════════════════════════════════════════════════════════
// ASSERTION SUITE
// ════════════════════════════════════════════════════════════════════════════════

/**
 * IntelligenceAssertionSuite — Comprehensive assertion test runner
 */
export class IntelligenceAssertionSuite {
  constructor(name = 'IntelligenceAssertionSuite') {
    this.name = name;
    this.results = [];
    this.startTime = null;
    this.endTime = null;
  }

  run(assertionFn, ...args) {
    try {
      const result = assertionFn(...args);
      this.results.push(result);
      return result;
    } catch (error) {
      const result = AssertionResult.fail(assertionFn.name || 'unknown', error.message, { error: error.stack });
      this.results.push(result);
      return result;
    }
  }

  runAll(assertions) {
    this.startTime = Date.now();
    
    for (const { fn, args, description } of assertions) {
      const result = this.run(fn, ...args);
      if (description) result.description = description;
    }
    
    this.endTime = Date.now();
    return this.getSummary();
  }

  getSummary() {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    
    return {
      name: this.name,
      total: this.results.length,
      passed,
      failed,
      passRate: this.results.length > 0 ? passed / this.results.length : 0,
      duration: this.endTime ? this.endTime - this.startTime : null,
      results: this.results,
      failures: this.results.filter(r => !r.passed)
    };
  }

  reset() {
    this.results = [];
    this.startTime = null;
    this.endTime = null;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// PRODUCTION VALIDATION
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Validate a unified engine for production readiness
 */
export function validateProductionReadiness(engine) {
  const suite = new IntelligenceAssertionSuite('ProductionReadinessValidation');
  
  const assertions = [
    { fn: assertDefined, args: [engine, 'engine'], description: 'Engine exists' },
    { fn: assertDefined, args: [engine?.config, 'engine.config'], description: 'Config exists' },
    { fn: assertDefined, args: [engine?.metrics, 'engine.metrics'], description: 'Metrics exists' },
    { fn: assertDefined, args: [engine?.quantumStates, 'engine.quantumStates'], description: 'Quantum states map exists' },
    { fn: assertDefined, args: [engine?.temporalBuffer, 'engine.temporalBuffer'], description: 'Temporal buffer exists' },
  ];
  
  // Validate quantum subsystem
  if (engine?.config?.enableQuantum) {
    const qState = engine.createQuantumState('validation_state');
    assertions.push(
      { fn: assertQuantumNormalized, args: [qState], description: 'Quantum state normalized' },
      { fn: assertLength, args: [qState.amplitudes, engine.config.quantumDimensions, 'amplitudes'], description: 'Correct quantum dimensions' }
    );
  }
  
  // Validate temporal subsystem
  if (engine?.config?.enableTemporal) {
    assertions.push(
      { fn: assertDefined, args: [engine.temporalBuffer.events, 'temporalBuffer.events'], description: 'Temporal events array exists' }
    );
  }
  
  return suite.runAll(assertions);
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export default {
  // Result class
  AssertionResult,
  
  // Base assertions
  assertDefined,
  assertEqual,
  assertInRange,
  assertProbability,
  assertLength,
  assertProbabilityDistribution,
  
  // Quantum assertions
  assertQuantumNormalized,
  assertCoherenceLevel,
  assertEntangled,
  assertValidMeasurement,
  
  // Temporal assertions
  assertTemporalOrder,
  assertCausalLink,
  assertBufferIntegrity,
  
  // Swarm assertions
  assertParticleInBounds,
  assertSwarmConvergence,
  assertPheromoneLevels,
  
  // PHI assertions
  assertPhiRatio,
  assertPhiScaled,
  
  // Suite
  IntelligenceAssertionSuite,
  validateProductionReadiness
};
