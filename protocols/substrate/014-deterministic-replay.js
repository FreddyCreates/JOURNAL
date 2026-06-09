/**
 * SUBSTRATE-014: Deterministic Replay Protocol (DRP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * Every computation in the organism can be deterministically replayed
 * from its inputs. Ensures reproducibility at the substrate level.
 * No black-box operations permitted.
 *
 * Engines wired: ReplayEngine + EventLog + DeterminismGuard
 * Ring: Memory Ring | Placement: Substrate foundation
 * Wire: substrate-wire/drp
 * Enforcement: IMMUTABLE
 */

import crypto from 'node:crypto';

const SUBSTRATE_SEAL = 'UNBREAKABLE::DRP::014';

class DeterministicReplayProtocol {
  #replayLog;
  #checkpoints;

  constructor() {
    this.#replayLog = [];
    this.#checkpoints = new Map();
    this.protocolId = 'SUBSTRATE-014';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Record a computation for future replay.
   * @param {string} computationId - Unique ID
   * @param {Function} fn - The computation (must be pure/deterministic)
   * @param {Array} inputs - Serializable inputs
   * @returns {Object} Recorded computation with output
   */
  record(computationId, fn, inputs) {
    const output = fn(...inputs);
    const record = Object.freeze({
      computationId,
      inputs: JSON.parse(JSON.stringify(inputs)),
      output: JSON.parse(JSON.stringify(output)),
      inputHash: this._hash(JSON.stringify(inputs)),
      outputHash: this._hash(JSON.stringify(output)),
      timestamp: Date.now(),
      seal: SUBSTRATE_SEAL
    });
    this.#replayLog.push(record);
    return record;
  }

  /**
   * Replay a recorded computation and verify determinism.
   */
  replay(computationId, fn) {
    const record = this.#replayLog.find(r => r.computationId === computationId);
    if (!record) throw new Error(`Computation ${computationId} not in replay log`);

    const replayOutput = fn(...record.inputs);
    const replayHash = this._hash(JSON.stringify(replayOutput));
    const deterministic = replayHash === record.outputHash;

    return {
      computationId,
      deterministic,
      originalHash: record.outputHash,
      replayHash,
      reason: deterministic ? 'DETERMINISTIC' : 'NON_DETERMINISTIC_VIOLATION',
      seal: SUBSTRATE_SEAL
    };
  }

  /**
   * Create a checkpoint — snapshot of all computations up to now.
   */
  checkpoint(checkpointId) {
    const snapshot = {
      checkpointId,
      computationCount: this.#replayLog.length,
      hash: this._hash(this.#replayLog.map(r => r.outputHash).join(':')),
      timestamp: Date.now(),
      seal: SUBSTRATE_SEAL
    };
    this.#checkpoints.set(checkpointId, Object.freeze(snapshot));
    return snapshot;
  }

  /**
   * Verify checkpoint integrity.
   */
  verifyCheckpoint(checkpointId) {
    const cp = this.#checkpoints.get(checkpointId);
    if (!cp) return { valid: false, reason: 'CHECKPOINT_NOT_FOUND' };
    const currentHash = this._hash(this.#replayLog.slice(0, cp.computationCount).map(r => r.outputHash).join(':'));
    return { valid: currentHash === cp.hash, checkpointId, seal: SUBSTRATE_SEAL };
  }

  _hash(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
  }
}

export { DeterministicReplayProtocol };
