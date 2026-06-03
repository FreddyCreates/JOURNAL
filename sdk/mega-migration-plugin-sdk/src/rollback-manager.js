import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class RollbackManager {
  constructor() { this._checkpoints = []; }
  checkpoint(name, state) { const cp = { checkpointId: crypto.randomUUID(), name, state: structuredClone(state), createdAt: Date.now() }; this._checkpoints.push(cp); return { checkpointId: cp.checkpointId, name }; }
  restore(name) { const cp = [...this._checkpoints].reverse().find(c => c.name === name); if (!cp) throw new Error(`Checkpoint "${name}" not found`); return { checkpointId: cp.checkpointId, name, state: structuredClone(cp.state), phiIntegrity: PHI / (PHI + 1) }; }
  getCheckpoints() { return this._checkpoints.map(c => ({ checkpointId: c.checkpointId, name: c.name })); }
  prune(keepLast = 5) { if (this._checkpoints.length > keepLast) { this._checkpoints = this._checkpoints.slice(-keepLast); } return { remaining: this._checkpoints.length }; }
}
