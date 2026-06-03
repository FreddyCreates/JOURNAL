import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DecisionEngine } from '../src/decision-engine.js';
import { SovereignGovernor } from '../src/sovereign-governor.js';
import { PolicyEnforcer } from '../src/policy-enforcer.js';
import { AutonomyBoundary } from '../src/autonomy-boundary.js';
import { SelfDirector } from '../src/self-director.js';

const PHI = 1.618033988749895;

describe('DecisionEngine', () => {
  let engine;
  beforeEach(() => { engine = new DecisionEngine(); });

  test('should create with defaults', () => {
    assert.strictEqual(engine.maxOptions, 16);
    assert.strictEqual(engine.phiBias, PHI);
  });

  test('should add option', () => {
    const r = engine.addOption('option A', { reward: 0.8, risk: 0.2 });
    assert.ok(r.optionId);
    assert.strictEqual(r.option, 'option A');
  });

  test('should evaluate options', () => {
    engine.addOption('high', { reward: 0.9, risk: 0.1 });
    engine.addOption('low', { reward: 0.2, risk: 0.8 });
    const r = engine.evaluate();
    assert.strictEqual(r.rankings.length, 2);
    assert.ok(r.recommended);
  });

  test('should decide', () => {
    engine.addOption('x', { reward: 0.7, risk: 0.3 });
    const r = engine.decide();
    assert.ok(r.decisionId);
    assert.ok(r.chosen);
    assert.ok(r.confidence >= 0);
  });

  test('should throw when no options to decide', () => {
    assert.throws(() => engine.decide(), /No options/);
  });

  test('should throw at max options', () => {
    const e = new DecisionEngine({ maxOptions: 2 });
    e.addOption('a', {});
    e.addOption('b', {});
    assert.throws(() => e.addOption('c', {}), /Max options/);
  });

  test('should get decision history', () => {
    engine.addOption('x', { reward: 0.5 });
    engine.decide();
    assert.strictEqual(engine.getDecisionHistory().length, 1);
  });

  test('should clear options', () => {
    engine.addOption('x', {});
    engine.clear();
    assert.strictEqual(engine.getOptions().length, 0);
  });
});

describe('SovereignGovernor', () => {
  let gov;
  beforeEach(() => { gov = new SovereignGovernor(); });

  test('should create with defaults', () => {
    assert.strictEqual(gov.autonomyLevel, 7);
  });

  test('should set constitution', () => {
    const r = gov.setConstitution(['no harm', 'seek truth']);
    assert.strictEqual(r.rulesCount, 2);
    assert.ok(r.constitutionHash);
  });

  test('should check permitted action', () => {
    gov.setConstitution([{ pattern: 'destroy', allow: false }]);
    const r = gov.checkAction('create something');
    assert.ok(r.permitted);
  });

  test('should check blocked action', () => {
    gov.setConstitution([{ pattern: 'destroy', allow: false }]);
    const r = gov.checkAction('destroy data');
    assert.strictEqual(r.permitted, false);
    assert.ok(r.overrideRequired);
  });

  test('should override', () => {
    const r = gov.override('destroy', 'emergency situation');
    assert.ok(r.overrideId);
  });

  test('should get override log', () => {
    gov.override('x', 'reason');
    assert.strictEqual(gov.getOverrideLog().length, 1);
  });

  test('should get autonomy level', () => {
    assert.strictEqual(gov.getAutonomyLevel(), 7);
  });
});

