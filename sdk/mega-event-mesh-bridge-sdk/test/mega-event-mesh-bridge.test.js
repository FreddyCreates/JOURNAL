import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { EventBus } from '../src/event-bus.js';
import { TopicRouter } from '../src/topic-router.js';
import { DeadLetterQueue } from '../src/dead-letter-queue.js';
import { EventFilter } from '../src/event-filter.js';
import { MeshBridge } from '../src/mesh-bridge.js';

describe('EventBus', () => {
  let bus; beforeEach(() => { bus = new EventBus(); });
  test('should subscribe', () => { const r = bus.subscribe('orders', () => {}); assert.ok(r.subId); });
  test('should publish', () => { let received = null; bus.subscribe('t', e => { received = e; }); bus.publish('t', { x: 1 }); assert.deepStrictEqual(received, { x: 1 }); });
  test('should track delivery count', () => { bus.subscribe('t', () => {}); bus.subscribe('t', () => {}); const r = bus.publish('t', {}); assert.strictEqual(r.delivered, 2); });
  test('should unsubscribe', () => { const s = bus.subscribe('t', () => {}); assert.strictEqual(bus.unsubscribe('t', s.subId), true); });
  test('should throw on invalid handler', () => { assert.throws(() => bus.subscribe('t', 'bad'), /handler must be a function/); });
});
describe('TopicRouter', () => {
  let router; beforeEach(() => { router = new TopicRouter(); router.addRoute('orders', 'order-service'); router.addRoute('orders.created', 'new-order-service'); });
  test('should route exact match', () => { const r = router.route('orders'); assert.strictEqual(r.destination, 'order-service'); });
  test('should route prefix match', () => { const r = router.route('orders.created'); assert.strictEqual(r.destination, 'new-order-service'); });
  test('should throw on no route', () => { assert.throws(() => router.route('unknown'), /No route/); });
  test('should remove route', () => { router.removeRoute('orders'); assert.throws(() => router.route('orders'), /No route/); });
});
describe('DeadLetterQueue', () => {
  let dlq; beforeEach(() => { dlq = new DeadLetterQueue({ maxRetries: 2 }); });
  test('should enqueue', () => { const r = dlq.enqueue({ x: 1 }, 'timeout'); assert.ok(r.dlqId); });
  test('should retry successfully', () => { const e = dlq.enqueue({ x: 1 }, 'fail'); const r = dlq.retry(e.dlqId, ev => ({ done: true })); assert.strictEqual(r.success, true); });
  test('should fail on max retries', () => { const e = dlq.enqueue({}, 'err'); dlq.retry(e.dlqId, () => { throw new Error('fail'); }); dlq.retry(e.dlqId, () => { throw new Error('fail'); }); assert.throws(() => dlq.retry(e.dlqId, () => {}), /Max retries/); });
  test('should track size', () => { dlq.enqueue({}, 'a'); assert.strictEqual(dlq.size(), 1); });
});
describe('EventFilter', () => {
  let ef; beforeEach(() => { ef = new EventFilter(); });
  test('should add filter', () => { const r = ef.addFilter('hasType', e => !!e.type); assert.strictEqual(r.filterCount, 1); });
  test('should pass event', () => { ef.addFilter('valid', e => e.ok); const r = ef.apply({ ok: true }); assert.strictEqual(r.passed, true); });
  test('should block event', () => { ef.addFilter('valid', e => e.ok); const r = ef.apply({ ok: false }); assert.strictEqual(r.passed, false); });
  test('should track stats', () => { ef.addFilter('a', () => true); ef.apply({}); const s = ef.getStats(); assert.strictEqual(s.passed, 1); });
});
describe('MeshBridge', () => {
  let mb; beforeEach(() => { mb = new MeshBridge(); });
  test('should register mesh', () => { const r = mb.registerMesh('cloud'); assert.strictEqual(r.registered, true); });
  test('should connect meshes', () => { mb.registerMesh('a'); mb.registerMesh('b'); const r = mb.connect('a', 'b', ['orders']); assert.ok(r.connectionId); });
  test('should throw on missing mesh', () => { assert.throws(() => mb.connect('x', 'y'), /not found/); });
});
