import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { GatewayRouter } from '../src/gateway-router.js';
import { RequestTransformer } from '../src/request-transformer.js';
import { ResponseCache } from '../src/response-cache.js';
import { RateLimiter } from '../src/rate-limiter.js';
import { GatewayBridge } from '../src/gateway-bridge.js';

describe('GatewayRouter', () => {
  let router; beforeEach(() => { router = new GatewayRouter(); });
  test('should add route', () => { const r = router.addRoute('GET', '/api/users', () => []); assert.strictEqual(r.routeCount, 1); });
  test('should match route', () => { router.addRoute('POST', '/api/orders', () => ({})); const r = router.match('POST', '/api/orders'); assert.ok(r.handler); });
  test('should throw on no match', () => { assert.throws(() => router.match('GET', '/unknown'), /No route/); });
  test('should list routes', () => { router.addRoute('GET', '/a', () => {}); assert.strictEqual(router.getRoutes().length, 1); });
});
describe('RequestTransformer', () => {
  let rt; beforeEach(() => { rt = new RequestTransformer(); });
  test('should add transform', () => { const r = rt.addTransform('auth', req => ({ ...req, auth: true })); assert.strictEqual(r.transformCount, 1); });
  test('should apply transforms', () => { rt.addTransform('tag', req => ({ ...req, tagged: true })); const r = rt.transform({ url: '/test' }); assert.strictEqual(r.result.tagged, true); });
  test('should track history', () => { rt.addTransform('a', r => r); rt.transform({}); assert.strictEqual(rt.getHistory().length, 1); });
});
describe('ResponseCache', () => {
  let cache; beforeEach(() => { cache = new ResponseCache(); });
  test('should set and get', () => { cache.set('k1', { data: 1 }); const r = cache.get('k1'); assert.strictEqual(r.hit, true); });
  test('should miss on unknown key', () => { const r = cache.get('missing'); assert.strictEqual(r.hit, false); });
  test('should invalidate', () => { cache.set('k', 1); cache.invalidate('k'); assert.strictEqual(cache.get('k').hit, false); });
  test('should track stats', () => { cache.set('k', 1); cache.get('k'); cache.get('x'); const s = cache.getStats(); assert.strictEqual(s.hits, 1); assert.strictEqual(s.misses, 1); });
});
describe('RateLimiter', () => {
  let rl; beforeEach(() => { rl = new RateLimiter({ maxRequests: 3 }); });
  test('should allow under limit', () => { const r = rl.check('c1'); assert.strictEqual(r.allowed, true); });
  test('should block over limit', () => { rl.check('c1'); rl.check('c1'); rl.check('c1'); const r = rl.check('c1'); assert.strictEqual(r.allowed, false); });
  test('should reset', () => { rl.check('c1'); rl.check('c1'); rl.check('c1'); rl.reset('c1'); const r = rl.check('c1'); assert.strictEqual(r.allowed, true); });
});
describe('GatewayBridge', () => {
  let gb; beforeEach(() => { gb = new GatewayBridge(); });
  test('should register gateway', () => { const r = gb.registerGateway('public', { baseUrl: 'https://api.example.com' }); assert.strictEqual(r.registered, true); });
  test('should proxy request', () => { gb.registerGateway('a'); gb.registerGateway('b'); const r = gb.proxy('a', 'b', { path: '/test' }); assert.ok(r.proxyId); });
  test('should throw on missing gateway', () => { assert.throws(() => gb.proxy('x', 'y', {}), /not found/); });
});
