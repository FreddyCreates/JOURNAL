import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AgentOrchestrator } from '../src/agent-orchestrator.js';
import { TaskScheduler } from '../src/task-scheduler.js';
import { WorkflowEngine } from '../src/workflow-engine.js';
import { ConsensusProtocol } from '../src/consensus-protocol.js';
import { LoadBalancer } from '../src/load-balancer.js';

const PHI = 1.618033988749895;

describe('AgentOrchestrator', () => {
  let orch;
  beforeEach(() => { orch = new AgentOrchestrator(); });

  test('should create with defaults', () => {
    assert.strictEqual(orch.maxAgents, 128);
    assert.strictEqual(orch.heartbeatInterval, 873);
  });

  test('should register agent', () => {
    const r = orch.registerAgent({ capabilities: ['compute', 'search'] });
    assert.ok(r.agentId);
    assert.strictEqual(r.status, 'idle');
    assert.deepStrictEqual(r.capabilities, ['compute', 'search']);
  });

  test('should assign task', () => {
    const agent = orch.registerAgent({ capabilities: ['x'] });
    const task = orch.assignTask(agent.agentId, { name: 'process' });
    assert.ok(task.taskId);
    assert.strictEqual(task.status, 'assigned');
  });

  test('should throw for unknown agent task assignment', () => {
    assert.throws(() => orch.assignTask('fake', {}), /not found/);
  });

  test('should broadcast message', () => {
    orch.registerAgent({ capabilities: [] });
    orch.registerAgent({ capabilities: [] });
    const result = orch.broadcast('hello');
    assert.strictEqual(result.deliveredTo, 2);
  });

  test('should get agents by capability', () => {
    orch.registerAgent({ capabilities: ['ai'] });
    orch.registerAgent({ capabilities: ['db'] });
    const ai = orch.getAgentsByCapability('ai');
    assert.strictEqual(ai.length, 1);
  });

  test('should get orchestration state', () => {
    orch.registerAgent({ capabilities: [] });
    const state = orch.getOrchestrationState();
    assert.strictEqual(state.totalAgents, 1);
    assert.strictEqual(state.idleAgents, 1);
  });

  test('should deregister agent', () => {
    const a = orch.registerAgent({ capabilities: [] });
    assert.ok(orch.deregisterAgent(a.agentId));
    assert.strictEqual(orch.getOrchestrationState().totalAgents, 0);
  });
});

describe('TaskScheduler', () => {
  let sched;
  beforeEach(() => { sched = new TaskScheduler(); });

  test('should schedule task', () => {
    const r = sched.schedule({ name: 'work', urgency: 2, importance: 3 });
    assert.ok(r.taskId);
    assert.ok(r.priority > 0);
  });

  test('should execute task', () => {
    const t = sched.schedule({ name: 'x' });
    const r = sched.execute(t.taskId);
    assert.strictEqual(r.status, 'executing');
  });

  test('should complete task', () => {
    const t = sched.schedule({ name: 'x' });
    sched.execute(t.taskId);
    const r = sched.complete(t.taskId, 'done');
    assert.strictEqual(r.status, 'completed');
  });

  test('should throw for unknown task execution', () => {
    assert.throws(() => sched.execute('fake'), /not in queue/);
  });

  test('should get metrics', () => {
    sched.schedule({ name: 'a' });
    const m = sched.getMetrics();
    assert.strictEqual(m.queued, 1);
  });

  test('should sort queue by priority', () => {
    sched.schedule({ name: 'low', urgency: 1, importance: 1 });
    sched.schedule({ name: 'high', urgency: 5, importance: 5 });
    const q = sched.getQueue();
    assert.ok(q[0].priority >= q[1].priority);
  });
});

describe('WorkflowEngine', () => {
  let wf;
  beforeEach(() => { wf = new WorkflowEngine(); });

  test('should create workflow', () => {
    const r = wf.createWorkflow('test', ['step1', 'step2']);
    assert.ok(r.workflowId);
    assert.strictEqual(r.stepCount, 2);
  });

  test('should execute workflow', () => {
    const w = wf.createWorkflow('w', ['s1']);
    const r = wf.executeWorkflow(w.workflowId, { data: 1 });
    assert.strictEqual(r.status, 'running');
  });

  test('should pause and resume', () => {
    const w = wf.createWorkflow('w', ['s1']);
    const e = wf.executeWorkflow(w.workflowId, {});
    wf.pauseExecution(e.executionId);
    assert.strictEqual(wf.getExecution(e.executionId).status, 'paused');
    wf.resumeExecution(e.executionId);
    assert.strictEqual(wf.getExecution(e.executionId).status, 'running');
  });

  test('should throw for too many steps', () => {
    assert.throws(() => wf.createWorkflow('x', Array(51).fill('s')), /Too many/);
  });

  test('should list workflows', () => {
    wf.createWorkflow('a', ['s']);
    assert.strictEqual(wf.getWorkflows().length, 1);
  });
});

describe('ConsensusProtocol', () => {
  let cp;
  beforeEach(() => { cp = new ConsensusProtocol(); });

  test('should propose', () => {
    const r = cp.propose('change X');
    assert.ok(r.proposalId);
    assert.strictEqual(r.status, 'voting');
  });

  test('should vote', () => {
    const p = cp.propose('y');
    const r = cp.vote(p.proposalId, 'agent1', 'accept');
    assert.strictEqual(r.accepts, 1);
  });

  test('should resolve accepted', () => {
    const p = cp.propose('z');
    cp.vote(p.proposalId, 'a1', 'accept');
    cp.vote(p.proposalId, 'a2', 'accept');
    cp.vote(p.proposalId, 'a3', 'accept');
    const r = cp.resolve(p.proposalId);
    assert.strictEqual(r.decision, 'accepted');
    assert.ok(r.quorumMet);
  });

  test('should resolve pending without quorum', () => {
    const p = cp.propose('w');
    cp.vote(p.proposalId, 'a1', 'accept');
    const r = cp.resolve(p.proposalId);
    assert.strictEqual(r.decision, 'pending');
  });

  test('should get history', () => {
    cp.propose('a');
    cp.propose('b');
    assert.strictEqual(cp.getHistory().length, 2);
  });
});

describe('LoadBalancer', () => {
  let lb;
  beforeEach(() => { lb = new LoadBalancer(); });

  test('should add node', () => {
    const r = lb.addNode({ capacity: 50 });
    assert.ok(r.nodeId);
    assert.strictEqual(r.capacity, 50);
    assert.strictEqual(r.currentLoad, 0);
  });

  test('should route request', () => {
    lb.addNode({ capacity: 10 });
    const r = lb.route({ type: 'query' });
    assert.ok(r.nodeId);
    assert.strictEqual(r.loadAfter, 1);
  });

  test('should throw when no nodes', () => {
    assert.throws(() => lb.route({}), /No nodes/);
  });

  test('should get node load', () => {
    const n = lb.addNode({});
    lb.route({});
    const load = lb.getNodeLoad(n.nodeId);
    assert.strictEqual(load.currentLoad, 1);
  });

  test('should rebalance', () => {
    lb.addNode({});
    lb.addNode({});
    lb.route({});
    lb.route({});
    lb.route({});
    const r = lb.rebalance();
    assert.ok(r.avgLoad > 0);
  });

  test('should get metrics', () => {
    lb.addNode({ capacity: 100 });
    const m = lb.getMetrics();
    assert.strictEqual(m.nodeCount, 1);
    assert.strictEqual(m.totalCapacity, 100);
  });
});
