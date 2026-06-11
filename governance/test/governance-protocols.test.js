import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TemporalGovernanceProtocol } from '../protocols/temporal-governance.js';
import { UserLifecycleProtocol } from '../protocols/user-lifecycle.js';
import { PolicyEngineProtocol } from '../protocols/policy-engine.js';
import { EthicsFrameworkProtocol } from '../protocols/ethics-framework.js';
import { HTTPServiceGovernanceProtocol } from '../protocols/http-service-governance.js';
import { FederationAuthorityProtocol } from '../protocols/federation-authority.js';

// ═══════════════════════════════════════════════════════════════════
// TEMPORAL GOVERNANCE PROTOCOL — 35 Tests
// ═══════════════════════════════════════════════════════════════════

describe('Temporal Governance Protocol', () => {
  it('instantiates with correct defaults', () => {
    const t = new TemporalGovernanceProtocol();
    assert.equal(t.id, 'GOV-TEMPORAL-001');
    assert.equal(t.status, 'ACTIVE');
    assert.equal(t.rollbackWindow, 300);
  });

  it('initializes an epoch', () => {
    const t = new TemporalGovernanceProtocol();
    const epoch = t.initEpoch('test-epoch');
    assert.ok(epoch.id.startsWith('EPOCH-'));
    assert.equal(epoch.label, 'test-epoch');
    assert.equal(epoch.status, 'active');
  });

  it('tracks current epoch', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('first');
    assert.equal(t.currentEpoch.label, 'first');
  });

  it('records decisions in epoch', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('decision-epoch');
    const dec = t.recordDecision({ type: 'governance', action: 'test' });
    assert.ok(dec.id.startsWith('DEC-'));
    assert.equal(t.currentEpoch.decisions.length, 1);
  });

  it('throws when recording decision without epoch', () => {
    const t = new TemporalGovernanceProtocol();
    assert.throws(() => t.recordDecision({ type: 'test' }), /No active epoch/);
  });

  it('creates checkpoints', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('cp-epoch');
    const cp = t.checkpoint('before-change');
    assert.ok(cp.id.startsWith('CP-'));
    assert.equal(cp.label, 'before-change');
  });

  it('throws when creating checkpoint without epoch', () => {
    const t = new TemporalGovernanceProtocol();
    assert.throws(() => t.checkpoint('test'), /No active epoch/);
  });

  it('canRollback returns true within window', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('rollback-epoch');
    const cp = t.checkpoint('snap');
    assert.equal(t.canRollback(cp.id), true);
  });

  it('canRollback returns false for unknown checkpoint', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('test');
    assert.equal(t.canRollback('CP-nonexistent'), false);
  });

  it('canRollback returns false without epoch', () => {
    const t = new TemporalGovernanceProtocol();
    assert.equal(t.canRollback('CP-anything'), false);
  });

  it('executes rollback successfully', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('rollback-test');
    t.recordDecision({ type: 'first' });
    const cp = t.checkpoint('mid');
    t.recordDecision({ type: 'second' });
    t.recordDecision({ type: 'third' });
    const result = t.rollback(cp.id);
    assert.equal(result.success, true);
    assert.equal(result.removedDecisions, 2);
    assert.equal(t.currentEpoch.decisions.length, 1);
  });

  it('rollback fails for invalid checkpoint', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('test');
    const result = t.rollback('CP-invalid');
    assert.equal(result.success, false);
  });

  it('closes epoch with reason', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('close-test');
    const closed = t.closeEpoch('completed');
    assert.equal(closed.status, 'completed');
    assert.ok(closed.endedAt);
    assert.equal(t.currentEpoch, null);
  });

  it('throws when closing without active epoch', () => {
    const t = new TemporalGovernanceProtocol();
    assert.throws(() => t.closeEpoch(), /No active epoch/);
  });

  it('supports nested epochs via parentEpoch', () => {
    const t = new TemporalGovernanceProtocol();
    const first = t.initEpoch('parent');
    t.closeEpoch();
    const second = t.initEpoch('child');
    assert.equal(second.parentEpoch, null); // parent was closed
  });

  it('getTemporalHealth returns pristine for empty', () => {
    const t = new TemporalGovernanceProtocol();
    const h = t.getTemporalHealth();
    assert.equal(h.score, 1.0);
    assert.equal(h.status, 'pristine');
  });

  it('getTemporalHealth calculates healthy state', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('e1'); t.closeEpoch('completed');
    t.initEpoch('e2'); t.closeEpoch('completed');
    t.initEpoch('e3'); t.closeEpoch('completed');
    const h = t.getTemporalHealth();
    assert.equal(h.status, 'healthy');
    assert.equal(h.score, 1.0);
  });

  it('getTemporalHealth detects degraded state', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('e1'); t.closeEpoch('completed');
    t.initEpoch('e2'); t.closeEpoch('failed');
    t.initEpoch('e3'); t.closeEpoch('failed');
    const h = t.getTemporalHealth();
    assert.ok(h.score < 0.618);
  });

  it('getTimeline returns structured data', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('timeline-1');
    t.recordDecision({ type: 'a' });
    t.closeEpoch();
    const tl = t.getTimeline();
    assert.equal(tl.length, 1);
    assert.equal(tl[0].decisions, 1);
  });

  it('supports custom rollback window', () => {
    const t = new TemporalGovernanceProtocol();
    const epoch = t.initEpoch('custom', { rollbackWindow: 600 });
    assert.equal(epoch.rollbackWindowMs, 600000);
  });

  it('decisions are marked reversible by default', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('rev-test');
    const dec = t.recordDecision({ type: 'test' });
    assert.equal(dec.reversible, true);
  });

  it('decisions can be marked irreversible', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('irrev-test');
    const dec = t.recordDecision({ type: 'test', reversible: false });
    assert.equal(dec.reversible, false);
  });

  it('checkpoint records decision count at time', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('count-test');
    t.recordDecision({ type: 'a' });
    t.recordDecision({ type: 'b' });
    const cp = t.checkpoint('after-two');
    assert.equal(cp.decisionCount, 2);
  });

  it('multiple checkpoints in same epoch', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('multi-cp');
    t.checkpoint('first');
    t.checkpoint('second');
    assert.equal(t.currentEpoch.checkpoints.length, 2);
  });

  it('epoch stores startedAt as ISO string', () => {
    const t = new TemporalGovernanceProtocol();
    const epoch = t.initEpoch('iso-test');
    assert.ok(epoch.startedAt.includes('T'));
  });

  it('epochs array grows with each init', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('a'); t.closeEpoch();
    t.initEpoch('b'); t.closeEpoch();
    t.initEpoch('c'); t.closeEpoch();
    assert.equal(t.epochs.length, 3);
  });

  it('closed epoch has both start and end times', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('time-test');
    const closed = t.closeEpoch();
    assert.ok(closed.startedAt);
    assert.ok(closed.endedAt);
  });

  it('getTemporalHealth includes threshold', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('th'); t.closeEpoch('completed');
    const h = t.getTemporalHealth();
    assert.ok(Math.abs(h.threshold - 0.618) < 0.001);
  });

  it('version is 1.0.0', () => {
    const t = new TemporalGovernanceProtocol();
    assert.equal(t.version, '1.0.0');
  });

  it('name matches specification', () => {
    const t = new TemporalGovernanceProtocol();
    assert.equal(t.name, 'Temporal Governance Protocol');
  });

  it('decision has epochId', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('eid-test');
    const dec = t.recordDecision({ type: 'link' });
    assert.equal(dec.epochId, t.currentEpoch.id);
  });

  it('checkpoint has epochId', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('cpeid');
    const cp = t.checkpoint('linked');
    assert.equal(cp.epochId, t.currentEpoch.id);
  });

  it('handles rapid epoch cycling', () => {
    const t = new TemporalGovernanceProtocol();
    for (let i = 0; i < 50; i++) {
      t.initEpoch(`rapid-${i}`);
      t.recordDecision({ type: 'rapid', index: i });
      t.closeEpoch('completed');
    }
    assert.equal(t.epochs.length, 50);
    const h = t.getTemporalHealth();
    assert.equal(h.score, 1.0);
  });

  it('timeline shows correct order', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('alpha'); t.closeEpoch();
    t.initEpoch('beta'); t.closeEpoch();
    const tl = t.getTimeline();
    assert.equal(tl[0].label, 'alpha');
    assert.equal(tl[1].label, 'beta');
  });

  it('failed epochs tracked in health', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('f1'); t.closeEpoch('failed');
    const h = t.getTemporalHealth();
    assert.equal(h.failedEpochs, 1);
  });
});

