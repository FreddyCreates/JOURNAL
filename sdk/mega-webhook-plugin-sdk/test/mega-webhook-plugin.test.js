import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { WebhookRegistry } from '../src/webhook-registry.js';
import { DeliveryEngine } from '../src/delivery-engine.js';
import { SignatureVerifier } from '../src/signature-verifier.js';
import { RetryQueue } from '../src/retry-queue.js';
import { WebhookPlugin } from '../src/webhook-plugin.js';

describe('WebhookRegistry', () => {
  let wr; beforeEach(() => { wr = new WebhookRegistry(); });
  test('should register webhook', () => { const r = wr.register('https://example.com/hook', ['order.created']); assert.ok(r.webhookId); });
  test('should throw on empty url', () => { assert.throws(() => wr.register('', []), /URL required/); });
  test('should find by event', () => { wr.register('https://a.com', ['push']); const r = wr.findByEvent('push'); assert.strictEqual(r.length, 1); });
  test('should unregister', () => { const w = wr.register('https://a.com', []); wr.unregister(w.webhookId); assert.strictEqual(wr.getAll().length, 0); });
  test('should disable', () => { const w = wr.register('https://a.com', ['x']); wr.disable(w.webhookId); assert.strictEqual(wr.findByEvent('x').length, 0); });
  test('should throw on max', () => { const r = new WebhookRegistry({ maxWebhooks: 1 }); r.register('https://a.com', []); assert.throws(() => r.register('https://b.com', []), /Max webhooks/); });
});
describe('DeliveryEngine', () => {
  let de; beforeEach(() => { de = new DeliveryEngine(); });
  test('should deliver', () => { const r = de.deliver('wh1', 'https://a.com', { event: 'push' }); assert.strictEqual(r.status, 'delivered'); });
  test('should mark failed', () => { const d = de.deliver('wh1', 'https://a.com', {}); const r = de.markFailed(d.deliveryId, 'timeout'); assert.strictEqual(r.status, 'failed'); });
  test('should get stats', () => { de.deliver('wh1', 'https://a.com', {}); const s = de.getStats(); assert.strictEqual(s.total, 1); assert.strictEqual(s.delivered, 1); });
});
describe('SignatureVerifier', () => {
  let sv; beforeEach(() => { sv = new SignatureVerifier(); });
  test('should sign payload', () => { const r = sv.sign({ event: 'push' }, 'secret'); assert.ok(r.signature); });
  test('should verify valid signature', () => { const { signature } = sv.sign({ x: 1 }, 'key'); const r = sv.verify({ x: 1 }, 'key', signature); assert.strictEqual(r.valid, true); });
  test('should reject invalid signature', () => { const r = sv.verify({ x: 1 }, 'key', 'bad-sig'); assert.strictEqual(r.valid, false); });
});
describe('RetryQueue', () => {
  let rq; beforeEach(() => { rq = new RetryQueue({ maxRetries: 2 }); });
  test('should enqueue', () => { const r = rq.enqueue({ url: 'https://a.com' }); assert.ok(r.retryId); });
  test('should retry successfully', () => { const e = rq.enqueue({ url: 'https://a.com' }); const r = rq.retry(e.retryId, () => 'ok'); assert.strictEqual(r.success, true); });
  test('should move to dead after max retries', () => { const e = rq.enqueue({}); rq.retry(e.retryId, () => { throw new Error('fail'); }); rq.retry(e.retryId, () => { throw new Error('fail'); }); assert.strictEqual(rq.getDead().length, 1); });
  test('should track size', () => { rq.enqueue({}); assert.strictEqual(rq.size(), 1); });
});
describe('WebhookPlugin', () => {
  let wp; beforeEach(() => { wp = new WebhookPlugin(); });
  test('should register hook', () => { const r = wp.on('push', 'https://a.com/hook'); assert.strictEqual(r.hookCount, 1); });
  test('should dispatch', () => { wp.on('push', 'https://a.com'); wp.on('push', 'https://b.com'); const r = wp.dispatch('push', { ref: 'main' }); assert.strictEqual(r.dispatched, 2); });
  test('should get hooks', () => { wp.on('deploy', 'https://a.com'); assert.strictEqual(wp.getHooks('deploy').length, 1); });
});
