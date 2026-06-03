import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class WorkflowEngine {
  constructor(config = {}) {
    this.maxSteps = config.maxSteps ?? 50;
    this.parallelism = config.parallelism ?? 'auto';
    this.phiPacing = config.phiPacing ?? true;
    this._workflows = new Map();
    this._executions = new Map();
  }

  createWorkflow(name, steps) {
    if (steps.length > this.maxSteps) throw new Error('Too many steps');
    const workflowId = crypto.randomUUID();
    const workflow = { workflowId, name, steps: [...steps], stepCount: steps.length, created: Date.now() };
    this._workflows.set(workflowId, workflow);
    return { workflowId, name, stepCount: steps.length, created: workflow.created };
  }

  executeWorkflow(workflowId, input) {
    const workflow = this._workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);
    const executionId = crypto.randomUUID();
    const execution = { executionId, workflowId, status: 'running', input, currentStep: 0, startedAt: Date.now(), stepResults: [] };
    this._executions.set(executionId, execution);
    return { executionId, workflowId, status: 'running', startedAt: execution.startedAt };
  }

  getExecution(executionId) {
    const exec = this._executions.get(executionId);
    return exec ? { ...exec } : undefined;
  }

  pauseExecution(executionId) {
    const exec = this._executions.get(executionId);
    if (!exec) throw new Error(`Execution ${executionId} not found`);
    exec.status = 'paused';
    return { executionId, status: 'paused' };
  }

  resumeExecution(executionId) {
    const exec = this._executions.get(executionId);
    if (!exec) throw new Error(`Execution ${executionId} not found`);
    exec.status = 'running';
    return { executionId, status: 'running' };
  }

  getWorkflows() { return [...this._workflows.values()].map(w => ({ ...w })); }
}