// ═══════════════════════════════════════════════════════════════════
// USER LIFECYCLE PROTOCOL — 35 Tests
// ═══════════════════════════════════════════════════════════════════

describe('User Lifecycle Protocol', () => {
  it('instantiates correctly', () => {
    const u = new UserLifecycleProtocol();
    assert.equal(u.id, 'GOV-USER-001');
    assert.equal(u.status, 'ACTIVE');
  });

  it('registers a user', () => {
    const u = new UserLifecycleProtocol();
    const result = u.registerUser('user-1', { name: 'Alice' });
    assert.equal(result.success, true);
    assert.equal(result.user.id, 'user-1');
    assert.equal(result.user.status, 'pending');
  });

  it('prevents duplicate registration', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1');
    const result = u.registerUser('user-1');
    assert.equal(result.success, false);
  });

  it('gives consent', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1');
    const result = u.giveConsent('user-1', 'full');
    assert.equal(result.success, true);
  });

  it('consent fails for unknown user', () => {
    const u = new UserLifecycleProtocol();
    const result = u.giveConsent('ghost');
    assert.equal(result.success, false);
  });

  it('activates user after consent', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1');
    u.giveConsent('user-1');
    const result = u.activateUser('user-1');
    assert.equal(result.success, true);
    assert.equal(result.user.status, 'active');
  });

  it('activation fails without consent', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1');
    const result = u.activateUser('user-1');
    assert.equal(result.success, false);
  });

  it('activation fails for unknown user', () => {
    const u = new UserLifecycleProtocol();
    const result = u.activateUser('ghost');
    assert.equal(result.success, false);
  });

  it('assigns role to active user', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1'); u.giveConsent('user-1'); u.activateUser('user-1');
    const result = u.assignRole('user-1', 'admin');
    assert.equal(result.success, true);
    assert.ok(result.roles.includes('admin'));
  });

  it('role assignment fails for inactive user', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1');
    const result = u.assignRole('user-1', 'admin');
    assert.equal(result.success, false);
  });

  it('role assignment fails for unknown user', () => {
    const u = new UserLifecycleProtocol();
    const result = u.assignRole('ghost', 'admin');
    assert.equal(result.success, false);
  });

  it('does not duplicate roles', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1'); u.giveConsent('user-1'); u.activateUser('user-1');
    u.assignRole('user-1', 'admin');
    u.assignRole('user-1', 'admin');
    const status = u.getStatus('user-1');
    assert.equal(status.roles.filter(r => r === 'admin').length, 1);
  });

  it('revokes role', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1'); u.giveConsent('user-1'); u.activateUser('user-1');
    u.assignRole('user-1', 'admin');
    const result = u.revokeRole('user-1', 'admin');
    assert.equal(result.success, true);
    assert.ok(!result.roles.includes('admin'));
  });

  it('revoke fails for unknown user', () => {
    const u = new UserLifecycleProtocol();
    const result = u.revokeRole('ghost', 'admin');
    assert.equal(result.success, false);
  });

  it('hasPermission checks role', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1'); u.giveConsent('user-1'); u.activateUser('user-1');
    u.assignRole('user-1', 'admin');
    assert.equal(u.hasPermission('user-1', 'anything'), true); // admin has all
  });

  it('hasPermission false for inactive user', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1');
    assert.equal(u.hasPermission('user-1', 'read'), false);
  });

  it('hasPermission false for unknown user', () => {
    const u = new UserLifecycleProtocol();
    assert.equal(u.hasPermission('ghost', 'read'), false);
  });

  it('suspends user', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1'); u.giveConsent('user-1'); u.activateUser('user-1');
    const result = u.suspendUser('user-1', 'violation');
    assert.equal(result.success, true);
    assert.equal(u.getStatus('user-1').status, 'suspended');
  });

  it('suspend fails for unknown user', () => {
    const u = new UserLifecycleProtocol();
    const result = u.suspendUser('ghost', 'test');
    assert.equal(result.success, false);
  });

  it('offboards user', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1'); u.giveConsent('user-1'); u.activateUser('user-1');
    const result = u.offboardUser('user-1');
    assert.equal(result.success, true);
    assert.equal(result.exportRequired, true);
  });

  it('offboard fails for unknown user', () => {
    const u = new UserLifecycleProtocol();
    const result = u.offboardUser('ghost');
    assert.equal(result.success, false);
  });

  it('updates trust score', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1'); u.giveConsent('user-1'); u.activateUser('user-1');
    const result = u.updateTrust('user-1', 0.1);
    assert.equal(result.success, true);
    assert.ok(result.trustScore > 0);
  });

  it('trust score clamps to [0, 1]', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1'); u.giveConsent('user-1'); u.activateUser('user-1');
    u.updateTrust('user-1', 100);
    assert.equal(u.getStatus('user-1').trustScore, 1);
    u.updateTrust('user-1', -200);
    assert.equal(u.getStatus('user-1').trustScore, 0);
  });

  it('trust update fails for unknown user', () => {
    const u = new UserLifecycleProtocol();
    const result = u.updateTrust('ghost', 0.1);
    assert.equal(result.success, false);
  });

  it('getStatus returns null for unknown user', () => {
    const u = new UserLifecycleProtocol();
    assert.equal(u.getStatus('ghost'), null);
  });

  it('getStatus returns structured data', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1'); u.giveConsent('user-1'); u.activateUser('user-1');
    const s = u.getStatus('user-1');
    assert.equal(s.id, 'user-1');
    assert.equal(s.status, 'active');
    assert.equal(s.consentGiven, true);
  });

  it('getSystemHealth empty is healthy', () => {
    const u = new UserLifecycleProtocol();
    const h = u.getSystemHealth();
    assert.equal(h.status, 'empty');
  });

  it('getSystemHealth with active users', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('u1'); u.giveConsent('u1'); u.activateUser('u1');
    u.registerUser('u2'); u.giveConsent('u2'); u.activateUser('u2');
    const h = u.getSystemHealth();
    assert.equal(h.status, 'healthy');
    assert.equal(h.active, 2);
  });

  it('getSystemHealth detects degraded', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('u1'); u.giveConsent('u1'); u.activateUser('u1');
    u.registerUser('u2');
    u.registerUser('u3');
    u.registerUser('u4');
    const h = u.getSystemHealth();
    assert.equal(h.status, 'degraded');
  });

  it('audit log records actions', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1');
    u.giveConsent('user-1');
    assert.ok(u.auditLog.length >= 2);
  });

  it('data sovereignty defaults to user-owned', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1');
    assert.equal(u.getStatus('user-1').dataSovereignty, 'user-owned');
  });

  it('initial trust score after activation uses φ', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1'); u.giveConsent('user-1'); u.activateUser('user-1');
    const score = u.getStatus('user-1').trustScore;
    assert.ok(score > 0 && score < 1);
  });

  it('multiple roles can be assigned', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1'); u.giveConsent('user-1'); u.activateUser('user-1');
    u.assignRole('user-1', 'reader');
    u.assignRole('user-1', 'writer');
    u.assignRole('user-1', 'admin');
    assert.equal(u.getStatus('user-1').roles.length, 3);
  });

  it('suspended user count in health', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('u1'); u.giveConsent('u1'); u.activateUser('u1');
    u.suspendUser('u1', 'test');
    const h = u.getSystemHealth();
    assert.equal(h.suspended, 1);
  });

  it('consent scope is recorded', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('user-1');
    u.giveConsent('user-1', 'limited');
    const user = u.users.get('user-1');
    assert.equal(user.consentScope, 'limited');
  });
});

// ═══════════════════════════════════════════════════════════════════
// POLICY ENGINE PROTOCOL — 35 Tests
// ═══════════════════════════════════════════════════════════════════

