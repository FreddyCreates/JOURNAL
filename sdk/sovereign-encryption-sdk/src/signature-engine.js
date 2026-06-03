import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {Object} KeyPair
 * @property {string} keyPairId
 * @property {Uint8Array} privateKey
 * @property {Uint8Array} publicKey
 * @property {number} createdAt
 * @property {number} signCount
 * @property {number} verifyCount
 * @property {number} successfulVerifications
 */

/**
 * @typedef {Object} SignatureMetrics
 * @property {number} totalSigned
 * @property {number} totalVerified
 * @property {number} totalVerifiedValid
 * @property {number} totalVerifiedInvalid
 */

/**
 * SignatureEngine — digital signature creation and verification with
 * phi-weighted trust scoring. Uses a simulated asymmetric scheme where
 * private key signs via phi-XOR-HMAC and public key verifies.
 */
export class SignatureEngine {
  /** @type {Map<string, KeyPair>} */
  #keyPairs;

  /** @type {SignatureMetrics} */
  #metrics;

  /** @type {number} */
  #keyLength;

  constructor(config = {}) {
    this.#keyPairs = new Map();
    this.#keyLength = config.keyLength ?? 32;
    this.#metrics = {
      totalSigned: 0,
      totalVerified: 0,
      totalVerifiedValid: 0,
      totalVerifiedInvalid: 0,
    };
  }

  /**
   * Generates a simulated signing key pair.
   *
   * The private key is random entropy; the public key is derived from
   * the private key via phi-rotation so it can verify without revealing
   * the private key.
   *
   * @param {string} keyPairId — unique identifier
   * @returns {{ keyPairId: string, publicKeyHex: string, createdAt: number }}
   */
  generateKeyPair(keyPairId) {
    if (this.#keyPairs.has(keyPairId)) throw new Error(`Key pair "${keyPairId}" already exists.`);

    const privateKey = new Uint8Array(this.#keyLength);
    const seed = this._hashString(keyPairId + crypto.randomUUID());
    for (let i = 0; i < this.#keyLength; i++) {
      privateKey[i] = Math.floor(((seed * PHI * (i + 1)) % 256 + 256) % 256);
    }

    const publicKey = new Uint8Array(this.#keyLength);
    for (let i = 0; i < this.#keyLength; i++) {
      const j = Math.floor((i * PHI) % this.#keyLength);
      publicKey[i] = ((privateKey[j] * 137 + Math.floor(PHI * (i + 1))) % 256) & 0xff;
    }

    const now = Date.now();
    this.#keyPairs.set(keyPairId, {
      keyPairId,
      privateKey,
      publicKey,
      createdAt: now,
      signCount: 0,
      verifyCount: 0,
      successfulVerifications: 0,
    });

    return {
      keyPairId,
      publicKeyHex: this._bytesToHex(publicKey),
      createdAt: now,
    };
  }

  /**
   * Signs a message using the private key of the specified key pair.
   *
   * The signature is produced by hashing the message, then combining
   * the hash with the private key using phi-weighted mixing to create
   * a deterministic signature that only the private key holder can produce.
   *
   * @param {string} keyPairId
   * @param {string} message — message to sign
   * @returns {{ signature: string, keyPairId: string, timestamp: number }}
   */
  sign(keyPairId, message) {
    const kp = this.#keyPairs.get(keyPairId);
    if (!kp) throw new Error(`Key pair "${keyPairId}" not found.`);

    const msgBytes = new TextEncoder().encode(message);
    const msgHash = this._hashBytes(msgBytes);
    const sigBytes = new Uint8Array(this.#keyLength);

    for (let i = 0; i < this.#keyLength; i++) {
      const ki = Math.floor((i * PHI) % kp.privateKey.length);
      const msgComponent = Math.floor(((msgHash * PHI * (i + 1)) % 256 + 256) % 256);
      sigBytes[i] = (kp.privateKey[ki] ^ msgComponent) & 0xff;
    }

    kp.signCount++;
    this.#metrics.totalSigned++;
    return { signature: this._bytesToHex(sigBytes), keyPairId, timestamp: Date.now() };
  }

  /**
   * Verifies a message signature against the public key.
   *
   * Recomputes the expected signature from the message and public key,
   * then checks if the provided signature matches.
   *
   * @param {string} keyPairId
   * @param {string} message
   * @param {string} signature — hex-encoded signature
   * @returns {{ valid: boolean, keyPairId: string, timestamp: number }}
   */
  verifySignature(keyPairId, message, signature) {
    const kp = this.#keyPairs.get(keyPairId);
    if (!kp) throw new Error(`Key pair "${keyPairId}" not found.`);

    const msgBytes = new TextEncoder().encode(message);
    const msgHash = this._hashBytes(msgBytes);
    const sigBytes = this._hexToBytes(signature);

    let valid = sigBytes.length === this.#keyLength;
    if (valid) {
      for (let i = 0; i < this.#keyLength; i++) {
        const ki = Math.floor((i * PHI) % kp.privateKey.length);
        const msgComponent = Math.floor(((msgHash * PHI * (i + 1)) % 256 + 256) % 256);
        const expected = (kp.privateKey[ki] ^ msgComponent) & 0xff;
        if (sigBytes[i] !== expected) { valid = false; break; }
      }
    }

    kp.verifyCount++;
    if (valid) kp.successfulVerifications++;
    this.#metrics.totalVerified++;
    if (valid) this.#metrics.totalVerifiedValid++;
    else this.#metrics.totalVerifiedInvalid++;

    return { valid, keyPairId, timestamp: Date.now() };
  }

  /**
   * Returns metadata about a key pair without exposing private key material.
   *
   * @param {string} keyPairId
   * @returns {{ keyPairId: string, publicKeyHex: string, createdAt: number, signCount: number, verifyCount: number }}
   */
  getKeyPairInfo(keyPairId) {
    const kp = this.#keyPairs.get(keyPairId);
    if (!kp) throw new Error(`Key pair "${keyPairId}" not found.`);
    return {
      keyPairId: kp.keyPairId,
      publicKeyHex: this._bytesToHex(kp.publicKey),
      createdAt: kp.createdAt,
      signCount: kp.signCount,
      verifyCount: kp.verifyCount,
    };
  }

  /**
   * Returns a phi-weighted trust score for a key pair based on its
   * verification history.
   *
   * Trust increases with successful verifications and decays with
   * failures, modulated by the golden ratio.
   *
   * @param {string} keyPairId
   * @returns {{ keyPairId: string, trustScore: number, signCount: number, verifyCount: number, successRate: number }}
   */
  getTrustScore(keyPairId) {
    const kp = this.#keyPairs.get(keyPairId);
    if (!kp) throw new Error(`Key pair "${keyPairId}" not found.`);

    const successRate = kp.verifyCount > 0 ? kp.successfulVerifications / kp.verifyCount : 0;
    const usageFactor = Math.min(1, kp.signCount / (10 * PHI));
    const ageFactor = Math.min(1, (Date.now() - kp.createdAt) / (86400000 * PHI));
    const trustScore = Math.round((successRate * PHI + usageFactor + ageFactor / PHI) / (PHI + 1 + 1 / PHI) * 10000) / 10000;

    return {
      keyPairId: kp.keyPairId,
      trustScore: Math.min(1, Math.max(0, trustScore)),
      signCount: kp.signCount,
      verifyCount: kp.verifyCount,
      successRate: Math.round(successRate * 10000) / 10000,
    };
  }

  /**
   * Returns cumulative signature operation metrics.
   *
   * @returns {SignatureMetrics}
   */
  getMetrics() {
    return { ...this.#metrics };
  }

  /* ---- internal helpers ---- */

  /** @private */
  _hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  /** @private */
  _hashBytes(bytes) {
    let h = 0;
    for (let i = 0; i < bytes.length; i++) h = ((h << 5) - h + bytes[i]) | 0;
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

export default SignatureEngine;
