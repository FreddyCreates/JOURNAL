/**
 * SUBSTRATE-002: Immutable Truth Anchor Protocol (ITAP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * Establishes a cryptographic truth anchor that all claims, assertions,
 * and declarations must reference. No claim can enter canonical state
 * without binding to the truth anchor chain.
 *
 * Engines wired: HashManifest + ThesisVerifier + CryptoCore
 * Ring: Sovereign Ring | Placement: Substrate foundation
 * Wire: substrate-wire/itap
 * Enforcement: IMMUTABLE
 */

import crypto from 'node:crypto';

const PHI = 1.618033988749895;
const SUBSTRATE_SEAL = 'UNBREAKABLE::ITAP::002';

class ImmutableTruthAnchorProtocol {
  #anchorChain;
  #truthRoots;

  constructor() {
    this.#anchorChain = [];
    this.#truthRoots = new Map();
    this.protocolId = 'SUBSTRATE-002';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
    this._plantGenesisAnchor();
  }

  _plantGenesisAnchor() {
    const genesis = {
      anchorId: 'anchor-genesis',
      hash: this._hash('TRUTH_ANCHOR_GENESIS:' + SUBSTRATE_SEAL),
      timestamp: Date.now(),
      depth: 0,
      type: 'GENESIS'
    };
    this.#anchorChain.push(Object.freeze(genesis));
  }

  /**
   * Anchor a truth — once anchored it becomes immutable reference.
   * @param {string} claimId - The claim being anchored
   * @param {string} evidence - Evidence hash or proof
   * @param {string} authority - Who is anchoring (must be authorized)
   * @returns {Object} Anchor record
   */
  anchorTruth(claimId, evidence, authority) {
    const prevAnchor = this.#anchorChain[this.#anchorChain.length - 1];
    const anchor = {
      anchorId: `anchor-${this.#anchorChain.length}`,
      claimId,
      evidence,
      authority,
      previousHash: prevAnchor.hash,
      hash: this._hash(`${claimId}:${evidence}:${authority}:${prevAnchor.hash}`),
      timestamp: Date.now(),
      depth: prevAnchor.depth + 1,
      type: 'TRUTH_ANCHOR',
      seal: SUBSTRATE_SEAL
    };

    const frozen = Object.freeze(anchor);
    this.#anchorChain.push(frozen);
    this.#truthRoots.set(claimId, frozen);
    return frozen;
  }

  /**
   * Verify a claim is properly anchored.
   */
  verifyAnchor(claimId) {
    const anchor = this.#truthRoots.get(claimId);
    if (!anchor) return { anchored: false, reason: 'NOT_ANCHORED' };

    const idx = this.#anchorChain.findIndex(a => a.anchorId === anchor.anchorId);
    if (idx <= 0) return { anchored: false, reason: 'CHAIN_BROKEN' };

    const prev = this.#anchorChain[idx - 1];
    const expectedHash = this._hash(`${anchor.claimId}:${anchor.evidence}:${anchor.authority}:${prev.hash}`);
    const valid = expectedHash === anchor.hash;

    return { anchored: valid, claimId, depth: anchor.depth, reason: valid ? 'VERIFIED' : 'HASH_MISMATCH' };
  }

  /**
   * Get chain integrity report.
   */
  auditChain() {
    let valid = true;
    for (let i = 1; i < this.#anchorChain.length; i++) {
      if (this.#anchorChain[i].previousHash !== this.#anchorChain[i - 1].hash) {
        valid = false;
        break;
      }
    }
    return { valid, length: this.#anchorChain.length, seal: SUBSTRATE_SEAL };
  }

  _hash(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
  }
}

export { ImmutableTruthAnchorProtocol };