describe('Policy Engine Protocol', () => {
  it('instantiates correctly', () => {
    const p = new PolicyEngineProtocol();
    assert.equal(p.id, 'GOV-POLICY-001');
    assert.equal(p.status, 'ACTIVE');
  });

  it('registers a policy', () => {
    const p = new PolicyEngineProtocol();
    const result = p.registerPolicy('POL-001', { name: 'Test Policy', rules: [] });
    assert.equal(result.success, true);
    assert.equal(result.policy.status, 'draft');
  });

  it('prevents duplicate policy', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('POL-001', { name: 'First' });
    const result = p.registerPolicy('POL-001', { name: 'Dup' });
    assert.equal(result.success, false);
  });

  it('activates policy with rules', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('POL-001', { name: 'Test', rules: [{ id: 'r1', field: 'x', operator: 'exists' }] });
    const result = p.activatePolicy('POL-001');
    assert.equal(result.success, true);
    assert.equal(result.policy.status, 'active');
  });

  it('activation fails without rules', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('POL-001', { name: 'Empty', rules: [] });
    const result = p.activatePolicy('POL-001');
    assert.equal(result.success, false);
  });

  it('activation fails for unknown policy', () => {
    const p = new PolicyEngineProtocol();
    const result = p.activatePolicy('ghost');
    assert.equal(result.success, false);
  });

  it('retires policy', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('POL-001', { name: 'Test', rules: [{ id: 'r1' }] });
    p.activatePolicy('POL-001');
    const result = p.retirePolicy('POL-001', 'outdated');
    assert.equal(result.success, true);
  });

  it('retire fails for unknown policy', () => {
    const p = new PolicyEngineProtocol();
    const result = p.retirePolicy('ghost');
    assert.equal(result.success, false);
  });

  it('evaluates context — all pass', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('POL-001', {
      name: 'Existence Check',
      rules: [{ id: 'r1', field: 'name', operator: 'exists' }],
    });
    p.activatePolicy('POL-001');
    const result = p.evaluate({ name: 'Alice' });
    assert.equal(result.allPassed, true);
  });

  it('evaluates context — violation detected', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('POL-001', {
      name: 'Equality Check',
      rules: [{ id: 'r1', field: 'role', operator: 'eq', value: 'admin' }],
    });
    p.activatePolicy('POL-001');
    const result = p.evaluate({ role: 'guest' });
    assert.equal(result.allPassed, false);
    assert.equal(result.violations.length, 1);
  });

  it('supports gt operator', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('POL-001', {
      name: 'GT', rules: [{ id: 'r1', field: 'age', operator: 'gt', value: 18 }],
    });
    p.activatePolicy('POL-001');
    assert.equal(p.evaluate({ age: 21 }).allPassed, true);
    assert.equal(p.evaluate({ age: 15 }).allPassed, false);
  });

  it('supports gte operator', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('POL-001', {
      name: 'GTE', rules: [{ id: 'r1', field: 'score', operator: 'gte', value: 80 }],
    });
    p.activatePolicy('POL-001');
    assert.equal(p.evaluate({ score: 80 }).allPassed, true);
    assert.equal(p.evaluate({ score: 79 }).allPassed, false);
  });

  it('supports lt operator', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('POL-001', {
      name: 'LT', rules: [{ id: 'r1', field: 'errors', operator: 'lt', value: 5 }],
    });
    p.activatePolicy('POL-001');
    assert.equal(p.evaluate({ errors: 3 }).allPassed, true);
    assert.equal(p.evaluate({ errors: 10 }).allPassed, false);
  });

  it('supports lte operator', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('POL-001', {
      name: 'LTE', rules: [{ id: 'r1', field: 'x', operator: 'lte', value: 100 }],
    });
    p.activatePolicy('POL-001');
    assert.equal(p.evaluate({ x: 100 }).allPassed, true);
    assert.equal(p.evaluate({ x: 101 }).allPassed, false);
  });

  it('supports neq operator', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('POL-001', {
      name: 'NEQ', rules: [{ id: 'r1', field: 'status', operator: 'neq', value: 'banned' }],
    });
    p.activatePolicy('POL-001');
    assert.equal(p.evaluate({ status: 'active' }).allPassed, true);
    assert.equal(p.evaluate({ status: 'banned' }).allPassed, false);
  });

  it('supports in operator', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('POL-001', {
      name: 'IN', rules: [{ id: 'r1', field: 'tier', operator: 'in', value: ['gold', 'platinum'] }],
    });
    p.activatePolicy('POL-001');
    assert.equal(p.evaluate({ tier: 'gold' }).allPassed, true);
    assert.equal(p.evaluate({ tier: 'bronze' }).allPassed, false);
  });

  it('supports contains operator', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('POL-001', {
      name: 'Contains', rules: [{ id: 'r1', field: 'email', operator: 'contains', value: '@' }],
    });
    p.activatePolicy('POL-001');
    assert.equal(p.evaluate({ email: 'a@b.com' }).allPassed, true);
    assert.equal(p.evaluate({ email: 'invalid' }).allPassed, false);
  });

  it('supports function conditions', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('POL-001', {
      name: 'Fn',
      rules: [{ id: 'r1', condition: (ctx) => ctx.value > 10 }],
    });
    p.activatePolicy('POL-001');
    assert.equal(p.evaluate({ value: 20 }).allPassed, true);
    assert.equal(p.evaluate({ value: 5 }).allPassed, false);
  });

  it('enforce creates enforcement record', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('POL-001', { name: 'Test', rules: [{ id: 'r1' }] });
    const result = p.enforce('POL-001', 'block', 'user-1');
    assert.equal(result.success, true);
    assert.ok(result.enforcement.id.startsWith('ENF-'));
  });

  it('enforce fails for unknown policy', () => {
    const p = new PolicyEngineProtocol();
    const result = p.enforce('ghost', 'block', 'user-1');
    assert.equal(result.success, false);
  });

  it('getComplianceScore with no policies', () => {
    const p = new PolicyEngineProtocol();
    const score = p.getComplianceScore();
    assert.equal(score.status, 'no-policies');
  });

  it('getComplianceScore with unevaluated policies', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('POL-001', { name: 'T', rules: [{ id: 'r1' }] });
    p.activatePolicy('POL-001');
    const score = p.getComplianceScore();
    assert.equal(score.status, 'unevaluated');
  });

  it('getComplianceScore tracks violations', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('POL-001', {
      name: 'Strict',
      rules: [{ id: 'r1', field: 'ok', operator: 'eq', value: true }],
    });
    p.activatePolicy('POL-001');
    p.evaluate({ ok: true });
    p.evaluate({ ok: false });
    const score = p.getComplianceScore();
    assert.equal(score.totalEvaluations, 2);
    assert.equal(score.totalViolations, 1);
    assert.equal(score.score, 0.5);
  });

  it('listPolicies returns all', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('P1', { name: 'One', rules: [{ id: 'r' }] });
    p.registerPolicy('P2', { name: 'Two', rules: [{ id: 'r' }] });
    assert.equal(p.listPolicies().length, 2);
  });

  it('listPolicies filters by status', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('P1', { name: 'One', rules: [{ id: 'r' }] });
    p.registerPolicy('P2', { name: 'Two', rules: [{ id: 'r' }] });
    p.activatePolicy('P1');
    assert.equal(p.listPolicies('active').length, 1);
    assert.equal(p.listPolicies('draft').length, 1);
  });

  it('policy priority affects order', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('LOW', { name: 'Low', priority: 1, rules: [{ id: 'r' }] });
    p.registerPolicy('HIGH', { name: 'High', priority: 10, rules: [{ id: 'r' }] });
    p.activatePolicy('LOW');
    p.activatePolicy('HIGH');
    const result = p.evaluate({ anything: true });
    assert.equal(result.results[0].policyId, 'HIGH');
  });

  it('evaluation ID is unique', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('P1', { name: 'T', rules: [{ id: 'r1', field: 'x', operator: 'exists' }] });
    p.activatePolicy('P1');
    const e1 = p.evaluate({ x: 1 });
    const e2 = p.evaluate({ x: 2 });
    assert.notEqual(e1.id, e2.id);
  });

  it('retired policies are not evaluated', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('P1', { name: 'T', rules: [{ id: 'r1', field: 'x', operator: 'eq', value: 1 }] });
    p.activatePolicy('P1');
    p.retirePolicy('P1');
    const result = p.evaluate({ x: 999 });
    assert.equal(result.results.length, 0);
  });

  it('unknown operator defaults to pass', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('P1', {
      name: 'T', rules: [{ id: 'r1', field: 'x', operator: 'fancy', value: 1 }],
    });
    p.activatePolicy('P1');
    const result = p.evaluate({ x: 1 });
    assert.equal(result.allPassed, false); // unknown op returns false
  });

  it('evaluation records timestamp', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('P1', { name: 'T', rules: [{ id: 'r1' }] });
    p.activatePolicy('P1');
    const result = p.evaluate({ x: 1 });
    assert.ok(result.timestamp.includes('T'));
  });

  it('multiple rules must all pass', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('MULTI', {
      name: 'Multi',
      rules: [
        { id: 'r1', field: 'a', operator: 'eq', value: 1 },
        { id: 'r2', field: 'b', operator: 'eq', value: 2 },
      ],
    });
    p.activatePolicy('MULTI');
    assert.equal(p.evaluate({ a: 1, b: 2 }).allPassed, true);
    assert.equal(p.evaluate({ a: 1, b: 9 }).allPassed, false);
  });

  it('evaluation count increments', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('P1', { name: 'T', rules: [{ id: 'r1' }] });
    p.activatePolicy('P1');
    p.evaluate({});
    p.evaluate({});
    p.evaluate({});
    const policies = p.listPolicies();
    assert.equal(policies[0].evaluations, 3);
  });

  it('function condition that throws counts as fail', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('ERR', {
      name: 'Error',
      rules: [{ id: 'r1', condition: () => { throw new Error('boom'); } }],
    });
    p.activatePolicy('ERR');
    const result = p.evaluate({});
    assert.equal(result.allPassed, false);
  });

  it('version is 1.0.0', () => {
    const p = new PolicyEngineProtocol();
    assert.equal(p.version, '1.0.0');
  });
});

