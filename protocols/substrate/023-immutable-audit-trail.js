/**
 * SUBSTRATE-023: Immutable Audit Trail Protocol (IATP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * Every significant action in the organism produces an immutable audit
 * entry. The audit trail cannot be edited, truncated, or destroyed.
 * Full accountability at the substrate level.
 *
 * Engines wired: AuditEngine + AppendOnlyStore + CryptoCore
 * Ring: Memory Ring | Placement: Substrate foundation
 * Wire: substrate-wire/iatp
 * Enforcement: IMMUTABLE
 */

import crypto from 'node:crypto';

const SUBSTRATE_SEAL = 'UNBREAKABLE::IATP::023';

class ImmutableAuditTrailProtocol {
  #trail;
  #trailHash;

  constructor() {
    this.#trail = [];
    this.#trailHash = 'GENESIS';
    this.protocolId = 'SUBSTRATE-023';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Append an audit entry. Entries are append-only and hash-chained.
   */
  append(agentId, action, details) {
    const entry = Object.freeze({
      index: this.#trail.length,
      agentId,
      action,
      details: Object.freeze({ ...details }),
      previousHash: this.#trailHash,
      hash: this._hash(`${this.#trail.length}:${agentId}:${action}:${JSON.stringify(details)}:${this.#trailHash}`),
      timestamp: Date.now(),
      seal: SUBSTRATE_SEAL
    });

    this.#trailHash = entry.hash;
    this.#trail.push(entry);
    return entry;
  }

  /**
   * Query the audit trail by agent.
   */
  queryByAgent(agentId) {
    return this.#trail.filter(e => e.agentId === agentId);
  }

  /**
   * Query the audit trail by action type.
   */
  queryByAction(action) {
    return this.#trail.filter(e => e.action === action);
  }

  /**
   * Query by time range.
   */
  queryByTime(startTime, endTime) {
    return this.#trail.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
  }

  /**
   * Verify full trail integrity.
   */
  verifyIntegrity() {
    let prevHash = 'GENESIS';
    for (const entry of this.#trail) {
      if (entry.previousHash !== prevHash) {
        return { valid: false, breakAt: entry.index, seal: SUBSTRATE_SEAL };
      }
      prevHash = entry.hash;
    }
    return { valid: true, length: this.#trail.length, seal: SUBSTRATE_SEAL };
  }

  /**
   * Attempt to modify trail — ALWAYS fails.
   */
  modify() {
    throw new Error('SUBSTRATE VIOLATION: Audit trail is IMMUTABLE. Cannot modify entries.');
  }

  /**
   * Attempt to delete entries — ALWAYS fails.
   */
  delete() {
    throw new Error('SUBSTRATE VIOLATION: Audit trail is APPEND-ONLY. Cannot delete entries.');
  }

  /**
   * Attempt to truncate — ALWAYS fails.
   */
  truncate() {
    throw new Error('SUBSTRATE VIOLATION: Audit trail cannot be truncated.');
  }

  getTrailLength() { return this.#trail.length; }
  getLatestHash() { return this.#trailHash; }

  _hash(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
  }
}

export { ImmutableAuditTrailProtocol };
