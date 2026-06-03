/**
 * Hook Trigger SDK Test Suite
 * 
 * Comprehensive tests for LifecycleHook, DataHook, ErrorHook,
 * StateTrigger, ThresholdTrigger, and ScheduleTrigger
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { LifecycleHook } from '../src/lifecycle-hook.js';
import { DataHook } from '../src/data-hook.js';
import { ErrorHook } from '../src/error-hook.js';
import { StateTrigger } from '../src/state-trigger.js';
import { ThresholdTrigger } from '../src/threshold-trigger.js';
import { ScheduleTrigger } from '../src/schedule-trigger.js';

const PHI = 1.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════
// LIFECYCLE HOOK
// ═══════════════════════════════════════════════════════════════════════════

describe('LifecycleHook', () => {
  let hook;

  beforeEach(() => {
    hook = new LifecycleHook();
  });

  describe('static properties', () => {
    test('PHI should be golden ratio', () => {
      assert.strictEqual(LifecycleHook.PHI, PHI);
    });

    test('PHASES should include all lifecycle phases', () => {
      const expected = ['boot', 'init', 'ready', 'run', 'pause', 'resume', 'shutdown'];
      assert.deepStrictEqual(LifecycleHook.PHASES, expected);
    });
  });

  describe('register', () => {
    test('should register hook for valid phase', () => {
      const result = hook.register('my-hook', 'init', async () => {});
      
      assert.strictEqual(result.hookId, 'my-hook');
      assert.strictEqual(result.phase, 'init');
      assert.ok(result.effectivePriority > 0);
    });

    test('should throw for invalid phase', () => {
      assert.throws(
        () => hook.register('hook', 'invalid', async () => {}),
        /Invalid phase/
      );
    });

    test('should throw for non-function handler', () => {
      assert.throws(
        () => hook.register('hook', 'init', 'not-a-function'),
        /Handler must be a function/
      );
    });

    test('should throw for duplicate hook id', () => {
      hook.register('duplicate', 'init', async () => {});
      assert.throws(
        () => hook.register('duplicate', 'init', async () => {}),
        /already registered/
      );
    });

    test('should apply phi-weighted priority', () => {
      const result = hook.register('weighted', 'init', async () => {}, 2);
      assert.strictEqual(result.effectivePriority, 2 * PHI);
    });
  });

  describe('fire', () => {
    test('should fire all hooks for phase', async () => {
      let fired = [];
      hook.register('h1', 'boot', async () => fired.push('h1'));
      hook.register('h2', 'boot', async () => fired.push('h2'));

      const result = await hook.fire('boot');
      
      assert.strictEqual(result.phase, 'boot');
      assert.strictEqual(result.fired, 2);
      assert.strictEqual(result.skipped, 0);
    });

    test('should pass context to handlers', async () => {
      let receivedContext;
      hook.register('ctx-hook', 'init', async (ctx) => { receivedContext = ctx; });

      await hook.fire('init', { data: 'test-value' });
      
      assert.strictEqual(receivedContext.data, 'test-value');
      assert.strictEqual(receivedContext.phase, 'init');
    });

    test('should skip bypassed hooks', async () => {
      let called = false;
      hook.register('bypassed-hook', 'run', async () => { called = true; });
      hook.bypass('bypassed-hook');

      const result = await hook.fire('run');
      
      assert.strictEqual(result.skipped, 1);
      assert.strictEqual(result.fired, 0);
      assert.strictEqual(called, false);
    });

    test('should handle errors gracefully', async () => {
      hook.register('error-hook', 'ready', async () => { throw new Error('Test error'); });

      const result = await hook.fire('ready');
      
      assert.strictEqual(result.fired, 1);
      assert.strictEqual(result.results[0].success, false);
    });

    test('should fire in priority order', async () => {
      const order = [];
      hook.register('low', 'boot', async () => order.push('low'), 1);
      hook.register('high', 'boot', async () => order.push('high'), 10);
      hook.register('mid', 'boot', async () => order.push('mid'), 5);

      await hook.fire('boot');
      
      assert.strictEqual(order[0], 'high');
      assert.strictEqual(order[1], 'mid');
      assert.strictEqual(order[2], 'low');
    });
  });

  describe('getChain', () => {
    test('should return hook chain for phase', () => {
      hook.register('h1', 'init', async () => {}, 2);
      hook.register('h2', 'init', async () => {}, 1);

      const chain = hook.getChain('init');
      
      assert.strictEqual(chain.length, 2);
      assert.ok(chain[0].priority > chain[1].priority);
    });

    test('should throw for invalid phase', () => {
      assert.throws(() => hook.getChain('invalid'), /Invalid phase/);
    });
  });

  describe('bypass and restore', () => {
    test('should bypass hook', () => {
      hook.register('bypassable', 'run', async () => {});
      
      const result = hook.bypass('bypassable');
      
      assert.strictEqual(result, true);
      assert.strictEqual(hook.getChain('run')[0].bypassed, true);
    });

    test('should restore bypassed hook', () => {
      hook.register('restorable', 'run', async () => {});
      hook.bypass('restorable');
      
      const result = hook.restore('restorable');
      
      assert.strictEqual(result, true);
      assert.strictEqual(hook.getChain('run')[0].bypassed, false);
    });

    test('should return false for unknown hook', () => {
      assert.strictEqual(hook.bypass('nonexistent'), false);
      assert.strictEqual(hook.restore('nonexistent'), false);
    });
  });

  describe('getMetrics', () => {
    test('should return metrics', async () => {
      hook.register('m1', 'boot', async () => {});
      await hook.fire('boot');

      const metrics = hook.getMetrics();
      
      assert.ok(metrics.totalFires >= 1);
      assert.strictEqual(metrics.hookCount, 1);
      assert.ok('byPhase' in metrics);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// DATA HOOK
// ═══════════════════════════════════════════════════════════════════════════

describe('DataHook', () => {
  let dataHook;

  beforeEach(() => {
    dataHook = new DataHook();
  });

  describe('constructor', () => {
    test('should create DataHook', () => {
      assert.ok(dataHook);
    });
  });

  describe('register', () => {
    test('should register data hook', () => {
      const result = dataHook.register('transform1', 'string', (data) => data.toUpperCase());
      
      assert.ok(result);
      assert.strictEqual(result.hookId, 'transform1');
      assert.strictEqual(result.dataType, 'string');
    });

    test('should throw for invalid position', () => {
      assert.throws(
        () => dataHook.register('h', 'type', () => {}, 'invalid'),
        /Invalid position/
      );
    });

    test('should throw for non-function transform', () => {
      assert.throws(
        () => dataHook.register('h', 'type', 'not-a-function'),
        /must be a function/
      );
    });
  });

  describe('process', () => {
    test('should process data through hooks', () => {
      dataHook.register('upper', 'text', (d) => d.toUpperCase());

      const result = dataHook.process('text', 'hello');
      
      assert.strictEqual(result.data, 'HELLO');
      assert.strictEqual(result.hooksFired, 1);
    });

    test('should chain multiple hooks', () => {
      dataHook.register('prefix', 'text', (d) => 'pre-' + d);
      dataHook.register('suffix', 'text', (d) => d + '-suf');

      const result = dataHook.process('text', 'data');
      
      assert.ok(result.data.includes('pre-'));
      assert.ok(result.data.includes('-suf'));
    });

    test('should pass through unhooked types', () => {
      const result = dataHook.process('unregistered', 'unchanged');
      
      assert.strictEqual(result.data, 'unchanged');
      assert.strictEqual(result.hooksFired, 0);
    });
  });

  describe('registerValidator', () => {
    test('should register validator', () => {
      dataHook.registerValidator('number-check', 'number', (d) => ({
        valid: typeof d === 'number',
        errors: typeof d === 'number' ? [] : ['Not a number']
      }));

      // No exception means success
      assert.ok(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ERROR HOOK
// ═══════════════════════════════════════════════════════════════════════════

describe('ErrorHook', () => {
  let errorHook;

  beforeEach(() => {
    errorHook = new ErrorHook();
  });

  describe('constructor', () => {
    test('should create ErrorHook', () => {
      assert.ok(errorHook);
    });
  });

  describe('register', () => {
    test('should register error handler', () => {
      const result = errorHook.register('handler1', 'Error', async (err) => ({ handled: true }));
      
      assert.ok(result);
    });
  });

  describe('handle', () => {
    test('should handle error through hooks', async () => {
      let handledError;
      errorHook.register('logger', 'Error', async (err) => {
        handledError = err;
        return { logged: true };
      });

      const error = new Error('Test error');
      await errorHook.handle(error);
      
      assert.strictEqual(handledError.message, 'Test error');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// STATE TRIGGER
// ═══════════════════════════════════════════════════════════════════════════

describe('StateTrigger', () => {
  let trigger;

  beforeEach(() => {
    trigger = new StateTrigger();
  });

  describe('constructor', () => {
    test('should create StateTrigger', () => {
      assert.ok(trigger);
    });
  });

  describe('register', () => {
    test('should register state transition trigger', () => {
      const result = trigger.register('idle-to-active', 'idle', 'active', async () => {});

      assert.ok(result);
      assert.strictEqual(result.triggerId, 'idle-to-active');
      assert.strictEqual(result.fromState, 'idle');
      assert.strictEqual(result.toState, 'active');
    });

    test('should throw for duplicate trigger', () => {
      trigger.register('dup', 'a', 'b', async () => {});
      assert.throws(
        () => trigger.register('dup', 'x', 'y', async () => {}),
        /already registered/
      );
    });
  });

  describe('evaluate', () => {
    test('should fire trigger on matching transition', async () => {
      let fired = false;
      trigger.register('start', 'stopped', 'running', async () => { fired = true; });

      await trigger.evaluate('running', 'stopped');
      
      assert.strictEqual(fired, true);
    });

    test('should not fire on non-matching transition', async () => {
      let fired = false;
      trigger.register('specific', 'a', 'b', async () => { fired = true; });

      await trigger.evaluate('y', 'x');
      
      assert.strictEqual(fired, false);
    });

    test('should support wildcard from-state', async () => {
      let fireCount = 0;
      trigger.register('any-to-error', '*', 'error', async () => { fireCount++; });

      await trigger.evaluate('error', 'running');
      await trigger.evaluate('error', 'idle');
      
      assert.strictEqual(fireCount, 2);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// THRESHOLD TRIGGER
// ═══════════════════════════════════════════════════════════════════════════

describe('ThresholdTrigger', () => {
  let trigger;

  beforeEach(() => {
    trigger = new ThresholdTrigger();
  });

  describe('constructor', () => {
    test('should create ThresholdTrigger', () => {
      assert.ok(trigger);
    });
  });

  describe('register', () => {
    test('should register threshold trigger', () => {
      const result = trigger.register('cpu-high', 'cpu', 80, 'above', () => {});

      assert.ok(result);
      assert.strictEqual(result.triggerId, 'cpu-high');
      assert.strictEqual(result.threshold, 80);
      assert.strictEqual(result.direction, 'above');
    });

    test('should throw for invalid direction', () => {
      assert.throws(
        () => trigger.register('bad', 'metric', 50, 'invalid', () => {}),
        /Invalid direction/
      );
    });
  });

  describe('update', () => {
    test('should update metric value', () => {
      const result = trigger.update('cpu', 50);

      assert.strictEqual(result.metric, 'cpu');
      assert.strictEqual(result.raw, 50);
      assert.ok('smoothed' in result);
    });

    test('should trigger when crossing threshold above', () => {
      let fired = false;
      trigger.register('high-cpu', 'cpu', 80, 'above', () => { fired = true; });

      // Initialize with low value
      trigger.update('cpu', 50);
      // Cross threshold
      trigger.update('cpu', 90);
      
      assert.strictEqual(fired, true);
    });

    test('should trigger when crossing threshold below', () => {
      let fired = false;
      trigger.register('low-battery', 'battery', 20, 'below', () => { fired = true; });

      // Initialize with high value
      trigger.update('battery', 50);
      // Cross threshold
      trigger.update('battery', 10);
      
      assert.strictEqual(fired, true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SCHEDULE TRIGGER
// ═══════════════════════════════════════════════════════════════════════════

describe('ScheduleTrigger', () => {
  let trigger;

  beforeEach(() => {
    trigger = new ScheduleTrigger();
  });

  describe('constructor', () => {
    test('should create ScheduleTrigger', () => {
      assert.ok(trigger);
    });
  });

  describe('register', () => {
    test('should register interval-based schedule', () => {
      const result = trigger.register('every-5-sec', 5000, async () => {});

      assert.ok(result);
      assert.strictEqual(result.triggerId, 'every-5-sec');
      assert.strictEqual(result.intervalMs, 5000);
    });

    test('should throw for invalid interval', () => {
      assert.throws(
        () => trigger.register('bad', -100, async () => {}),
        /positive number/
      );
    });

    test('should support options', () => {
      const result = trigger.register('with-opts', 1000, async () => {}, {
        maxFires: 5,
        jitter: true
      });

      assert.strictEqual(result.maxFires, 5);
      assert.strictEqual(result.jitter, true);
    });
  });

  describe('pause and resume', () => {
    test('should pause scheduled trigger', () => {
      trigger.register('pausable', 1000, async () => {});
      trigger.start('pausable');

      const result = trigger.pause('pausable');
      assert.strictEqual(result, true);
    });

    test('should resume paused trigger', () => {
      trigger.register('resumable', 1000, async () => {});
      trigger.start('resumable');
      trigger.pause('resumable');
      
      const result = trigger.resume('resumable');
      
      assert.strictEqual(result, true);
      
      trigger.stop('resumable');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Integration', () => {
  test('should integrate lifecycle hooks with state triggers', async () => {
    const lifecycle = new LifecycleHook();
    const stateTrigger = new StateTrigger();
    
    let currentState = 'idle';
    let transitioned = false;
    
    stateTrigger.register('boot-monitor', 'idle', 'booting', async () => {
      transitioned = true;
    });

    lifecycle.register('state-updater', 'boot', async () => {
      await stateTrigger.evaluate('booting', currentState);
      currentState = 'booting';
    });

    await lifecycle.fire('boot');
    
    assert.strictEqual(currentState, 'booting');
    assert.strictEqual(transitioned, true);
  });
});