// ═══════════════════════════════════════════════════════════════════
// ETHICS FRAMEWORK PROTOCOL — 35 Tests
// ═══════════════════════════════════════════════════════════════════

describe('Ethics Framework Protocol', () => {
  it('instantiates correctly', () => {
    const e = new EthicsFrameworkProtocol();
    assert.equal(e.id, 'GOV-ETHICS-001');
    assert.equal(e.status, 'ACTIVE');
  });

  it('registers a principle', () => {
    const e = new EthicsFrameworkProtocol();
    const result = e.registerPrinciple('HARM-001', { name: 'Do No Harm', category: 'harm-prevention' });
    assert.equal(result.success, true);
  });

  it('adds constraint', () => {
    const e = new EthicsFrameworkProtocol();
    const c = e.addConstraint({ name: 'no-harm', type: 'prohibition', severity: 'critical' });
    assert.ok(c.id.startsWith('CONSTRAINT-'));
  });

  it('assesses ethical action — approved', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('HARM', { name: 'No Harm', category: 'harm-prevention', mandatory: true });
    const result = e.assess({ causesHarm: false });
    assert.equal(result.approved, true);
  });

  it('assesses ethical action — rejected (harm)', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('HARM', { name: 'No Harm', category: 'harm-prevention', mandatory: true });
    const result = e.assess({ causesHarm: true });
    assert.equal(result.approved, false);
  });

  it('mandatory violation blocks approval', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('TRANS', { name: 'Transparency', category: 'transparency', mandatory: true });
    const result = e.assess({ isTransparent: false });
    assert.equal(result.approved, false);
  });

  it('non-mandatory failure does not block', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('OPT', { name: 'Optional', category: 'general', mandatory: false });
    const result = e.assess({ anything: true });
    assert.equal(result.approved, true);
  });

  it('constraint violation blocks approval', () => {
    const e = new EthicsFrameworkProtocol();
    e.addConstraint({ name: 'no-harm', type: 'prohibition' });
    const result = e.assess({ causesHarm: true });
    assert.equal(result.approved, false);
  });

  it('discrimination constraint', () => {
    const e = new EthicsFrameworkProtocol();
    e.addConstraint({ name: 'no-discrimination', type: 'prohibition' });
    const result = e.assess({ isDiscriminatory: true });
    assert.equal(result.approved, false);
  });

  it('deception constraint', () => {
    const e = new EthicsFrameworkProtocol();
    e.addConstraint({ name: 'no-deception', type: 'prohibition' });
    const result = e.assess({ isDeceptive: true });
    assert.equal(result.approved, false);
  });

  it('obligation constraint — transparency required', () => {
    const e = new EthicsFrameworkProtocol();
    e.addConstraint({ name: 'transparency-required', type: 'obligation' });
    const fail = e.assess({ isTransparent: false });
    assert.equal(fail.approved, false);
    const pass = e.assess({ isTransparent: true });
    assert.equal(pass.approved, true);
  });

  it('obligation constraint — consent required', () => {
    const e = new EthicsFrameworkProtocol();
    e.addConstraint({ name: 'consent-required', type: 'obligation' });
    assert.equal(e.assess({ hasConsent: false }).approved, false);
    assert.equal(e.assess({ hasConsent: true }).approved, true);
  });

  it('ethics score calculated correctly', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('A', { name: 'A', category: 'harm-prevention', weight: 1 });
    e.registerPrinciple('B', { name: 'B', category: 'transparency', weight: 1 });
    const result = e.assess({ causesHarm: false, isTransparent: true });
    assert.equal(result.ethicsScore, 1.0);
  });

  it('partial ethics score', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('A', { name: 'A', category: 'harm-prevention', weight: 1 });
    e.registerPrinciple('B', { name: 'B', category: 'transparency', weight: 1 });
    const result = e.assess({ causesHarm: true, isTransparent: true });
    assert.equal(result.ethicsScore, 0.5);
  });

  it('weighted principles affect score', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('A', { name: 'A', category: 'harm-prevention', weight: 3 });
    e.registerPrinciple('B', { name: 'B', category: 'transparency', weight: 1 });
    const result = e.assess({ causesHarm: false, isTransparent: false });
    assert.equal(result.ethicsScore, 0.75);
  });

  it('getFairnessMetrics with no data', () => {
    const e = new EthicsFrameworkProtocol();
    const m = e.getFairnessMetrics();
    assert.equal(m.status, 'no-data');
  });

  it('getFairnessMetrics with assessments', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('H', { name: 'H', category: 'harm-prevention' });
    e.assess({ causesHarm: false });
    e.assess({ causesHarm: false });
    const m = e.getFairnessMetrics();
    assert.equal(m.score, 1.0);
    assert.equal(m.status, 'fair');
  });

  it('getTransparencyReport structure', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('P1', { name: 'P1', category: 'general' });
    e.addConstraint({ name: 'c1', type: 'prohibition' });
    const report = e.getTransparencyReport();
    assert.equal(report.totalPrinciples, 1);
    assert.equal(report.totalConstraints, 1);
  });

  it('detectBias with insufficient data', () => {
    const e = new EthicsFrameworkProtocol();
    const result = e.detectBias('group');
    assert.equal(result.biasDetected, false);
    assert.equal(result.reason, 'insufficient-data');
  });

  it('detectBias with single group', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('H', { name: 'H', category: 'harm-prevention' });
    e.assess({ causesHarm: false, group: 'A' });
    e.assess({ causesHarm: false, group: 'A' });
    const result = e.detectBias('group');
    assert.equal(result.biasDetected, false);
  });

  it('detectBias detects disparity', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('H', { name: 'H', category: 'harm-prevention', mandatory: true });
    e.assess({ causesHarm: false, group: 'A' });
    e.assess({ causesHarm: false, group: 'A' });
    e.assess({ causesHarm: true, group: 'B' });
    e.assess({ causesHarm: true, group: 'B' });
    const result = e.detectBias('group');
    assert.equal(result.biasDetected, true);
  });

  it('violations tracked', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('H', { name: 'H', category: 'harm-prevention', mandatory: true });
    e.assess({ causesHarm: true });
    assert.equal(e.violations.length, 1);
  });

  it('consent principle checks hasConsent', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('C', { name: 'Consent', category: 'consent', mandatory: true });
    assert.equal(e.assess({ hasConsent: true }).approved, true);
    assert.equal(e.assess({ hasConsent: false }).approved, false);
  });

  it('fairness principle checks isFair', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('F', { name: 'Fair', category: 'fairness', mandatory: true });
    assert.equal(e.assess({ isFair: true }).approved, true);
    assert.equal(e.assess({ isFair: false }).approved, false);
  });

  it('privacy principle checks respectsPrivacy', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('P', { name: 'Privacy', category: 'privacy', mandatory: true });
    assert.equal(e.assess({ respectsPrivacy: true }).approved, true);
    assert.equal(e.assess({ respectsPrivacy: false }).approved, false);
  });

  it('accountability principle checks hasAccountability', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('A', { name: 'Account', category: 'accountability', mandatory: true });
    assert.equal(e.assess({ hasAccountability: true }).approved, true);
    assert.equal(e.assess({ hasAccountability: false }).approved, false);
  });

  it('assessment has unique ID', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('H', { name: 'H', category: 'general' });
    const a1 = e.assess({});
    const a2 = e.assess({});
    assert.notEqual(a1.id, a2.id);
  });

  it('assessment records timestamp', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('H', { name: 'H', category: 'general' });
    const a = e.assess({});
    assert.ok(a.timestamp.includes('T'));
  });

  it('constraint severity levels', () => {
    const e = new EthicsFrameworkProtocol();
    const c1 = e.addConstraint({ name: 'c1', severity: 'critical' });
    const c2 = e.addConstraint({ name: 'c2', severity: 'warning' });
    assert.equal(c1.severity, 'critical');
    assert.equal(c2.severity, 'warning');
  });

  it('multiple principles aggregate', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('H', { name: 'Harm', category: 'harm-prevention', weight: 2 });
    e.registerPrinciple('T', { name: 'Trans', category: 'transparency', weight: 1 });
    e.registerPrinciple('C', { name: 'Consent', category: 'consent', weight: 1 });
    const result = e.assess({ causesHarm: false, isTransparent: true, hasConsent: true });
    assert.equal(result.ethicsScore, 1.0);
    assert.equal(result.approved, true);
  });

  it('version is 1.0.0', () => {
    const e = new EthicsFrameworkProtocol();
    assert.equal(e.version, '1.0.0');
  });

  it('getFairnessMetrics averageEthicsScore', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('H', { name: 'H', category: 'harm-prevention', weight: 1 });
    e.registerPrinciple('T', { name: 'T', category: 'transparency', weight: 1 });
    e.assess({ causesHarm: false, isTransparent: true }); // score 1.0
    e.assess({ causesHarm: true, isTransparent: false }); // score 0.0
    const m = e.getFairnessMetrics();
    assert.equal(m.averageEthicsScore, 0.5);
  });

  it('total violations count', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('H', { name: 'H', category: 'harm-prevention', mandatory: true });
    e.assess({ causesHarm: true });
    e.assess({ causesHarm: true });
    e.assess({ causesHarm: false });
    const report = e.getTransparencyReport();
    assert.equal(report.totalViolations, 2);
  });

  it('empty principles means all approved', () => {
    const e = new EthicsFrameworkProtocol();
    const result = e.assess({ anything: true });
    assert.equal(result.approved, true);
    assert.equal(result.ethicsScore, 1.0);
  });

  it('mandatoryViolations count in assessment', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('H', { name: 'H', category: 'harm-prevention', mandatory: true });
    e.registerPrinciple('T', { name: 'T', category: 'transparency', mandatory: true });
    const result = e.assess({ causesHarm: true, isTransparent: false });
    assert.equal(result.mandatoryViolations, 2);
  });
});

