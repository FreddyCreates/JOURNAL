import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class SelfDirector {
  constructor(config = {}) {
    this.priorityMethod = config.priorityMethod ?? 'phi-stack';
    this.reflectionInterval = config.reflectionInterval ?? 873;
    this.adaptiveGoals = config.adaptiveGoals ?? true;
    this._goals = new Map();
    this._completedGoals = 0;
  }

  setGoal(goal, priority = 1.0) {
    const goalId = crypto.randomUUID();
    const phiWeight = priority * PHI / (PHI + 1);
    const entry = { goalId, goal, priority, phiWeight, status: 'active', progress: 0, setAt: Date.now() };
    this._goals.set(goalId, entry);
    return { goalId, goal, priority, phiWeight, status: 'active' };
  }

  getNextAction() {
    const active = [...this._goals.values()].filter(g => g.status === 'active').sort((a, b) => b.phiWeight - a.phiWeight);
    if (active.length === 0) return null;
    const top = active[0];
    const phiMomentum = top.phiWeight * (1 - top.progress);
    return { actionId: crypto.randomUUID(), goal: top.goal, goalId: top.goalId, action: `advance: ${top.goal}`, reasoning: ['highest phi-weight', 'lowest progress'], phiMomentum };
  }

  reportProgress(goalId, progress) {
    const goal = this._goals.get(goalId);
    if (!goal) throw new Error(`Goal ${goalId} not found`);
    goal.progress = Math.min(1.0, progress);
    if (goal.progress >= 1.0) { goal.status = 'completed'; this._completedGoals++; }
    return { goalId, progress: goal.progress, status: goal.status };
  }

  reprioritize() {
    const goals = [...this._goals.values()].filter(g => g.status === 'active');
    goals.sort((a, b) => b.priority * (1 - b.progress) - a.priority * (1 - a.progress));
    goals.forEach((g, i) => { g.phiWeight = g.priority * Math.pow(PHI, -i); });
    return goals.map(g => ({ goalId: g.goalId, goal: g.goal, phiWeight: g.phiWeight }));
  }

  getGoals() { return [...this._goals.values()].sort((a, b) => b.phiWeight - a.phiWeight); }

  getDirectionState() {
    const goals = [...this._goals.values()];
    const active = goals.filter(g => g.status === 'active');
    const momentum = active.reduce((s, g) => s + g.phiWeight * (1 - g.progress), 0);
    return { activeGoals: active.length, completedGoals: this._completedGoals, momentum, focus: active[0]?.goal ?? null };
  }
}
