/**
 * @medina/ux-ai-multi-engine — Full Test Suite
 *
 * Tests for UX Intelligence Engine, Multi-Engine Orchestrator,
 * UX Model Registry, Adaptive UX Runtime, and UX Telemetry Collector.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  UXIntelligenceEngine,
  MultiEngineOrchestrator,
  UXModelRegistry,
  COMPONENT_MODELS,
  INTERACTION_MODELS,
  LAYOUT_MODELS,
  AdaptiveUXRuntime,
  UXTelemetryCollector
} from '../src/index.js';

/* ====================================================================== */
/*  UX Intelligence Engine Tests                                           */
/* ====================================================================== */

describe('UXIntelligenceEngine', () => {
  describe('constructor', () => {
    it('creates engine with default config', () => {
      const engine = new UXIntelligenceEngine();
      assert.equal(engine.heartbeatMs, 873);
      assert.equal(engine.perceptionDepth, 5);
      assert.equal(engine.phase, 'idle');
      assert.equal(engine.cycleCount, 0);
    });

    it('accepts custom config', () => {
      const engine = new UXIntelligenceEngine({ heartbeatMs: 500, perceptionDepth: 10 });
      assert.equal(engine.heartbeatMs, 500);
      assert.equal(engine.perceptionDepth, 10);
    });
  });

  describe('Perception', () => {
    it('perceives user context and returns frame', () => {
      const engine = new UXIntelligenceEngine();
      const frame = engine.perceive({
        userId: 'user-1',
        deviceType: 'mobile',
        viewportWidth: 375,
        viewportHeight: 812,
        intent: 'purchase'
      });

      assert.equal(frame.userId, 'user-1');
      assert.equal(frame.deviceType, 'mobile');
      assert.equal(frame.viewportWidth, 375);
      assert.equal(frame.intent, 'purchase');
      assert.ok(frame.confidence > 0);
      assert.ok(frame.timestamp > 0);
    });

    it('applies defaults for missing signals', () => {
      const engine = new UXIntelligenceEngine();
      const frame = engine.perceive({ userId: 'user-2' });
      assert.equal(frame.deviceType, 'desktop');
      assert.equal(frame.viewportWidth, 1920);
      assert.equal(frame.intent, 'browse');
    });

    it('maintains bounded perception stack', () => {
      const engine = new UXIntelligenceEngine({ perceptionDepth: 3 });
      for (let i = 0; i < 20; i++) {
        engine.perceive({ userId: `user-${i}` });
      }
      // Max depth = ceil(3 * PHI) = ceil(4.854) = 5
      assert.ok(engine.perceptionStack.length <= 5);
    });

    it('calculates higher confidence with more signals', () => {
      const engine = new UXIntelligenceEngine();
      const minimal = engine.perceive({ userId: 'u1' });
      const full = engine.perceive({
        userId: 'u2',
        deviceType: 'tablet',
        viewportWidth: 768,
        viewportHeight: 1024,
        intent: 'search',
        context: { page: 'results' }
      });
      assert.ok(full.confidence >= minimal.confidence);
    });

    it('getLatestPerception returns last frame', () => {
      const engine = new UXIntelligenceEngine();
      engine.perceive({ userId: 'a' });
      engine.perceive({ userId: 'b' });
      const latest = engine.getLatestPerception();
      assert.equal(latest.userId, 'b');
    });

    it('getUserPerceptions filters by userId', () => {
      const engine = new UXIntelligenceEngine();
      engine.perceive({ userId: 'alice' });
      engine.perceive({ userId: 'bob' });
      engine.perceive({ userId: 'alice' });
      const alicePerceptions = engine.getUserPerceptions('alice');
      assert.equal(alicePerceptions.length, 2);
    });

    it('updates metrics correctly', () => {
      const engine = new UXIntelligenceEngine();
      engine.perceive({ userId: 'u1' });
      engine.perceive({ userId: 'u2' });
      assert.equal(engine.metrics.perceptionsProcessed, 2);
      assert.ok(engine.metrics.averageConfidence > 0);
    });
  });

  describe('Interaction', () => {
    it('records new interaction patterns', () => {
      const engine = new UXIntelligenceEngine();
      const pattern = engine.recordInteraction({
        type: 'click',
        target: 'buy-button',
        userId: 'user-1'
      });

      assert.equal(pattern.patternId, 'click:buy-button');
      assert.equal(pattern.type, 'click');
      assert.equal(pattern.frequency, 1);
      assert.ok(pattern.weight > 0);
    });

    it('accumulates frequency for repeated interactions', () => {
      const engine = new UXIntelligenceEngine();
      engine.recordInteraction({ type: 'click', target: 'nav' });
      engine.recordInteraction({ type: 'click', target: 'nav' });
      const result = engine.recordInteraction({ type: 'click', target: 'nav' });
      assert.equal(result.frequency, 3);
    });

    it('tracks interaction sequences', () => {
      const engine = new UXIntelligenceEngine();
      engine.recordInteraction({ type: 'hover', target: 'card' });
      engine.recordInteraction({ type: 'click', target: 'card' });
      const patterns = engine.getTopPatterns(10);
      assert.ok(patterns.length >= 1);
    });

    it('getTopPatterns returns sorted by weight', () => {
      const engine = new UXIntelligenceEngine();
      for (let i = 0; i < 10; i++) engine.recordInteraction({ type: 'click', target: 'popular' });
      for (let i = 0; i < 2; i++) engine.recordInteraction({ type: 'click', target: 'rare' });

      const top = engine.getTopPatterns(2);
      assert.equal(top[0].target, 'popular');
      assert.ok(top[0].weight > top[1].weight);
    });

    it('tracks unique users per pattern', () => {
      const engine = new UXIntelligenceEngine();
      engine.recordInteraction({ type: 'click', target: 'cta', userId: 'u1' });
      engine.recordInteraction({ type: 'click', target: 'cta', userId: 'u2' });
      engine.recordInteraction({ type: 'click', target: 'cta', userId: 'u1' });
      const patterns = engine.getTopPatterns(1);
      assert.equal(patterns[0].userCount, 2);
    });
  });

  describe('Adaptation', () => {
    it('adapts property toward target with phi-rate', () => {
      const engine = new UXIntelligenceEngine();
      const result = engine.adapt({
        property: 'density',
        target: 'main-grid',
        targetValue: 0.8
      });

      assert.equal(result.property, 'density');
      assert.equal(result.target, 'main-grid');
      assert.ok(result.newValue > result.oldValue);
      assert.ok(result.newValue < 0.8); // Hasn't converged in one step
    });

    it('converges toward target over multiple adaptations', () => {
      const engine = new UXIntelligenceEngine();
      let lastValue = 0;
      for (let i = 0; i < 10; i++) {
        const result = engine.adapt({ property: 'contrast', target: 'body', targetValue: 1.0 });
        assert.ok(result.newValue >= lastValue);
        lastValue = result.newValue;
      }
      assert.ok(lastValue > 0.8); // Should be close to 1.0
    });

    it('tracks adaptation history', () => {
      const engine = new UXIntelligenceEngine();
      engine.adapt({ property: 'speed', target: 'animation', targetValue: 0.3 });
      engine.adapt({ property: 'speed', target: 'animation', targetValue: 0.7 });
      const states = engine.getAdaptationStates();
      assert.ok(states.length >= 1);
      assert.equal(states[0].adaptationCount, 2);
    });

    it('returns convergence score', () => {
      const engine = new UXIntelligenceEngine();
      const result = engine.adapt({ property: 'layout', target: 'page', targetValue: 0.5 });
      assert.ok(result.convergence >= 0 && result.convergence <= 1);
    });
  });

  describe('Prediction', () => {
    it('predicts next actions from interaction patterns', () => {
      const engine = new UXIntelligenceEngine();
      // Build pattern: click → scroll → click
      engine.recordInteraction({ type: 'click', target: 'item' });
      engine.recordInteraction({ type: 'scroll', target: 'item' });
      engine.recordInteraction({ type: 'click', target: 'item' });

      const prediction = engine.predict('user-1', 'click');
      assert.equal(prediction.userId, 'user-1');
      assert.equal(prediction.currentAction, 'click');
      assert.ok(Array.isArray(prediction.predictions));
    });

    it('returns empty predictions when no patterns match', () => {
      const engine = new UXIntelligenceEngine();
      const prediction = engine.predict('user-1', 'unknown');
      assert.equal(prediction.predictions.length, 0);
    });

    it('limits predictions to horizon', () => {
      const engine = new UXIntelligenceEngine({ predictionHorizon: 2 });
      // Build diverse patterns
      for (let i = 0; i < 5; i++) {
        engine.recordInteraction({ type: 'click', target: `t${i}` });
        engine.recordInteraction({ type: 'hover', target: `t${i}` });
        engine.recordInteraction({ type: 'scroll', target: `t${i}` });
      }
      const prediction = engine.predict('u1', 'click');
      assert.ok(prediction.predictions.length <= 2);
    });

    it('updates prediction metrics', () => {
      const engine = new UXIntelligenceEngine();
      engine.predict('u1', 'click');
      engine.predict('u2', 'scroll');
      assert.equal(engine.metrics.predictionsMade, 2);
    });
  });

  describe('Generation', () => {
    it('generates component when confidence is sufficient', () => {
      const engine = new UXIntelligenceEngine({ generationThreshold: 0 });
      const result = engine.generate({ type: 'button', purpose: 'submit' });
      assert.equal(result.status, 'generated');
      assert.ok(result.component.componentId.startsWith('GEN-'));
      assert.equal(result.component.type, 'button');
      assert.equal(result.component.purpose, 'submit');
    });

    it('rejects generation below threshold', () => {
      const engine = new UXIntelligenceEngine({ generationThreshold: 0.99 });
      // Add low-confidence perceptions
      engine.perceive({ userId: 'u1' });
      const result = engine.generate({ type: 'card', purpose: 'display' });
      assert.equal(result.status, 'below-threshold');
    });

    it('incorporates adaptation state into properties', () => {
      const engine = new UXIntelligenceEngine({ generationThreshold: 0 });
      engine.adapt({ property: 'density', target: 'button', targetValue: 0.9 });
      const result = engine.generate({ type: 'button', purpose: 'action' });
      assert.equal(result.status, 'generated');
      assert.ok(result.component.properties.density !== undefined);
    });

    it('applies constraints to generated component', () => {
      const engine = new UXIntelligenceEngine({ generationThreshold: 0 });
      const result = engine.generate({ type: 'modal', purpose: 'alert', constraints: { size: 'large' } });
      assert.equal(result.component.properties.size, 'large');
    });

    it('tracks generated components', () => {
      const engine = new UXIntelligenceEngine({ generationThreshold: 0 });
      engine.generate({ type: 'a', purpose: 'x' });
      engine.generate({ type: 'b', purpose: 'y' });
      assert.equal(engine.getGeneratedComponents().length, 2);
      assert.equal(engine.metrics.componentsGenerated, 2);
    });
  });

  describe('Full Cycle', () => {
    it('runs a complete intelligence cycle', () => {
      const engine = new UXIntelligenceEngine({ generationThreshold: 0 });
      const result = engine.runCycle({
        signals: { userId: 'u1', intent: 'buy', context: { cart: true } },
        event: { type: 'click', target: 'checkout' },
        adaptation: { property: 'speed', target: 'checkout', targetValue: 0.9 },
        generateSpec: { type: 'button', purpose: 'confirm' }
      });

      assert.ok(result.perception);
      assert.ok(result.interaction);
      assert.ok(result.adaptation);
      assert.ok(result.generation);
      assert.equal(result.cycleId, 1);
      assert.ok(result.latencyMs >= 0);
    });

    it('handles partial cycle input', () => {
      const engine = new UXIntelligenceEngine();
      const result = engine.runCycle({ signals: { userId: 'u1' } });
      assert.ok(result.perception);
      assert.equal(result.interaction, null);
      assert.equal(result.adaptation, null);
    });

    it('increments cycle count', () => {
      const engine = new UXIntelligenceEngine();
      engine.runCycle({ signals: { userId: 'u1' } });
      engine.runCycle({ signals: { userId: 'u2' } });
      assert.equal(engine.cycleCount, 2);
    });
  });

  describe('Metrics', () => {
    it('returns comprehensive metrics', () => {
      const engine = new UXIntelligenceEngine();
      engine.perceive({ userId: 'u1' });
      engine.recordInteraction({ type: 'click', target: 'btn' });
      const metrics = engine.getMetrics();
      assert.equal(metrics.perceptionsProcessed, 1);
      assert.equal(metrics.interactionsAnalyzed, 1);
      assert.ok(metrics.phase);
      assert.ok('perceptionStackDepth' in metrics);
    });
  });
});

