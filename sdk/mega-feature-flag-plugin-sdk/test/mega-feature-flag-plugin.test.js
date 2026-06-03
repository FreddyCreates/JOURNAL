import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { FlagManager } from '../src/flag-manager.js';
import { RolloutEngine } from '../src/rollout-engine.js';
import { AudienceTargeter } from '../src/audience-targeter.js';
import { ExperimentRunner } from '../src/experiment-runner.js';
import { FeatureFlagPlugin } from '../src/feature-flag-plugin.js';

describe('FlagManager', () => {
  let fm; beforeEach(() => { fm = new FlagManager(); });
  test('should create flag', () => { const r = fm.create('dark-mode'); assert.ok(r.flagId); });
  test('should check disabled', () => { fm.create('x'); assert.strictEqual(fm.isEnabled('x'), false); });
  test('should toggle', () => { fm.create('x'); fm.toggle('x'); assert.strictEqual(fm.isEnabled('x', { userId: 'abc' }), false); });
  test('should enable with 100% rollout', () => { fm.create('x', { enabled: true, rolloutPercentage: 100 }); assert.strictEqual(fm.isEnabled('x'), true); });
  test('should throw on duplicate', () => { fm.create('x'); assert.throws(() => fm.create('x'), /already exists/); });
  test('should delete', () => { fm.create('x'); fm.delete('x'); assert.strictEqual(fm.getAll().length, 0); });
});
describe('RolloutEngine', () => {
  let re; beforeEach(() => { re = new RolloutEngine(); re.create('feat', [{ percentage: 10 }, { percentage: 50 }, { percentage: 100 }]); });
  test('should create rollout', () => { const r = re.getStatus('feat'); assert.strictEqual(r.totalStages, 3); });
  test('should advance', () => { const r = re.advance('feat'); assert.strictEqual(r.stage, 1); });
  test('should throw at final stage', () => { re.advance('feat'); re.advance('feat'); assert.throws(() => re.advance('feat'), /final stage/); });
  test('should rollback', () => { re.advance('feat'); re.rollback('feat'); const r = re.getStatus('feat'); assert.strictEqual(r.currentStage, 0); });
});
describe('AudienceTargeter', () => {
  let at; beforeEach(() => { at = new AudienceTargeter(); });
  test('should define segment', () => { const r = at.defineSegment('premium', c => c.plan === 'pro'); assert.strictEqual(r.segmentCount, 1); });
  test('should evaluate', () => { at.defineSegment('us', c => c.country === 'US'); const r = at.evaluate({ country: 'US' }); assert.ok(r.matched.includes('us')); });
  test('should check segment membership', () => { at.defineSegment('admin', c => c.role === 'admin'); assert.strictEqual(at.isInSegment('admin', { role: 'admin' }), true); });
});
describe('ExperimentRunner', () => {
  let er; beforeEach(() => { er = new ExperimentRunner(); er.create('button-color', ['red', 'blue', 'green']); });
  test('should assign variant', () => { const r = er.assign('button-color', 'user1'); assert.ok(['red', 'blue', 'green'].includes(r.variant)); });
  test('should get results', () => { er.assign('button-color', 'u1'); er.assign('button-color', 'u2'); const r = er.getResults('button-color'); assert.strictEqual(r.totalAssignments, 2); });
  test('should stop experiment', () => { const r = er.stop('button-color'); assert.strictEqual(r.status, 'stopped'); });
  test('should throw on missing', () => { assert.throws(() => er.assign('x', 'u'), /not found/); });
});
describe('FeatureFlagPlugin', () => {
  let ffp; beforeEach(() => { ffp = new FeatureFlagPlugin(); });
  test('should evaluate flag', () => { const r = ffp.evaluate('test-flag', { userId: 'u1' }); assert.ok(r.evaluationId); assert.strictEqual(typeof r.enabled, 'boolean'); });
  test('should track evaluations', () => { ffp.evaluate('a'); ffp.evaluate('b'); assert.strictEqual(ffp.getEvaluations().length, 2); });
});
