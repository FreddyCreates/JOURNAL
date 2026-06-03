import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { CircuitBreaker } from '../src/circuit-breaker.js';
import { HealthMonitor } from '../src/health-monitor.js';
import { RetryPolicy } from '../src/retry-policy.js';
import { BulkheadIsolator } from '../src/bulkhead-isolator.js';
import { ResiliencePlugin } from '../src/resilience-plugin.js';

describe('CircuitBreaker', () => {
  let cb; beforeEach(() => { cb = new CircuitBreaker({ failureThreshold: 3 }); });
  test('should start closed', () => { assert.strictEqual(cb.getState(), 'closed'); });
  test('should execute successfully', () => { const r = cb.execute(() => 42); assert.strictEqual(r, 42); });
  test('should open after threshold', () => { for (let i = 0; i < 3; i++) { try { cb.execute(() => { throw new Error('fail'); }); } catch {} } assert.strictEqual(cb.getState(), 'open'); });
  test('should reject when open', () => { for (let i = 0; i < 3; i++) { try { cb.execute(() => { throw new Error('f'); }); } catch {} } assert.throws(() => cb.execute(() => {}), /Circuit is open/); });
  test('should reset', () => { cb.reset(); assert.strictEqual(cb.getState(), 'closed'); });
});
describe('HealthMonitor', () => {
  let hm; beforeEach(() => { hm = new HealthMonitor(); });
  test('should register check', () => { const r = hm.register('db', () => true); assert.strictEqual(r.registered, true); });
  test('should check healthy', () => { hm.register('db', () => true); const r = hm.check('db'); assert.strictEqual(r.healthy, true); });
  test('should check unhealthy', () => { hm.register('db', () => false); const r = hm.check('db'); assert.strictEqual(r.healthy, false); });
  test('should throw on missing', () => { assert.throws(() => hm.check('x'), /not found/); });
});
describe('RetryPolicy', () => {
  let rp; beforeEach(() => { rp = new RetryPolicy({ maxRetries: 3 }); });
  test('should succeed first try', () => { const r = rp.execute(() => 'ok'); assert.strictEqual(r.result, 'ok'); assert.strictEqual(r.attempts, 1); });
  test('should retry on failure', () => { let calls = 0; const r = rp.execute(() => { calls++; if (calls < 3) throw new Error('fail'); return 'ok'; }); assert.strictEqual(r.attempts, 3); });
  test('should throw after max retries', () => { assert.throws(() => rp.execute(() => { throw new Error('always fail'); }), /always fail/); });
});
describe('BulkheadIsolator', () => {
  let bi; beforeEach(() => { bi = new BulkheadIsolator(); bi.createPartition('api', 2); });
  test('should acquire', () => { const r = bi.acquire('api'); assert.strictEqual(r.active, 1); });
  test('should reject at capacity', () => { bi.acquire('api'); bi.acquire('api'); assert.throws(() => bi.acquire('api'), /at capacity/); });
  test('should release', () => { bi.acquire('api'); bi.release('api'); const r = bi.acquire('api'); assert.strictEqual(r.active, 1); });
});
describe('ResiliencePlugin', () => {
  let rp; beforeEach(() => { rp = new ResiliencePlugin(); });
  test('should add policy', () => { const r = rp.addPolicy('cb', 'circuit-breaker'); assert.strictEqual(r.type, 'circuit-breaker'); });
  test('should record event', () => { const r = rp.recordEvent('cb', 'opened'); assert.ok(r.eventId); });
  test('should get active policies', () => { rp.addPolicy('a', 'retry'); assert.strictEqual(rp.getActivePolicies().length, 1); });
});