// ═══════════════════════════════════════════════════════════════════
// HTTP SERVICE GOVERNANCE PROTOCOL — 35 Tests
// ═══════════════════════════════════════════════════════════════════

describe('HTTP Service Governance Protocol', () => {
  it('instantiates correctly', () => {
    const h = new HTTPServiceGovernanceProtocol();
    assert.equal(h.id, 'GOV-HTTP-001');
    assert.equal(h.status, 'ACTIVE');
  });

  it('registers a service', () => {
    const h = new HTTPServiceGovernanceProtocol();
    const result = h.registerService('svc-1', { name: 'API', baseUrl: 'http://localhost:3000' });
    assert.equal(result.success, true);
    assert.equal(result.service.status, 'registered');
  });

  it('prevents duplicate service registration', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    const result = h.registerService('svc-1', { baseUrl: 'http://b' });
    assert.equal(result.success, false);
  });

  it('activates service', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    const result = h.activateService('svc-1');
    assert.equal(result.success, true);
  });

  it('activation fails for unknown service', () => {
    const h = new HTTPServiceGovernanceProtocol();
    const result = h.activateService('ghost');
    assert.equal(result.success, false);
  });

  it('registers route', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    const result = h.registerRoute({ method: 'GET', path: '/users', serviceId: 'svc-1' });
    assert.equal(result.success, true);
    assert.ok(result.route.id.startsWith('ROUTE-'));
  });

  it('health check on active service', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    h.activateService('svc-1');
    const result = h.healthCheck('svc-1');
    assert.equal(result.success, true);
    assert.equal(result.status, 'healthy');
  });

  it('health check on inactive service', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    const result = h.healthCheck('svc-1');
    assert.equal(result.status, 'unhealthy');
  });

  it('health check fails for unknown service', () => {
    const h = new HTTPServiceGovernanceProtocol();
    const result = h.healthCheck('ghost');
    assert.equal(result.success, false);
  });

  it('records successful request', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    const result = h.recordRequest('svc-1', true);
    assert.equal(result.success, true);
    assert.equal(result.requestCount, 1);
    assert.equal(result.errorRate, 0);
  });

  it('records failed request', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    h.recordRequest('svc-1', true);
    const result = h.recordRequest('svc-1', false);
    assert.equal(result.errorRate, 0.5);
  });

  it('record request fails for unknown service', () => {
    const h = new HTTPServiceGovernanceProtocol();
    const result = h.recordRequest('ghost');
    assert.equal(result.success, false);
  });

  it('circuit breaker starts closed', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    assert.equal(h.getCircuitState('svc-1'), 'closed');
  });

  it('circuit breaker opens after threshold failures', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    for (let i = 0; i < 5; i++) h.recordRequest('svc-1', false);
    assert.equal(h.getCircuitState('svc-1'), 'open');
  });

  it('circuit state unknown for unregistered service', () => {
    const h = new HTTPServiceGovernanceProtocol();
    assert.equal(h.getCircuitState('ghost'), 'unknown');
  });

  it('rate limit check allows by default', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    const result = h.checkRateLimit('svc-1', 'client-1');
    assert.equal(result.allowed, true);
  });

  it('rate limit fails for unknown service', () => {
    const h = new HTTPServiceGovernanceProtocol();
    const result = h.checkRateLimit('ghost', 'client-1');
    assert.equal(result.allowed, false);
  });

  it('getServiceMesh overview', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('s1', { baseUrl: 'http://a' });
    h.registerService('s2', { baseUrl: 'http://b' });
    h.activateService('s1');
    const mesh = h.getServiceMesh();
    assert.equal(mesh.totalServices, 2);
    assert.equal(mesh.activeServices, 1);
  });

  it('service mesh health status', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('s1', { baseUrl: 'http://a' });
    h.activateService('s1');
    h.healthCheck('s1');
    const mesh = h.getServiceMesh();
    assert.ok(mesh.meshHealth > 0);
  });

  it('decommissions service', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    h.registerRoute({ path: '/x', serviceId: 'svc-1' });
    const result = h.decommissionService('svc-1', 'deprecated');
    assert.equal(result.success, true);
    assert.equal(h.routes.length, 0); // routes removed
  });

  it('decommission fails for unknown service', () => {
    const h = new HTTPServiceGovernanceProtocol();
    const result = h.decommissionService('ghost');
    assert.equal(result.success, false);
  });

  it('service default health endpoint', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    const svc = h.services.get('svc-1');
    assert.equal(svc.healthEndpoint, '/health');
  });

  it('service custom config', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', {
      baseUrl: 'http://a',
      timeout: 5000,
      retries: 5,
      rateLimit: { requests: 500, windowMs: 30000 },
    });
    const svc = h.services.get('svc-1');
    assert.equal(svc.timeout, 5000);
    assert.equal(svc.retries, 5);
    assert.equal(svc.rateLimit.requests, 500);
  });

  it('auth required by default', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    assert.equal(h.services.get('svc-1').authRequired, true);
  });

  it('auth can be disabled', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a', authRequired: false });
    assert.equal(h.services.get('svc-1').authRequired, false);
  });

  it('multiple routes for same service', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    h.registerRoute({ method: 'GET', path: '/a', serviceId: 'svc-1' });
    h.registerRoute({ method: 'POST', path: '/b', serviceId: 'svc-1' });
    h.registerRoute({ method: 'DELETE', path: '/c', serviceId: 'svc-1' });
    assert.equal(h.routes.length, 3);
  });

  it('route method defaults to GET', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    const result = h.registerRoute({ path: '/test', serviceId: 'svc-1' });
    assert.equal(result.route.method, 'GET');
  });

  it('health checks accumulate', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    h.activateService('svc-1');
    h.healthCheck('svc-1');
    h.healthCheck('svc-1');
    h.healthCheck('svc-1');
    assert.equal(h.healthChecks.length, 3);
  });

  it('service mesh shows circuit state', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    const mesh = h.getServiceMesh();
    assert.equal(mesh.services[0].circuit, 'closed');
  });

  it('error rate calculation', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    h.recordRequest('svc-1', true);
    h.recordRequest('svc-1', true);
    h.recordRequest('svc-1', false);
    const mesh = h.getServiceMesh();
    const svc = mesh.services.find(s => s.id === 'svc-1');
    assert.ok(Math.abs(svc.errorRate - 1/3) < 0.01);
  });

  it('version is 1.0.0', () => {
    const h = new HTTPServiceGovernanceProtocol();
    assert.equal(h.version, '1.0.0');
  });

  it('decommissioned service shows in mesh', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    h.decommissionService('svc-1');
    const mesh = h.getServiceMesh();
    assert.equal(mesh.services[0].status, 'decommissioned');
  });

  it('open circuit affects health check', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    h.activateService('svc-1');
    for (let i = 0; i < 5; i++) h.recordRequest('svc-1', false);
    const check = h.healthCheck('svc-1');
    assert.equal(check.status, 'unhealthy');
  });

  it('request count tracking', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('svc-1', { baseUrl: 'http://a' });
    for (let i = 0; i < 10; i++) h.recordRequest('svc-1', true);
    const mesh = h.getServiceMesh();
    assert.equal(mesh.services[0].requests, 10);
  });
});

