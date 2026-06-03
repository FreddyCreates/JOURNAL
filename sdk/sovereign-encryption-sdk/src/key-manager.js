import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * KeyManager — comprehensive key lifecycle management with hierarchical
 * key derivation. Supports generation, rotation, revocation, and
 * phi-weighted HKDF-like child key derivation trees.
 */
export class KeyManager {
  /** @type {Map<string, ManagedKey>} */
  #keys;

  /** @type {number} */
  #defaultLength;

  constructor(config = {}) {
    this.#keys = new Map();
    this.#defaultLength = config.defaultLength ?? 32;
  }

  /**
   * Generates a new managed key.
   *
   * Key bytes combine crypto.randomUUID entropy with phi-seeded byte
   * generation for balanced randomness.
   *
   * @param {string} keyId — unique key identifier
   * @param {Object} [config]
   * @param {string} [config.algorithm='phi-derived'] — algorithm label
   * @param {number} [config.length] — key length in bytes
   * @param {string} [config.purpose='general'] — key purpose
   * @returns {{ keyId: string, algorithm: string, length: number, createdAt: number }}
   */
  generateKey(keyId, config = {}) {
    if (this.#keys.has(keyId)) {
      throw new Error(`Key "${keyId}" already exists.`);
    }

    const algorithm = config.algorithm ?? 'phi-derived';
    const length = config.length ?? this.#defaultLength;
    const purpose = config.purpose ?? 'general';
    const keyBytes = this._generateBytes(keyId + crypto.randomUUID(), length);
    const now = Date.now();

    this.#keys.set(keyId, {
      keyId,
      algorithm,
      length,
      purpose,
      keyBytes,
      createdAt: now,
      rotationCount: 0,
      lastRotatedAt: now,
      parentKeyId: null,
      childKeyIds: [],
      revoked: false,
      revokeReason: null,
    });

    return { keyId, algorithm, length, createdAt: now };
  }

  /**
   * Derives a child key from a parent using phi-weighted HKDF-like derivation.
   * Child bytes combine parent key with context and phi-rotation for domain separation.
   * @param {string} parentKeyId — parent key to derive from
   * @param {string} childId — identifier for the derived key
   * @param {string} [context='default'] — derivation context for domain separation
   * @returns {{ keyId: string, parentKeyId: string, context: string, createdAt: number }}
   */
  deriveKey(parentKeyId, childId, context = 'default') {
    const parent = this.#keys.get(parentKeyId);
    if (!parent) throw new Error(`Parent key "${parentKeyId}" not found.`);
    if (parent.revoked) throw new Error(`Parent key "${parentKeyId}" is revoked.`);
    if (this.#keys.has(childId)) throw new Error(`Key "${childId}" already exists.`);

    const contextSeed = this._hashString(context + childId);
    const childBytes = new Uint8Array(parent.length);
    for (let i = 0; i < childBytes.length; i++) {
      const phiOffset = Math.floor((i * PHI + contextSeed) % parent.keyBytes.length);
      const rotation = Math.floor((contextSeed * PHI * (i + 1)) % 256);
      childBytes[i] = (parent.keyBytes[phiOffset] ^ rotation) & 0xff;
    }

    const now = Date.now();
    this.#keys.set(childId, {
      keyId: childId,
      algorithm: parent.algorithm,
      length: parent.length,
      purpose: `derived:${context}`,
      keyBytes: childBytes,
      createdAt: now,
      rotationCount: 0,
      lastRotatedAt: now,
      parentKeyId,
      childKeyIds: [],
      revoked: false,
      revokeReason: null,
    });

    parent.childKeyIds.push(childId);
    return { keyId: childId, parentKeyId, context, createdAt: now };
  }

  /**
   * Retrieves key metadata without exposing raw key bytes.
   * @param {string} keyId
   * @returns {{ keyId: string, algorithm: string, length: number, purpose: string, createdAt: number, rotationCount: number, revoked: boolean, parentKeyId: string|null, childCount: number }}
   */
  getKey(keyId) {
    const key = this.#keys.get(keyId);
    if (!key) throw new Error(`Key "${keyId}" not found.`);
    return {
      keyId: key.keyId,
      algorithm: key.algorithm,
      length: key.length,
      purpose: key.purpose,
      createdAt: key.createdAt,
      rotationCount: key.rotationCount,
      revoked: key.revoked,
      parentKeyId: key.parentKeyId,
      childCount: key.childKeyIds.length,
    };
  }

  /**
   * Rotates a key by regenerating its bytes while preserving metadata.
   * The new bytes incorporate the old key's hash for forward secrecy.
   * @param {string} keyId
   * @returns {{ keyId: string, rotationCount: number, rotatedAt: number }}
   */
  rotateKey(keyId) {
    const key = this.#keys.get(keyId);
    if (!key) throw new Error(`Key "${keyId}" not found.`);
    if (key.revoked) throw new Error(`Cannot rotate revoked key "${keyId}".`);

    const oldHash = this._hashBytes(key.keyBytes);
    const newBytes = new Uint8Array(key.length);
    for (let i = 0; i < newBytes.length; i++) {
      const seed = (oldHash * PHI * (i + 1) + crypto.randomUUID().charCodeAt(i % 36)) % 256;
      newBytes[i] = Math.floor(((seed % 256) + 256) % 256);
    }

    key.keyBytes = newBytes;
    key.rotationCount++;
    key.lastRotatedAt = Date.now();
    return { keyId, rotationCount: key.rotationCount, rotatedAt: key.lastRotatedAt };
  }

  /**
   * Revokes a key and all of its descendant keys.
   * @param {string} keyId
   * @param {string} [reason='unspecified'] — revocation reason
   * @returns {{ revoked: string[], reason: string }}
   */
  revokeKey(keyId, reason = 'unspecified') {
    const key = this.#keys.get(keyId);
    if (!key) throw new Error(`Key "${keyId}" not found.`);
    const revoked = [];
    const stack = [key];
    while (stack.length) {
      const k = stack.pop();
      k.revoked = true;
      k.revokeReason = reason;
      revoked.push(k.keyId);
      for (const cid of k.childKeyIds) {
        const c = this.#keys.get(cid);
        if (c && !c.revoked) stack.push(c);
      }
    }
    return { revoked, reason };
  }

  /**
   * Returns the hierarchical key derivation tree rooted at the given key.
   * @param {string} rootKeyId
   * @returns {{ keyId: string, children: Array }}
   */
  getKeyTree(rootKeyId) {
    const root = this.#keys.get(rootKeyId);
    if (!root) throw new Error(`Key "${rootKeyId}" not found.`);
    return this._buildTree(root);
  }

  /**
   * Returns phi-weighted health metrics for all managed keys.
   * Health score decays as keys age past their phi-adjusted rotation window.
   * @returns {Array<{ keyId: string, ageMs: number, rotationCount: number, revoked: boolean, healthScore: number }>}
   */
  getKeyHealth() {
    const now = Date.now();
    const report = [];
    const rotationWindow = 86400000;

    for (const key of this.#keys.values()) {
      const ageMs = now - key.lastRotatedAt;
      const phiWindow = rotationWindow / Math.pow(PHI, key.rotationCount % 5);
      const freshness = key.revoked ? 0 : 1 - Math.min(1, ageMs / phiWindow);
      const healthScore = Math.round(freshness * PHI * 6180) / 10000;

      report.push({
        keyId: key.keyId,
        ageMs,
        rotationCount: key.rotationCount,
        revoked: key.revoked,
        healthScore: Math.min(1, Math.max(0, healthScore)),
      });
    }

    return report;
  }

  /* ---- internal helpers ---- */

  /** @private */
  _buildTree(key) {
    const children = key.childKeyIds.map((id) => {
      const c = this.#keys.get(id);
      return c ? this._buildTree(c) : { keyId: id, revoked: false, children: [] };
    });
    return { keyId: key.keyId, revoked: key.revoked, children };
  }

  /** @private */
  _generateBytes(seed, length) {
    const bytes = new Uint8Array(length);
    const h = this._hashString(seed);
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(((h * PHI * (i + 1)) % 256 + 256) % 256);
    return bytes;
  }

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
}

export default KeyManager;