/* ====================================================================== */
/*  Multi-Engine Orchestrator Tests                                         */
/* ====================================================================== */

describe('MultiEngineOrchestrator', () => {
  describe('constructor', () => {
    it('creates orchestrator with defaults', () => {
      const orch = new MultiEngineOrchestrator();
      assert.equal(orch.maxEnginesPerType, 5);
      assert.equal(orch.circuitThreshold, 3);
      assert.equal(orch.status, 'idle');
    });
  });

  describe('Engine Registration', () => {
    it('registers engine with auto-generated ID', () => {
      const orch = new MultiEngineOrchestrator();
      const node = orch.registerEngine({ type: 'perception', capacity: 10 });
      assert.ok(node.engineId.startsWith('ENG-PERCEPTION-'));
      assert.equal(node.type, 'perception');
      assert.equal(node.status, 'ready');
      assert.equal(node.capacity, 10);
    });

    it('bulk-registers engines', () => {
      const orch = new MultiEngineOrchestrator();
      const nodes = orch.registerAll([
        { type: 'perception' },
        { type: 'interaction' },
        { type: 'adaptation' }
      ]);
      assert.equal(nodes.length, 3);
      assert.equal(orch.engines.size, 3);
    });

    it('indexes engines by type', () => {
      const orch = new MultiEngineOrchestrator();
      orch.registerEngine({ type: 'perception' });
      orch.registerEngine({ type: 'perception' });
      orch.registerEngine({ type: 'interaction' });
      assert.equal(orch.getEnginesByType('perception').length, 2);
      assert.equal(orch.getEnginesByType('interaction').length, 1);
    });

    it('deregisters engines', () => {
      const orch = new MultiEngineOrchestrator();
      const node = orch.registerEngine({ type: 'test' });
      assert.ok(orch.deregisterEngine(node.engineId));
      assert.equal(orch.engines.size, 0);
    });

    it('returns false for deregistering unknown engine', () => {
      const orch = new MultiEngineOrchestrator();
      assert.equal(orch.deregisterEngine('fake-id'), false);
    });
  });

  describe('Load Balancing', () => {
    it('selects engine with lowest load', () => {
      const orch = new MultiEngineOrchestrator();
      const e1 = orch.registerEngine({ type: 'perception', capacity: 10 });
      const e2 = orch.registerEngine({ type: 'perception', capacity: 10 });
      e1.load = 0.8;
      e2.load = 0.2;

      const selected = orch.selectEngine('perception');
      assert.equal(selected.engineId, e2.engineId);
    });

    it('returns null for unknown engine type', () => {
      const orch = new MultiEngineOrchestrator();
      assert.equal(orch.selectEngine('nonexistent'), null);
    });

    it('skips failed engines', () => {
      const orch = new MultiEngineOrchestrator();
      const e1 = orch.registerEngine({ type: 'perception' });
      orch.registerEngine({ type: 'perception' });
      e1.status = 'failed';

      const selected = orch.selectEngine('perception');
      assert.notEqual(selected.engineId, e1.engineId);
    });

    it('skips circuit-open engines', () => {
      const orch = new MultiEngineOrchestrator();
      const e1 = orch.registerEngine({ type: 'perception' });
      const e2 = orch.registerEngine({ type: 'perception' });
      e1.status = 'circuit-open';
      e1.circuitOpenedAt = Date.now(); // just opened

      const selected = orch.selectEngine('perception');
      assert.equal(selected.engineId, e2.engineId);
    });

    it('gives priority bonus to P0 tasks', () => {
      const orch = new MultiEngineOrchestrator();
      orch.registerEngine({ type: 'perception', capacity: 10 });
      const selected = orch.selectEngine('perception', 'P0');
      assert.ok(selected);
    });
  });

  describe('Task Dispatch', () => {
    it('dispatches task to available engine', () => {
      const orch = new MultiEngineOrchestrator();
      orch.registerEngine({ type: 'perception' });
      const task = orch.dispatch({ type: 'perception', payload: { data: 'test' } });

      assert.ok(task.taskId);
      assert.equal(task.type, 'perception');
      assert.equal(task.status, 'assigned');
      assert.ok(task.assignedEngine);
    });

    it('queues task when no engine available', () => {
      const orch = new MultiEngineOrchestrator();
      const task = orch.dispatch({ type: 'unknown', payload: {} });
      assert.equal(task.status, 'queued');
      assert.equal(task.assignedEngine, null);
    });

    it('uses preferred engine when specified', () => {
      const orch = new MultiEngineOrchestrator();
      const e1 = orch.registerEngine({ type: 'perception' });
      orch.registerEngine({ type: 'perception' });

      const task = orch.dispatch({ type: 'perception', payload: {}, preferredEngine: e1.engineId });
      assert.equal(task.assignedEngine, e1.engineId);
    });

    it('increases engine load on dispatch', () => {
      const orch = new MultiEngineOrchestrator();
      const engine = orch.registerEngine({ type: 'perception', capacity: 5 });
      orch.dispatch({ type: 'perception', payload: {} });
      assert.ok(engine.load > 0);
    });

    it('marks engine as busy at high load', () => {
      const orch = new MultiEngineOrchestrator();
      const engine = orch.registerEngine({ type: 'perception', capacity: 2 });
      orch.dispatch({ type: 'perception', payload: {} });
      orch.dispatch({ type: 'perception', payload: {} });
      assert.equal(engine.status, 'busy');
    });
  });

  describe('Task Execution', () => {
    it('executes task and returns result', () => {
      const orch = new MultiEngineOrchestrator();
      orch.registerEngine({ type: 'perception' });
      const task = orch.dispatch({ type: 'perception', payload: {} });
      const result = orch.execute(task.taskId);

      assert.equal(result.status, 'completed');
      assert.ok(result.engineId);
      assert.ok(result.durationMs >= 0);
    });

    it('throws for unknown task', () => {
      const orch = new MultiEngineOrchestrator();
      assert.throws(() => orch.execute('fake-id'), /Task not found/);
    });

    it('returns queued status for unassigned tasks', () => {
      const orch = new MultiEngineOrchestrator();
      const task = orch.dispatch({ type: 'unknown', payload: {} });
      const result = orch.execute(task.taskId);
      assert.equal(result.status, 'queued');
    });

    it('updates engine metrics after execution', () => {
      const orch = new MultiEngineOrchestrator();
      const engine = orch.registerEngine({ type: 'perception' });
      const task = orch.dispatch({ type: 'perception', payload: {} });
      orch.execute(task.taskId);
      assert.equal(engine.tasksProcessed, 1);
    });

    it('updates orchestrator metrics', () => {
      const orch = new MultiEngineOrchestrator();
      orch.registerEngine({ type: 'perception' });
      const task = orch.dispatch({ type: 'perception', payload: {} });
      orch.execute(task.taskId);
      assert.equal(orch.metrics.totalCompleted, 1);
    });
  });

  describe('Failover', () => {
    it('fails over to another engine when primary fails', () => {
      const orch = new MultiEngineOrchestrator();
      const e1 = orch.registerEngine({ type: 'perception' });
      orch.registerEngine({ type: 'perception' });

      const task = orch.dispatch({ type: 'perception', payload: {}, preferredEngine: e1.engineId });
      e1.status = 'failed';

      const result = orch.execute(task.taskId);
      assert.ok(result.status === 'completed-via-failover');
      assert.ok(orch.metrics.totalFailovers > 0);
    });

    it('fails when no failover available', () => {
      const orch = new MultiEngineOrchestrator();
      const e1 = orch.registerEngine({ type: 'perception' });

      const task = orch.dispatch({ type: 'perception', payload: {} });
      e1.status = 'failed';

      const result = orch.execute(task.taskId);
      assert.equal(result.status, 'failed');
    });

    it('respects allowFailover=false', () => {
      const orch = new MultiEngineOrchestrator();
      const e1 = orch.registerEngine({ type: 'perception' });
      orch.registerEngine({ type: 'perception' });

      const task = orch.dispatch({ type: 'perception', payload: {}, allowFailover: false });
      e1.status = 'failed';
      // Manually set the task to use e1
      const record = orch.getTask(task.taskId);
      record.assignedEngine = e1.engineId;

      const result = orch.execute(task.taskId);
      assert.equal(result.status, 'failed');
    });
  });

  describe('Circuit Breaker', () => {
    it('opens circuit after threshold failures', () => {
      const orch = new MultiEngineOrchestrator({ circuitThreshold: 2 });
      const engine = orch.registerEngine({ type: 'perception' });

      orch.simulateEngineFailure(engine.engineId);
      assert.equal(engine.status, 'degraded');

      orch.simulateEngineFailure(engine.engineId);
      assert.equal(engine.status, 'circuit-open');
      assert.equal(orch.metrics.totalCircuitBreaks, 1);
    });

    it('resets circuit after timeout', () => {
      const orch = new MultiEngineOrchestrator({ circuitThreshold: 1, circuitResetMs: 0 });
      const engine = orch.registerEngine({ type: 'perception' });
      orch.registerEngine({ type: 'perception' }); // backup

      orch.simulateEngineFailure(engine.engineId);
      assert.equal(engine.status, 'circuit-open');

      // With circuitResetMs=0, it should reset on next selection
      const selected = orch.selectEngine('perception');
      assert.ok(selected); // should find an engine
    });
  });

  describe('Heartbeat', () => {
    it('returns health report', () => {
      const orch = new MultiEngineOrchestrator();
      orch.registerEngine({ type: 'perception' });
      orch.registerEngine({ type: 'interaction' });
      const report = orch.heartbeat();
      assert.equal(report.total, 2);
      assert.equal(report.healthy, 2);
    });

    it('processes queue during heartbeat', () => {
      const orch = new MultiEngineOrchestrator();
      // Queue a task with no engines
      orch.dispatch({ type: 'perception', payload: {} });
      assert.equal(orch.queue.length, 1);

      // Register engine and heartbeat
      orch.registerEngine({ type: 'perception' });
      orch.heartbeat();
      assert.equal(orch.queue.length, 0);
    });
  });

  describe('Lifecycle', () => {
    it('starts and shuts down', () => {
      const orch = new MultiEngineOrchestrator();
      orch.registerEngine({ type: 'perception' });
      const startResult = orch.start();
      assert.equal(startResult.status, 'running');

      const shutdownResult = orch.shutdown();
      assert.equal(shutdownResult.status, 'shutdown');
    });

    it('lists engine types', () => {
      const orch = new MultiEngineOrchestrator();
      orch.registerEngine({ type: 'perception' });
      orch.registerEngine({ type: 'interaction' });
      const types = orch.listEngineTypes();
      assert.ok(types.includes('perception'));
      assert.ok(types.includes('interaction'));
    });

    it('provides engine distribution', () => {
      const orch = new MultiEngineOrchestrator();
      orch.registerEngine({ type: 'perception' });
      orch.registerEngine({ type: 'perception' });
      orch.registerEngine({ type: 'adaptation' });
      const dist = orch.getEngineDistribution();
      assert.equal(dist.perception, 2);
      assert.equal(dist.adaptation, 1);
    });
  });

  describe('Events', () => {
    it('emits dispatch events', () => {
      const orch = new MultiEngineOrchestrator();
      orch.registerEngine({ type: 'perception' });

      let emitted = null;
      orch.on('dispatch', (data) => { emitted = data; });
      orch.dispatch({ type: 'perception', payload: {} });
      assert.ok(emitted);
      assert.ok(emitted.taskId);
    });

    it('emits complete events', () => {
      const orch = new MultiEngineOrchestrator();
      orch.registerEngine({ type: 'perception' });

      let emitted = null;
      orch.on('complete', (data) => { emitted = data; });
      const task = orch.dispatch({ type: 'perception', payload: {} });
      orch.execute(task.taskId);
      assert.ok(emitted);
    });
  });
});

