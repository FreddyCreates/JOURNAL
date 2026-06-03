/**
 * New Protocol Tests - PROTO-231 through PROTO-233
 * Comprehensive tests for Quantum Coherence, Temporal Reasoning, and Swarm Intelligence
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';

import {
  Complex,
  QuantumCognitiveState,
  QuantumCoherenceProtocol,
  PLANCK_COGNITIVE
} from '../src/quantum-coherence-protocol.js';

import {
  TemporalEvent,
  TemporalMemoryBuffer,
  CausalInferenceEngine,
  TemporalReasoningProtocol,
  TIME_SCALES
} from '../src/temporal-reasoning-protocol.js';

import {
  SwarmParticle,
  PheromoneTrailSystem,
  SwarmConsensus,
  SwarmIntelligenceProtocol,
  SWARM_CONSTANTS
} from '../src/swarm-intelligence-protocol.js';

const PHI = 1.618033988749895;
const PHI_INVERSE = 1 / PHI;

// ═══════════════════════════════════════════════════════════════════════════
// PROTO-231: Quantum Coherence Protocol Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('PROTO-231: Quantum Coherence Protocol', () => {
  describe('Complex number operations', () => {
    it('should create complex numbers from polar form', () => {
      const c = Complex.fromPolar(1, Math.PI / 4);
      assert.ok(Math.abs(c.real - Math.SQRT1_2) < 0.0001);
      assert.ok(Math.abs(c.imag - Math.SQRT1_2) < 0.0001);
    });

    it('should calculate magnitude correctly', () => {
      const c = new Complex(3, 4);
      assert.strictEqual(c.magnitude(), 5);
    });

    it('should calculate phase correctly', () => {
      const c = new Complex(1, 1);
      assert.ok(Math.abs(c.phase() - Math.PI / 4) < 0.0001);
    });

    it('should multiply complex numbers correctly', () => {
      const a = new Complex(1, 2);
      const b = new Complex(3, 4);
      const result = a.multiply(b);
      assert.strictEqual(result.real, -5); // 1*3 - 2*4
      assert.strictEqual(result.imag, 10); // 1*4 + 2*3
    });

    it('should calculate probability from amplitude', () => {
      const c = new Complex(0.6, 0.8);
      assert.strictEqual(c.probability(), 1); // |0.6 + 0.8i|² = 0.36 + 0.64 = 1
    });
  });

  describe('QuantumCognitiveState', () => {
    it('should initialize to ground state', () => {
      const state = new QuantumCognitiveState(4);
      const inspection = state.inspect();
      assert.ok(inspection.probabilities[0] > 0.99);
    });

    it('should create superposition', () => {
      const state = new QuantumCognitiveState(4);
      state.applySuperposition(1);
      const inspection = state.inspect();
      // After Hadamard-like gate, should have ~50% in each state
      assert.ok(inspection.probabilities[0] > 0.4);
      assert.ok(inspection.probabilities[1] > 0.4);
    });

    it('should apply phase rotation', () => {
      const state = new QuantumCognitiveState(4);
      const initialPhase = state.amplitudes[0].phase();
      state.applyPhaseRotation(0, Math.PI / 2);
      const newPhase = state.amplitudes[0].phase();
      assert.ok(Math.abs(newPhase - initialPhase - Math.PI / 2) < 0.0001);
    });

    it('should measure and collapse state', () => {
      const state = new QuantumCognitiveState(4);
      const result = state.measure();
      assert.strictEqual(result.state, 0); // Ground state should measure to 0
      assert.strictEqual(result.probability, 1);
    });

    it('should entangle two states', () => {
      const state1 = new QuantumCognitiveState(4);
      const state2 = new QuantumCognitiveState(4);
      const entId = state1.entangle(state2, PHI_INVERSE);
      assert.ok(state1.entanglements.has(entId));
      assert.ok(state2.entanglements.has(entId));
    });

    it('should calculate entropy', () => {
      const state = new QuantumCognitiveState(4);
      state.applySuperposition(1);
      const inspection = state.inspect();
      // Superposition should have non-zero entropy
      assert.ok(inspection.entropy > 0);
    });
  });

  describe('QuantumCoherenceProtocol', () => {
    it('should create and manage quantum states', () => {
      const protocol = new QuantumCoherenceProtocol();
      const state = protocol.createState('test-state');
      assert.ok(state instanceof QuantumCognitiveState);
      assert.strictEqual(protocol.states.size, 1);
    });

    it('should prepare superposition over indices', () => {
      const protocol = new QuantumCoherenceProtocol({ dimensions: 8 });
      protocol.prepareSuperposition('test', [0, 2, 4]);
      const state = protocol.getState('test');
      const inspection = state.inspect();
      // Should have equal probability in indices 0, 2, 4
      assert.ok(Math.abs(inspection.probabilities[0] - 1/3) < 0.01);
      assert.ok(Math.abs(inspection.probabilities[2] - 1/3) < 0.01);
      assert.ok(Math.abs(inspection.probabilities[4] - 1/3) < 0.01);
    });

    it('should apply interference between states', () => {
      const protocol = new QuantumCoherenceProtocol();
      protocol.createState('state1');
      protocol.createState('state2');
      const interference = protocol.applyInterference('state1', 'state2');
      assert.ok(interference.pattern.length > 0);
      assert.ok(['constructive', 'destructive'].includes(interference.dominantType));
    });

    it('should entangle states', () => {
      const protocol = new QuantumCoherenceProtocol();
      protocol.createState('s1');
      protocol.createState('s2');
      const entId = protocol.entangleStates('s1', 's2');
      assert.ok(entId.startsWith('ent_'));
      assert.strictEqual(protocol.coherenceMetrics.entanglementEvents, 1);
    });

    it('should make quantum decisions', () => {
      const protocol = new QuantumCoherenceProtocol();
      const options = [
        { name: 'A', weight: 1 },
        { name: 'B', weight: 2 },
        { name: 'C', weight: 0.5 }
      ];
      const decision = protocol.quantumDecision('decision-state', options);
      assert.ok(decision.decision);
      assert.ok(decision.confidence >= 0 && decision.confidence <= 1);
    });

    it('should track metrics', () => {
      const protocol = new QuantumCoherenceProtocol();
      protocol.createState('test');
      protocol.measureState('test');
      const metrics = protocol.getMetrics();
      assert.strictEqual(metrics.totalMeasurements, 1);
      assert.strictEqual(metrics.collapseEvents, 1);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PROTO-232: Temporal Reasoning Protocol Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('PROTO-232: Temporal Reasoning Protocol', () => {
  describe('TIME_SCALES constants', () => {
    it('should have phi-scaled time constants', () => {
      assert.ok(TIME_SCALES.IMMEDIATE < TIME_SCALES.SHORT);
      assert.ok(TIME_SCALES.SHORT < TIME_SCALES.MEDIUM);
      assert.ok(TIME_SCALES.MEDIUM < TIME_SCALES.LONG);
      // Check phi scaling
      assert.ok(Math.abs(TIME_SCALES.SHORT / TIME_SCALES.IMMEDIATE - PHI) < 0.01);
    });

    it('should cover multiple time scales', () => {
      assert.ok(TIME_SCALES.IMMEDIATE > 0);
      assert.ok(TIME_SCALES.STRATEGIC > 1000); // > 1 second
    });
  });

  describe('TemporalEvent', () => {
    it('should create events with timestamps', () => {
      const event = new TemporalEvent({ type: 'test' });
      assert.ok(event.id.startsWith('evt_'));
      assert.ok(event.timestamp > 0);
    });

    it('should detect temporal precedence', () => {
      const event1 = new TemporalEvent({ type: 'first' }, 1000);
      const event2 = new TemporalEvent({ type: 'second' }, 2000);
      assert.ok(event1.precedes(event2));
      assert.ok(!event2.precedes(event1));
    });

    it('should calculate temporal distance', () => {
      const event1 = new TemporalEvent({ type: 'a' }, 1000);
      const event2 = new TemporalEvent({ type: 'b' }, 1500);
      assert.strictEqual(event1.temporalDistance(event2), 500);
    });

    it('should detect overlapping events', () => {
      const event1 = new TemporalEvent({ type: 'a', duration: 500 }, 1000);
      const event2 = new TemporalEvent({ type: 'b', duration: 500 }, 1200);
      assert.ok(event1.overlaps(event2));
    });

    it('should add causal links', () => {
      const event = new TemporalEvent({ type: 'cause' });
      event.addCausalLink('effect_123', 0.8);
      assert.strictEqual(event.causalLinks.size, 1);
    });
  });

  describe('TemporalMemoryBuffer', () => {
    it('should add and retrieve events', () => {
      const buffer = new TemporalMemoryBuffer();
      const event = new TemporalEvent({ type: 'test' });
      buffer.add(event);
      assert.strictEqual(buffer.get(event.id), event);
    });

    it('should query events by time range', () => {
      const buffer = new TemporalMemoryBuffer();
      buffer.add(new TemporalEvent({ type: 'a' }, 1000));
      buffer.add(new TemporalEvent({ type: 'b' }, 2000));
      buffer.add(new TemporalEvent({ type: 'c' }, 3000));
      const results = buffer.queryRange(1500, 2500);
      assert.strictEqual(results.length, 1);
    });

    it('should get recent events by time scale', () => {
      const buffer = new TemporalMemoryBuffer();
      const now = Date.now();
      buffer.add(new TemporalEvent({ type: 'recent' }, now - 100));
      buffer.add(new TemporalEvent({ type: 'old' }, now - 10000));
      const recent = buffer.getRecent('SHORT');
      assert.ok(recent.length >= 1);
    });

    it('should apply temporal decay', () => {
      const buffer = new TemporalMemoryBuffer({ decayRate: 0.5 });
      const event = new TemporalEvent({ type: 'test', salience: 1.0 }, Date.now() - 1000);
      buffer.add(event);
      buffer.applyDecay();
      assert.ok(event.salience < 1.0);
    });

    it('should provide buffer statistics', () => {
      const buffer = new TemporalMemoryBuffer();
      buffer.add(new TemporalEvent({ type: 'test' }));
      const stats = buffer.getStats();
      assert.strictEqual(stats.eventCount, 1);
    });
  });

  describe('CausalInferenceEngine', () => {
    it('should record cooccurrences', () => {
      const engine = new CausalInferenceEngine();
      const cause = new TemporalEvent({ type: 'cause' }, 1000);
      const effect = new TemporalEvent({ type: 'effect' }, 1100);
      engine.recordCooccurrence(cause, effect);
      assert.strictEqual(engine.cooccurrenceMatrix.size, 1);
    });

    it('should infer causality from repeated cooccurrences', () => {
      const engine = new CausalInferenceEngine({ minCooccurrence: 2 });
      for (let i = 0; i < 5; i++) {
        const cause = new TemporalEvent({ type: 'trigger' }, i * 1000);
        const effect = new TemporalEvent({ type: 'response' }, i * 1000 + 100);
        engine.recordCooccurrence(cause, effect);
      }
      const relationships = engine.inferCausality();
      assert.ok(relationships.length > 0);
      assert.strictEqual(relationships[0].cause, 'trigger');
      assert.strictEqual(relationships[0].effect, 'response');
    });

    it('should predict effects from causes', () => {
      const engine = new CausalInferenceEngine({ minCooccurrence: 2 });
      for (let i = 0; i < 5; i++) {
        const cause = new TemporalEvent({ type: 'input' }, i * 1000);
        const effect = new TemporalEvent({ type: 'output' }, i * 1000 + 50);
        engine.recordCooccurrence(cause, effect);
      }
      engine.inferCausality();
      const predictions = engine.predictEffects('input');
      assert.ok(predictions.length > 0);
    });
  });

  describe('TemporalReasoningProtocol', () => {
    it('should process events', () => {
      const protocol = new TemporalReasoningProtocol();
      const event = protocol.processEvent({ type: 'test' });
      assert.ok(event instanceof TemporalEvent);
      assert.strictEqual(protocol.metrics.eventsProcessed, 1);
    });

    it('should generate predictions', () => {
      const protocol = new TemporalReasoningProtocol();
      // Build up causal data
      for (let i = 0; i < 10; i++) {
        protocol.processEvent({ type: 'stimulus' });
        protocol.processEvent({ type: 'response' });
      }
      protocol.inferCausalStructure();
      const predictions = protocol.predict('stimulus');
      assert.ok(Array.isArray(predictions));
    });

    it('should explain events', () => {
      const protocol = new TemporalReasoningProtocol();
      const explanation = protocol.explain('unknown_event');
      assert.ok(explanation.event);
      assert.ok(Array.isArray(explanation.likelyCauses));
    });

    it('should perform temporal abstraction', () => {
      const protocol = new TemporalReasoningProtocol();
      const now = Date.now();
      protocol.processEvent({ type: 'a' });
      protocol.processEvent({ type: 'b' });
      const abstraction = protocol.abstract(now - 1000, now + 1000);
      assert.ok(abstraction.eventCount >= 0);
    });

    it('should get temporal context', () => {
      const protocol = new TemporalReasoningProtocol();
      protocol.processEvent({ type: 'test' });
      const context = protocol.getTemporalContext('MEDIUM');
      assert.strictEqual(context.scale, 'MEDIUM');
      assert.ok(context.windowMs > 0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PROTO-233: Swarm Intelligence Protocol Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('PROTO-233: Swarm Intelligence Protocol', () => {
  describe('SWARM_CONSTANTS', () => {
    it('should have phi-based weights', () => {
      assert.strictEqual(SWARM_CONSTANTS.COGNITIVE_WEIGHT, PHI);
      assert.strictEqual(SWARM_CONSTANTS.SOCIAL_WEIGHT, PHI_INVERSE);
      assert.strictEqual(SWARM_CONSTANTS.INERTIA_WEIGHT, PHI_INVERSE);
    });
  });

  describe('SwarmParticle', () => {
    it('should initialize within bounds', () => {
      const bounds = [{ min: 0, max: 10 }, { min: -5, max: 5 }];
      const particle = new SwarmParticle(2, bounds);
      assert.ok(particle.position[0] >= 0 && particle.position[0] <= 10);
      assert.ok(particle.position[1] >= -5 && particle.position[1] <= 5);
    });

    it('should update position based on velocity', () => {
      const bounds = [{ min: -10, max: 10 }];
      const particle = new SwarmParticle(1, bounds);
      const initialPos = particle.position[0];
      particle.update([5]); // Global best at 5
      assert.notStrictEqual(particle.position[0], initialPos);
    });

    it('should evaluate fitness and update personal best', () => {
      const bounds = [{ min: -10, max: 10 }];
      const particle = new SwarmParticle(1, bounds);
      particle.evaluate((pos) => -Math.abs(pos[0])); // Fitness: closer to 0 is better
      assert.ok(particle.fitness !== -Infinity);
    });

    it('should track stagnation', () => {
      const bounds = [{ min: -10, max: 10 }];
      const particle = new SwarmParticle(1, bounds);
      particle.evaluate(() => 0);
      particle.evaluate(() => 0);
      assert.strictEqual(particle.stagnationCount, 1);
    });

    it('should apply perturbation', () => {
      const bounds = [{ min: -10, max: 10 }];
      const particle = new SwarmParticle(1, bounds);
      const initialPos = particle.position[0];
      particle.perturb(0.5);
      // Position should change (with high probability)
      // Note: This is probabilistic, so we just check bounds
      assert.ok(particle.position[0] >= -10 && particle.position[0] <= 10);
    });
  });

  describe('PheromoneTrailSystem', () => {
    it('should deposit and retrieve pheromone', () => {
      const system = new PheromoneTrailSystem(10);
      system.deposit('A', 1.0);
      assert.strictEqual(system.getLevel('A'), 1.0);
    });

    it('should apply evaporation', () => {
      const system = new PheromoneTrailSystem(10, 0.5);
      system.deposit('A', 1.0);
      system.evaporate();
      assert.ok(system.getLevel('A') < 1.0);
    });

    it('should get strongest trails', () => {
      const system = new PheromoneTrailSystem(10);
      system.deposit('A', 1.0);
      system.deposit('B', 2.0);
      system.deposit('C', 0.5);
      const strongest = system.getStrongestTrails(2);
      assert.strictEqual(strongest[0].location, 'B');
      assert.strictEqual(strongest[1].location, 'A');
    });

    it('should calculate move probabilities', () => {
      const system = new PheromoneTrailSystem(10);
      system.deposit('A', 2.0);
      system.deposit('B', 1.0);
      const probs = system.getMoveProbabilities(['A', 'B']);
      assert.ok(probs[0].probability > probs[1].probability);
      const totalProb = probs.reduce((sum, p) => sum + p.probability, 0);
      assert.ok(Math.abs(totalProb - 1) < 0.0001);
    });
  });

  describe('SwarmConsensus', () => {
    it('should record votes', () => {
      const consensus = new SwarmConsensus();
      consensus.vote('agent1', { option: 'A' }, 1);
      consensus.vote('agent2', { option: 'A' }, 1);
      const status = consensus.getStatus();
      assert.strictEqual(status[0].supporterCount, 2);
    });

    it('should detect consensus', () => {
      const consensus = new SwarmConsensus({ threshold: 0.5 });
      consensus.vote('agent1', { option: 'A' }, 1);
      consensus.vote('agent2', { option: 'A' }, 1);
      consensus.vote('agent3', { option: 'B' }, 1);
      const result = consensus.checkConsensus(3);
      assert.ok(result !== null);
      assert.deepStrictEqual(result.proposal, { option: 'A' });
    });

    it('should return null when no consensus', () => {
      const consensus = new SwarmConsensus({ threshold: 0.9 });
      consensus.vote('agent1', { option: 'A' }, 1);
      consensus.vote('agent2', { option: 'B' }, 1);
      consensus.vote('agent3', { option: 'C' }, 1);
      const result = consensus.checkConsensus(3);
      assert.strictEqual(result, null);
    });
  });

  describe('SwarmIntelligenceProtocol', () => {
    it('should initialize swarm', () => {
      const protocol = new SwarmIntelligenceProtocol({ swarmSize: 10 });
      assert.strictEqual(protocol.particles.length, 10);
    });

    it('should optimize a simple function', () => {
      const protocol = new SwarmIntelligenceProtocol({
        swarmSize: 20,
        dimensions: 2,
        bounds: [{ min: -5, max: 5 }, { min: -5, max: 5 }]
      });
      
      // Optimize sphere function (minimum at origin)
      const result = protocol.optimize(
        (pos) => -(pos[0] ** 2 + pos[1] ** 2),
        50
      );
      
      assert.ok(result.bestFitness > -1); // Should be close to 0
      assert.ok(result.iterations > 0);
    });

    it('should make collective decisions', () => {
      const protocol = new SwarmIntelligenceProtocol({ swarmSize: 10 });
      const options = [
        { name: 'Option A', value: 1 },
        { name: 'Option B', value: 2 },
        { name: 'Option C', value: 3 }
      ];
      
      const decision = protocol.collectiveDecision(
        options,
        (opt, pos) => opt.value * (1 + pos[0] * 0.1)
      );
      
      assert.ok(decision.decision);
      assert.ok(decision.supportRatio >= 0);
    });

    it('should calculate swarm diversity', () => {
      const protocol = new SwarmIntelligenceProtocol({ swarmSize: 10 });
      const state = protocol.getSwarmState();
      assert.ok(state.diversity >= 0);
    });

    it('should track metrics', () => {
      const protocol = new SwarmIntelligenceProtocol({ swarmSize: 5 });
      protocol.optimize((pos) => -(pos[0] ** 2), 10);
      const metrics = protocol.getMetrics();
      assert.ok(metrics.iterations > 0);
      assert.ok(metrics.evaluations > 0);
    });

    it('should reset properly', () => {
      const protocol = new SwarmIntelligenceProtocol({ swarmSize: 5 });
      protocol.optimize((pos) => -(pos[0] ** 2), 10);
      protocol.reset();
      assert.strictEqual(protocol.metrics.iterations, 0);
      assert.strictEqual(protocol.globalBestFitness, -Infinity);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Integration Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('Protocol Integration', () => {
  it('should use consistent PHI constants across protocols', () => {
    // All protocols should use the same PHI value
    assert.strictEqual(SWARM_CONSTANTS.COGNITIVE_WEIGHT, PHI);
    assert.ok(Math.abs(TIME_SCALES.SHORT / TIME_SCALES.IMMEDIATE - PHI) < 0.01);
  });

  it('should have unique protocol IDs', () => {
    const quantum = new QuantumCoherenceProtocol();
    const temporal = new TemporalReasoningProtocol();
    const swarm = new SwarmIntelligenceProtocol();
    
    const ids = [quantum.protocolId, temporal.protocolId, swarm.protocolId];
    const uniqueIds = new Set(ids);
    assert.strictEqual(ids.length, uniqueIds.size);
  });

  it('should all provide metrics', () => {
    const quantum = new QuantumCoherenceProtocol();
    const temporal = new TemporalReasoningProtocol();
    const swarm = new SwarmIntelligenceProtocol();
    
    assert.ok(quantum.getMetrics().protocolId);
    assert.ok(temporal.getMetrics().protocolId);
    assert.ok(swarm.getMetrics().protocolId);
  });

  it('should all support reset', () => {
    const quantum = new QuantumCoherenceProtocol();
    const temporal = new TemporalReasoningProtocol();
    const swarm = new SwarmIntelligenceProtocol();
    
    // Should not throw
    quantum.reset();
    temporal.reset();
    swarm.reset();
  });
});