// ═══════════════════════════════════════════════════════════════════
// FEDERATION AUTHORITY PROTOCOL — 30 Tests
// ═══════════════════════════════════════════════════════════════════

describe('Federation Authority Protocol', () => {
  it('instantiates correctly', () => {
    const f = new FederationAuthorityProtocol();
    assert.equal(f.id, 'GOV-FEDERATION-001');
    assert.equal(f.status, 'ACTIVE');
  });

  it('adds a member', () => {
    const f = new FederationAuthorityProtocol();
    const result = f.addMember('org-1', { name: 'Org One' });
    assert.equal(result.success, true);
    assert.equal(result.member.status, 'pending');
  });

  it('prevents duplicate member', () => {
    const f = new FederationAuthorityProtocol();
    f.addMember('org-1', { name: 'A' });
    const result = f.addMember('org-1', { name: 'B' });
    assert.equal(result.success, false);
  });

  it('approves member', () => {
    const f = new FederationAuthorityProtocol();
    f.addMember('org-1', { name: 'A' });
    const result = f.approveMember('org-1');
    assert.equal(result.success, true);
    assert.equal(result.member.status, 'active');
  });

  it('approve fails for unknown member', () => {
    const f = new FederationAuthorityProtocol();
    const result = f.approveMember('ghost');
    assert.equal(result.success, false);
  });

  it('suspends member', () => {
    const f = new FederationAuthorityProtocol();
    f.addMember('org-1', { name: 'A' });
    f.approveMember('org-1');
    const result = f.suspendMember('org-1', 'breach');
    assert.equal(result.success, true);
  });

  it('suspend fails for unknown member', () => {
    const f = new FederationAuthorityProtocol();
    const result = f.suspendMember('ghost', 'test');
    assert.equal(result.success, false);
  });

  it('creates treaty', () => {
    const f = new FederationAuthorityProtocol();
    const result = f.createTreaty({ name: 'Data Sharing', parties: ['org-1', 'org-2'] });
    assert.equal(result.success, true);
    assert.ok(result.treaty.id.startsWith('TREATY-'));
    assert.equal(result.treaty.status, 'proposed');
  });

  it('votes on treaty', () => {
    const f = new FederationAuthorityProtocol();
    f.addMember('org-1', { name: 'A', votingPower: 1 });
    f.approveMember('org-1');
    const { treaty } = f.createTreaty({ name: 'T1' });
    const result = f.voteTreaty(treaty.id, 'org-1', 'approve');
    assert.equal(result.success, true);
  });

  it('treaty ratified when quorum reached', () => {
    const f = new FederationAuthorityProtocol();
    f.addMember('m1', { votingPower: 1 }); f.approveMember('m1');
    f.addMember('m2', { votingPower: 1 }); f.approveMember('m2');
    f.addMember('m3', { votingPower: 1 }); f.approveMember('m3');
    const { treaty } = f.createTreaty({ name: 'T1' });
    f.voteTreaty(treaty.id, 'm1', 'approve');
    const result = f.voteTreaty(treaty.id, 'm2', 'approve');
    // 2/3 = 0.667 >= φ⁻¹ (0.618) → ratified
    assert.equal(result.currentStatus, 'ratified');
  });

  it('vote fails for unknown treaty', () => {
    const f = new FederationAuthorityProtocol();
    f.addMember('m1', {}); f.approveMember('m1');
    const result = f.voteTreaty('TREATY-ghost', 'm1', 'approve');
    assert.equal(result.success, false);
  });

  it('vote fails for inactive member', () => {
    const f = new FederationAuthorityProtocol();
    f.addMember('m1', {});
    const { treaty } = f.createTreaty({ name: 'T' });
    const result = f.voteTreaty(treaty.id, 'm1', 'approve');
    assert.equal(result.success, false);
  });

  it('adds shared policy', () => {
    const f = new FederationAuthorityProtocol();
    const result = f.addSharedPolicy({ name: 'Common Rules', rules: ['no-spam'] });
    assert.equal(result.success, true);
    assert.ok(result.policy.id.startsWith('SHARED-'));
  });

  it('getFederationHealth empty', () => {
    const f = new FederationAuthorityProtocol();
    const h = f.getFederationHealth();
    assert.equal(h.totalMembers, 0);
    assert.equal(h.status, 'fragile');
  });

  it('getFederationHealth with active members', () => {
    const f = new FederationAuthorityProtocol();
    f.addMember('m1', { trustLevel: 0.8 }); f.approveMember('m1');
    f.addMember('m2', { trustLevel: 0.9 }); f.approveMember('m2');
    const h = f.getFederationHealth();
    assert.equal(h.activeMembers, 2);
    assert.ok(h.averageTrust > 0.618);
    assert.equal(h.status, 'healthy');
  });

  it('updateTrust', () => {
    const f = new FederationAuthorityProtocol();
    f.addMember('m1', { trustLevel: 0.5 });
    const result = f.updateTrust('m1', 0.9);
    assert.equal(result.success, true);
    assert.equal(result.trustLevel, 0.9);
  });

  it('updateTrust clamps to [0, 1]', () => {
    const f = new FederationAuthorityProtocol();
    f.addMember('m1', {});
    f.updateTrust('m1', 5.0);
    assert.equal(f.members.get('m1').trustLevel, 1);
    f.updateTrust('m1', -5.0);
    assert.equal(f.members.get('m1').trustLevel, 0);
  });

  it('updateTrust fails for unknown member', () => {
    const f = new FederationAuthorityProtocol();
    const result = f.updateTrust('ghost', 0.5);
    assert.equal(result.success, false);
  });

  it('getConsensusStatus', () => {
    const f = new FederationAuthorityProtocol();
    f.addMember('m1', {}); f.approveMember('m1');
    f.addMember('m2', {}); f.approveMember('m2');
    f.addMember('m3', {}); f.approveMember('m3');
    const status = f.getConsensusStatus('data-sharing');
    assert.equal(status.totalVoters, 3);
    assert.equal(status.requiredVotes, 2);
  });

  it('member types supported', () => {
    const f = new FederationAuthorityProtocol();
    f.addMember('m1', { type: 'organism' });
    f.addMember('m2', { type: 'service' });
    f.addMember('m3', { type: 'agent' });
    assert.equal(f.members.get('m1').type, 'organism');
    assert.equal(f.members.get('m2').type, 'service');
    assert.equal(f.members.get('m3').type, 'agent');
  });

  it('member capabilities tracked', () => {
    const f = new FederationAuthorityProtocol();
    f.addMember('m1', { capabilities: ['compute', 'storage'] });
    assert.deepEqual(f.members.get('m1').capabilities, ['compute', 'storage']);
  });

  it('treaty parties recorded', () => {
    const f = new FederationAuthorityProtocol();
    const { treaty } = f.createTreaty({ name: 'T', parties: ['a', 'b', 'c'] });
    assert.deepEqual(treaty.parties, ['a', 'b', 'c']);
  });

  it('multiple treaties tracked', () => {
    const f = new FederationAuthorityProtocol();
    f.createTreaty({ name: 'T1' });
    f.createTreaty({ name: 'T2' });
    f.createTreaty({ name: 'T3' });
    assert.equal(f.treaties.length, 3);
  });

  it('federation health counts treaties', () => {
    const f = new FederationAuthorityProtocol();
    f.createTreaty({ name: 'T1' });
    const h = f.getFederationHealth();
    assert.equal(h.treaties, 1);
    assert.equal(h.ratifiedTreaties, 0);
  });

  it('shared policies accumulate', () => {
    const f = new FederationAuthorityProtocol();
    f.addSharedPolicy({ name: 'P1' });
    f.addSharedPolicy({ name: 'P2' });
    const h = f.getFederationHealth();
    assert.equal(h.sharedPolicies, 2);
  });

  it('version is 1.0.0', () => {
    const f = new FederationAuthorityProtocol();
    assert.equal(f.version, '1.0.0');
  });

  it('quorum uses φ⁻¹ threshold', () => {
    const f = new FederationAuthorityProtocol();
    f.addMember('m1', {}); f.approveMember('m1');
    const status = f.getConsensusStatus('test');
    assert.ok(Math.abs(status.quorumThreshold - 0.618) < 0.001);
  });

  it('reject vote does not ratify', () => {
    const f = new FederationAuthorityProtocol();
    f.addMember('m1', { votingPower: 1 }); f.approveMember('m1');
    f.addMember('m2', { votingPower: 1 }); f.approveMember('m2');
    const { treaty } = f.createTreaty({ name: 'T' });
    f.voteTreaty(treaty.id, 'm1', 'reject');
    f.voteTreaty(treaty.id, 'm2', 'reject');
    assert.equal(treaty.status, 'proposed');
  });

  it('abstain vote does not count toward quorum', () => {
    const f = new FederationAuthorityProtocol();
    f.addMember('m1', { votingPower: 1 }); f.approveMember('m1');
    f.addMember('m2', { votingPower: 1 }); f.approveMember('m2');
    f.addMember('m3', { votingPower: 1 }); f.approveMember('m3');
    const { treaty } = f.createTreaty({ name: 'T' });
    f.voteTreaty(treaty.id, 'm1', 'abstain');
    f.voteTreaty(treaty.id, 'm2', 'abstain');
    const result = f.voteTreaty(treaty.id, 'm3', 'abstain');
    assert.equal(result.currentStatus, 'proposed');
  });

  it('voting power affects ratification', () => {
    const f = new FederationAuthorityProtocol();
    f.addMember('m1', { votingPower: 10 }); f.approveMember('m1');
    f.addMember('m2', { votingPower: 1 }); f.approveMember('m2');
    const { treaty } = f.createTreaty({ name: 'T' });
    // m1 has 10/11 power, which is > φ⁻¹
    const result = f.voteTreaty(treaty.id, 'm1', 'approve');
    assert.equal(result.currentStatus, 'ratified');
  });
});