/* ====================================================================== */
/*  UX Model Registry Tests                                                */
/* ====================================================================== */

describe('UXModelRegistry', () => {
  describe('initialization', () => {
    it('initializes with 30 models', () => {
      const registry = new UXModelRegistry();
      assert.equal(registry.models.size, 30);
    });

    it('has 10 component models', () => {
      const registry = new UXModelRegistry();
      assert.equal(registry.getByCategory('component').length, 10);
    });

    it('has 10 interaction models', () => {
      const registry = new UXModelRegistry();
      assert.equal(registry.getByCategory('interaction').length, 10);
    });

    it('has 10 layout models', () => {
      const registry = new UXModelRegistry();
      assert.equal(registry.getByCategory('layout').length, 10);
    });

    it('each model has 5 capabilities', () => {
      const registry = new UXModelRegistry();
      for (const model of registry.listModels()) {
        assert.equal(model.capabilities.length, 5);
      }
    });

    it('all models have phi-encoded priority scores', () => {
      const registry = new UXModelRegistry();
      for (const model of registry.listModels()) {
        assert.ok(model.priorityScore > 0);
        assert.ok(model.phiWeight > 0);
      }
    });
  });

  describe('query methods', () => {
    it('getModel returns specific model', () => {
      const registry = new UXModelRegistry();
      const model = registry.getModel('UXM-C01');
      assert.equal(model.name, 'ButtonIntelligence');
      assert.equal(model.category, 'component');
    });

    it('findByCapability returns matching models', () => {
      const registry = new UXModelRegistry();
      const models = registry.findByCapability('click-prediction');
      assert.ok(models.length > 0);
      assert.ok(models.some(m => m.modelId === 'UXM-C01'));
    });

    it('search finds models by name', () => {
      const registry = new UXModelRegistry();
      const results = registry.search('intelligence');
      assert.ok(results.length > 0);
    });

    it('search is case-insensitive', () => {
      const registry = new UXModelRegistry();
      const results = registry.search('BUTTON');
      assert.ok(results.length > 0);
    });

    it('getTopModels returns sorted by priority', () => {
      const registry = new UXModelRegistry();
      const top = registry.getTopModels(5);
      assert.equal(top.length, 5);
      for (let i = 1; i < top.length; i++) {
        assert.ok(top[i - 1].priorityScore >= top[i].priorityScore);
      }
    });

    it('listCapabilities returns all unique capabilities', () => {
      const registry = new UXModelRegistry();
      const caps = registry.listCapabilities();
      assert.ok(caps.length >= 140); // 30 models × 5 caps, some shared across models
      assert.ok(caps.length <= 150);
    });

    it('listCategories returns 3 categories', () => {
      const registry = new UXModelRegistry();
      const cats = registry.listCategories();
      assert.equal(cats.length, 3);
      assert.ok(cats.includes('component'));
      assert.ok(cats.includes('interaction'));
      assert.ok(cats.includes('layout'));
    });

    it('getStats returns aggregate statistics', () => {
      const registry = new UXModelRegistry();
      const stats = registry.getStats();
      assert.equal(stats.totalModels, 30);
      assert.equal(stats.categories.component, 10);
      assert.ok(stats.averagePriority > 0);
    });
  });

  describe('exported constants', () => {
    it('COMPONENT_MODELS has 10 entries', () => {
      assert.equal(COMPONENT_MODELS.length, 10);
    });

    it('INTERACTION_MODELS has 10 entries', () => {
      assert.equal(INTERACTION_MODELS.length, 10);
    });

    it('LAYOUT_MODELS has 10 entries', () => {
      assert.equal(LAYOUT_MODELS.length, 10);
    });
  });
});

