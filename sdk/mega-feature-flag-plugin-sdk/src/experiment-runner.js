import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class ExperimentRunner {
  constructor() { this._experiments = new Map(); this._assignments = []; }
  create(name, variants = ['control', 'treatment']) { const exp = { experimentId: crypto.randomUUID(), name, variants, status: 'running', createdAt: Date.now() }; this._experiments.set(name, exp); return exp; }
  assign(experimentName, userId) { const exp = this._experiments.get(experimentName); if (!exp) throw new Error(`Experiment "${experimentName}" not found`); const hash = userId.split('').reduce((h, c) => h + c.charCodeAt(0), 0) % exp.variants.length; const variant = exp.variants[hash]; const assignment = { assignmentId: crypto.randomUUID(), experiment: experimentName, userId, variant, phiDistribution: PHI / (PHI + 1), timestamp: Date.now() }; this._assignments.push(assignment); return assignment; }
  getResults(experimentName) { const assignments = this._assignments.filter(a => a.experiment === experimentName); const distribution = {}; for (const a of assignments) { distribution[a.variant] = (distribution[a.variant] ?? 0) + 1; } return { experiment: experimentName, totalAssignments: assignments.length, distribution }; }
  stop(experimentName) { const exp = this._experiments.get(experimentName); if (!exp) throw new Error(`Experiment "${experimentName}" not found`); exp.status = 'stopped'; return { name: experimentName, status: 'stopped' }; }
}
