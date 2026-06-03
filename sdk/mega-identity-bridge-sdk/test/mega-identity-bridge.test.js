import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { IdentityProvider } from '../src/identity-provider.js';
import { TrustScorer } from '../src/trust-scorer.js';
import { SessionManager } from '../src/session-manager.js';
import { ClaimVerifier } from '../src/claim-verifier.js';
import { FederationBridge } from '../src/federation-bridge.js';

describe('IdentityProvider', () => {
  let ip; beforeEach(() => { ip = new IdentityProvider(); });
  test('should register provider', () => { const r = ip.registerProvider('google'); assert.strictEqual(r.name, 'google'); });
  test('should create identity', () => { ip.registerProvider('gh'); const r = ip.createIdentity('gh', { email: 'a@b.c' }); assert.ok(r.identityId); });
  test('should throw on unknown provider', () => { assert.throws(() => ip.createIdentity('x', {}), /not registered/); });
  test('should resolve identity', () => { ip.registerProvider('p'); const id = ip.createIdentity('p', {}); const r = ip.resolve(id.identityId); assert.ok(r.trustLevel > 0); });
});
describe('TrustScorer', () => {
  let ts; beforeEach(() => { ts = new TrustScorer(); ts.initialize('user1', 0.5); });
  test('should initialize score', () => { const r = ts.getScore('user1'); assert.strictEqual(r.score, 0.5); });
  test('should boost', () => { ts.boost('user1', 0.2); const r = ts.getScore('user1'); assert.ok(r.score > 0.5); });
  test('should penalize', () => { ts.penalize('user1', 0.3); const r = ts.getScore('user1'); assert.ok(r.score < 0.5); });
  test('should throw on unknown entity', () => { assert.throws(() => ts.getScore('x'), /not found/); });
});
describe('SessionManager', () => {
  let sm; beforeEach(() => { sm = new SessionManager(); });
  test('should create session', () => { const r = sm.create('id1'); assert.ok(r.sessionId); });
  test('should validate session', () => { const s = sm.create('id1'); const r = sm.validate(s.sessionId); assert.strictEqual(r.valid, true); });
  test('should revoke session', () => { const s = sm.create('id1'); sm.revoke(s.sessionId); const r = sm.validate(s.sessionId); assert.strictEqual(r.valid, false); });
  test('should throw on missing session', () => { assert.throws(() => sm.validate('x'), /not found/); });
});
describe('ClaimVerifier', () => {
  let cv; beforeEach(() => { cv = new ClaimVerifier(); });
  test('should add rule', () => { const r = cv.addRule('email', v => v.includes('@')); assert.strictEqual(r.registered, true); });
  test('should verify claims', () => { cv.addRule('age', v => v >= 18); const r = cv.verify({ age: 25 }); assert.strictEqual(r.passed, 1); });
  test('should detect invalid claim', () => { cv.addRule('age', v => v >= 18); const r = cv.verify({ age: 10 }); assert.strictEqual(r.passed, 0); });
});
describe('FederationBridge', () => {
  let fb; beforeEach(() => { fb = new FederationBridge(); });
  test('should create federation', () => { const r = fb.createFederation('corp', ['google', 'azure']); assert.ok(r.federationId); });
  test('should map identity', () => { const f = fb.createFederation('t', []); const r = fb.mapIdentity(f.federationId, 'src1', 'tgt1'); assert.ok(r.mappingId); });
  test('should resolve mapping', () => { const f = fb.createFederation('t', []); fb.mapIdentity(f.federationId, 's', 't'); const r = fb.resolve(f.federationId, 's'); assert.strictEqual(r.resolved, true); });
});