describe('PolicyEnforcer', () => {
  let enforcer;
  beforeEach(() => { enforcer = new PolicyEnforcer(); });

  test('should add policy', () => {
    const r = enforcer.addPolicy('no-spam', 'spam', 'block');
    assert.ok(r.policyId);
    assert.strictEqual(r.name, 'no-spam');
    assert.ok(r.active);
  });

  test('should enforce and detect violation', () => {
    enforcer.addPolicy('no-hack', 'hack', 'alert');
    const r = enforcer.enforce({ action: 'hack system' });
    assert.strictEqual(r.compliant, false);
    assert.ok(r.violations.length > 0);
  });

  test('should enforce compliant event', () => {
    enforcer.addPolicy('no-spam', 'spam', 'block');
    const r = enforcer.enforce({ action: 'normal operation' });
    assert.ok(r.compliant);
  });

  test('should toggle policy', () => {
    const p = enforcer.addPolicy('test', 'x', 'y');
    enforcer.togglePolicy(p.policyId, false);
    assert.strictEqual(enforcer.getPolicy(p.policyId).active, false);
  });

  test('should get enforcement log', () => {
    enforcer.addPolicy('p', '*', 'log');
    enforcer.enforce({ x: 1 });
    assert.strictEqual(enforcer.getEnforcementLog().length, 1);
  });

  test('should get policies', () => {
    enforcer.addPolicy('a', 'x', 'y');
    assert.strictEqual(enforcer.getPolicies().length, 1);
  });
});

describe('AutonomyBoundary', () => {
  let boundary;
  beforeEach(() => { boundary = new AutonomyBoundary(); });

  test('should create with defaults', () => {
    assert.strictEqual(boundary.innerRadius, 1.0);
    assert.strictEqual(boundary.outerRadius, PHI);
  });

  test('should define constraints', () => {
    const r = boundary.define(['speed < 100', 'scope = local']);
    assert.strictEqual(r.constraintCount, 2);
  });

  test('should check in bounds', () => {
    const r = boundary.checkBounds({ magnitude: 1.3 });
    assert.ok(r.inBounds);
    assert.strictEqual(r.transgressLevel, 0);
  });

  test('should check out of bounds', () => {
    const r = boundary.checkBounds({ magnitude: 10.0 });
    assert.strictEqual(r.inBounds, false);
    assert.ok(r.transgressLevel > 0);
  });

  test('should expand boundary', () => {
    const r = boundary.expand(2);
    assert.strictEqual(r.outerRadius, PHI * 2);
  });

  test('should contract boundary', () => {
    const before = boundary.outerRadius;
    boundary.contract(2);
    assert.ok(boundary.outerRadius < before);
  });

  test('should get boundary state', () => {
    const b = boundary.getBoundary();
    assert.strictEqual(b.type, 'phi-sphere');
  });

  test('should track transgressions', () => {
    boundary.checkBounds({ magnitude: 100 });
    assert.strictEqual(boundary.getTransgressionLog().length, 1);
  });
});

describe('SelfDirector', () => {
  let director;
  beforeEach(() => { director = new SelfDirector(); });

  test('should create with defaults', () => {
    assert.strictEqual(director.reflectionInterval, 873);
  });

  test('should set goal', () => {
    const r = director.setGoal('learn AI', 5.0);
    assert.ok(r.goalId);
    assert.strictEqual(r.status, 'active');
  });

  test('should get next action', () => {
    director.setGoal('build SDK', 3.0);
    const r = director.getNextAction();
    assert.ok(r.actionId);
    assert.ok(r.phiMomentum > 0);
  });

  test('should return null when no goals', () => {
    assert.strictEqual(director.getNextAction(), null);
  });

  test('should report progress', () => {
    const g = director.setGoal('x', 1);
    const r = director.reportProgress(g.goalId, 0.5);
    assert.strictEqual(r.progress, 0.5);
  });

  test('should complete goal at 100%', () => {
    const g = director.setGoal('x', 1);
    const r = director.reportProgress(g.goalId, 1.0);
    assert.strictEqual(r.status, 'completed');
  });

  test('should reprioritize', () => {
    director.setGoal('a', 1);
    director.setGoal('b', 5);
    const r = director.reprioritize();
    assert.strictEqual(r.length, 2);
  });

  test('should get direction state', () => {
    director.setGoal('x', 2);
    const s = director.getDirectionState();
    assert.strictEqual(s.activeGoals, 1);
    assert.ok(s.momentum > 0);
  });
});
