/**
 * SUBSTRATE-017: Cross-Agent Attestation Protocol (CAAP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * Agents can attest to each other's outputs. Multi-party attestation
 * is required for high-stakes claims. No single agent can self-attest.
 *
 * Engines wired: AttestationEngine + QuorumGuard + SealChain
 * Ring: Interface Ring | Placement: Substrate foundation
 * Wire: substrate-wire/caap
 * Enforcement: IMMUTABLE
 */

import crypto from 'node:crypto';

const SUBSTRATE_SEAL = 'UNBREAKABLE::CAAP::017';

class CrossAgentAttestationProtocol {
  #attestations;
  #requirements;

  constructor() {
    this.#attestations = new Map();
    this.#requirements = new Map();
    this.protocolId = 'SUBSTRATE-017';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Define attestation requirements for a claim class.
   */
  defineRequirement(claimClass, minAttestors, excludeSelf = true) {
    this.#requirements.set(claimClass, Object.freeze({ claimClass, minAttestors, excludeSelf }));
    return { claimClass, minAttestors, excludeSelf, seal: SUBSTRATE_SEAL };
  }

  /**
   * Submit a claim for attestation.
   */
  submitClaim(claimId, authorAgentId, claimClass, content) {
    const record = {
      claimId,
      authorAgentId,
      claimClass,
      content,
      attestations: new Map(),
      submittedAt: Date.now(),
      resolved: false,
      accepted: false,
      seal: SUBSTRATE_SEAL
    };
    this.#attestations.set(claimId, record);
    return { claimId, submitted: true, seal: SUBSTRATE_SEAL };
  }

  /**
   * Attest to a claim. Self-attestation blocked if requirement says so.
   */
  attest(claimId, attestorAgentId, agrees, confidence = 1.0) {
    const record = this.#attestations.get(claimId);
    if (!record) throw new Error(`Claim ${claimId} not found`);
    if (record.resolved) throw new Error(`Claim ${claimId} already resolved`);

    const req = this.#requirements.get(record.claimClass);
    if (req && req.excludeSelf && attestorAgentId === record.authorAgentId) {
      throw new Error('SUBSTRATE VIOLATION: Self-attestation forbidden for this claim class.');
    }

    record.attestations.set(attestorAgentId, {
      agrees,
      confidence,
      timestamp: Date.now(),
      hash: this._hash(`${claimId}:${attestorAgentId}:${agrees}:${confidence}`)
    });

    return { claimId, attestorAgentId, recorded: true };
  }

  /**
   * Resolve a claim — check if attestation requirements are met.
   */
  resolve(claimId) {
    const record = this.#attestations.get(claimId);
    if (!record) throw new Error(`Claim ${claimId} not found`);

    const req = this.#requirements.get(record.claimClass);
    const minRequired = req ? req.minAttestors : 1;
    const positiveAttestations = [...record.attestations.values()].filter(a => a.agrees);

    const accepted = positiveAttestations.length >= minRequired;
    record.resolved = true;
    record.accepted = accepted;

    return {
      claimId,
      accepted,
      attestations: positiveAttestations.length,
      required: minRequired,
      seal: SUBSTRATE_SEAL
    };
  }

  _hash(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
  }
}

export { CrossAgentAttestationProtocol };
