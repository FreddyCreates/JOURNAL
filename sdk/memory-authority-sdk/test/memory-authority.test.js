import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AuthorityGate } from '../src/authority-gate.js';
import { ClaimRegister } from '../src/claim-register.js';
import { PromotionEngine } from '../src/promotion-engine.js';
import { BoundedMembrane } from '../src/bounded-membrane.js';

// ═══════════════════════════════════════════════════════════════════
// AUTHORITY GATE TESTS
// ═══════════════════════════════════════════════════════════════════

describe('AuthorityGate', () => {
  it('should block claims below resonance floor', () => {
    const gate = new AuthorityGate();
    const result = gate.evaluate({
      id: 'test-1',
      sourceId: 'agent-1',
      claimClass: 'candidate',
      phiResonance: 0.3,
      evidenceIds: ['e1'],
      releaseBoundary: 'private'
    });
    assert.equal(result.permitted, false);
    assert.match(result.reason, /below floor/);
  });

  it('should block claims with wrong class', () => {
    const gate = new AuthorityGate();
    const result = gate.evaluate({
      id: 'test-2',
      sourceId: 'agent-1',
      claimClass: 'hypothesis',
      phiResonance: 0.8,
      evidenceIds: ['e1'],
      releaseBoundary: 'private'
    });
    assert.equal(result.permitted, false);
    assert.match(result.reason, /not eligible/);
  });

  it('should block claims without evidence when required', () => {
    const gate = new AuthorityGate({ requireEvidence: true });
    const result = gate.evaluate({
      id: 'test-3',
      sourceId: 'agent-1',
      claimClass: 'candidate',
      phiResonance: 0.8,
      evidenceIds: [],
      releaseBoundary: 'private'
    });
    assert.equal(result.permitted, false);
    assert.match(result.reason, /evidence/i);
  });

  it('should permit valid claims', () => {
    const gate = new AuthorityGate();
    const result = gate.evaluate({
      id: 'test-4',
      sourceId: 'agent-1',
      claimClass: 'candidate',
      phiResonance: 0.8,
      evidenceIds: ['e1', 'e2'],
      releaseBoundary: 'private'
    });
    assert.equal(result.permitted, true);
  });

  it('should fast-path trusted sources', () => {
    const gate = new AuthorityGate({ trustedSources: ['nova-root'] });
    const result = gate.evaluate({
      id: 'test-5',
      sourceId: 'nova-root',
      claimClass: 'candidate',
      phiResonance: 0.8,
      evidenceIds: ['e1'],
      releaseBoundary: 'private'
    });
    assert.equal(result.permitted, true);
    assert.match(result.reason, /Trusted source/);
  });

  it('should maintain audit log', () => {
    const gate = new AuthorityGate();
    gate.evaluate({ id: 'x', sourceId: 'a', claimClass: 'candidate', phiResonance: 0.1, evidenceIds: [], releaseBoundary: 'private' });
    gate.evaluate({ id: 'y', sourceId: 'a', claimClass: 'candidate', phiResonance: 0.9, evidenceIds: ['e1'], releaseBoundary: 'private' });
    const log = gate.getAuditLog();
    assert.equal(log.length, 2);
  });
});

// ═══════════════════════════════════════════════════════════════════
// CLAIM REGISTER TESTS
// ═══════════════════════════════════════════════════════════════════

