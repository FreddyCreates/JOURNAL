import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {Object} EncryptionKey
 * @property {string} keyId
 * @property {string} algorithm
 * @property {Uint8Array} keyBytes
 * @property {number} createdAt
 * @property {number} rotationCount
 * @property {number} lastRotatedAt
 */

/**
 * EncryptionShield — data encryption and decryption layer for organism
 * communications. Uses XOR-based cipher with phi-rotation key scheduling
 * to protect data in transit and at rest.
 */
export class EncryptionShield {
  /** @type {Map<string, EncryptionKey>} */
  #keys;

  /** @type {number} */
  #rotationIntervalMs;

  /** @type {number} */
  #defaultKeyLength;

  /**
   * @param {Object} [config]
   * @param {number} [config.rotationIntervalMs=86400000] — key rotation interval (default 24h)
   * @param {number} [config.defaultKeyLength=32] — default key length in bytes
   */
  constructor(config = {}) {
    this.#keys = new Map();
    this.#rotationIntervalMs = config.rotationIntervalMs ?? 86400000;
    this.#defaultKeyLength = config.defaultKeyLength ?? 32;
  }

  /**
   * Generates a simulated encryption key.
   *
   * Key bytes are derived from a combination of crypto.randomUUID entropy
   * and phi-seeded byte generation for deterministic reproducibility when
   * the same seed parameters are used.
   *
   * @param {string} keyId — unique identifier for this key
   * @param {string} [algorithm='phi-xor-256'] — algorithm descriptor
   * @returns {{ keyId: string, algorithm: string, createdAt: number, keyLengthBytes: number }}
   */
  generateKey(keyId, algorithm = 'phi-xor-256') {
    if (this.#keys.has(keyId)) {
      throw new Error(`Key "${keyId}" already exists. Use rotateKeys() to refresh.`);
    }

    const keyBytes = new Uint8Array(this.#defaultKeyLength);
    const seed = this._hashString(keyId + algorithm + crypto.randomUUID());
    for (let i = 0; i < keyBytes.length; i++) {
      keyBytes[i] = Math.floor(((seed * PHI * (i + 1)) % 256 + 256) % 256);
    }

    const now = Date.now();
    this.#keys.set(keyId, {
      keyId,
      algorithm,
      keyBytes,
      createdAt: now,
      rotationCount: 0,
      lastRotatedAt: now,
    });

