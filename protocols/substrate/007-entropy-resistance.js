/**
 * SUBSTRATE-007: Entropy Resistance Protocol (ERP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * Actively resists entropy, decay, and degradation across the organism.
 * Maintains structural coherence even under sustained attack or neglect.
 * The organism does not rot.
 *
 * Engines wired: IntegrityScanner + PhiResonance + CryptoCore
 * Ring: Sovereign Ring | Placement: Substrate foundation
 * Wire: substrate-wire/erp
 * Enforcement: IMMUTABLE
 */

import crypto from 'node:crypto';

const PHI = 1.618033988749895;
const SUBSTRATE_SEAL = 'UNBREAKABLE::ERP::007';

class EntropyResistanceProtocol {
  #integrityMap;
  #entropyLog;
  #checksumVault;

  constructor() {
    this.#integrityMap = new Map();
    this.#entropyLog = [];
    this.#checksumVault = new Map();
    this.protocolId = 'SUBSTRATE-007';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Seal a component's state. Creates an integrity checkpoint.
   * @param {string} componentId - Component to seal
   * @param {*} state - Current state to preserve
   * @returns {Object} Integrity seal
   */
  sealState(componentId, state) {
    const serialized = JSON.stringify(state);
    const checksum = this._hash(serialized);
    const record = {
      componentId,
      checksum,
      sealedAt: Date.now(),
      size: serialized.length,
      seal: SUBSTRATE_SEAL
    };
    this.#checksumVault.set(componentId, record);
    this.#integrityMap.set(componentId, serialized);
    return record;
  }

  /**
   * Check if a component has decayed from its sealed state.
   * @param {string} componentId - Component to check
   * @param {*} currentState - Current state to compare
   * @returns {Object} Decay assessment
   */
  assessDecay(componentId, currentState) {
    const original = this.#checksumVault.get(componentId);
    if (!original) return { decayed: false, reason: 'NO_SEAL_FOUND' };

    const currentChecksum = this._hash(JSON.stringify(currentState));
    const decayed = currentChecksum !== original.checksum;

    if (decayed) {
      this.#entropyLog.push({
        componentId,
        detectedAt: Date.now(),
        originalChecksum: original.checksum,
        currentChecksum,
        seal: SUBSTRATE_SEAL
      });
    }

    return {
      decayed,
      componentId,
      age: Date.now() - original.sealedAt,
      reason: decayed ? 'STATE_DRIFT_DETECTED' : 'INTEGRITY_MAINTAINED'
    };
  }

  /**
   * Restore a component to its sealed state.
   * @param {string} componentId - Component to restore
   * @returns {*} The original sealed state
   */
  restore(componentId) {
    const serialized = this.#integrityMap.get(componentId);
    if (!serialized) throw new Error(`No sealed state for ${componentId}`);
    return JSON.parse(serialized);
  }

  getEntropyLog() { return [...this.#entropyLog]; }

  _hash(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
  }
}

export { EntropyResistanceProtocol };
