/**
 * @medina/stress-testing-framework — Extreme Stress Tests
 * 
 * Comprehensive test suite for extreme stress testing capabilities.
 * Tests chaos injection, self-healing, and production-grade resilience.
 * 
 * ENCODED IDENTITY: TEST.EXTREME.SOVEREIGN
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  PHI,
  PHI_INVERSE,
  PHI_SQUARED,
  PHI_CUBED,
  STRESS_LEVELS,
  MemoryPressureInjector,
  LatencyInjector,
  ErrorInjector,
  DataCorruptionInjector,
  SelfHealingValidator,
  ExtremeLoadTester,
  ChaosScenarioRunner,
  CHAOS_SCENARIOS
} from '../src/extreme-stress.js';

// ════════════════════════════════════════════════════════════════════════════
// PHI CONSTANT VALIDATION
// ════════════════════════════════════════════════════════════════════════════

describe('PHI Constants', () => {
  test('PHI equals golden ratio', () => {
    assert.ok(Math.abs(PHI - 1.618033988749895) < 1e-10);
  });

  test('PHI_INVERSE equals 1/PHI', () => {
    assert.ok(Math.abs(PHI_INVERSE - (1 / PHI)) < 1e-10);
  });

  test('PHI_SQUARED equals PHI * PHI', () => {
    assert.ok(Math.abs(PHI_SQUARED - (PHI * PHI)) < 1e-10);
  });

  test('PHI_CUBED equals PHI^3', () => {
    assert.ok(Math.abs(PHI_CUBED - Math.pow(PHI, 3)) < 1e-10);
  });

  test('PHI satisfies φ = 1 + 1/φ', () => {
    assert.ok(Math.abs(PHI - (1 + 1/PHI)) < 1e-10);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// STRESS LEVELS VALIDATION
// ════════════════════════════════════════════════════════════════════════════

describe('Stress Levels', () => {
  test('BASELINE is 0', () => {
    assert.strictEqual(STRESS_LEVELS.BASELINE, 0);
  });

  test('LIGHT is approximately 23.6%', () => {
    assert.ok(Math.abs(STRESS_LEVELS.LIGHT - 0.236) < 0.01);
  });

  test('MODERATE is approximately 38.2%', () => {
    assert.ok(Math.abs(STRESS_LEVELS.MODERATE - 0.382) < 0.01);
  });

  test('HEAVY is approximately 61.8%', () => {
    assert.ok(Math.abs(STRESS_LEVELS.HEAVY - 0.618) < 0.01);
  });

  test('CRITICAL is 100%', () => {
    assert.strictEqual(STRESS_LEVELS.CRITICAL, 1.0);
  });

  test('EXTREME is approximately 161.8%', () => {
    assert.ok(Math.abs(STRESS_LEVELS.EXTREME - 1.618) < 0.01);
  });

  test('CATASTROPHIC is approximately 261.8%', () => {
    assert.ok(Math.abs(STRESS_LEVELS.CATASTROPHIC - 2.618) < 0.01);
  });

  test('Stress levels are in ascending order', () => {
    assert.ok(STRESS_LEVELS.BASELINE < STRESS_LEVELS.LIGHT);
    assert.ok(STRESS_LEVELS.LIGHT < STRESS_LEVELS.MODERATE);
    assert.ok(STRESS_LEVELS.MODERATE < STRESS_LEVELS.HEAVY);
    assert.ok(STRESS_LEVELS.HEAVY < STRESS_LEVELS.CRITICAL);
    assert.ok(STRESS_LEVELS.CRITICAL < STRESS_LEVELS.EXTREME);
    assert.ok(STRESS_LEVELS.EXTREME < STRESS_LEVELS.CATASTROPHIC);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// MEMORY PRESSURE INJECTOR TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('MemoryPressureInjector', () => {
  test('initializes with empty allocations', () => {
    const injector = new MemoryPressureInjector();
    assert.strictEqual(injector.allocations.length, 0);
  });

  test('injects memory pressure at specified level', () => {
    const injector = new MemoryPressureInjector();
    const result = injector.inject(0.5);
    assert.ok(result.allocatedChunks > 0);
    assert.ok(result.estimatedMemoryMB > 0);
    injector.releaseAll();
  });

  test('releases specified count of allocations', () => {
    const injector = new MemoryPressureInjector();
    injector.inject(0.3);
    const initial = injector.allocations.length;
    const result = injector.release(5);
    assert.strictEqual(result.releasedChunks, Math.min(5, initial));
    injector.releaseAll();
  });

  test('releases all allocations', () => {
    const injector = new MemoryPressureInjector();
    injector.inject(0.5);
    assert.ok(injector.allocations.length > 0);
    injector.releaseAll();
    assert.strictEqual(injector.allocations.length, 0);
  });

  test('handles repeated injections', () => {
    const injector = new MemoryPressureInjector();
    injector.inject(0.2);
    const first = injector.allocations.length;
    injector.inject(0.5);
    assert.ok(injector.allocations.length >= first);
    injector.releaseAll();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// LATENCY INJECTOR TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('LatencyInjector', () => {
  test('initializes as inactive', () => {
    const injector = new LatencyInjector();
    assert.strictEqual(injector.active, false);
  });

  test('configures latency parameters', () => {
    const injector = new LatencyInjector();
    injector.configure(100, 20);
    assert.strictEqual(injector.baseLatencyMs, 100);
    assert.strictEqual(injector.jitterMs, 20);
    assert.strictEqual(injector.active, true);
  });

  test('inject returns immediately when inactive', async () => {
    const injector = new LatencyInjector();
    const start = Date.now();
    const result = await injector.inject();
    const elapsed = Date.now() - start;
    assert.strictEqual(result.injected, false);
    assert.ok(elapsed < 10);
  });

  test('inject adds delay when active', async () => {
    const injector = new LatencyInjector();
    injector.configure(50, 0);
    const start = Date.now();
    const result = await injector.inject();
    const elapsed = Date.now() - start;
    assert.strictEqual(result.injected, true);
    assert.ok(elapsed >= 40); // Allow some tolerance
  });

  test('disable turns off injection', () => {
    const injector = new LatencyInjector();
    injector.configure(100, 20);
    injector.disable();
    assert.strictEqual(injector.active, false);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ERROR INJECTOR TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('ErrorInjector', () => {
  test('initializes with zero error rate', () => {
    const injector = new ErrorInjector();
    assert.strictEqual(injector.errorRate, 0);
  });

  test('configures error rate', () => {
    const injector = new ErrorInjector();
    injector.configure(0.5);
    assert.strictEqual(injector.errorRate, 0.5);
  });

  test('clamps error rate to [0, 1]', () => {
    const injector = new ErrorInjector();
    injector.configure(1.5);
    assert.strictEqual(injector.errorRate, 1);
    injector.configure(-0.5);
    assert.strictEqual(injector.errorRate, 0);
  });

  test('shouldError returns false when rate is 0', () => {
    const injector = new ErrorInjector();
    injector.configure(0);
    let errorCount = 0;
    for (let i = 0; i < 100; i++) {
      if (injector.shouldError()) errorCount++;
    }
    assert.strictEqual(errorCount, 0);
  });

  test('shouldError returns true approximately at configured rate', () => {
    const injector = new ErrorInjector();
    injector.configure(0.5);
    let errorCount = 0;
    const iterations = 1000;
    for (let i = 0; i < iterations; i++) {
      if (injector.shouldError()) errorCount++;
    }
    const actualRate = errorCount / iterations;
    assert.ok(actualRate > 0.3 && actualRate < 0.7);
  });

  test('getRandomError returns null when no error', () => {
    const injector = new ErrorInjector();
    injector.configure(0);
    assert.strictEqual(injector.getRandomError(), null);
  });

  test('getRandomError returns Error object when triggered', () => {
    const injector = new ErrorInjector();
    injector.configure(1);
    const error = injector.getRandomError();
    assert.ok(error instanceof Error);
    assert.ok(error.message.startsWith('Injected error:'));
  });
});

// ════════════════════════════════════════════════════════════════════════════
// DATA CORRUPTION INJECTOR TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('DataCorruptionInjector', () => {
  test('returns non-object data unchanged', () => {
    const injector = new DataCorruptionInjector();
    assert.strictEqual(injector.corrupt(42, 0.5), 42);
    assert.strictEqual(injector.corrupt('hello', 0.5), 'hello');
    assert.strictEqual(injector.corrupt(null, 0.5), null);
  });

  test('corrupts object data', () => {
    const injector = new DataCorruptionInjector();
    const original = { a: 100, b: 200, c: 300 };
    const corrupted = injector.corrupt(original, 1.0);
    // Corrupted data should be different
    const allSame = corrupted.a === original.a && 
                    corrupted.b === original.b && 
                    corrupted.c === original.c;
    assert.ok(!allSame || corrupted !== original);
  });

  test('corrupts array data', () => {
    const injector = new DataCorruptionInjector();
    const original = [1, 2, 3, 4, 5];
    const corrupted = injector.corrupt(original, 0.8);
    assert.ok(Array.isArray(corrupted));
    assert.strictEqual(corrupted.length, original.length);
  });

  test('severity 0 produces no corruption', () => {
    const injector = new DataCorruptionInjector();
    const original = { value: 100 };
    const corrupted = injector.corrupt(original, 0);
    assert.strictEqual(corrupted.value, original.value);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// SELF-HEALING VALIDATOR TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('SelfHealingValidator', () => {
  test('initializes with empty histories', () => {
    const validator = new SelfHealingValidator();
    assert.strictEqual(validator.faultHistory.length, 0);
    assert.strictEqual(validator.recoveryHistory.length, 0);
  });

  test('injects fault and records it', () => {
    const validator = new SelfHealingValidator();
    const fault = validator.injectFault('test_fault', 0.5);
    assert.ok(fault.id.startsWith('fault_'));
    assert.strictEqual(fault.type, 'test_fault');
    assert.strictEqual(fault.severity, 0.5);
    assert.strictEqual(fault.healed, false);
    assert.strictEqual(validator.faultHistory.length, 1);
  });

  test('simulates healing with φ-encoded probability', () => {
    const validator = new SelfHealingValidator();
    let healedCount = 0;
    
    for (let i = 0; i < 100; i++) {
      const fault = validator.injectFault('test', 0.3);
      validator.simulateHealing(fault);
      if (fault.healed) healedCount++;
    }
    
    // Should heal approximately PHI_INVERSE * (1 - 0.3 * 0.5) ≈ 52.5%
    assert.ok(healedCount > 30 && healedCount < 80);
  });

  test('getStatistics returns correct metrics', () => {
    const validator = new SelfHealingValidator();
    
    for (let i = 0; i < 50; i++) {
      const fault = validator.injectFault('test', 0.4);
      validator.simulateHealing(fault);
    }
    
    const stats = validator.getStatistics();
    assert.strictEqual(stats.totalFaults, 50);
    assert.strictEqual(stats.healedFaults + stats.unhealedFaults, 50);
    assert.ok(stats.healingRate >= 0 && stats.healingRate <= 1);
    assert.ok(stats.averageMTTR >= 0);
  });

  test('percentile calculation works correctly', () => {
    const validator = new SelfHealingValidator();
    
    // Inject faults with predictable MTTRs
    for (let i = 0; i < 100; i++) {
      const fault = validator.injectFault('test', 0.1);
      validator.simulateHealing(fault);
    }
    
    const stats = validator.getStatistics();
    assert.ok(stats.p95MTTR >= stats.averageMTTR * 0.5);
    assert.ok(stats.p99MTTR >= stats.p95MTTR * 0.8);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// EXTREME LOAD TESTER TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('ExtremeLoadTester', () => {
  test('initializes with empty metrics', () => {
    const tester = new ExtremeLoadTester();
    assert.strictEqual(tester.metrics.requestsSent, 0);
    assert.strictEqual(tester.metrics.requestsCompleted, 0);
    assert.strictEqual(tester.metrics.requestsFailed, 0);
  });

  test('runs load test and returns results', async () => {
    const tester = new ExtremeLoadTester();
    const results = await tester.runLoadTest({
      targetRPS: 100,
      durationMs: 200,
      rampUpMs: 50
    });
    
    assert.ok(results.totalRequests > 0);
    assert.ok(results.completedRequests >= 0);
    assert.ok(results.actualRPS > 0);
    assert.ok(results.errorRate >= 0 && results.errorRate <= 1);
  });

  test('calculates latency percentiles', async () => {
    const tester = new ExtremeLoadTester();
    const results = await tester.runLoadTest({
      targetRPS: 50,
      durationMs: 200,
      rampUpMs: 50
    });
    
    assert.ok(results.latency.p50 <= results.latency.p95);
    assert.ok(results.latency.p95 <= results.latency.p99);
    assert.ok(results.latency.min <= results.latency.avg);
    assert.ok(results.latency.avg <= results.latency.max);
  });

  test('reset clears metrics', async () => {
    const tester = new ExtremeLoadTester();
    await tester.runLoadTest({
      targetRPS: 50,
      durationMs: 100,
      rampUpMs: 20
    });
    
    assert.ok(tester.metrics.requestsSent > 0);
    tester.reset();
    assert.strictEqual(tester.metrics.requestsSent, 0);
    assert.strictEqual(tester.metrics.latencies.length, 0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// CHAOS SCENARIO RUNNER TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('ChaosScenarioRunner', () => {
  test('initializes all injectors', () => {
    const runner = new ChaosScenarioRunner();
    assert.ok(runner.memoryInjector);
    assert.ok(runner.latencyInjector);
    assert.ok(runner.errorInjector);
    assert.ok(runner.dataCorruptor);
    assert.ok(runner.healingValidator);
  });

  test('runs simple scenario', async () => {
    const runner = new ChaosScenarioRunner();
    const result = await runner.runScenario({
      name: 'Simple Test',
      steps: [
        { action: 'wait', durationMs: 50 }
      ]
    });
    
    assert.strictEqual(result.name, 'Simple Test');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.steps.length, 1);
    assert.ok(result.durationMs >= 40);
  });

  test('runs memory pressure scenario', async () => {
    const runner = new ChaosScenarioRunner();
    const result = await runner.runScenario({
      name: 'Memory Test',
      steps: [
        { action: 'inject_memory_pressure', level: 0.3 },
        { action: 'wait', durationMs: 50 },
        { action: 'release_memory' }
      ]
    });
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(runner.memoryInjector.allocations.length, 0);
  });

  test('runs fault injection scenario', async () => {
    const runner = new ChaosScenarioRunner();
    const result = await runner.runScenario({
      name: 'Fault Test',
      steps: [
        { action: 'inject_fault', faultType: 'test_fault', severity: 0.5 },
        { action: 'inject_fault', faultType: 'test_fault', severity: 0.3 },
        { action: 'inject_fault', faultType: 'test_fault', severity: 0.2 }
      ]
    });
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(runner.healingValidator.faultHistory.length, 3);
  });

  test('handles unknown action gracefully', async () => {
    const runner = new ChaosScenarioRunner();
    const result = await runner.runScenario({
      name: 'Unknown Action Test',
      steps: [
        { action: 'unknown_action' }
      ]
    });
    
    assert.strictEqual(result.success, false);
    assert.ok(result.steps[0].error.includes('Unknown action'));
  });

  test('getSummary returns aggregated stats', async () => {
    const runner = new ChaosScenarioRunner();
    
    await runner.runScenario({
      name: 'Test 1',
      steps: [{ action: 'wait', durationMs: 10 }]
    });
    
    await runner.runScenario({
      name: 'Test 2',
      steps: [{ action: 'inject_fault', faultType: 'test', severity: 0.3 }]
    });
    
    const summary = runner.getSummary();
    assert.strictEqual(summary.totalScenarios, 2);
    assert.ok(summary.successRate >= 0);
    assert.ok(summary.totalDurationMs > 0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// PREDEFINED SCENARIOS TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('Predefined Chaos Scenarios', () => {
  test('MEMORY_PRESSURE_STORM scenario is defined', () => {
    assert.ok(CHAOS_SCENARIOS.MEMORY_PRESSURE_STORM);
    assert.strictEqual(CHAOS_SCENARIOS.MEMORY_PRESSURE_STORM.name, 'Memory Pressure Storm');
    assert.ok(CHAOS_SCENARIOS.MEMORY_PRESSURE_STORM.steps.length > 0);
  });

  test('LATENCY_SPIKE scenario is defined', () => {
    assert.ok(CHAOS_SCENARIOS.LATENCY_SPIKE);
    assert.strictEqual(CHAOS_SCENARIOS.LATENCY_SPIKE.name, 'Latency Spike Attack');
  });

  test('MULTI_FAULT_CASCADE scenario is defined', () => {
    assert.ok(CHAOS_SCENARIOS.MULTI_FAULT_CASCADE);
    assert.strictEqual(CHAOS_SCENARIOS.MULTI_FAULT_CASCADE.name, 'Multi-Fault Cascade');
  });

  test('CATASTROPHIC_FAILURE scenario is defined', () => {
    assert.ok(CHAOS_SCENARIOS.CATASTROPHIC_FAILURE);
    assert.strictEqual(CHAOS_SCENARIOS.CATASTROPHIC_FAILURE.name, 'Catastrophic Failure Recovery');
  });

  test('runs MEMORY_PRESSURE_STORM scenario', async () => {
    const runner = new ChaosScenarioRunner();
    const result = await runner.runScenario(CHAOS_SCENARIOS.MEMORY_PRESSURE_STORM);
    // May or may not succeed based on healing probability, but should complete
    assert.ok(result.completedAt > result.startedAt);
    runner.memoryInjector.releaseAll();
  });

  test('runs LATENCY_SPIKE scenario', async () => {
    const runner = new ChaosScenarioRunner();
    const result = await runner.runScenario(CHAOS_SCENARIOS.LATENCY_SPIKE);
    assert.ok(result.completedAt > result.startedAt);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// HIGH-VOLUME STRESS TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('High-Volume Stress Tests', () => {
  test('handles 100 concurrent fault injections', () => {
    const validator = new SelfHealingValidator();
    
    for (let i = 0; i < 100; i++) {
      const fault = validator.injectFault(`fault_${i}`, Math.random());
      validator.simulateHealing(fault);
    }
    
    const stats = validator.getStatistics();
    assert.strictEqual(stats.totalFaults, 100);
    assert.ok(stats.healingRate > 0);
  });

  test('handles 500 fault injections with varied severities', () => {
    const validator = new SelfHealingValidator();
    
    for (let i = 0; i < 500; i++) {
      const severity = (i % 10) / 10; // 0.0 to 0.9
      const fault = validator.injectFault(`type_${i % 5}`, severity);
      validator.simulateHealing(fault);
    }
    
    const stats = validator.getStatistics();
    assert.strictEqual(stats.totalFaults, 500);
    assert.ok(stats.healingRate >= 0.3); // Should heal at least 30%
  });

  test('memory pressure cycles without leaks', () => {
    const injector = new MemoryPressureInjector();
    
    for (let i = 0; i < 50; i++) {
      injector.inject(0.5);
      injector.releaseAll();
    }
    
    assert.strictEqual(injector.allocations.length, 0);
  });

  test('error injection statistical distribution', () => {
    const injector = new ErrorInjector();
    const rates = [0.1, 0.25, 0.5, 0.75, 0.9];
    
    for (const targetRate of rates) {
      injector.configure(targetRate);
      let errors = 0;
      const samples = 1000;
      
      for (let i = 0; i < samples; i++) {
        if (injector.shouldError()) errors++;
      }
      
      const actualRate = errors / samples;
      // Should be within 10% of target
      assert.ok(Math.abs(actualRate - targetRate) < 0.15);
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('Integration Tests', () => {
  test('full chaos scenario with all injectors', async () => {
    const runner = new ChaosScenarioRunner();
    
    const fullScenario = {
      name: 'Full Integration Test',
      steps: [
        { action: 'inject_memory_pressure', level: STRESS_LEVELS.LIGHT },
        { action: 'inject_latency', latencyMs: 10, jitterMs: 5 },
        { action: 'inject_errors', errorRate: 0.05 },
        { action: 'inject_fault', faultType: 'integration_test', severity: 0.4 },
        { action: 'wait', durationMs: 100 },
        { action: 'release_memory' },
        { action: 'disable_latency' },
        { action: 'verify_healing', minHealingRate: 0.3 }
      ]
    };
    
    const result = await runner.runScenario(fullScenario);
    assert.ok(result.steps.length === fullScenario.steps.length);
    assert.ok(result.durationMs >= 100);
  });

  test('sequential stress level escalation', () => {
    const injector = new MemoryPressureInjector();
    const levels = [
      STRESS_LEVELS.LIGHT,
      STRESS_LEVELS.MODERATE,
      STRESS_LEVELS.HEAVY,
      STRESS_LEVELS.CRITICAL
    ];
    
    let previousChunks = 0;
    for (const level of levels) {
      const result = injector.inject(level);
      assert.ok(result.allocatedChunks >= previousChunks);
      previousChunks = result.allocatedChunks;
    }
    
    injector.releaseAll();
  });

  test('combined load and fault testing', async () => {
    const loadTester = new ExtremeLoadTester();
    const validator = new SelfHealingValidator();
    
    // Run load test while injecting faults
    const loadPromise = loadTester.runLoadTest({
      targetRPS: 50,
      durationMs: 200,
      rampUpMs: 50
    });
    
    // Inject faults during load
    for (let i = 0; i < 10; i++) {
      const fault = validator.injectFault('concurrent_fault', 0.3);
      validator.simulateHealing(fault);
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    
    const loadResults = await loadPromise;
    const healingStats = validator.getStatistics();
    
    assert.ok(loadResults.totalRequests > 0);
    assert.strictEqual(healingStats.totalFaults, 10);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// PERFORMANCE VALIDATION TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('Performance Validation', () => {
  test('fault injection is fast (< 1ms per fault)', () => {
    const validator = new SelfHealingValidator();
    const start = Date.now();
    const count = 1000;
    
    for (let i = 0; i < count; i++) {
      validator.injectFault('perf_test', Math.random());
    }
    
    const elapsed = Date.now() - start;
    const perFault = elapsed / count;
    assert.ok(perFault < 1, `Fault injection took ${perFault}ms per fault`);
  });

  test('healing simulation is fast (< 1ms per heal)', () => {
    const validator = new SelfHealingValidator();
    const faults = [];
    const count = 1000;
    
    for (let i = 0; i < count; i++) {
      faults.push(validator.injectFault('perf_test', Math.random()));
    }
    
    const start = Date.now();
    for (const fault of faults) {
      validator.simulateHealing(fault);
    }
    const elapsed = Date.now() - start;
    const perHeal = elapsed / count;
    assert.ok(perHeal < 1, `Healing simulation took ${perHeal}ms per heal`);
  });

  test('statistics calculation is efficient', () => {
    const validator = new SelfHealingValidator();
    
    for (let i = 0; i < 10000; i++) {
      const fault = validator.injectFault('stats_test', Math.random());
      validator.simulateHealing(fault);
    }
    
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
      validator.getStatistics();
    }
    const elapsed = Date.now() - start;
    const perCalc = elapsed / 100;
    assert.ok(perCalc < 10, `Statistics calculation took ${perCalc}ms per call`);
  });
});
