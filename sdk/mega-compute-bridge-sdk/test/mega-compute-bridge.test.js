import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { ComputePool } from '../src/compute-pool.js';
import { TaskDistributor } from '../src/task-distributor.js';
import { WorkerRegistry } from '../src/worker-registry.js';
import { LoadBalancer } from '../src/load-balancer.js';
import { ComputeBridge } from '../src/compute-bridge.js';

describe('ComputePool', () => {
  let pool;
  beforeEach(() => { pool = new ComputePool(); });
  test('should add worker', () => { const r = pool.addWorker('w1', 5); assert.ok(r.workerId); });
  test('should submit task', () => { pool.addWorker('w1', 2); const r = pool.submit({ type: 'compute' }); assert.ok(r.taskId); });
  test('should throw when no workers available', () => { pool.addWorker('w1', 1); pool.submit({}); assert.throws(() => pool.submit({}), /No available/); });
  test('should release worker', () => { const w = pool.addWorker('w1', 2); pool.submit({}); const r = pool.release(w.workerId); assert.strictEqual(r.load, 0); });
  test('should get utilization', () => { pool.addWorker('w1', 4); pool.submit({}); const u = pool.getUtilization(); assert.ok(u.utilization > 0); });
  test('should throw on max workers', () => { const p = new ComputePool({ maxWorkers: 1 }); p.addWorker('a'); assert.throws(() => p.addWorker('b'), /Max workers/); });
});

describe('TaskDistributor', () => {
  let dist;
  beforeEach(() => { dist = new TaskDistributor(); });
  test('should add target', () => { const r = dist.addTarget('gpu-cluster'); assert.strictEqual(r.targetCount, 1); });
  test('should distribute round-robin', () => { dist.addTarget('a'); dist.addTarget('b'); const r1 = dist.distribute({}); const r2 = dist.distribute({}); assert.notStrictEqual(r1.target, r2.target); });
  test('should throw on no targets', () => { assert.throws(() => dist.distribute({}), /No targets/); });
  test('should track stats', () => { dist.addTarget('x'); dist.distribute({}); const s = dist.getStats(); assert.strictEqual(s[0].taskCount, 1); });
});

describe('WorkerRegistry', () => {
  let reg;
  beforeEach(() => { reg = new WorkerRegistry(); });
  test('should register worker', () => { const r = reg.register('ml-worker', ['gpu', 'inference']); assert.ok(r.workerId); });
  test('should find by capability', () => { reg.register('w1', ['gpu']); const r = reg.findByCapability('gpu'); assert.strictEqual(r.length, 1); });
  test('should heartbeat', () => { const w = reg.register('w1', []); const r = reg.heartbeat(w.workerId); assert.ok(r.lastHeartbeat); });
  test('should deregister', () => { const w = reg.register('w1', []); reg.deregister(w.workerId); assert.strictEqual(reg.getActive().length, 0); });
});

describe('LoadBalancer', () => {
  let lb;
  beforeEach(() => { lb = new LoadBalancer(); lb.addBackend('s1'); lb.addBackend('s2'); });
  test('should route to least connections', () => { const r = lb.route(); assert.ok(r.backend); });
  test('should throw on no healthy backends', () => { lb.markUnhealthy('s1'); lb.markUnhealthy('s2'); assert.throws(() => lb.route(), /No healthy/); });
  test('should release connection', () => { lb.route(); const r = lb.release('s1'); assert.strictEqual(r.connections, 0); });
  test('should mark healthy/unhealthy', () => { lb.markUnhealthy('s1'); lb.markHealthy('s1'); const s = lb.getStatus(); assert.strictEqual(s[0].healthy, true); });
});

describe('ComputeBridge', () => {
  let bridge;
  beforeEach(() => { bridge = new ComputeBridge(); });
  test('should register provider', () => { const r = bridge.registerProvider('aws', p => p); assert.strictEqual(r.registered, true); });
  test('should dispatch job', () => { bridge.registerProvider('local', p => ({ ...p, done: true })); const r = bridge.dispatch('local', { x: 1 }); assert.strictEqual(r.result.done, true); });
  test('should throw on missing provider', () => { assert.throws(() => bridge.dispatch('missing', {}), /not found/); });
  test('should track jobs', () => { bridge.registerProvider('p', p => p); bridge.dispatch('p', {}); assert.strictEqual(bridge.getJobs().length, 1); });
});
