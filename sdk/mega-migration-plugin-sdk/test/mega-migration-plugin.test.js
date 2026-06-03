import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { MigrationRunner } from '../src/migration-runner.js';
import { VersionTracker } from '../src/version-tracker.js';
import { DataTransformer } from '../src/data-transformer.js';
import { RollbackManager } from '../src/rollback-manager.js';
import { MigrationPlugin } from '../src/migration-plugin.js';

describe('MigrationRunner', () => {
  let mr; beforeEach(() => { mr = new MigrationRunner(); });
  test('should register migration', () => { const r = mr.register('add-users', () => 'up', () => 'down'); assert.strictEqual(r.name, 'add-users'); });
  test('should run all', () => { mr.register('m1', () => 'r1', () => {}); mr.register('m2', () => 'r2', () => {}); const r = mr.runAll(); assert.strictEqual(r.executed, 2); });
  test('should rollback', () => { mr.register('m1', () => 'up', () => 'down'); mr.runAll(); const r = mr.rollback('m1'); assert.strictEqual(r.rolledBack, true); });
  test('should throw rollback on unexecuted', () => { mr.register('m1', () => {}, () => {}); assert.throws(() => mr.rollback('m1'), /not executed/); });
  test('should get status', () => { mr.register('m1', () => {}, () => {}); const s = mr.getStatus(); assert.strictEqual(s.pending, 1); });
});
describe('VersionTracker', () => {
  let vt; beforeEach(() => { vt = new VersionTracker(); });
  test('should record version', () => { const r = vt.record('1.0.0', 'initial'); assert.strictEqual(r.version, '1.0.0'); });
  test('should get current', () => { vt.record('1.0'); vt.record('2.0'); assert.strictEqual(vt.getCurrent(), '2.0'); });
  test('should check if applied', () => { vt.record('1.0'); assert.strictEqual(vt.isApplied('1.0'), true); assert.strictEqual(vt.isApplied('2.0'), false); });
});
describe('DataTransformer', () => {
  let dt; beforeEach(() => { dt = new DataTransformer(); });
  test('should transform records', () => { const r = dt.transform([1, 2, 3], x => x * 2); assert.deepStrictEqual(r.data, [2, 4, 6]); });
  test('should throw on non-array', () => { assert.throws(() => dt.transform('bad', x => x), /must be an array/); });
  test('should track history', () => { dt.transform([1], x => x); assert.strictEqual(dt.getHistory().length, 1); });
});
describe('RollbackManager', () => {
  let rm; beforeEach(() => { rm = new RollbackManager(); });
  test('should create checkpoint', () => { const r = rm.checkpoint('v1', { data: [1] }); assert.ok(r.checkpointId); });
  test('should restore', () => { rm.checkpoint('v1', { x: 42 }); const r = rm.restore('v1'); assert.strictEqual(r.state.x, 42); });
  test('should throw on missing', () => { assert.throws(() => rm.restore('x'), /not found/); });
  test('should prune', () => { for (let i = 0; i < 10; i++) rm.checkpoint(`v${i}`, {}); rm.prune(3); assert.strictEqual(rm.getCheckpoints().length, 3); });
});
describe('MigrationPlugin', () => {
  let mp; beforeEach(() => { mp = new MigrationPlugin(); });
  test('should run migration', () => { const r = mp.run('add-table', () => 'created'); assert.strictEqual(r.result, 'created'); });
  test('should track runs', () => { mp.run('m1', () => {}); mp.run('m2', () => {}); assert.strictEqual(mp.getRuns().length, 2); });
});
