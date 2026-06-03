import { describe, it } from 'node:test';
import assert from 'node:assert';
import { UnifiedIntelligenceEngine, QuantumCoherenceProtocol, TemporalReasoningProtocol, SwarmIntelligenceProtocol, PHI } from '../src/index.js';

describe('Production Intelligence SDK', () => {
  describe('PHI Constants', () => {
    it('should have correct PHI value', () => {
      assert.strictEqual(PHI, 1.618033988749895);
    });
  });

  describe('QuantumCoherenceProtocol (PROTO-231)', () => {
    it('should create and manage quantum states', () => {
      const protocol = new QuantumCoherenceProtocol();
      const state = protocol.createState('test');
      assert.ok(state);
      assert.strictEqual(state.dimensions, 8);
      assert.ok(state.isCoherent());
    });

    it('should apply gates', () => {
      const protocol = new QuantumCoherenceProtocol();
      protocol.createState('test');
      const result = protocol.applyGate('test', 'hadamard', { target: 0 });
      assert.ok(result);
    });

    it('should measure states', () => {
      const protocol = new QuantumCoherenceProtocol();
      protocol.createState('test');
      const result = protocol.measure('test');
      assert.ok(result);
      assert.ok('outcome' in result);
    });
  });

  describe('TemporalReasoningProtocol (PROTO-232)', () => {
    it('should record temporal events', () => {
      const protocol = new TemporalReasoningProtocol();
      const event = protocol.recordEvent({ action: 'test' });
      assert.ok(event);
      assert.ok(event.id);
    });

    it('should query events by time range', () => {
      const protocol = new TemporalReasoningProtocol();
      protocol.recordEvent({ action: 'test1' });
      protocol.recordEvent({ action: 'test2' });
      const now = Date.now();
      const events = protocol.queryEvents(now - 10000, now + 10000);
      assert.strictEqual(events.length, 2);
    });

    it('should build causal chains', () => {
      const protocol = new TemporalReasoningProtocol();
      const e1 = protocol.recordEvent({ action: 'cause' });
      const e2 = protocol.recordEvent({ action: 'effect' });
      protocol.addCausalLink(e1.id, e2.id, 0.8);
      const chain = protocol.getCausalChain(e2.id);
      assert.ok(chain);
    });
  });

  describe('SwarmIntelligenceProtocol (PROTO-233)', () => {
    it('should initialize swarm', () => {
      const protocol = new SwarmIntelligenceProtocol({ swarmSize: 10, dimensions: 5 });
      assert.strictEqual(protocol.agents.length, 10);
    });

    it('should optimize functions', () => {
      const protocol = new SwarmIntelligenceProtocol({ swarmSize: 20, dimensions: 2, maxIterations: 50 });
      const sphere = (x) => -x.reduce((sum, xi) => sum + xi * xi, 0);
      const result = protocol.optimize(sphere);
      assert.ok(result.bestPosition);
      assert.ok(result.bestFitness > -100);
    });
  });

  describe('UnifiedIntelligenceEngine', () => {
    it('should integrate all protocols', () => {
      const engine = new UnifiedIntelligenceEngine();
      const status = engine.getStatus();
      assert.ok(status.quantum);
      assert.ok(status.temporal);
      assert.ok(status.swarm);
    });

    it('should reset all protocols', () => {
      const engine = new UnifiedIntelligenceEngine();
      engine.quantum.createState('test');
      engine.temporal.recordEvent({ x: 1 });
      engine.reset();
      assert.strictEqual(engine.quantum.states.size, 0);
      assert.strictEqual(engine.temporal.events.size, 0);
    });
  });
});
