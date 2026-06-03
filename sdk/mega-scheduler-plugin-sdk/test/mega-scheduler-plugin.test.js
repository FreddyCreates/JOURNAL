import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { JobScheduler } from '../src/job-scheduler.js';
import { CronParser } from '../src/cron-parser.js';
import { TaskQueue } from '../src/task-queue.js';
import { RecurrenceEngine } from '../src/recurrence-engine.js';
import { SchedulerPlugin } from '../src/scheduler-plugin.js';

describe('JobScheduler', () => {
  let js; beforeEach(() => { js = new JobScheduler(); });
  test('should schedule job', () => { const r = js.schedule('cleanup', Date.now() + 1000, () => 'done'); assert.ok(r.jobId); });
  test('should execute job', () => { const j = js.schedule('t', Date.now(), () => 42); const r = js.execute(j.jobId); assert.strictEqual(r.result, 42); });
  test('should cancel job', () => { const j = js.schedule('t', Date.now(), () => {}); const r = js.cancel(j.jobId); assert.strictEqual(r.cancelled, true); });
  test('should throw on missing job', () => { assert.throws(() => js.execute('x'), /not found/); });
  test('should throw on max jobs', () => { const s = new JobScheduler({ maxJobs: 1 }); s.schedule('a', 0, () => {}); assert.throws(() => s.schedule('b', 0, () => {}), /Max jobs/); });
});
describe('CronParser', () => {
  let cp; beforeEach(() => { cp = new CronParser(); });
  test('should parse valid cron', () => { const r = cp.parse('*/5 * * * *'); assert.strictEqual(r.minute, '*/5'); assert.strictEqual(r.valid, true); });
  test('should throw on invalid', () => { assert.throws(() => cp.parse('bad'), /Invalid cron/); });
  test('should validate', () => { assert.strictEqual(cp.validate('0 12 * * *').valid, true); assert.strictEqual(cp.validate('x').valid, false); });
  test('should get next run', () => { const r = cp.nextRun('0 * * * *'); assert.ok(r.nextRun); });
});
describe('TaskQueue', () => {
  let tq; beforeEach(() => { tq = new TaskQueue({ concurrency: 2 }); });
  test('should enqueue', () => { const r = tq.enqueue('task1', 5); assert.ok(r.taskId); });
  test('should dequeue', () => { tq.enqueue('t', 1); const r = tq.dequeue(); assert.strictEqual(r.task, 't'); });
  test('should throw on empty', () => { assert.throws(() => tq.dequeue(), /empty/); });
  test('should respect concurrency', () => { tq.enqueue('a'); tq.enqueue('b'); tq.enqueue('c'); tq.dequeue(); tq.dequeue(); assert.throws(() => tq.dequeue(), /concurrency/); });
});
describe('RecurrenceEngine', () => {
  let re; beforeEach(() => { re = new RecurrenceEngine(); });
  test('should add rule', () => { const r = re.addRule('daily', { interval: 86400000 }); assert.ok(r.ruleId); });
  test('should trigger', () => { const rule = re.addRule('t', { interval: 1000 }); const r = re.trigger(rule.ruleId); assert.strictEqual(r.occurrence, 1); });
  test('should throw on max occurrences', () => { const rule = re.addRule('t', { interval: 1000, maxOccurrences: 1 }); re.trigger(rule.ruleId); assert.throws(() => re.trigger(rule.ruleId), /Max occurrences/); });
});
describe('SchedulerPlugin', () => {
  let sp; beforeEach(() => { sp = new SchedulerPlugin(); });
  test('should schedule once', () => { const r = sp.scheduleOnce('cleanup', 5000, () => 'done'); assert.ok(r.timerId); });
  test('should execute now', () => { const t = sp.scheduleOnce('t', 1000, () => 42); const r = sp.executeNow(t.timerId); assert.strictEqual(r.result, 42); });
  test('should cancel', () => { const t = sp.scheduleOnce('t', 1000, () => {}); assert.strictEqual(sp.cancel(t.timerId), true); });
});
