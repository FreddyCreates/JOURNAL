import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { TokenBucket } from '../src/token-bucket.js';
import { SlidingWindow } from '../src/sliding-window.js';
import { AdaptiveThrottle } from '../src/adaptive-throttle.js';
import { QuotaManager } from '../src/quota-manager.js';
import { RateLimiterPlugin } from '../src/rate-limiter-plugin.js';

describe('TokenBucket', () => {
  let tb; beforeEach(() => { tb = new TokenBucket({ capacity: 5, refillRate: 1 }); });
  test('should allow within capacity', () => { const r = tb.consume(1); assert.strictEqual(r.allowed, true); });
  test('should deny when empty', () => { for (let i = 0; i < 5; i++) tb.consume(1); const r = tb.consume(1); assert.strictEqual(r.allowed, false); });
  test('should show status', () => { tb.consume(2); const s = tb.getStatus(); assert.strictEqual(s.tokens, 3); });
  test('should reset', () => { tb.consume(5); tb.reset(); assert.strictEqual(tb.getStatus().tokens, 5); });
});
describe('SlidingWindow', () => {
  let sw; beforeEach(() => { sw = new SlidingWindow({ maxRequests: 3, windowMs: 60000 }); });
  test('should allow under limit', () => { const r = sw.record('c1'); assert.strictEqual(r.allowed, true); });
  test('should block over limit', () => { sw.record('c1'); sw.record('c1'); sw.record('c1'); const r = sw.record('c1'); assert.strictEqual(r.allowed, false); });
  test('should reset', () => { sw.record('c1'); sw.reset('c1'); assert.strictEqual(sw.getCount('c1'), 0); });
});
describe('AdaptiveThrottle', () => {
  let at; beforeEach(() => { at = new AdaptiveThrottle({ baseDelay: 100 }); });
  test('should start at base delay', () => { const r = at.getDelay('c1'); assert.strictEqual(r.delay, 100); });
  test('should increase on failure', () => { at.recordFailure('c1'); const r = at.getDelay('c1'); assert.ok(r.delay > 100); });
  test('should decrease on success', () => { at.recordFailure('c1'); at.recordSuccess('c1'); const r = at.getDelay('c1'); assert.ok(r.delay <= 200); });
});
describe('QuotaManager', () => {
  let qm; beforeEach(() => { qm = new QuotaManager(); qm.setQuota('user1', 10); });
  test('should allow within quota', () => { const r = qm.consume('user1', 5); assert.strictEqual(r.allowed, true); });
  test('should deny over quota', () => { qm.consume('user1', 10); const r = qm.consume('user1', 1); assert.strictEqual(r.allowed, false); });
  test('should reset usage', () => { qm.consume('user1', 10); qm.resetUsage('user1'); const r = qm.getUsage('user1'); assert.strictEqual(r.used, 0); });
  test('should throw on unknown', () => { assert.throws(() => qm.consume('x'), /No quota/); });
});
describe('RateLimiterPlugin', () => {
  let rlp; beforeEach(() => { rlp = new RateLimiterPlugin(); rlp.createLimiter('api', 3); });
  test('should allow under limit', () => { const r = rlp.check('api'); assert.strictEqual(r.allowed, true); });
  test('should block over limit', () => { rlp.check('api'); rlp.check('api'); rlp.check('api'); const r = rlp.check('api'); assert.strictEqual(r.allowed, false); });
  test('should throw on missing', () => { assert.throws(() => rlp.check('x'), /not found/); });
  test('should track blocked', () => { rlp.check('api'); rlp.check('api'); rlp.check('api'); rlp.check('api'); assert.strictEqual(rlp.getBlocked().length, 1); });
});