describe('ClaimRegister', () => {
  it('should register a claim with hypothesis class', () => {
    const register = new ClaimRegister();
    const claim = register.register({ sourceId: 'agent-1', content: 'Earth is round' });
    assert.equal(claim.claimClass, 'hypothesis');
    assert.equal(claim.sourceId, 'agent-1');
    assert.equal(claim.evidencePosture, 'speculative');
    assert.ok(claim.id);
    assert.ok(claim.contentHash);
  });

  it('should assign sequential numbers', () => {
    const register = new ClaimRegister();
    const c1 = register.register({ sourceId: 'a', content: 'first' });
    const c2 = register.register({ sourceId: 'a', content: 'second' });
    assert.equal(c2.sequenceNumber, c1.sequenceNumber + 1);
  });

  it('should index by source', () => {
    const register = new ClaimRegister();
    register.register({ sourceId: 'agent-1', content: 'claim 1' });
    register.register({ sourceId: 'agent-1', content: 'claim 2' });
    register.register({ sourceId: 'agent-2', content: 'claim 3' });
    assert.equal(register.getBySource('agent-1').length, 2);
    assert.equal(register.getBySource('agent-2').length, 1);
  });

  it('should index by class', () => {
    const register = new ClaimRegister();
    register.register({ sourceId: 'a', content: 'x' });
    register.register({ sourceId: 'b', content: 'y' });
    assert.equal(register.getByClass('hypothesis').length, 2);
    assert.equal(register.getByClass('canonical').length, 0);
  });

  it('should update class and re-index', () => {
    const register = new ClaimRegister();
    const claim = register.register({ sourceId: 'a', content: 'promote me' });
    register.updateClass(claim.id, 'draft');
    assert.equal(register.getByClass('hypothesis').length, 0);
    assert.equal(register.getByClass('draft').length, 1);
  });

  it('should verify content integrity', () => {
    const register = new ClaimRegister();
    const claim = register.register({ sourceId: 'a', content: 'immutable content' });
    const result = register.verifyIntegrity(claim.id);
    assert.equal(result.valid, true);
  });

  it('should detect tampered content', () => {
    const register = new ClaimRegister();
    const claim = register.register({ sourceId: 'a', content: 'original' });
    // Simulate tampering
    const internal = register.getMutable(claim.id);
    internal.content = 'tampered!';
    const result = register.verifyIntegrity(claim.id);
    assert.equal(result.valid, false);
  });

  it('should track lineage through parent chain', () => {
    const register = new ClaimRegister();
    const root = register.register({ sourceId: 'a', content: 'root' });
    const child = register.register({ sourceId: 'a', content: 'child', parentClaimId: root.id });
    const grandchild = register.register({ sourceId: 'a', content: 'grandchild', parentClaimId: child.id });
    const lineage = register.getLineage(grandchild.id);
    assert.deepEqual(lineage, [root.id, child.id]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// PROMOTION ENGINE TESTS
// ═══════════════════════════════════════════════════════════════════

describe('PromotionEngine', () => {
  function createEngine() {
    const register = new ClaimRegister();
    const gate = new AuthorityGate({ requireEvidence: true });
    const engine = new PromotionEngine({ register, gate, cooldownMs: 0 });
    return { register, gate, engine };
  }

  it('should promote hypothesis to draft', () => {
    const { register, engine } = createEngine();
    const claim = register.register({ sourceId: 'a', content: 'test' });
    const result = engine.promote(claim.id, 'reviewer-1', 'looks good');
    assert.equal(result.approved, true);
    assert.equal(result.newClass, 'draft');
  });

  it('should promote draft to candidate with evidence', () => {
    const { register, engine } = createEngine();
    const claim = register.register({ sourceId: 'a', content: 'test' });

    // Promote to draft
    engine.promote(claim.id, 'r1', 'step 1');

    // Add evidence for candidate
    const internal = register.getMutable(claim.id);
    internal.evidenceIds.push('evidence-1');
    internal.phiResonance = 0.7;

    const result = engine.promote(claim.id, 'r1', 'step 2');
    assert.equal(result.approved, true);
    assert.equal(result.newClass, 'candidate');
  });

  it('should deny promotion without sufficient evidence', () => {
    const { register, engine } = createEngine();
    const claim = register.register({ sourceId: 'a', content: 'test' });

    // Promote to draft first
    engine.promote(claim.id, 'r1', 'step 1');

    // Try candidate without evidence — should fail
    const internal = register.getMutable(claim.id);
    internal.phiResonance = 0.8;
    const result = engine.promote(claim.id, 'r1', 'step 2');
    assert.equal(result.approved, false);
    assert.match(result.reason, /evidence/i);
  });

  it('should freeze claim after max denials', () => {
    const { register, engine } = createEngine();
    const claim = register.register({ sourceId: 'a', content: 'test' });

    // Promote to draft
    engine.promote(claim.id, 'r1', '');

    // Attempt candidate 3 times without evidence
    const internal = register.getMutable(claim.id);
    internal.phiResonance = 0.8;
    engine.promote(claim.id, 'r1', '');
    engine.promote(claim.id, 'r1', '');
    engine.promote(claim.id, 'r1', '');

    // 4th attempt should be frozen
    const frozen = engine.promote(claim.id, 'r1', '');
    assert.equal(frozen.approved, false);
    assert.match(frozen.reason, /frozen/i);
  });

  it('should allow NOVA_ROOT override', () => {
    const { register, engine } = createEngine();
    const claim = register.register({ sourceId: 'a', content: 'force this' });
    const result = engine.novaOverride(claim.id, 'canonical', 'Emergency canonicalization');
    assert.equal(result.approved, true);
    assert.equal(result.newClass, 'canonical');
  });

  it('should maintain decision log', () => {
    const { register, engine } = createEngine();
    const claim = register.register({ sourceId: 'a', content: 'logged' });
    engine.promote(claim.id, 'r1', 'first');
    engine.promote(claim.id, 'r1', 'second');
    const log = engine.getDecisionLog();
    assert.equal(log.length, 2);
  });
});

// ═══════════════════════════════════════════════════════════════════
// BOUNDED MEMBRANE TESTS
// ═══════════════════════════════════════════════════════════════════

describe('BoundedMembrane', () => {
  it('should block foundation_floor from writing to memory_runtime', () => {
    const membrane = new BoundedMembrane();
    const result = membrane.checkWrite('foundation_floor', 'memory_runtime');
    assert.equal(result.permitted, false);
  });

  it('should allow nova_root to write to memory_runtime', () => {
    const membrane = new BoundedMembrane();
    const result = membrane.checkWrite('nova_root', 'memory_runtime');
    assert.equal(result.permitted, true);
  });

  it('should allow foundation_floor to write to active_state', () => {
    const membrane = new BoundedMembrane();
    const result = membrane.checkWrite('foundation_floor', 'active_state');
    assert.equal(result.permitted, true);
  });

  it('should block active_state from writing to memory_runtime', () => {
    const membrane = new BoundedMembrane();
    const result = membrane.checkWrite('active_state', 'memory_runtime');
    assert.equal(result.permitted, false);
  });

  it('should block active_state from writing to nova_root', () => {
    const membrane = new BoundedMembrane();
    const result = membrane.checkWrite('active_state', 'nova_root');
    assert.equal(result.permitted, false);
  });

  it('should register components and check writes by component ID', () => {
    const membrane = new BoundedMembrane();
    membrane.registerComponent('llm-engine', 'foundation_floor');
    membrane.registerComponent('memory-store', 'memory_runtime');

    const result = membrane.attemptWrite('llm-engine', 'memory_runtime');
    assert.equal(result.permitted, false);
    assert.equal(result.sourceLayer, 'foundation_floor');
  });

  it('should track violations', () => {
    const membrane = new BoundedMembrane();
    membrane.checkWrite('foundation_floor', 'memory_runtime');
    membrane.checkWrite('active_state', 'memory_runtime');
    const violations = membrane.getViolations();
    assert.equal(violations.length, 2);
  });

  it('should validate membrane configuration', () => {
    const membrane = new BoundedMembrane();
    membrane.registerComponent('engine-1', 'foundation_floor');
    membrane.registerComponent('engine-2', 'active_state');
    const result = membrane.validate();
    assert.equal(result.valid, true);
  });

  it('should report metrics', () => {
    const membrane = new BoundedMembrane();
    membrane.checkWrite('nova_root', 'memory_runtime');
    membrane.checkWrite('foundation_floor', 'memory_runtime');
    const metrics = membrane.getMetrics();
    assert.equal(metrics.totalChecks, 2);
    assert.equal(metrics.totalBlocked, 1);
  });

  it('should enforce read boundaries', () => {
    const membrane = new BoundedMembrane();

    // foundation_floor can only read from itself
    const r1 = membrane.checkRead('foundation_floor', 'memory_runtime');
    assert.equal(r1.permitted, false);

    // active_state can read from foundation_floor
    const r2 = membrane.checkRead('active_state', 'foundation_floor');
    assert.equal(r2.permitted, true);

    // nova_root can read everything
    const r3 = membrane.checkRead('nova_root', 'foundation_floor');
    assert.equal(r3.permitted, true);
  });
});
