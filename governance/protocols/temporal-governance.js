/**
 * Temporal Governance Protocol
 * 
 * Governs how the system behaves across time — scheduling, rollback windows,
 * epoch transitions, temporal isolation, and chronological integrity.
 * 
 * Protocol ID: GOV-TEMPORAL-001
 * Layer: Governance Macro
 * Authority: CHRONOS + CIVOS PRIME
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI; // 0.618...

export class TemporalGovernanceProtocol {
  constructor() {
    this.id = 'GOV-TEMPORAL-001';
    this.name = 'Temporal Governance Protocol';
    this.version = '1.0.0';
    this.status = 'ACTIVE';
    this.epochs = [];
    this.rollbackWindow = 300; // seconds
    this.currentEpoch = null;
  }

  /**
   * Initialize a new governance epoch
   */
  initEpoch(label, options = {}) {
    const epoch = {
      id: `EPOCH-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label,
      startedAt: new Date().toISOString(),
      endedAt: null,
      status: 'active',
      rollbackWindowMs: (options.rollbackWindow || this.rollbackWindow) * 1000,
      decisions: [],
      checkpoints: [],
      parentEpoch: this.currentEpoch?.id || null,
    };
    this.epochs.push(epoch);
    this.currentEpoch = epoch;
    return epoch;
  }

  /**
   * Record a governance decision within current epoch
   */
  recordDecision(decision) {
    if (!this.currentEpoch) throw new Error('No active epoch');
    const record = {
      id: `DEC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...decision,
      epochId: this.currentEpoch.id,
      reversible: decision.reversible !== false,
    };
    this.currentEpoch.decisions.push(record);
    return record;
  }

  /**
   * Create a temporal checkpoint (snapshot point for rollback)
   */
  checkpoint(label) {
    if (!this.currentEpoch) throw new Error('No active epoch');
    const cp = {
      id: `CP-${Date.now()}`,
      label,
      timestamp: new Date().toISOString(),
      epochId: this.currentEpoch.id,
      decisionCount: this.currentEpoch.decisions.length,
    };
    this.currentEpoch.checkpoints.push(cp);
    return cp;
  }

  /**
   * Check if a rollback is still within the allowed window
   */
  canRollback(checkpointId) {
    if (!this.currentEpoch) return false;
    const cp = this.currentEpoch.checkpoints.find(c => c.id === checkpointId);
    if (!cp) return false;
    const elapsed = Date.now() - new Date(cp.timestamp).getTime();
    return elapsed <= this.currentEpoch.rollbackWindowMs;
  }

  /**
   * Execute rollback to a checkpoint
   */
  rollback(checkpointId) {
    if (!this.canRollback(checkpointId)) {
      return { success: false, reason: 'Rollback window expired or checkpoint not found' };
    }
    const cp = this.currentEpoch.checkpoints.find(c => c.id === checkpointId);
    const removedDecisions = this.currentEpoch.decisions.splice(cp.decisionCount);
    return {
      success: true,
      checkpoint: cp,
      removedDecisions: removedDecisions.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Close current epoch
   */
  closeEpoch(reason = 'completed') {
    if (!this.currentEpoch) throw new Error('No active epoch');
    this.currentEpoch.endedAt = new Date().toISOString();
    this.currentEpoch.status = reason;
    const closed = this.currentEpoch;
    this.currentEpoch = null;
    return closed;
  }

  /**
   * Calculate temporal health using φ-harmonic thresholds
   */
  getTemporalHealth() {
    const totalEpochs = this.epochs.length;
    if (totalEpochs === 0) return { score: 1.0, status: 'pristine' };

    const completedEpochs = this.epochs.filter(e => e.status === 'completed').length;
    const failedEpochs = this.epochs.filter(e => e.status === 'failed').length;
    const ratio = totalEpochs > 0 ? completedEpochs / totalEpochs : 0;

    return {
      score: ratio,
      status: ratio >= PHI_INV ? 'healthy' : ratio >= (1 - PHI_INV) ? 'degraded' : 'critical',
      totalEpochs,
      completedEpochs,
      failedEpochs,
      threshold: PHI_INV,
    };
  }

  /**
   * Get governance timeline
   */
  getTimeline() {
    return this.epochs.map(e => ({
      id: e.id,
      label: e.label,
      started: e.startedAt,
      ended: e.endedAt,
      status: e.status,
      decisions: e.decisions.length,
      checkpoints: e.checkpoints.length,
    }));
  }
}

export default TemporalGovernanceProtocol;
