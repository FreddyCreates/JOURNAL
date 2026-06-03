import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class LifecycleBootstrapper {
  constructor(config = {}) {
    this.stages = config.stages ?? ['genesis', 'infancy', 'growth', 'maturity', 'transcendence'];
    this.phiTransitions = config.phiTransitions ?? true;
    this.autoAdvance = config.autoAdvance ?? false;
    this._lifecycles = new Map();
  }

  bootstrap(entityId) {
    const lifecycleId = crypto.randomUUID();
    const lifecycle = { lifecycleId, entityId, stageIndex: 0, stage: this.stages[0], startedAt: Date.now(), phiAge: 0, history: [] };
    this._lifecycles.set(lifecycleId, lifecycle);
    return { lifecycleId, entityId, stage: lifecycle.stage, startedAt: lifecycle.startedAt, phiAge: 0 };
  }

  advance(lifecycleId) {
    const lc = this._lifecycles.get(lifecycleId);
    if (!lc) throw new Error(`Lifecycle ${lifecycleId} not found`);
    if (lc.stageIndex >= this.stages.length - 1) throw new Error('Already at final stage');
    const from = lc.stage;
    lc.stageIndex++;
    lc.stage = this.stages[lc.stageIndex];
    lc.phiAge = (lc.stageIndex + 1) * PHI;
    lc.history.push({ from, to: lc.stage, transitionAt: Date.now() });
    return { from, to: lc.stage, phiAge: lc.phiAge, transitionAt: Date.now() };
  }

  getLifecycle(lifecycleId) {
    const lc = this._lifecycles.get(lifecycleId);
    return lc ? { ...lc, history: [...lc.history] } : null;
  }

  getStage(lifecycleId) {
    const lc = this._lifecycles.get(lifecycleId);
    return lc ? lc.stage : null;
  }

  getAllLifecycles() { return [...this._lifecycles.values()].map(l => ({ lifecycleId: l.lifecycleId, entityId: l.entityId, stage: l.stage })); }

  terminate(lifecycleId) {
    const lc = this._lifecycles.get(lifecycleId);
    if (!lc) throw new Error(`Lifecycle ${lifecycleId} not found`);
    lc.stage = 'terminated';
    return { lifecycleId, stage: 'terminated', terminatedAt: Date.now() };
  }
}