/* ====================================================================== */
/*  Adaptive UX Runtime Tests                                              */
/* ====================================================================== */

describe('AdaptiveUXRuntime', () => {
  describe('constructor', () => {
    it('creates runtime with defaults', () => {
      const runtime = new AdaptiveUXRuntime();
      assert.equal(runtime.heartbeatMs, 873);
      assert.equal(runtime.status, 'idle');
      assert.equal(runtime.maxVariants, 4);
    });
  });

  describe('A/B Testing', () => {
    it('creates a test with variants', () => {
      const runtime = new AdaptiveUXRuntime();
      const test = runtime.createTest({
        name: 'button-color',
        variants: [
          { variantId: 'blue', config: { color: '#0000ff' } },
          { variantId: 'green', config: { color: '#00ff00' } }
        ]
      });

      assert.ok(test.testId.startsWith('ABT-'));
      assert.equal(test.name, 'button-color');
      assert.equal(test.variants.length, 2);
      assert.equal(test.status, 'running');
    });

    it('rejects test with fewer than 2 variants', () => {
      const runtime = new AdaptiveUXRuntime();
      assert.throws(() => runtime.createTest({ name: 'bad', variants: [{ variantId: 'a' }] }));
    });

    it('rejects test exceeding max variants', () => {
      const runtime = new AdaptiveUXRuntime({ maxVariants: 2 });
      assert.throws(() => runtime.createTest({
        name: 'too-many',
        variants: [{ variantId: 'a' }, { variantId: 'b' }, { variantId: 'c' }]
      }));
    });

    it('allocates user to variant deterministically', () => {
      const runtime = new AdaptiveUXRuntime();
      const test = runtime.createTest({
        name: 'test1',
        variants: [{ variantId: 'A' }, { variantId: 'B' }]
      });

      const alloc1 = runtime.allocateUser(test.testId, 'user-123');
      const alloc2 = runtime.allocateUser(test.testId, 'user-123');
      assert.equal(alloc1.variantId, alloc2.variantId);
      assert.equal(alloc2.cached, true);
    });

    it('distributes users across variants', () => {
      const runtime = new AdaptiveUXRuntime();
      const test = runtime.createTest({
        name: 'dist-test',
        variants: [{ variantId: 'A' }, { variantId: 'B' }]
      });

      const variants = new Set();
      for (let i = 0; i < 100; i++) {
        const alloc = runtime.allocateUser(test.testId, `user-${i}`);
        variants.add(alloc.variantId);
      }
      assert.equal(variants.size, 2); // Both variants should be used
    });

    it('records conversions', () => {
      const runtime = new AdaptiveUXRuntime();
      const test = runtime.createTest({
        name: 'conv-test',
        variants: [{ variantId: 'A' }, { variantId: 'B' }]
      });

      runtime.allocateUser(test.testId, 'u1');
      const result = runtime.recordConversion(test.testId, 'u1', 0.8);
      assert.ok(result.conversions > 0);
    });

    it('concludes test and determines winner', () => {
      const runtime = new AdaptiveUXRuntime();
      const test = runtime.createTest({
        name: 'winner-test',
        variants: [{ variantId: 'A' }, { variantId: 'B' }]
      });

      // Simulate: all users in A convert, none in B
      for (let i = 0; i < 50; i++) {
        const alloc = runtime.allocateUser(test.testId, `user-${i}`);
        if (alloc.variantId === 'A') {
          runtime.recordConversion(test.testId, `user-${i}`, 1);
        }
      }

      const conclusion = runtime.concludeTest(test.testId);
      assert.ok(conclusion.winner);
      assert.ok(conclusion.variants.length === 2);
    });

    it('getTestStatus returns test info', () => {
      const runtime = new AdaptiveUXRuntime();
      const test = runtime.createTest({
        name: 'status-test',
        variants: [{ variantId: 'X' }, { variantId: 'Y' }]
      });

      const status = runtime.getTestStatus(test.testId);
      assert.equal(status.name, 'status-test');
      assert.equal(status.status, 'running');
    });
  });

  describe('Personalization', () => {
    it('creates a new profile', () => {
      const runtime = new AdaptiveUXRuntime();
      const profile = runtime.setProfile('user-1', { theme: 'dark', density: 0.8 });
      assert.equal(profile.userId, 'user-1');
      assert.equal(profile.preferences.theme, 'dark');
    });

    it('merges preferences with phi-weighted decay for numbers', () => {
      const runtime = new AdaptiveUXRuntime();
      runtime.setProfile('user-1', { density: 0.5 });
      const updated = runtime.setProfile('user-1', { density: 0.9 });
      // Should be between 0.5 and 0.9, weighted toward 0.9
      assert.ok(updated.preferences.density > 0.5);
      assert.ok(updated.preferences.density < 0.9);
    });

    it('getProfile returns profile data', () => {
      const runtime = new AdaptiveUXRuntime();
      runtime.setProfile('user-1', { color: 'blue' });
      const profile = runtime.getProfile('user-1');
      assert.equal(profile.userId, 'user-1');
      assert.equal(profile.preferences.color, 'blue');
    });

    it('returns undefined for unknown user', () => {
      const runtime = new AdaptiveUXRuntime();
      assert.equal(runtime.getProfile('nobody'), undefined);
    });

    it('updates engagement score', () => {
      const runtime = new AdaptiveUXRuntime();
      runtime.setProfile('user-1', {});
      const result = runtime.updateEngagement('user-1', 0.5);
      assert.ok(result.engagementScore > 0.5);
    });

    it('clamps engagement to 0–1', () => {
      const runtime = new AdaptiveUXRuntime();
      runtime.setProfile('user-1', {});
      runtime.updateEngagement('user-1', 10); // way above
      const profile = runtime.getProfile('user-1');
      assert.ok(profile.engagementScore <= 1);
    });
  });

  describe('UX Mutations', () => {
    it('applies and records mutations', () => {
      const runtime = new AdaptiveUXRuntime();
      const mutation = runtime.applyMutation({
        target: 'header',
        property: 'opacity',
        value: 0.9,
        reason: 'engagement-drop'
      });

      assert.ok(mutation.mutationId.startsWith('MUT-'));
      assert.equal(mutation.target, 'header');
      assert.equal(mutation.property, 'opacity');
      assert.equal(mutation.value, 0.9);
    });

    it('getRecentMutations returns bounded list', () => {
      const runtime = new AdaptiveUXRuntime();
      for (let i = 0; i < 5; i++) {
        runtime.applyMutation({ target: `el-${i}`, property: 'x', value: i });
      }
      const recent = runtime.getRecentMutations(3);
      assert.equal(recent.length, 3);
    });
  });

  describe('Runtime Pulse', () => {
    it('executes pulse and increments count', () => {
      const runtime = new AdaptiveUXRuntime();
      const report = runtime.pulse();
      assert.equal(report.pulse, 1);
      assert.equal(runtime.status, 'running');
    });

    it('getMetrics returns runtime metrics', () => {
      const runtime = new AdaptiveUXRuntime();
      runtime.pulse();
      const metrics = runtime.getMetrics();
      assert.equal(metrics.pulseCount, 1);
      assert.equal(metrics.status, 'running');
    });
  });
});