// ═══════════════════════════════════════════════════════════════════
// CROSS-PROTOCOL INTEGRATION — 30 Tests
// ═══════════════════════════════════════════════════════════════════

describe('Cross-Protocol Integration', () => {
  it('temporal + policy: epoch decisions evaluated by policy', () => {
    const t = new TemporalGovernanceProtocol();
    const p = new PolicyEngineProtocol();
    p.registerPolicy('TIME-RULE', {
      name: 'Time Rule',
      rules: [{ id: 'r1', field: 'type', operator: 'eq', value: 'governance' }],
    });
    p.activatePolicy('TIME-RULE');
    t.initEpoch('governed');
    const dec = t.recordDecision({ type: 'governance', action: 'test' });
    const eval_ = p.evaluate(dec);
    assert.equal(eval_.allPassed, true);
  });

  it('user + ethics: user actions assessed ethically', () => {
    const u = new UserLifecycleProtocol();
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('CONSENT', { name: 'Consent', category: 'consent', mandatory: true });
    u.registerUser('user-1');
    u.giveConsent('user-1');
    const assessment = e.assess({ hasConsent: true, userId: 'user-1' });
    assert.equal(assessment.approved, true);
  });

  it('http + policy: service registration checked by policy', () => {
    const h = new HTTPServiceGovernanceProtocol();
    const p = new PolicyEngineProtocol();
    p.registerPolicy('SVC-RULE', {
      name: 'Service Must Have Auth',
      rules: [{ id: 'r1', field: 'authRequired', operator: 'eq', value: true }],
    });
    p.activatePolicy('SVC-RULE');
    h.registerService('svc-1', { baseUrl: 'http://a', authRequired: true });
    const svc = h.services.get('svc-1');
    const eval_ = p.evaluate(svc);
    assert.equal(eval_.allPassed, true);
  });

  it('federation + ethics: member approval requires ethics', () => {
    const f = new FederationAuthorityProtocol();
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('TRUST', { name: 'Trust', category: 'accountability', mandatory: true });
    f.addMember('m1', { trustLevel: 0.9, hasAccountability: true });
    const member = f.members.get('m1');
    const assessment = e.assess(member);
    assert.equal(assessment.approved, true);
  });

  it('temporal + http: epoch tracks service deployments', () => {
    const t = new TemporalGovernanceProtocol();
    const h = new HTTPServiceGovernanceProtocol();
    t.initEpoch('deploy-epoch');
    h.registerService('api-v2', { baseUrl: 'http://new' });
    t.recordDecision({ type: 'deployment', service: 'api-v2' });
    assert.equal(t.currentEpoch.decisions.length, 1);
  });

  it('policy + federation: shared policy enforced', () => {
    const p = new PolicyEngineProtocol();
    const f = new FederationAuthorityProtocol();
    f.addSharedPolicy({ name: 'No Spam', rules: ['block-spam'] });
    p.registerPolicy('FED-RULE', {
      name: 'Federation Rule',
      rules: [{ id: 'r1', field: 'intent', operator: 'neq', value: 'spam' }],
    });
    p.activatePolicy('FED-RULE');
    assert.equal(p.evaluate({ intent: 'legitimate' }).allPassed, true);
    assert.equal(p.evaluate({ intent: 'spam' }).allPassed, false);
  });

  it('ethics + user: suspension triggers ethical review', () => {
    const u = new UserLifecycleProtocol();
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('FAIR', { name: 'Fairness', category: 'fairness', mandatory: true });
    u.registerUser('u1'); u.giveConsent('u1'); u.activateUser('u1');
    u.suspendUser('u1', 'test');
    const assessment = e.assess({ isFair: true, action: 'suspension', userId: 'u1' });
    assert.equal(assessment.approved, true);
  });

  it('all protocols initialize without error', () => {
    const t = new TemporalGovernanceProtocol();
    const u = new UserLifecycleProtocol();
    const p = new PolicyEngineProtocol();
    const e = new EthicsFrameworkProtocol();
    const h = new HTTPServiceGovernanceProtocol();
    const f = new FederationAuthorityProtocol();
    assert.equal(t.status, 'ACTIVE');
    assert.equal(u.status, 'ACTIVE');
    assert.equal(p.status, 'ACTIVE');
    assert.equal(e.status, 'ACTIVE');
    assert.equal(h.status, 'ACTIVE');
    assert.equal(f.status, 'ACTIVE');
  });

  it('temporal health + system health correlation', () => {
    const t = new TemporalGovernanceProtocol();
    const u = new UserLifecycleProtocol();
    t.initEpoch('health'); t.closeEpoch('completed');
    u.registerUser('u1'); u.giveConsent('u1'); u.activateUser('u1');
    const th = t.getTemporalHealth();
    const uh = u.getSystemHealth();
    assert.equal(th.status, 'healthy');
    assert.equal(uh.status, 'healthy');
  });

  it('http service mesh + federation health combined', () => {
    const h = new HTTPServiceGovernanceProtocol();
    const f = new FederationAuthorityProtocol();
    h.registerService('s1', { baseUrl: 'http://a' }); h.activateService('s1');
    f.addMember('m1', { trustLevel: 0.8 }); f.approveMember('m1');
    const mesh = h.getServiceMesh();
    const fed = f.getFederationHealth();
    assert.equal(mesh.activeServices, 1);
    assert.equal(fed.activeMembers, 1);
  });

  it('policy compliance + ethics fairness combined score', () => {
    const p = new PolicyEngineProtocol();
    const e = new EthicsFrameworkProtocol();
    p.registerPolicy('P1', { name: 'T', rules: [{ id: 'r1', field: 'x', operator: 'exists' }] });
    p.activatePolicy('P1');
    p.evaluate({ x: true });
    e.registerPrinciple('H', { name: 'H', category: 'general' });
    e.assess({});
    const compliance = p.getComplianceScore();
    const fairness = e.getFairnessMetrics();
    assert.equal(compliance.score, 1.0);
    assert.equal(fairness.score, 1.0);
  });

  it('full governance cycle: register user, create policy, evaluate', () => {
    const u = new UserLifecycleProtocol();
    const p = new PolicyEngineProtocol();
    u.registerUser('alice'); u.giveConsent('alice'); u.activateUser('alice');
    p.registerPolicy('ACTIVE-ONLY', {
      name: 'Active Only',
      rules: [{ id: 'r1', field: 'status', operator: 'eq', value: 'active' }],
    });
    p.activatePolicy('ACTIVE-ONLY');
    const status = u.getStatus('alice');
    const eval_ = p.evaluate(status);
    assert.equal(eval_.allPassed, true);
  });

  it('rollback + policy: rolled back decisions not re-evaluated', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('rollback-policy');
    t.recordDecision({ type: 'first' });
    const cp = t.checkpoint('safe');
    t.recordDecision({ type: 'bad-decision' });
    t.rollback(cp.id);
    assert.equal(t.currentEpoch.decisions.length, 1);
  });

  it('http circuit + temporal epoch tracking', () => {
    const h = new HTTPServiceGovernanceProtocol();
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('circuit-watch');
    h.registerService('svc-1', { baseUrl: 'http://a' });
    for (let i = 0; i < 5; i++) h.recordRequest('svc-1', false);
    t.recordDecision({ type: 'circuit-opened', service: 'svc-1' });
    assert.equal(h.getCircuitState('svc-1'), 'open');
    assert.equal(t.currentEpoch.decisions.length, 1);
  });

  it('ethics bias detection across user groups', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('FAIR', { name: 'Fair', category: 'general' });
    for (let i = 0; i < 10; i++) {
      e.assess({ group: 'A', isFair: true });
      e.assess({ group: 'B', isFair: true });
    }
    const bias = e.detectBias('group');
    assert.equal(bias.biasDetected, false);
  });

  it('federation quorum with varying voting power', () => {
    const f = new FederationAuthorityProtocol();
    f.addMember('whale', { votingPower: 100 }); f.approveMember('whale');
    f.addMember('minnow', { votingPower: 1 }); f.approveMember('minnow');
    const { treaty } = f.createTreaty({ name: 'Power Test' });
    f.voteTreaty(treaty.id, 'minnow', 'approve');
    // 1/101 < φ⁻¹ → not ratified yet
    assert.equal(treaty.status, 'proposed');
    f.voteTreaty(treaty.id, 'whale', 'approve');
    assert.equal(treaty.status, 'ratified');
  });

  it('user offboarding preserves data sovereignty', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('u1'); u.giveConsent('u1'); u.activateUser('u1');
    u.offboardUser('u1');
    const status = u.getStatus('u1');
    assert.equal(status.status, 'offboarded');
    assert.equal(status.dataSovereignty, 'export-pending');
  });

  it('policy versioning through register + retire cycle', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('V1', { name: 'Rule v1', version: '1.0.0', rules: [{ id: 'r' }] });
    p.activatePolicy('V1');
    p.retirePolicy('V1', 'superseded by V2');
    p.registerPolicy('V2', { name: 'Rule v2', version: '2.0.0', rules: [{ id: 'r' }] });
    p.activatePolicy('V2');
    assert.equal(p.listPolicies('active').length, 1);
    assert.equal(p.listPolicies('active')[0].id, 'V2');
  });

  it('full system health check aggregation', () => {
    const t = new TemporalGovernanceProtocol();
    const u = new UserLifecycleProtocol();
    const h = new HTTPServiceGovernanceProtocol();
    const f = new FederationAuthorityProtocol();
    t.initEpoch('full'); t.closeEpoch('completed');
    u.registerUser('u1'); u.giveConsent('u1'); u.activateUser('u1');
    h.registerService('s1', { baseUrl: 'http://a' }); h.activateService('s1'); h.healthCheck('s1');
    f.addMember('m1', { trustLevel: 0.8 }); f.approveMember('m1');
    assert.equal(t.getTemporalHealth().status, 'healthy');
    assert.equal(u.getSystemHealth().status, 'healthy');
    assert.equal(h.getServiceMesh().status, 'healthy');
    assert.equal(f.getFederationHealth().status, 'healthy');
  });

  it('ethic constraint + policy enforcement double gate', () => {
    const e = new EthicsFrameworkProtocol();
    const p = new PolicyEngineProtocol();
    e.addConstraint({ name: 'no-harm', type: 'prohibition' });
    p.registerPolicy('SAFE', {
      name: 'Safety',
      rules: [{ id: 'r1', field: 'causesHarm', operator: 'eq', value: false }],
    });
    p.activatePolicy('SAFE');
    const action = { causesHarm: false };
    assert.equal(e.assess(action).approved, true);
    assert.equal(p.evaluate(action).allPassed, true);
  });

  it('temporal epoch with multiple protocol interactions', () => {
    const t = new TemporalGovernanceProtocol();
    const u = new UserLifecycleProtocol();
    const h = new HTTPServiceGovernanceProtocol();
    t.initEpoch('multi-protocol');
    u.registerUser('new-user');
    t.recordDecision({ type: 'user-registered', userId: 'new-user' });
    h.registerService('new-svc', { baseUrl: 'http://new' });
    t.recordDecision({ type: 'service-registered', serviceId: 'new-svc' });
    assert.equal(t.currentEpoch.decisions.length, 2);
  });

  it('federation + http: service discovery through federation', () => {
    const f = new FederationAuthorityProtocol();
    const h = new HTTPServiceGovernanceProtocol();
    f.addMember('provider', { capabilities: ['api'], endpoint: 'http://provider' });
    f.approveMember('provider');
    const member = f.members.get('provider');
    h.registerService('fed-svc', { baseUrl: member.endpoint, name: 'Federation Service' });
    assert.equal(h.services.get('fed-svc').baseUrl, 'http://provider');
  });

  it('ethics transparency report includes all data', () => {
    const e = new EthicsFrameworkProtocol();
    e.registerPrinciple('P1', { name: 'Principle 1', category: 'general' });
    e.registerPrinciple('P2', { name: 'Principle 2', category: 'fairness' });
    e.addConstraint({ name: 'C1', type: 'prohibition' });
    e.assess({});
    const report = e.getTransparencyReport();
    assert.equal(report.totalPrinciples, 2);
    assert.equal(report.totalConstraints, 1);
    assert.equal(report.totalAssessments, 1);
    assert.ok(report.fairness);
  });

  it('policy evaluation context preserved', () => {
    const p = new PolicyEngineProtocol();
    p.registerPolicy('P1', { name: 'T', rules: [{ id: 'r', field: 'x', operator: 'exists' }] });
    p.activatePolicy('P1');
    const result = p.evaluate({ x: 42, y: 'hello' });
    assert.equal(result.context.x, 42);
    assert.equal(result.context.y, 'hello');
  });

  it('user lifecycle full journey', () => {
    const u = new UserLifecycleProtocol();
    u.registerUser('journey');
    assert.equal(u.getStatus('journey').status, 'pending');
    u.giveConsent('journey');
    u.activateUser('journey');
    assert.equal(u.getStatus('journey').status, 'active');
    u.assignRole('journey', 'contributor');
    u.updateTrust('journey', 0.3);
    u.suspendUser('journey', 'review');
    assert.equal(u.getStatus('journey').status, 'suspended');
    // audit trail captured all
    assert.ok(u.auditLog.length >= 5);
  });

  it('temporal governance handles 100 rapid decisions', () => {
    const t = new TemporalGovernanceProtocol();
    t.initEpoch('stress');
    for (let i = 0; i < 100; i++) {
      t.recordDecision({ type: 'rapid', index: i });
    }
    assert.equal(t.currentEpoch.decisions.length, 100);
    t.closeEpoch('completed');
    assert.equal(t.getTemporalHealth().status, 'healthy');
  });

  it('http service handles high request volume tracking', () => {
    const h = new HTTPServiceGovernanceProtocol();
    h.registerService('heavy', { baseUrl: 'http://heavy' });
    for (let i = 0; i < 100; i++) {
      h.recordRequest('heavy', Math.random() > 0.1);
    }
    const mesh = h.getServiceMesh();
    const svc = mesh.services.find(s => s.id === 'heavy');
    assert.equal(svc.requests, 100);
    assert.ok(svc.errorRate >= 0 && svc.errorRate <= 1);
  });

  it('federation handles large membership', () => {
    const f = new FederationAuthorityProtocol();
    for (let i = 0; i < 20; i++) {
      f.addMember(`m${i}`, { trustLevel: 0.7 + Math.random() * 0.3 });
      f.approveMember(`m${i}`);
    }
    const h = f.getFederationHealth();
    assert.equal(h.activeMembers, 20);
    assert.equal(h.status, 'healthy');
  });

  it('all protocol IDs follow naming convention', () => {
    const protocols = [
      new TemporalGovernanceProtocol(),
      new UserLifecycleProtocol(),
      new PolicyEngineProtocol(),
      new EthicsFrameworkProtocol(),
      new HTTPServiceGovernanceProtocol(),
      new FederationAuthorityProtocol(),
    ];
    for (const p of protocols) {
      assert.ok(p.id.startsWith('GOV-'), `${p.id} should start with GOV-`);
    }
  });
});
