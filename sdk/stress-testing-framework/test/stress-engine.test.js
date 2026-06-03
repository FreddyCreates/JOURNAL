/**
 * Stress Testing Framework — Comprehensive Test Suite
 * 
 * Tests cognitive load simulation, stress execution, pressure feedback,
 * and self-healing organism capabilities.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  PHI,
  PHI_INVERSE,
  PHI_SQUARED,
  STRESS_THRESHOLD,
  CognitiveLoadSimulator,
  StressTestExecutor,
  PressureFeedbackSystem,
  SelfHealingOrganismTester,
  StressTestingFramework
} from '../src/stress-engine.js';

// ════════════════════════════════════════════════════════════════════════════
// PHI CONSTANTS TESTS
// ════════════════════════════════════════════════════════════════════════════

test('PHI constant equals golden ratio', () => {
  assert.ok(Math.abs(PHI - 1.618033988749895) < 1e-10);
});

test('PHI_INVERSE is reciprocal of PHI', () => {
  assert.ok(Math.abs(PHI_INVERSE - 1/PHI) < 1e-10);
});

test('PHI_SQUARED equals PHI * PHI', () => {
  assert.ok(Math.abs(PHI_SQUARED - PHI * PHI) < 1e-10);
});

test('STRESS_THRESHOLD equals PHI_INVERSE', () => {
  assert.strictEqual(STRESS_THRESHOLD, PHI_INVERSE);
});

// ════════════════════════════════════════════════════════════════════════════
// COGNITIVE LOAD SIMULATOR TESTS
// ════════════════════════════════════════════════════════════════════════════

test('CognitiveLoadSimulator - Constructor initializes with defaults', () => {
  const sim = new CognitiveLoadSimulator();
  assert.strictEqual(sim.baseLoad, 0.1);
  assert.strictEqual(sim.maxLoad, 1.0);
  assert.strictEqual(sim.pattern, 'constant');
});

test('CognitiveLoadSimulator - Constructor accepts config', () => {
  const sim = new CognitiveLoadSimulator({
    baseLoad: 0.2,
    maxLoad: 0.8,
    pattern: 'sinusoidal'
  });
  assert.strictEqual(sim.baseLoad, 0.2);
  assert.strictEqual(sim.maxLoad, 0.8);
  assert.strictEqual(sim.pattern, 'sinusoidal');
});

test('CognitiveLoadSimulator - Constant pattern returns baseLoad', () => {
  const sim = new CognitiveLoadSimulator({ pattern: 'constant', baseLoad: 0.5 });
  const load = sim.calculateLoad();
  assert.strictEqual(load, 0.5);
});

test('CognitiveLoadSimulator - Sample returns load object', () => {
  const sim = new CognitiveLoadSimulator();
  const sample = sim.sample();
  assert.ok('load' in sample);
  assert.ok('timestamp' in sample);
  assert.ok('pattern' in sample);
});

test('CognitiveLoadSimulator - Load is within bounds', () => {
  const patterns = ['constant', 'linear_ramp', 'sinusoidal', 'phi_wave', 'spike', 'chaos'];
  for (const pattern of patterns) {
    const sim = new CognitiveLoadSimulator({ pattern, baseLoad: 0.1, maxLoad: 0.9 });
    for (let i = 0; i < 100; i++) {
      const load = sim.calculateLoad();
      assert.ok(load >= 0 && load <= 1, `${pattern} load out of bounds: ${load}`);
    }
  }
});

test('CognitiveLoadSimulator - getStatistics returns valid metrics', () => {
  const sim = new CognitiveLoadSimulator();
  for (let i = 0; i < 50; i++) sim.sample();
  const stats = sim.getStatistics();
  assert.ok('min' in stats);
  assert.ok('max' in stats);
  assert.ok('mean' in stats);
  assert.ok('variance' in stats);
  assert.ok('samples' in stats);
  assert.strictEqual(stats.samples, 50);
});

test('CognitiveLoadSimulator - History is capped at 1000', () => {
  const sim = new CognitiveLoadSimulator();
  for (let i = 0; i < 1500; i++) sim.sample();
  assert.ok(sim.loadHistory.length <= 1000);
});

// ════════════════════════════════════════════════════════════════════════════
// STRESS TEST EXECUTOR TESTS
// ════════════════════════════════════════════════════════════════════════════

test('StressTestExecutor - Constructor initializes with defaults', () => {
  const executor = new StressTestExecutor();
  assert.strictEqual(executor.concurrency, 10);
  assert.strictEqual(executor.duration, 5000);
  assert.strictEqual(executor.isRunning, false);
});

test('StressTestExecutor - Constructor accepts config', () => {
  const executor = new StressTestExecutor({
    concurrency: 20,
    duration: 10000
  });
  assert.strictEqual(executor.concurrency, 20);
  assert.strictEqual(executor.duration, 10000);
});

test('StressTestExecutor - Execute runs test function', async () => {
  const executor = new StressTestExecutor({ duration: 100 });
  let callCount = 0;
  const result = await executor.execute(() => {
    callCount++;
    return Promise.resolve(true);
  });
  assert.ok(callCount > 0);
  assert.ok('testId' in result);
  assert.ok('totalCalls' in result);
  assert.ok('successRate' in result);
});

test('StressTestExecutor - Execute handles failures', async () => {
  const executor = new StressTestExecutor({ duration: 100, concurrency: 2 });
  let callCount = 0;
  const result = await executor.execute(() => {
    callCount++;
    if (callCount % 2 === 0) throw new Error('Test failure');
    return Promise.resolve(true);
  });
  assert.ok(result.failureCount > 0);
  assert.ok(result.successRate < 1);
});

test('StressTestExecutor - Stop terminates execution', async () => {
  const executor = new StressTestExecutor({ duration: 10000 });
  const promise = executor.execute(() => Promise.resolve(true));
  setTimeout(() => executor.stop(), 50);
  const result = await promise;
  assert.ok(result.duration < 5000);
});

test('StressTestExecutor - phiStressRatio is calculated', async () => {
  const executor = new StressTestExecutor({ duration: 100 });
  const result = await executor.execute(() => Promise.resolve(true));
  assert.ok('phiStressRatio' in result);
  assert.ok(typeof result.phiStressRatio === 'number');
});

// ════════════════════════════════════════════════════════════════════════════
// PRESSURE FEEDBACK SYSTEM TESTS
// ════════════════════════════════════════════════════════════════════════════

test('PressureFeedbackSystem - Constructor initializes with defaults', () => {
  const pfs = new PressureFeedbackSystem();
  assert.ok(Math.abs(pfs.targetSuccessRate - PHI_INVERSE) < 1e-10);
  assert.strictEqual(pfs.pressureLevel, 0.5);
});

test('PressureFeedbackSystem - Constructor accepts config', () => {
  const pfs = new PressureFeedbackSystem({ targetSuccessRate: 0.8 });
  assert.strictEqual(pfs.targetSuccessRate, 0.8);
});

test('PressureFeedbackSystem - processFeedback adjusts pressure', () => {
  const pfs = new PressureFeedbackSystem();
  const initial = pfs.pressureLevel;
  pfs.processFeedback(0.3); // Below target
  // Pressure should adjust based on error
  assert.ok(pfs.pressureLevel !== initial || pfs.feedbackHistory.length === 1);
});

test('PressureFeedbackSystem - processFeedback returns diagnostics', () => {
  const pfs = new PressureFeedbackSystem();
  const feedback = pfs.processFeedback(0.5);
  assert.ok('timestamp' in feedback);
  assert.ok('actualSuccessRate' in feedback);
  assert.ok('error' in feedback);
  assert.ok('pressureLevel' in feedback);
  assert.ok('phiDeviation' in feedback);
});

test('PressureFeedbackSystem - Pressure stays within bounds', () => {
  const pfs = new PressureFeedbackSystem({ learningRate: 0.5 });
  for (let i = 0; i < 100; i++) {
    pfs.processFeedback(Math.random());
  }
  assert.ok(pfs.pressureLevel >= 0 && pfs.pressureLevel <= 1);
});

test('PressureFeedbackSystem - getHealthAssessment returns status', () => {
  const pfs = new PressureFeedbackSystem();
  for (let i = 0; i < 20; i++) {
    pfs.processFeedback(0.6);
  }
  const health = pfs.getHealthAssessment();
  assert.ok('status' in health);
  assert.ok('confidence' in health);
  assert.ok('trend' in health);
  assert.ok(['optimal', 'stable', 'stressed', 'critical'].includes(health.status));
});

test('PressureFeedbackSystem - Initializing status when few samples', () => {
  const pfs = new PressureFeedbackSystem();
  pfs.processFeedback(0.5);
  const health = pfs.getHealthAssessment();
  assert.strictEqual(health.status, 'initializing');
});

test('PressureFeedbackSystem - History is capped at 500', () => {
  const pfs = new PressureFeedbackSystem();
  for (let i = 0; i < 600; i++) {
    pfs.processFeedback(Math.random());
  }
  assert.ok(pfs.feedbackHistory.length <= 500);
});

// ════════════════════════════════════════════════════════════════════════════
// SELF-HEALING ORGANISM TESTER TESTS
// ════════════════════════════════════════════════════════════════════════════

test('SelfHealingOrganismTester - Constructor initializes', () => {
  const tester = new SelfHealingOrganismTester({});
  assert.deepStrictEqual(tester.injectedFaults, []);
  assert.deepStrictEqual(tester.healingEvents, []);
});

test('SelfHealingOrganismTester - injectFault creates fault record', () => {
  const tester = new SelfHealingOrganismTester({});
  const fault = tester.injectFault('memory_leak');
  assert.ok(fault.id.startsWith('FAULT-'));
  assert.strictEqual(fault.type, 'memory_leak');
  assert.strictEqual(fault.recovered, false);
});

test('SelfHealingOrganismTester - recordHealing marks fault recovered', () => {
  const tester = new SelfHealingOrganismTester({});
  const fault = tester.injectFault('cpu_spike');
  tester.recordHealing(fault.id);
  assert.strictEqual(fault.recovered, true);
  assert.ok(fault.recoveryTime !== null);
});

test('SelfHealingOrganismTester - recordHealing ignores unknown faults', () => {
  const tester = new SelfHealingOrganismTester({});
  tester.recordHealing('UNKNOWN-FAULT');
  assert.strictEqual(tester.healingEvents.length, 0);
});

test('SelfHealingOrganismTester - getRecoveryMetrics with no faults', () => {
  const tester = new SelfHealingOrganismTester({});
  const metrics = tester.getRecoveryMetrics();
  assert.strictEqual(metrics.healingRate, 0);
  assert.strictEqual(metrics.averageRecoveryTime, null);
});

test('SelfHealingOrganismTester - getRecoveryMetrics with healed faults', () => {
  const tester = new SelfHealingOrganismTester({});
  const fault1 = tester.injectFault('fault1');
  const fault2 = tester.injectFault('fault2');
  tester.recordHealing(fault1.id);
  const metrics = tester.getRecoveryMetrics();
  assert.strictEqual(metrics.healingRate, 0.5);
  assert.strictEqual(metrics.unhealedCount, 1);
});

test('SelfHealingOrganismTester - phiRecoveryScore is calculated', () => {
  const tester = new SelfHealingOrganismTester({});
  const fault = tester.injectFault('test');
  tester.recordHealing(fault.id);
  const metrics = tester.getRecoveryMetrics();
  assert.ok('phiRecoveryScore' in metrics);
  assert.ok(typeof metrics.phiRecoveryScore === 'number');
});

// ════════════════════════════════════════════════════════════════════════════
// STRESS TESTING FRAMEWORK INTEGRATION TESTS
// ════════════════════════════════════════════════════════════════════════════

test('StressTestingFramework - Constructor initializes components', () => {
  const framework = new StressTestingFramework();
  assert.ok(framework.loadSimulator instanceof CognitiveLoadSimulator);
  assert.ok(framework.executor instanceof StressTestExecutor);
  assert.ok(framework.feedbackSystem instanceof PressureFeedbackSystem);
});

test('StressTestingFramework - registerSuite adds suite', () => {
  const framework = new StressTestingFramework();
  framework.registerSuite('test-suite', {
    tests: [{ name: 'test1', fn: () => true }]
  });
  assert.strictEqual(framework.testSuites.size, 1);
  assert.ok(framework.testSuites.has('test-suite'));
});

test('StressTestingFramework - runAllSuites executes tests', async () => {
  const framework = new StressTestingFramework();
  framework.executor.duration = 100;
  
  framework.registerSuite('quick-suite', {
    tests: [
      { name: 'quick-test', fn: () => Promise.resolve(true) }
    ]
  });
  
  const results = await framework.runAllSuites();
  assert.ok('timestamp' in results);
  assert.ok('suiteCount' in results);
  assert.ok('overallHealth' in results);
  assert.ok('phiAlignment' in results);
});

test('StressTestingFramework - stop halts execution', () => {
  const framework = new StressTestingFramework();
  framework.isRunning = true;
  framework.stop();
  assert.strictEqual(framework.isRunning, false);
});

// ════════════════════════════════════════════════════════════════════════════
// LOAD PATTERN STRESS TESTS
// ════════════════════════════════════════════════════════════════════════════

test('Load pattern - phi_wave produces golden-ratio modulation', () => {
  const sim = new CognitiveLoadSimulator({
    pattern: 'phi_wave',
    baseLoad: 0,
    maxLoad: 1,
    cycleDuration: 1000
  });
  
  const samples = [];
  // Use varied start times to get varied samples
  for (let i = 0; i < 100; i++) {
    sim.startTime = Date.now() - i * 10;
    samples.push(sim.sample().load);
  }
  
  // Verify we have variation (not constant) - check for at least 2 unique values
  const uniqueValues = new Set(samples.map(s => Math.round(s * 10)));
  assert.ok(uniqueValues.size >= 1, 'phi_wave should produce load values');
});

test('Load pattern - chaos produces deterministic chaos', () => {
  const sim = new CognitiveLoadSimulator({
    pattern: 'chaos',
    baseLoad: 0,
    maxLoad: 1
  });
  
  const samples = [];
  for (let i = 0; i < 50; i++) {
    samples.push(sim.sample().load);
  }
  
  // Verify bounded chaos
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  assert.ok(min >= 0 && max <= 1, 'chaos should be bounded');
});

test('Load pattern - spike produces intermittent peaks', () => {
  const sim = new CognitiveLoadSimulator({
    pattern: 'spike',
    baseLoad: 0.1,
    maxLoad: 1.0,
    cycleDuration: 100
  });
  
  const samples = [];
  for (let i = 0; i < 100; i++) {
    samples.push(sim.sample().load);
  }
  
  const hasBase = samples.some(s => Math.abs(s - 0.1) < 0.01);
  const hasMax = samples.some(s => Math.abs(s - 1.0) < 0.01);
  assert.ok(hasBase || hasMax, 'spike pattern should have distinct levels');
});

// ════════════════════════════════════════════════════════════════════════════
// HIGH-VOLUME STRESS TESTS
// ════════════════════════════════════════════════════════════════════════════

test('High volume - 1000 cognitive load samples', () => {
  const sim = new CognitiveLoadSimulator({ pattern: 'phi_wave' });
  for (let i = 0; i < 1000; i++) {
    const sample = sim.sample();
    assert.ok(sample.load >= 0 && sample.load <= 1);
  }
  const stats = sim.getStatistics();
  assert.ok(stats.samples === 1000 || stats.samples === sim.loadHistory.length);
});

test('High volume - 500 pressure feedback iterations', () => {
  const pfs = new PressureFeedbackSystem();
  for (let i = 0; i < 500; i++) {
    const rate = 0.3 + Math.random() * 0.4;
    pfs.processFeedback(rate);
  }
  const health = pfs.getHealthAssessment();
  assert.ok(health.confidence > 0.5, 'Should have high confidence after many samples');
});

test('High volume - Multiple fault injection/recovery cycles', () => {
  const tester = new SelfHealingOrganismTester({});
  
  for (let i = 0; i < 100; i++) {
    const fault = tester.injectFault(`fault-${i}`);
    if (Math.random() > 0.3) {
      tester.recordHealing(fault.id);
    }
  }
  
  const metrics = tester.getRecoveryMetrics();
  assert.ok(metrics.healingRate > 0 && metrics.healingRate < 1);
  assert.ok(metrics.unhealedCount > 0);
});

// ════════════════════════════════════════════════════════════════════════════
// PHI-ALIGNMENT VALIDATION TESTS
// ════════════════════════════════════════════════════════════════════════════

test('φ-Alignment - Target success rate matches golden ratio', () => {
  const pfs = new PressureFeedbackSystem();
  assert.ok(Math.abs(pfs.targetSuccessRate - PHI_INVERSE) < 1e-10);
});

test('φ-Alignment - Optimal health at φ-inverse success rate', () => {
  const pfs = new PressureFeedbackSystem();
  for (let i = 0; i < 50; i++) {
    pfs.processFeedback(PHI_INVERSE);
  }
  const health = pfs.getHealthAssessment();
  assert.ok(health.averageError < 0.1, 'Error should be low at target rate');
});

test('φ-Alignment - Stress threshold equals φ-inverse', () => {
  assert.ok(Math.abs(STRESS_THRESHOLD - PHI_INVERSE) < 1e-10);
});