/* ====================================================================== */
/*  UX Telemetry Collector Tests                                           */
/* ====================================================================== */

describe('UXTelemetryCollector', () => {
  describe('constructor', () => {
    it('creates collector with defaults', () => {
      const collector = new UXTelemetryCollector();
      assert.equal(collector.heatmapGridSize, 20);
      assert.equal(collector.maxEvents, 10000);
    });
  });

  describe('Event Collection', () => {
    it('records events with auto-incrementing ID', () => {
      const collector = new UXTelemetryCollector();
      const e1 = collector.record({ type: 'click', sessionId: 's1' });
      const e2 = collector.record({ type: 'scroll', sessionId: 's1' });
      assert.equal(e1.eventId, 1);
      assert.equal(e2.eventId, 2);
    });

    it('records batch events', () => {
      const collector = new UXTelemetryCollector();
      const count = collector.recordBatch([
        { type: 'click', sessionId: 's1' },
        { type: 'scroll', sessionId: 's1' },
        { type: 'pageview', sessionId: 's1', pageId: 'home' }
      ]);
      assert.equal(count, 3);
      assert.equal(collector.metrics.totalEvents, 3);
    });

    it('trims events beyond maxEvents', () => {
      const collector = new UXTelemetryCollector({ maxEvents: 5 });
      for (let i = 0; i < 10; i++) {
        collector.record({ type: 'click', sessionId: 's1' });
      }
      assert.equal(collector.events.length, 5);
    });

    it('updates type-specific metrics', () => {
      const collector = new UXTelemetryCollector();
      collector.record({ type: 'click', sessionId: 's1' });
      collector.record({ type: 'click', sessionId: 's1' });
      collector.record({ type: 'scroll', sessionId: 's1' });
      collector.record({ type: 'pageview', sessionId: 's1', pageId: 'p1' });

      assert.equal(collector.metrics.totalClicks, 2);
      assert.equal(collector.metrics.totalScrolls, 1);
      assert.equal(collector.metrics.totalPageViews, 1);
    });

    it('getEventDistribution returns counts by type', () => {
      const collector = new UXTelemetryCollector();
      collector.record({ type: 'click', sessionId: 's1' });
      collector.record({ type: 'click', sessionId: 's1' });
      collector.record({ type: 'hover', sessionId: 's1' });

      const dist = collector.getEventDistribution();
      assert.equal(dist.click, 2);
      assert.equal(dist.hover, 1);
    });
  });

  describe('Sessions', () => {
    it('creates session on first event', () => {
      const collector = new UXTelemetryCollector();
      collector.record({ type: 'pageview', sessionId: 'session-1', pageId: 'home' });
      const session = collector.getSession('session-1');
      assert.ok(session);
      assert.equal(session.sessionId, 'session-1');
      assert.equal(session.pageViews, 1);
    });

    it('accumulates events in session', () => {
      const collector = new UXTelemetryCollector();
      collector.record({ type: 'pageview', sessionId: 's1', pageId: 'home' });
      collector.record({ type: 'click', sessionId: 's1' });
      collector.record({ type: 'scroll', sessionId: 's1' });

      const session = collector.getSession('s1');
      assert.equal(session.eventCount, 3);
      assert.equal(session.clicks, 1);
      assert.equal(session.scrolls, 1);
    });

    it('tracks unique pages visited', () => {
      const collector = new UXTelemetryCollector();
      collector.record({ type: 'pageview', sessionId: 's1', pageId: 'home' });
      collector.record({ type: 'pageview', sessionId: 's1', pageId: 'about' });
      collector.record({ type: 'pageview', sessionId: 's1', pageId: 'home' });

      const session = collector.getSession('s1');
      assert.equal(session.pages.length, 2);
    });

    it('ends session and calculates metrics', () => {
      const collector = new UXTelemetryCollector();
      collector.record({ type: 'pageview', sessionId: 's1', pageId: 'home' });
      collector.record({ type: 'click', sessionId: 's1' });
      collector.record({ type: 'pageview', sessionId: 's1', pageId: 'about' });

      const result = collector.endSession('s1');
      assert.ok(result.duration >= 0);
      assert.ok(result.engagement >= 0);
      assert.equal(result.isBounce, false); // 2 pageviews
    });

    it('detects bounce sessions', () => {
      const collector = new UXTelemetryCollector();
      collector.record({ type: 'pageview', sessionId: 's1', pageId: 'home' });
      const result = collector.endSession('s1');
      assert.equal(result.isBounce, true);
    });

    it('getSessionEvents returns events for session', () => {
      const collector = new UXTelemetryCollector();
      collector.record({ type: 'click', sessionId: 's1' });
      collector.record({ type: 'click', sessionId: 's2' });
      collector.record({ type: 'scroll', sessionId: 's1' });

      const events = collector.getSessionEvents('s1');
      assert.equal(events.length, 2);
    });
  });

  describe('Heatmap', () => {
    it('updates heatmap on click events with coordinates', () => {
      const collector = new UXTelemetryCollector({ heatmapGridSize: 10 });
      collector.record({ type: 'click', sessionId: 's1', x: 0.5, y: 0.5 });
      collector.record({ type: 'click', sessionId: 's1', x: 0.5, y: 0.5 });
      collector.record({ type: 'click', sessionId: 's1', x: 0.1, y: 0.1 });

      const heatmap = collector.getHeatmap();
      assert.ok(heatmap.length > 0);
      assert.equal(heatmap[0].intensity, 1); // Most intense cell
    });

    it('getHotspots returns high-intensity cells', () => {
      const collector = new UXTelemetryCollector({ heatmapGridSize: 10 });
      // Create a hotspot
      for (let i = 0; i < 10; i++) {
        collector.record({ type: 'click', sessionId: 's1', x: 0.5, y: 0.5 });
      }
      collector.record({ type: 'click', sessionId: 's1', x: 0.1, y: 0.9 });

      const hotspots = collector.getHotspots(0.5);
      assert.ok(hotspots.length > 0);
      assert.ok(hotspots[0].intensity >= 0.5);
    });

    it('handles edge coordinates', () => {
      const collector = new UXTelemetryCollector({ heatmapGridSize: 10 });
      collector.record({ type: 'click', sessionId: 's1', x: 0, y: 0 });
      collector.record({ type: 'click', sessionId: 's1', x: 0.99, y: 0.99 });
      const heatmap = collector.getHeatmap();
      assert.ok(heatmap.length === 2);
    });
  });

  describe('Flow Analysis', () => {
    it('builds flow graph from pageviews', () => {
      const collector = new UXTelemetryCollector();
      collector.record({ type: 'pageview', sessionId: 's1', pageId: 'home' });
      collector.record({ type: 'pageview', sessionId: 's1', pageId: 'products' });
      collector.record({ type: 'pageview', sessionId: 's1', pageId: 'checkout' });

      const graph = collector.getFlowGraph();
      assert.ok(graph.length >= 3);
    });

    it('tracks entry pages', () => {
      const collector = new UXTelemetryCollector();
      collector.record({ type: 'pageview', sessionId: 's1', pageId: 'home' });
      collector.record({ type: 'pageview', sessionId: 's2', pageId: 'home' });
      collector.record({ type: 'pageview', sessionId: 's3', pageId: 'blog' });

      const entries = collector.getTopEntryPages(5);
      assert.ok(entries.length > 0);
      assert.equal(entries[0].pageId, 'home');
      assert.equal(entries[0].entries, 2);
    });

    it('detects drop-off points', () => {
      const collector = new UXTelemetryCollector();
      // Session 1: home → products (no exit from home)
      collector.record({ type: 'pageview', sessionId: 's1', pageId: 'home' });
      collector.record({ type: 'pageview', sessionId: 's1', pageId: 'products' });
      // products is a drop-off (no further navigation)

      const dropoffs = collector.getDropOffPoints(0);
      assert.ok(dropoffs.length > 0);
    });

    it('tracks transitions between pages', () => {
      const collector = new UXTelemetryCollector();
      collector.record({ type: 'pageview', sessionId: 's1', pageId: 'home' });
      collector.record({ type: 'pageview', sessionId: 's1', pageId: 'about' });

      const graph = collector.getFlowGraph();
      const homeNode = graph.find(n => n.pageId === 'home');
      assert.ok(homeNode);
      assert.equal(homeNode.transitions.about, 1);
    });
  });

  describe('Metrics & Reset', () => {
    it('getMetrics returns all metrics', () => {
      const collector = new UXTelemetryCollector();
      collector.record({ type: 'click', sessionId: 's1' });
      const metrics = collector.getMetrics();
      assert.equal(metrics.totalEvents, 1);
      assert.equal(metrics.totalClicks, 1);
    });

    it('reset clears all data', () => {
      const collector = new UXTelemetryCollector();
      collector.record({ type: 'click', sessionId: 's1' });
      collector.record({ type: 'pageview', sessionId: 's1', pageId: 'home' });
      collector.reset();

      assert.equal(collector.events.length, 0);
      assert.equal(collector.sessions.size, 0);
      assert.equal(collector.metrics.totalEvents, 0);
    });
  });
});

