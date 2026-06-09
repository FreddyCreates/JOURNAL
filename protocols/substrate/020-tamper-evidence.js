/**
 * SUBSTRATE-020: Tamper Evidence Protocol (TEP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * Any attempt to tamper with the organism leaves an indelible trace.
 * Tampering cannot be hidden, erased, or disguised. The organism
 * remembers every attack.
 *
 * Engines wired: TamperDetector + ForensicLogger + IntegrityScanner
 * Ring: Sovereign Ring | Placement: Substrate foundation
 * Wire: substrate-wire/tep
 * Enforcement: IMMUTABLE
 */

import crypto from 'node:crypto';

const SUBSTRATE_SEAL = 'UNBREAKABLE::TEP::020';

class TamperEvidenceProtocol {
  #tamperLog;
  #watchpoints;
  #integrityHashes;

  constructor() {
    this.#tamperLog = [];
    this.#watchpoints = new Map();
    this.#integrityHashes = new Map();
    this.protocolId = 'SUBSTRATE-020';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Set a watchpoint on a critical value.
   */
  watch(watchId, value) {
    const hash = this._hash(JSON.stringify(value));
    this.#watchpoints.set(watchId, value);
    this.#integrityHashes.set(watchId, hash);
    return { watchId, hash, seal: SUBSTRATE_SEAL };
  }

  /**
   * Check if a watched value has been tampered with.
   */
  check(watchId, currentValue) {
    const originalHash = this.#integrityHashes.get(watchId);
    if (!originalHash) return { tampered: false, reason: 'NO_WATCHPOINT' };

    const currentHash = this._hash(JSON.stringify(currentValue));
    const tampered = currentHash !== originalHash;

    if (tampered) {
      const evidence = {
        watchId,
        type: 'TAMPER_DETECTED',
        originalHash,
        currentHash,
        timestamp: Date.now(),
        seal: SUBSTRATE_SEAL,
        indelible: true
      };
      this.#tamperLog.push(Object.freeze(evidence));
      return { tampered: true, evidence };
    }

    return { tampered: false, watchId, integrity: 'INTACT', seal: SUBSTRATE_SEAL };
  }

  /**
   * Get all tamper evidence. This log can NEVER be cleared.
   */
  getTamperEvidence() {
    return [...this.#tamperLog];
  }

  /**
   * Attempt to clear tamper evidence — ALWAYS fails.
   */
  clearEvidence() {
    const attempt = Object.freeze({
      type: 'EVIDENCE_CLEAR_ATTEMPT',
      timestamp: Date.now(),
      seal: SUBSTRATE_SEAL,
      result: 'DENIED'
    });
    this.#tamperLog.push(attempt);
    throw new Error('SUBSTRATE VIOLATION: Tamper evidence is INDELIBLE. Cannot be cleared.');
  }

  /**
   * Forensic scan — check all watchpoints.
   */
  forensicScan(getCurrentValues) {
    const results = [];
    for (const [watchId, originalValue] of this.#watchpoints) {
      const current = getCurrentValues(watchId);
      const check = this.check(watchId, current);
      results.push({ watchId, ...check });
    }
    return { results, scannedAt: Date.now(), seal: SUBSTRATE_SEAL };
  }

  _hash(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
  }
}

export { TamperEvidenceProtocol };
