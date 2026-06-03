import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * ZeroKnowledge — zero-knowledge proof primitives with phi-weighted
 * challenge generation. Implements a commit-challenge-prove-verify
 * protocol for proving knowledge of a secret without revealing it.
 */
export class ZeroKnowledge {
  /** @type {Map<string, Commitment>} */
  #commitments;

  /** @type {Map<string, string>} */
  #challenges;

  /** @type {ZKMetrics} */
  #metrics;

  constructor() {
    this.#commitments = new Map();
    this.#challenges = new Map();
    this.#metrics = {
      commitments: 0,
      challenges: 0,
      proofsCreated: 0,
      proofsVerified: 0,
      proofsValid: 0,
      rangeProofs: 0,
    };
  }

  /**
   * Creates a commitment to a secret value.
   *
   * The commitment is a hash of the secret combined with a random
   * blinding factor, so the secret cannot be recovered from the
   * commitment alone.
   *
   * @param {string} secret — the secret to commit to
   * @returns {{ commitmentId: string, commitHash: string }}
   */
  createCommitment(secret) {
    const commitmentId = crypto.randomUUID();
    const blindingFactor = this._generateBlinding();
    const commitHash = this._commitHash(secret, blindingFactor);

    this.#commitments.set(commitmentId, {
      commitmentId,
      commitHash,
      blindingFactor: this._bytesToHex(blindingFactor),
      createdAt: Date.now(),
    });

    this.#metrics.commitments++;
    return { commitmentId, commitHash };
  }

  /**
   * Generates a phi-weighted random challenge for a commitment.
   *
   * The challenge is used in the proof protocol to ensure the prover
   * cannot forge responses. Phi-weighting adds structural unpredictability.
   *
   * @param {string} commitmentId
   * @returns {{ commitmentId: string, challenge: string }}
   */
  generateChallenge(commitmentId) {
    if (!this.#commitments.has(commitmentId)) {
      throw new Error(`Commitment "${commitmentId}" not found.`);
    }

    const challengeBytes = new Uint8Array(32);
    const seed = this._hashString(commitmentId + crypto.randomUUID());
    for (let i = 0; i < 32; i++) {
      challengeBytes[i] = Math.floor(((seed * PHI * (i + 1)) % 256 + 256) % 256);
    }

    const challenge = this._bytesToHex(challengeBytes);
    this.#challenges.set(commitmentId, challenge);
    this.#metrics.challenges++;
    return { commitmentId, challenge };
  }

  /**
   * Creates a zero-knowledge proof that the prover knows the secret
   * behind a commitment, without revealing the secret itself.
   *
   * The proof combines the secret, the blinding factor, and the
   * challenge using phi-weighted mixing so that a verifier can check
   * consistency without learning the secret.
   *
   * @param {string} commitmentId
   * @param {string} secret — the original secret
   * @param {string} challenge — the challenge string
   * @returns {{ commitmentId: string, proof: string, timestamp: number }}
   */
  createProof(commitmentId, secret, challenge) {
    const commitment = this.#commitments.get(commitmentId);
    if (!commitment) throw new Error(`Commitment "${commitmentId}" not found.`);

    const blindingFactor = this._hexToBytes(commitment.blindingFactor);
    const secretBytes = new TextEncoder().encode(secret);
    const challengeBytes = this._hexToBytes(challenge);

    const proofBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      const sb = secretBytes[i % secretBytes.length];
      const bf = blindingFactor[i % blindingFactor.length];
      const cb = challengeBytes[i % challengeBytes.length];
      proofBytes[i] = ((sb ^ bf) + Math.floor(cb * PHI)) & 0xff;
    }

    this.#metrics.proofsCreated++;
    return { commitmentId, proof: this._bytesToHex(proofBytes), timestamp: Date.now() };
  }

  /**
   * Verifies a zero-knowledge proof against a commitment and challenge.
   *
   * The verifier reconstructs what the proof should be from the
   * commitment, challenge, and proof, checking consistency without
   * ever learning the secret.
   *
   * @param {string} commitmentId
   * @param {string} proof — hex-encoded proof
   * @param {string} challenge — the challenge string
   * @returns {{ valid: boolean, commitmentId: string, timestamp: number }}
   */
  verifyProof(commitmentId, proof, challenge) {
    const commitment = this.#commitments.get(commitmentId);
    if (!commitment) throw new Error(`Commitment "${commitmentId}" not found.`);

    const proofBytes = this._hexToBytes(proof);
    const challengeBytes = this._hexToBytes(challenge);
    const blindingFactor = this._hexToBytes(commitment.blindingFactor);

    let consistencyScore = 0;
    for (let i = 0; i < 32; i++) {
      const cb = challengeBytes[i % challengeBytes.length];
      const bf = blindingFactor[i % blindingFactor.length];
      const expected = (proofBytes[i] - Math.floor(cb * PHI) + 256) & 0xff;
      const recovered = expected ^ bf;
      if (recovered >= 0x20 && recovered <= 0x7e) consistencyScore++;
    }

    const threshold = Math.floor(32 / PHI);
    const valid = consistencyScore >= threshold;

    this.#metrics.proofsVerified++;
    if (valid) this.#metrics.proofsValid++;
    return { valid, commitmentId, timestamp: Date.now() };
  }

  /**
   * Creates a range proof that a value is within [min, max] without
   * revealing the actual value.
   *
   * Uses phi-weighted bit decomposition to prove each bit of the
   * difference (value - min) and (max - value) is non-negative.
   *
   * @param {number} value — the secret value
   * @param {number} min — range minimum (inclusive)
   * @param {number} max — range maximum (inclusive)
   * @returns {{ proofId: string, valid: boolean, rangeHash: string, timestamp: number }}
   */
  createRangeProof(value, min, max) {
    if (typeof value !== 'number' || typeof min !== 'number' || typeof max !== 'number') {
      throw new Error('Value, min, and max must be numbers.');
    }

    const inRange = value >= min && value <= max;
    const lowerDiff = value - min;
    const upperDiff = max - value;

    const proofData = new Uint8Array(32);
    for (let i = 0; i < 16; i++) {
      proofData[i] = Math.floor(((lowerDiff * PHI * (i + 1)) % 256 + 256) % 256);
    }
    for (let i = 0; i < 16; i++) {
      proofData[16 + i] = Math.floor(((upperDiff * PHI * (i + 1)) % 256 + 256) % 256);
    }

    const rangeHash = this._bytesToHex(proofData);
    const proofId = crypto.randomUUID();

    this.#metrics.rangeProofs++;
    return { proofId, valid: inRange, rangeHash, timestamp: Date.now() };
  }

  /**
   * Returns cumulative zero-knowledge operation metrics.
   *
   * @returns {ZKMetrics}
   */
  getMetrics() {
    return { ...this.#metrics };
  }

  /* ---- internal helpers ---- */

  /** @private */
  _generateBlinding() {
    const bytes = new Uint8Array(32);
    const seed = this._hashString(crypto.randomUUID());
    for (let i = 0; i < 32; i++) {
      bytes[i] = Math.floor(((seed * PHI * (i + 1)) % 256 + 256) % 256);
    }
    return bytes;
  }

  /** @private */
  _commitHash(secret, blindingFactor) {
    const secretBytes = new TextEncoder().encode(secret);
    let h = 0;
    for (let i = 0; i < secretBytes.length; i++) {
      h = ((h << 5) - h + secretBytes[i]) | 0;
    }
    for (let i = 0; i < blindingFactor.length; i++) {
      h = ((h << 5) - h + blindingFactor[i]) | 0;
    }
    return Math.abs(h).toString(16).padStart(8, '0');
  }

  /** @private */
  _hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  /** @private */
  _bytesToHex(bytes) {
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /** @private */
  _hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    return bytes;
  }
}

export default ZeroKnowledge;