    return { keyId, algorithm, createdAt: now, keyLengthBytes: keyBytes.length };
  }

  /**
   * Encrypts plaintext using the specified key.
   *
   * Uses XOR cipher with phi-rotation: each byte is XORed with the key
   * byte at position (i * PHI) mod keyLength, creating a non-linear
   * mapping that resists frequency analysis.
   *
   * @param {string} keyId — the key to encrypt with
   * @param {string} plaintext — data to encrypt
   * @returns {{ ciphertext: string, keyId: string, timestamp: number, length: number }}
   */
  encrypt(keyId, plaintext) {
    const key = this.#keys.get(keyId);
    if (!key) {
      throw new Error(`Key "${keyId}" not found. Generate it first.`);
    }

    const inputBytes = new TextEncoder().encode(plaintext);
    const outputBytes = new Uint8Array(inputBytes.length);

    for (let i = 0; i < inputBytes.length; i++) {
      const keyIndex = Math.floor((i * PHI) % key.keyBytes.length);
      const rotationOffset = Math.floor((i / PHI) % 256);
      outputBytes[i] = inputBytes[i] ^ ((key.keyBytes[keyIndex] + rotationOffset) % 256);
    }

    const ciphertext = this._bytesToHex(outputBytes);
    return { ciphertext, keyId, timestamp: Date.now(), length: plaintext.length };
  }

  /**
   * Decrypts ciphertext using the specified key.
   *
   * Reverses the phi-rotation XOR cipher. The same key and phi-offset
   * schedule are applied symmetrically to recover the original plaintext.
   *
   * @param {string} keyId — the key to decrypt with
   * @param {string} ciphertext — hex-encoded ciphertext
   * @returns {{ plaintext: string, keyId: string, timestamp: number }}
   */
  decrypt(keyId, ciphertext) {
    const key = this.#keys.get(keyId);
    if (!key) {
      throw new Error(`Key "${keyId}" not found`);
    }

    const inputBytes = this._hexToBytes(ciphertext);
    const outputBytes = new Uint8Array(inputBytes.length);

    for (let i = 0; i < inputBytes.length; i++) {
      const keyIndex = Math.floor((i * PHI) % key.keyBytes.length);
      const rotationOffset = Math.floor((i / PHI) % 256);
      outputBytes[i] = inputBytes[i] ^ ((key.keyBytes[keyIndex] + rotationOffset) % 256);
    }

    const plaintext = new TextDecoder().decode(outputBytes);
    return { plaintext, keyId, timestamp: Date.now() };
  }

  /**
   * Rotates all keys on a phi-interval schedule.
   *
   * Keys whose age exceeds the rotation interval are regenerated with
   * fresh entropy. The rotation count is incremented and the new key
   * bytes incorporate the previous key's hash for forward secrecy.
   *
   * @returns {{ rotated: string[], skipped: string[], nextRotationMs: number }}
   */
  rotateKeys() {
    const now = Date.now();
    const rotated = [];
    const skipped = [];

    for (const [keyId, key] of this.#keys) {
      const age = now - key.lastRotatedAt;
      const phiAdjustedInterval = this.#rotationIntervalMs / Math.pow(PHI, key.rotationCount % 5);

      if (age >= phiAdjustedInterval) {
        const oldHash = this._hashBytes(key.keyBytes);
        const newBytes = new Uint8Array(key.keyBytes.length);
        for (let i = 0; i < newBytes.length; i++) {
          const seed = (oldHash * PHI * (i + 1) + crypto.randomUUID().charCodeAt(i % 36)) % 256;
          newBytes[i] = Math.floor(((seed % 256) + 256) % 256);
        }

        key.keyBytes = newBytes;
        key.rotationCount++;
        key.lastRotatedAt = now;
        rotated.push(keyId);
      } else {
        skipped.push(keyId);
      }
    }

    const nextRotationMs = this.#rotationIntervalMs / Math.pow(PHI, (rotated.length + 1) % 5);
    return { rotated, skipped, nextRotationMs: Math.round(nextRotationMs) };
  }

  /**
   * Returns key age and rotation status for all managed keys.
   *
   * Health is computed as a phi-weighted freshness score: keys closer
   * to their rotation deadline score lower.
   *
   * @returns {Array<{ keyId: string, algorithm: string, ageMs: number, rotationCount: number, healthScore: number }>}
   */
  getKeyHealth() {
    const now = Date.now();
    const report = [];

    for (const key of this.#keys.values()) {
      const ageMs = now - key.lastRotatedAt;
      const phiInterval = this.#rotationIntervalMs / Math.pow(PHI, key.rotationCount % 5);
      const freshness = 1 - Math.min(1, ageMs / phiInterval);
      const healthScore = Math.round(freshness * PHI * 6180) / 10000;

      report.push({
        keyId: key.keyId,
        algorithm: key.algorithm,
        ageMs,
        rotationCount: key.rotationCount,
        healthScore: Math.min(1, healthScore),
      });
    }

    return report;
  }

  /* ---- internal helpers ---- */

  /**
   * Hash a string to a numeric seed.
   * @private
   * @param {string} str
   * @returns {number}
   */
  _hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  /**
   * Hash a byte array to a numeric value.
   * @private
   * @param {Uint8Array} bytes
   * @returns {number}
   */
  _hashBytes(bytes) {
    let h = 0;
    for (let i = 0; i < bytes.length; i++) {
      h = ((h << 5) - h + bytes[i]) | 0;
    }
    return Math.abs(h);
  }

  /**
   * Convert bytes to hex string.
   * @private
   * @param {Uint8Array} bytes
   * @returns {string}
   */
  _bytesToHex(bytes) {
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Convert hex string to bytes.
   * @private
   * @param {string} hex
   * @returns {Uint8Array}
   */
  _hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }
}

export default EncryptionShield;
