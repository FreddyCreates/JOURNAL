import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { WorkflowEngine } from '../src/workflow-engine.js';
import { StepExecutor } from '../src/step-executor.js';
import { StateMachine } from '../src/state-machine.js';
import { DagScheduler } from '../src/dag-scheduler.js';
import { WorkflowBridge } from '../src/workflow-bridge.js';

describe('WorkflowEngine', () => {
  let engine;
  beforeEach(() => { engine = new WorkflowEngine(); });

  test('should create workflow', () => {
    const r = engine.create('test', [ctx => ({ ...ctx, step1: true })]);
    assert.ok(r.workflowId);
    assert.strictEqual(r.stepCount, 1);
  });

  test('should execute workflow', () => {
    const r = engine.create('add', [ctx => ({ ...ctx, sum: (ctx.a ?? 0) + (ctx.b ?? 0) })]);
    const run = engine.execute(r.workflowId, { a: 2, b: 3 });
    assert.strictEqual(run.output.sum, 5);
  });

  test('should throw on missing workflow', () => {
    assert.throws(() => engine.execute('missing'), /not found/);
  });

  test('should list workflows', () => {
    engine.create('w1', []);
    assert.strictEqual(engine.list().length, 1);
  });

  test('should delete workflow', () => {
    const r = engine.create('del', []);
    assert.strictEqual(engine.delete(r.workflowId), true);
  });

  test('should track phi efficiency', () => {
    const r = engine.create('t', [ctx => ctx]);
    const run = engine.execute(r.workflowId, {});
    assert.ok(run.phiEfficiency > 0 && run.phiEfficiency <= 1);
  });
});

describe('StepExecutor', () => {
  let exec;
  beforeEach(() => { exec = new StepExecutor(); });

  test('should execute step', async () => {
    const r = await exec.execute(ctx => ({ done: true }), {});
    assert.strictEqual(r.success, true);
    assert.ok(r.result.done);
  });

  test('should retry on failure', async () => {
    let calls = 0;
    const r = await exec.execute(() => { calls++; if (calls < 2) throw new Error('fail'); return { ok: true }; });
    assert.strictEqual(r.attempts, 2);
  });

  test('should track success rate', async () => {
    await exec.execute(() => ({ ok: true }));
    assert.strictEqual(exec.getSuccessRate(), 1);
  });
});

describe('StateMachine', () => {
  let sm;
  beforeEach(() => {
    sm = new StateMachine({ initialState: 'idle' });
    sm.addTransition('idle', 'start', 'running');
    sm.addTransition('running', 'complete', 'done');
  });

  test('should start in initial state', () => {
    assert.strictEqual(sm.getState(), 'idle');
  });

  test('should transition on event', () => {
    sm.send('start');
    assert.strictEqual(sm.getState(), 'running');
  });

  test('should throw on invalid transition', () => {
    assert.throws(() => sm.send('complete'), /No transition/);
  });

  test('should track history', () => {
    sm.send('start');
    assert.strictEqual(sm.getHistory().length, 2);
  });

  test('should reset', () => {
    sm.send('start');
    sm.reset();
    assert.strictEqual(sm.getState(), 'idle');
  });

  test('should enforce guard', () => {
    const gsm = new StateMachine({ initialState: 'locked' });
    gsm.addTransition('locked', 'unlock', 'unlocked', p => p.key === 'secret');
    assert.throws(() => gsm.send('unlock', { key: 'wrong' }), /Guard/);
  });
});

describe('DagScheduler', () => {
  let dag;
  beforeEach(() => { dag = new DagScheduler(); });

  test('should add node', () => {
    const r = dag.addNode('a', () => ({ a: 1 }));
    assert.strictEqual(r.name, 'a');
  });

  test('should add edge', () => {
    dag.addNode('a', () => ({})); dag.addNode('b', () => ({}));
    const r = dag.addEdge('a', 'b');
    assert.strictEqual(r.from, 'a');
  });

  test('should get execution order', () => {
    dag.addNode('a', () => ({})); dag.addNode('b', () => ({}));
    dag.addEdge('a', 'b');
    const order = dag.getExecutionOrder();
    assert.ok(order.indexOf('a') < order.indexOf('b'));
  });

  test('should execute dag', () => {
    dag.addNode('sum', ctx => ({ result: (ctx.x ?? 0) + 1 }));
    const r = dag.execute({ x: 5 });
    assert.strictEqual(r.results.sum.result, 6);
  });

  test('should throw on duplicate node', () => {
    dag.addNode('x', () => ({}));
    assert.throws(() => dag.addNode('x', () => ({})), /already exists/);
  });
});

describe('WorkflowBridge', () => {
  let bridge;
  beforeEach(() => { bridge = new WorkflowBridge(); });

  test('should register connector', () => {
    const r = bridge.registerConnector('github', { toWorkflow: d => d, fromWorkflow: d => d });
    assert.strictEqual(r.registered, true);
  });

  test('should throw on invalid adapter', () => {
    assert.throws(() => bridge.registerConnector('bad', {}), /Adapter must have/);
  });

  test('should translate between connectors', () => {
    bridge.registerConnector('a', { toWorkflow: d => ({ ...d, fmt: 'internal' }), fromWorkflow: d => ({ ...d, fmt: 'a' }) });
    bridge.registerConnector('b', { toWorkflow: d => d, fromWorkflow: d => ({ ...d, fmt: 'b' }) });
    const r = bridge.translate('a', 'b', { steps: [] });
    assert.strictEqual(r.result.fmt, 'b');
  });

  test('should throw on missing connector', () => {
    assert.throws(() => bridge.translate('x', 'y', {}), /not found/);
  });
});