/* ====================================================================== */
/*  Integration Tests                                                      */
/* ====================================================================== */

describe('Integration: Full UX AI Pipeline', () => {
  it('connects intelligence engine to orchestrator', () => {
    const intelligence = new UXIntelligenceEngine({ generationThreshold: 0 });
    const orchestrator = new MultiEngineOrchestrator();

    // Register engines for each intelligence type
    orchestrator.registerAll([
      { type: 'perception', capacity: 10 },
      { type: 'interaction', capacity: 10 },
      { type: 'adaptation', capacity: 10 },
      { type: 'prediction', capacity: 5 },
      { type: 'generation', capacity: 5 }
    ]);

    orchestrator.start();

    // Run intelligence cycle
    const cycle = intelligence.runCycle({
      signals: { userId: 'u1', intent: 'explore', context: { source: 'search' } },
      event: { type: 'click', target: 'result-card' },
      adaptation: { property: 'density', target: 'results', targetValue: 0.7 },
      generateSpec: { type: 'card', purpose: 'result' }
    });

    // Dispatch results through orchestrator
    const task = orchestrator.dispatch({
      type: 'perception',
      payload: cycle.perception,
      priority: 'P1'
    });

    const result = orchestrator.execute(task.taskId);
    assert.equal(result.status, 'completed');
  });

  it('connects model registry to orchestrator', () => {
    const registry = new UXModelRegistry();
    const orchestrator = new MultiEngineOrchestrator();

    // Register engines based on model categories
    const categories = registry.listCategories();
    for (const category of categories) {
      const models = registry.getByCategory(category);
      orchestrator.registerEngine({ type: models[0].engineType, capacity: models.length });
    }

    assert.equal(orchestrator.listEngineTypes().length, 3);
  });

  it('connects telemetry to adaptive runtime', () => {
    const collector = new UXTelemetryCollector();
    const runtime = new AdaptiveUXRuntime();

    // Create A/B test
    const test = runtime.createTest({
      name: 'layout-test',
      variants: [{ variantId: 'grid' }, { variantId: 'list' }]
    });

    // Simulate user sessions with telemetry
    for (let i = 0; i < 20; i++) {
      const sessionId = `s-${i}`;
      const userId = `user-${i}`;

      // Allocate to test
      runtime.allocateUser(test.testId, userId);

      // Collect telemetry
      collector.record({ type: 'pageview', sessionId, pageId: 'home', userId });
      collector.record({ type: 'click', sessionId, x: 0.5, y: 0.3 });

      // Record engagement
      runtime.setProfile(userId, { layout: 'grid' });
    }

    // Verify telemetry collected
    assert.equal(collector.metrics.totalPageViews, 20);
    assert.equal(collector.metrics.totalClicks, 20);
    assert.equal(runtime.metrics.totalProfiles, 20);
  });

  it('full pipeline: perceive → route → adapt → test → measure', () => {
    const intelligence = new UXIntelligenceEngine({ generationThreshold: 0 });
    const orchestrator = new MultiEngineOrchestrator();
    const registry = new UXModelRegistry();
    const runtime = new AdaptiveUXRuntime();
    const collector = new UXTelemetryCollector();

    // Setup
    orchestrator.registerAll([
      { type: 'perception', capacity: 20 },
      { type: 'interaction', capacity: 20 },
      { type: 'adaptation', capacity: 20 }
    ]);
    orchestrator.start();

    const test = runtime.createTest({
      name: 'full-pipeline',
      variants: [{ variantId: 'v1' }, { variantId: 'v2' }]
    });

    // Simulate 10 users through the pipeline
    for (let i = 0; i < 10; i++) {
      const userId = `pipeline-user-${i}`;

      // 1. Perceive
      const perception = intelligence.perceive({ userId, intent: 'browse', deviceType: 'mobile' });

      // 2. Route through orchestrator
      const task = orchestrator.dispatch({ type: 'perception', payload: perception });
      orchestrator.execute(task.taskId);

      // 3. Adapt
      intelligence.adapt({ property: 'density', target: 'feed', targetValue: 0.6 });

      // 4. A/B test
      runtime.allocateUser(test.testId, userId);

      // 5. Collect telemetry
      collector.record({ type: 'pageview', sessionId: `s-${i}`, pageId: 'feed', userId });
    }

    // Verify full pipeline
    assert.equal(intelligence.metrics.perceptionsProcessed, 10);
    assert.equal(orchestrator.metrics.totalCompleted, 10);
    assert.equal(intelligence.metrics.adaptationsApplied, 10);
    assert.equal(collector.metrics.totalPageViews, 10);
    assert.equal(runtime.metrics.totalAllocations, 10);
  });
});
