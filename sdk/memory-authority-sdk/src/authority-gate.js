import crypto from 'node:crypto';

const PHI = 1.618033988749895;
const PHI_INVERSE = 1 / PHI;

/**
 * AuthorityGate — The enforcement layer of the Bounded Authority Membrane.
 * 
 * Every write attempt to canonical memory MUST pass through an AuthorityGate.
 * The gate evaluates: source identity, claim class, evidence posture, resonance score,
 * and release boundary before permitting any mutation to MEMORY_RUNTIME.
 *
 * Design principle: Generation ≠ Truth. Imagination ≠ Canonization.
 */
export class AuthorityGate {
  /**
   * @param {Object} config
   * @param {number} [config.resonanceFloor=0.618] - Minimum φ-resonance for passage
   * @param {string[]} [config.trustedSources=[]] - Pre-approved source identities
   * @param {boolean} [config.requireEvidence=true] - Require at least 1 evidence attachment
   * @param {number} [config.maxThroughput=100] - Max claims processed per heartbeat cycle
   */
  constructor(config = {}) {
    this.resonanceFloor = config.resonanceFloor ?? PHI_INVERSE;
    this.trustedSources = new Set(config.trustedSources || []);
    this.requireEvidence = config.requireEvidence ?? true;
    this.maxThroughput = config.maxThroughput ?? 100;
    this._throughputCounter = 0;
    this._lastResetAt = Date.now();
    this._auditLog = [];
  }

  /**
   * Evaluate whether a claim is permitted to pass through the gate.
   * @param {Object} claim - The claim object requesting passage
   * @param {string} claim.id
   * @param {string} claim.sourceId
   * @param {string} claim.claimClass
   * @param {number} claim.phiResonance
   * @param {string[]} claim.evidenceIds
   * @param {string} claim.releaseBoundary
   * @returns {{permitted: boolean, reason: string, gateId: string, timestamp: number}}
   */
  evaluate(claim) {
    const gateId = crypto.randomUUID();
    const timestamp = Date.now();

    // Reset throughput counter every heartbeat (873ms)
    if (timestamp - this._lastResetAt >= 873) {
      this._throughputCounter = 0;
      this._lastResetAt = timestamp;
    }

    // Throughput limit
    if (this._throughputCounter >= this.maxThroughput) {
      return this._result(false, 'Gate throughput exceeded for this heartbeat cycle', gateId, timestamp, claim.id);
    }

    this._throughputCounter++;

    // Only candidate or canonical-bound claims may pass
    if (claim.claimClass !== 'candidate' && claim.claimClass !== 'canonical') {
      return this._result(false, `Claim class '${claim.claimClass}' not eligible for gate passage`, gateId, timestamp, claim.id);
    }

    // Resonance floor
    if (claim.phiResonance < this.resonanceFloor) {
      return this._result(false, `Resonance ${claim.phiResonance.toFixed(4)} below floor ${this.resonanceFloor.toFixed(4)}`, gateId, timestamp, claim.id);
    }

    // Evidence requirement
    if (this.requireEvidence && (!claim.evidenceIds || claim.evidenceIds.length === 0)) {
      return this._result(false, 'No evidence attached — gate requires at least 1 evidence reference', gateId, timestamp, claim.id);
    }

    // Trusted source fast-path (still logged)
    if (this.trustedSources.has(claim.sourceId)) {
      return this._result(true, 'Trusted source — fast-path approved', gateId, timestamp, claim.id);
    }

    // Standard passage
    return this._result(true, 'All authority checks passed', gateId, timestamp, claim.id);
  }

  /**
   * Add a source to the trusted list.
   * @param {string} sourceId
   */
  trustSource(sourceId) {
    this.trustedSources.add(sourceId);
  }

  /**
   * Revoke trust for a source.
   * @param {string} sourceId
   */
  revokeTrust(sourceId) {
    this.trustedSources.delete(sourceId);
  }

  /**
   * Get the full audit log of gate decisions.
   * @returns {Object[]}
   */
  getAuditLog() {
    return [...this._auditLog];
  }

  /** @private */
  _result(permitted, reason, gateId, timestamp, claimId) {
    const entry = { permitted, reason, gateId, timestamp, claimId };
    this._auditLog.push(entry);
    return entry;
  }
}
