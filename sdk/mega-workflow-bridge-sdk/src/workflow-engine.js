import crypto from 'node:crypto';
const PHI = 1.618033988749895;

export class WorkflowEngine {
  constructor(config = {}) {
    this.maxWorkflows = config.maxWorkflows ?? 100;
    this._workflows = new Map();
    this._runs = [];
  }

  create(name, steps = []) {
    if (this._workflows.size >= this.maxWorkflows) throw new Error('Max workflows reached');
    const wf = { workflowId: crypto.randomUUID(), name, steps: [...steps], createdAt: Date.now(), version: 1 };
    this._workflows.set(wf.workflowId, wf);
    return { workflowId: wf.workflowId, name, stepCount: steps.length };
  }

  execute(workflowId, input = {}) {
    const wf = this._workflows.get(workflowId);
    if (!wf) throw new Error(`Workflow "${workflowId}" not found`);
    let context = { ...input };
    const stepResults = [];
    for (const step of wf.steps) {
      const result = typeof step === 'function' ? step(context) : { ...step, executed: true };
      stepResults.push(result);
      context = { ...context, ...result };
    }
    const phiEfficiency = Math.min(1, stepResults.length / (wf.steps.length || 1) * (PHI / (PHI + 1)));
    const run = { runId: crypto.randomUUID(), workflowId, stepsExecuted: stepResults.length, phiEfficiency, completedAt: Date.now() };
    this._runs.push(run);
    return { ...run, output: context };
  }

  list() { return [...this._workflows.values()].map(w => ({ workflowId: w.workflowId, name: w.name })); }
  getRuns() { return [...this._runs]; }
  delete(workflowId) { return this._workflows.delete(workflowId); }
}
