/**
 * Autonomous Testing SDK Test Suite
 * 
 * Comprehensive tests for AutonomousTestRunner, ChaosMonkeyEngine, and ContinuousMonitor
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import {
  PHI,
  PHI_INVERSE,
  AutonomousTestRunner,
  ChaosMonkeyEngine,
  ContinuousMonitor
} from '../src/index.js';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

describe('PHI Constants', () => {
  test('PHI should equal golden ratio', () => {
    assert.strictEqual(PHI, 1.618033988749895);
  });

  test('PHI_INVERSE should equal 1/PHI', () => {
    assert.strictEqual(PHI_INVERSE, 0.618033988749895);
  });

  test('PHI relationships should hold', () => {
    assert.ok(Math.abs(PHI * PHI_INVERSE - 1) < 1e-10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// AUTONOMOUS TEST RUNNER
// ═══════════════════════════════════════════════════════════════════════════

describe('AutonomousTestRunner', () => {
  let runner;

  beforeEach(() => {
    runner = new AutonomousTestRunner({
      retryAttempts: 2,
      healingEnabled: true
    });
  });

  afterEach(() => {
    runner.stop();
  });

  describe('constructor', () => {
    test('should create with default config', () => {
      const defaultRunner = new AutonomousTestRunner();
      
      assert.ok(defaultRunner.config.phiThreshold);
      assert.ok(defaultRunner.config.maxConcurrent);
      assert.strictEqual(defaultRunner.config.healingEnabled, true);
      defaultRunner.stop();
    });

    test('should accept custom config', () => {
      const custom = new AutonomousTestRunner({
        retryAttempts: 5,
        healingEnabled: false
      });

      assert.strictEqual(custom.config.retryAttempts, 5);
      assert.strictEqual(custom.config.healingEnabled, false);
      custom.stop();
    });
  });

  describe('registerProbe', () => {
    test('should register probe', () => {
      runner.registerProbe('test-probe', {
        fn: async () => ({ ok: true }),
        interval: 100000
      });

      const probes = runner.getProbeStatus();
      assert.ok('test-probe' in probes);
    });

    test('should chain registrations', () => {
      const result = runner
        .registerProbe('p1', { fn: async () => true, interval: 100000 })
        .registerProbe('p2', { fn: async () => true, interval: 100000 });

      assert.strictEqual(result, runner);
    });
  });

  describe('start/stop', () => {
    test('should start execution', () => {
      runner.registerProbe('starter', { fn: async () => true, interval: 100000 });
      runner.start();

      assert.strictEqual(runner.running, true);
    });

    test('should stop execution', () => {
      runner.registerProbe('stopper', { fn: async () => true, interval: 100000 });
      runner.start();
      runner.stop();

      assert.strictEqual(runner.running, false);
    });

    test('should not start twice', () => {
      runner.registerProbe('double', { fn: async () => true, interval: 100000 });
      runner.start();
      const initialIntervals = runner.intervalIds.length;
      runner.start();

      assert.strictEqual(runner.intervalIds.length, initialIntervals);
    });
  });

  describe('executeProbe', () => {
    test('should execute function probe', async () => {
      let executed = false;
      runner.registerProbe('fn-probe', {
        fn: async () => { executed = true; return { done: true }; },
        interval: 100000
      });

      await runner.executeProbe('fn-probe');

      assert.strictEqual(executed, true);
    });

    test('should track results', async () => {
      runner.registerProbe('tracked', {
        fn: async () => ({ result: 42 }),
        interval: 100000
      });

      await runner.executeProbe('tracked');

      const results = runner.getRecentResults();
      assert.ok(results.length > 0);
      assert.strictEqual(results[0].probe, 'tracked');
      assert.strictEqual(results[0].success, true);
    });

    test('should handle failures', async () => {
      runner.registerProbe('failing', {
        fn: async () => { throw new Error('Test failure'); },
        interval: 100000
      });

      await runner.executeProbe('failing');

      const results = runner.getRecentResults();
      assert.ok(results.some(r => r.probe === 'failing' && !r.success));
    });
  });

  describe('calculateInterval', () => {
    test('should calculate PHI-weighted interval', () => {
      const probe = { interval: 10000, priority: 1 };
      const interval = runner.calculateInterval(probe);

      assert.ok(interval >= 1000); // Minimum enforced
      assert.ok(interval <= 10000 * PHI);
    });

    test('should use default interval', () => {
      const probe = {};
      const interval = runner.calculateInterval(probe);

      assert.ok(interval >= 1000);
    });
  });

  describe('getStats', () => {
    test('should return statistics', async () => {
      runner.registerProbe('stat-probe', { fn: async () => true, interval: 100000 });
      await runner.executeProbe('stat-probe');

      const stats = runner.getStats();

      assert.ok('totalRuns' in stats);
      assert.ok('successes' in stats);
      assert.ok('failures' in stats);
      assert.ok('successRate' in stats);
    });

    test('should track healing count', async () => {
      runner.registerProbe('heal-probe', {
        fn: async () => { throw new Error('Need healing'); },
        healing: { action: 'restart', maxAttempts: 5 },
        interval: 100000
      });

      await runner.executeProbe('heal-probe');

      const stats = runner.getStats();
      assert.ok('healed' in stats);
    });
  });

  describe('getProbeStatus', () => {
    test('should return probe status', () => {
      runner.registerProbe('status-probe', { fn: async () => true, interval: 100000 });

      const status = runner.getProbeStatus();

      assert.ok('status-probe' in status);
      assert.ok('lastRun' in status['status-probe']);
      assert.ok('healthy' in status['status-probe']);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CHAOS MONKEY ENGINE
// ═══════════════════════════════════════════════════════════════════════════

describe('ChaosMonkeyEngine', () => {
  let chaos;

  beforeEach(() => {
    chaos = new ChaosMonkeyEngine();
  });

  describe('constructor', () => {
    test('should create with defaults', () => {
      assert.ok(chaos);
      assert.strictEqual(chaos.config.enabled, false);
      assert.ok(chaos.config.probability >= 0);
    });

    test('should accept custom config', () => {
      const custom = new ChaosMonkeyEngine({
        probability: 0.1,
        enabled: true
      });

      assert.strictEqual(custom.config.probability, 0.1);
      assert.strictEqual(custom.config.enabled, true);
    });
  });

  describe('enable/disable', () => {
    test('should enable chaos mode', () => {
      chaos.enable();
      assert.strictEqual(chaos.config.enabled, true);
    });

    test('should disable chaos mode', () => {
      chaos.enable();
      chaos.disable();
      assert.strictEqual(chaos.config.enabled, false);
    });

    test('should chain enable/disable', () => {
      const result = chaos.enable();
      assert.strictEqual(result, chaos);
    });
  });

  describe('shouldInjectChaos', () => {
    test('should return false when disabled', () => {
      assert.strictEqual(chaos.shouldInjectChaos(), false);
    });

    test('should check probability when enabled', () => {
      chaos.enable();
      chaos.config.probability = 1.0; // 100% chance
      chaos.config.phiScaling = false;

      // With 100% probability, should always inject
      assert.strictEqual(chaos.shouldInjectChaos(), true);
    });
  });

  describe('injectChaos', () => {
    test('should return null when disabled', async () => {
      const result = await chaos.injectChaos('target');
      assert.strictEqual(result, null);
    });

    test('should inject when enabled with high probability', async () => {
      chaos.enable();
      chaos.config.probability = 1.0;
      chaos.config.phiScaling = false;

      const result = await chaos.injectChaos('test-target');

      assert.ok(result);
      assert.ok(result.id);
      assert.strictEqual(result.target, 'test-target');
      assert.ok(['LATENCY', 'ERROR', 'TIMEOUT', 'PARTIAL_FAILURE'].includes(result.type));
    });
  });

  describe('recordRecovery', () => {
    test('should record recovery from injection', async () => {
      chaos.enable();
      chaos.config.probability = 1.0;
      chaos.config.phiScaling = false;

      const injection = await chaos.injectChaos('target');
      chaos.recordRecovery(injection.id, 500);

      const stats = chaos.getStats();
      assert.ok(stats.recovered >= 1);
    });
  });

  describe('getStats', () => {
    test('should return chaos statistics', () => {
      const stats = chaos.getStats();

      assert.ok('totalInjections' in stats);
      assert.ok('recovered' in stats);
      assert.ok('recoveryRate' in stats);
      assert.ok('avgRecoveryTime' in stats);
      assert.ok('enabled' in stats);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CONTINUOUS MONITOR
// ═══════════════════════════════════════════════════════════════════════════

describe('ContinuousMonitor', () => {
  let monitor;

  beforeEach(() => {
    monitor = new ContinuousMonitor();
  });

  describe('constructor', () => {
    test('should create with defaults', () => {
      assert.ok(monitor);
      assert.ok(monitor.config.aggregationWindow);
      assert.ok(monitor.config.alertThreshold);
    });

    test('should accept custom config', () => {
      const custom = new ContinuousMonitor({
        aggregationWindow: 30000,
        alertThreshold: 0.5
      });

      assert.strictEqual(custom.config.aggregationWindow, 30000);
      assert.strictEqual(custom.config.alertThreshold, 0.5);
    });
  });

  describe('record', () => {
    test('should record metric', () => {
      monitor.record('cpu_usage', 0.75, { host: 'server1' });

      assert.ok(monitor.metrics.length > 0);
      assert.strictEqual(monitor.metrics[0].name, 'cpu_usage');
      assert.strictEqual(monitor.metrics[0].value, 0.75);
    });

    test('should raise alert below threshold', () => {
      monitor.config.alertThreshold = 0.5;
      monitor.record('health', 0.3, { service: 'api' });

      const alerts = monitor.getAlerts();
      assert.ok(alerts.length > 0);
    });

    test('should not alert above threshold', () => {
      monitor.config.alertThreshold = 0.5;
      const initialAlerts = monitor.alerts.length;
      monitor.record('health', 0.8, { service: 'api' });

      assert.strictEqual(monitor.alerts.length, initialAlerts);
    });
  });

  describe('getAggregated', () => {
    test('should aggregate metrics by name', () => {
      monitor.record('latency', 100);
      monitor.record('latency', 150);
      monitor.record('latency', 200);

      const aggregated = monitor.getAggregated('latency');

      assert.ok(aggregated);
      assert.ok('avg' in aggregated);
      assert.ok('min' in aggregated);
      assert.ok('max' in aggregated);
      assert.ok('count' in aggregated);
      assert.strictEqual(aggregated.count, 3);
      assert.strictEqual(aggregated.min, 100);
      assert.strictEqual(aggregated.max, 200);
    });

    test('should return null for unknown metric', () => {
      const result = monitor.getAggregated('unknown');
      assert.strictEqual(result, null);
    });
  });

  describe('getAlerts', () => {
    test('should return alerts', () => {
      monitor.config.alertThreshold = 0.9;
      monitor.record('score', 0.5);

      const alerts = monitor.getAlerts();
      assert.ok(Array.isArray(alerts));
    });

    test('should limit number of returned alerts', () => {
      monitor.config.alertThreshold = 1.0;
      for (let i = 0; i < 100; i++) {
        monitor.record(`metric_${i}`, 0.5);
      }

      const alerts = monitor.getAlerts(10);
      assert.strictEqual(alerts.length, 10);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Integration', () => {
  test('should integrate runner with monitor', async () => {
    const runner = new AutonomousTestRunner();
    const monitor = new ContinuousMonitor();

    let successRate = 1.0;
    runner.registerProbe('monitored-probe', {
      fn: async () => {
        monitor.record('probe_execution', successRate);
        return { success: true };
      },
      interval: 100000
    });

    await runner.executeProbe('monitored-probe');

    assert.ok(monitor.metrics.length > 0);

    runner.stop();
  });

  test('should integrate runner with chaos engine', async () => {
    const runner = new AutonomousTestRunner({ retryAttempts: 1 });
    const chaos = new ChaosMonkeyEngine({ probability: 0.5, enabled: true });

    let executed = false;
    runner.registerProbe('chaos-resilient', {
      fn: async () => {
        executed = true;
        // Simulate chaos injection check
        if (chaos.shouldInjectChaos()) {
          await chaos.injectChaos('probe-execution');
        }
        return { resilient: true };
      },
      interval: 100000
    });

    await runner.executeProbe('chaos-resilient');

    assert.strictEqual(executed, true);
    runner.stop();
  });
});
