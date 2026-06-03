import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { CacheStore } from '../src/cache-store.js';
import { EvictionPolicy } from '../src/eviction-policy.js';
import { CacheCluster } from '../src/cache-cluster.js';
import { CoherenceManager } from '../src/coherence-manager.js';
import { CacheBridge } from '../src/cache-bridge.js';

describe('CacheStore', () => {
  let store; beforeEach(() => { store = new CacheStore(); });
  test('should set and get', () => { store.set('k', 'v'); const r = store.get('k'); assert.strictEqual(r.value, 'v'); });
  test('should miss on unknown', () => { const r = store.get('x'); assert.strictEqual(r.hit, false); });
  test('should delete', () => { store.set('k', 1); store.delete('k'); assert.strictEqual(store.get('k').hit, false); });
  test('should track stats', () => { store.set('k', 1); store.get('k'); store.get('x'); const s = store.getStats(); assert.strictEqual(s.hits, 1); });
  test('should flush', () => { store.set('k', 1); store.flush(); assert.strictEqual(store.getStats().size, 0); });
});
describe('EvictionPolicy', () => {
  let ep; beforeEach(() => { ep = new EvictionPolicy({ maxSize: 3, policy: 'lru' }); });
  test('should track access', () => { const r = ep.track('k1'); assert.strictEqual(r.tracked, true); });
  test('should detect eviction needed', () => { ep.track('a'); ep.track('b'); ep.track('c'); assert.strictEqual(ep.shouldEvict(), true); });
  test('should evict lru', () => { ep.track('a'); ep.track('b'); ep.track('c'); const r = ep.evict(); assert.ok(r.evicted); });
});
describe('CacheCluster', () => {
  let cc; beforeEach(() => { cc = new CacheCluster(); cc.addNode('n1'); cc.addNode('n2'); cc.addNode('n3'); });
  test('should add node', () => { assert.strictEqual(cc.getNodes().length, 3); });
  test('should assign key', () => { const r = cc.assign('user:123'); assert.ok(r.primary); });
  test('should throw on empty cluster', () => { const c = new CacheCluster(); assert.throws(() => c.assign('k'), /No nodes/); });
});
describe('CoherenceManager', () => {
  let cm; beforeEach(() => { cm = new CoherenceManager(); });
  test('should set version', () => { const r = cm.setVersion('k', 1); assert.strictEqual(r.version, 1); });
  test('should check coherent', () => { cm.setVersion('k', 2); const r = cm.checkCoherence('k', 2); assert.strictEqual(r.coherent, true); });
  test('should detect drift', () => { cm.setVersion('k', 3); const r = cm.checkCoherence('k', 1); assert.strictEqual(r.coherent, false); });
  test('should invalidate', () => { cm.setVersion('k', 1); cm.invalidate('k'); const r = cm.checkCoherence('k', 1); assert.strictEqual(r.coherent, true); });
});
describe('CacheBridge', () => {
  let cb; beforeEach(() => { cb = new CacheBridge(); cb.addTier('l1', { priority: 0 }); cb.addTier('l2', { priority: 1 }); });
  test('should set across tiers', () => { const r = cb.set('k', 'v'); assert.strictEqual(r.tiersWritten, 2); });
  test('should get from fastest tier', () => { cb.set('k', 'v'); const r = cb.get('k'); assert.strictEqual(r.tier, 'l1'); });
  test('should miss when not set', () => { const r = cb.get('x'); assert.strictEqual(r.hit, false); });
});
