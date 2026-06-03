import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class RolloutEngine {
  constructor() { this._rollouts = new Map(); }
  create(flagName, stages = []) { const rollout = { rolloutId: crypto.randomUUID(), flagName, stages: stages.map((s, i) => ({ ...s, order: i })), currentStage: 0, createdAt: Date.now() }; this._rollouts.set(flagName, rollout); return rollout; }
  advance(flagName) { const rollout = this._rollouts.get(flagName); if (!rollout) throw new Error(`Rollout for "${flagName}" not found`); if (rollout.currentStage >= rollout.stages.length - 1) throw new Error('Already at final stage'); rollout.currentStage++; const stage = rollout.stages[rollout.currentStage]; return { flagName, stage: rollout.currentStage, percentage: stage.percentage ?? 0, phiProgress: rollout.currentStage / rollout.stages.length * (PHI / (PHI + 1)) }; }
  getStatus(flagName) { const rollout = this._rollouts.get(flagName); if (!rollout) throw new Error(`Rollout for "${flagName}" not found`); return { flagName, currentStage: rollout.currentStage, totalStages: rollout.stages.length }; }
  rollback(flagName) { const rollout = this._rollouts.get(flagName); if (!rollout) throw new Error(`Rollout for "${flagName}" not found`); rollout.currentStage = Math.max(0, rollout.currentStage - 1); return { flagName, stage: rollout.currentStage }; }
}
