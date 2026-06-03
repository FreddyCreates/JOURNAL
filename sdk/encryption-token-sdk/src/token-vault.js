import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {{ tokenId: string, token: string, accessKeyHash: string, metadata: Object, storedAt: number, expiresAt: number|null, revoked: boolean, revokedReason: string|null, accessCount: number }} VaultEntry
 * @typedef {{ totalStored: number, activeCount: number, revokedCount: number, expiredCount: number, capacityUsed: number }} VaultStats
 */

/**
 * TokenVault — secure in-memory storage for active tokens with
 * access-key-gated retrieval. Tokens may be individually revoked,
 * filtered, and purged when expired.
 */
export class TokenVault {
  /** @type {Map<string, VaultEntry>} */
  #entries;

  /** @type {number} */
  #maxCapacity;

  /** @type {number} */
  #totalStoredEver;

  /**
   * @param {Object} [config]
   * @param {number} [config.maxCapacity=100000] — maximum tokens the vault will hold
   */
  constructor(config = {}) {
    this.#entries = new Map();
    this.#maxCapacity = config.maxCapacity ?? 100000;
    this.#totalStoredEver = 0;
  }

  /**
   * Stores a token in the vault under the given tokenId. A phi-hashed
   * access key is generated and returned to the caller.
   *
   * @param {string} tokenId — unique identifier
   * @param {string} token — the token value to store
   * @param {Object} [metadata={}] — optional metadata
   * @returns {{ tokenId: string, accessKey: string, storedAt: number }}
   */
  store(tokenId, token, metadata = {}) {
    if (!tokenId || typeof tokenId !== 'string') throw new Error('tokenId must be a non-empty string');
    if (this.#entries.has(tokenId)) throw new Error(`Token "${tokenId}" already exists in the vault`);
    if (this.#entries.size >= this.#maxCapacity) throw new Error('Vault capacity exceeded');

    const accessKey = crypto.randomUUID();
    const accessKeyHash = this._hashAccessKey(accessKey);
    const now = Date.now();

    this.#entries.set(tokenId, {
      tokenId,
      token,
      accessKeyHash,
      metadata: { ...metadata },
      storedAt: now,
      expiresAt: metadata.expiresAt ?? null,
      revoked: false,
      revokedReason: null,
      accessCount: 0,
    });

    this.#totalStoredEver++;
    return { tokenId, accessKey, storedAt: now };
  }

  /**
   * Retrieves a token from the vault.
   *
   * The caller must provide the access key that was returned at storage
   * time. Revoked tokens cannot be retrieved.
   *
   * @param {string} tokenId
   * @param {string} accessKey
   * @returns {{ tokenId: string, token: string, metadata: Object, storedAt: number }}
   */
  retrieve(tokenId, accessKey) {
    const entry = this.#entries.get(tokenId);
    if (!entry) {
      throw new Error(`Token "${tokenId}" not found in vault`);
    }
    if (entry.revoked) {
      throw new Error(`Token "${tokenId}" has been revoked: ${entry.revokedReason}`);
    }
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      throw new Error(`Token "${tokenId}" has expired`);
    }

    const hash = this._hashAccessKey(accessKey);
    if (hash !== entry.accessKeyHash) {
      throw new Error('Invalid access key');
    }

    entry.accessCount++;
    return {
      tokenId: entry.tokenId,
      token: entry.token,
      metadata: { ...entry.metadata },
      storedAt: entry.storedAt,
    };
  }

  /**
   * Revokes a token, preventing future retrieval.
   *
   * @param {string} tokenId
   * @param {string} [reason='Revoked by owner']
   * @returns {{ tokenId: string, revokedAt: number, reason: string }}
   */
  revoke(tokenId, reason = 'Revoked by owner') {
    const entry = this.#entries.get(tokenId);
    if (!entry) {
      throw new Error(`Token "${tokenId}" not found in vault`);
    }
    if (entry.revoked) {
      throw new Error(`Token "${tokenId}" is already revoked`);
    }

    entry.revoked = true;
    entry.revokedReason = reason;
    const revokedAt = Date.now();
    return { tokenId, revokedAt, reason };
  }

  /**
   * Lists tokens with an optional filter.
   *
   * The filter object may include `status` ('active', 'revoked', 'expired')
   * and/or `metadataKey` / `metadataValue` to match against stored metadata.
   *
   * @param {Object} [filter={}]
   * @param {string} [filter.status] — 'active' | 'revoked' | 'expired'
   * @param {string} [filter.metadataKey]
   * @param {*} [filter.metadataValue]
   * @returns {Array<{ tokenId: string, status: string, storedAt: number, accessCount: number }>}
   */
  list(filter = {}) {
    const now = Date.now();
    const results = [];

    for (const entry of this.#entries.values()) {
      const status = this._entryStatus(entry, now);

      if (filter.status && status !== filter.status) continue;

      if (filter.metadataKey !== undefined) {
        const val = entry.metadata[filter.metadataKey];
        if (filter.metadataValue !== undefined && val !== filter.metadataValue) continue;
        if (filter.metadataValue === undefined && val === undefined) continue;
      }

      results.push({
        tokenId: entry.tokenId,
        status,
        storedAt: entry.storedAt,
        accessCount: entry.accessCount,
      });
    }

    return results;
  }

  /**
   * Returns vault statistics including capacity usage.
   *
   * @returns {VaultStats}
   */
  getVaultStats() {
    const now = Date.now();
    let activeCount = 0;
    let revokedCount = 0;
    let expiredCount = 0;

    for (const entry of this.#entries.values()) {
      const status = this._entryStatus(entry, now);
      if (status === 'active') activeCount++;
      else if (status === 'revoked') revokedCount++;
      else if (status === 'expired') expiredCount++;
    }

    const capacityUsed = Math.round((this.#entries.size / this.#maxCapacity) * PHI * 6180) / 10000;

    return {
      totalStored: this.#totalStoredEver,
      activeCount,
      revokedCount,
      expiredCount,
      capacityUsed: Math.min(1, capacityUsed),
    };
  }

  /**
   * Purges all expired tokens from the vault.
   *
   * @returns {{ purged: number, remaining: number }}
   */
  purgeExpired() {
    const now = Date.now();
    const toPurge = [];

    for (const [tokenId, entry] of this.#entries) {
      if (entry.expiresAt !== null && now > entry.expiresAt) {
        toPurge.push(tokenId);
      }
    }

    for (const id of toPurge) {
      this.#entries.delete(id);
    }

    return { purged: toPurge.length, remaining: this.#entries.size };
  }

  /* ---- internal helpers ---- */

  /**
   * Derives the status string for a vault entry.
   * @private
   * @param {VaultEntry} entry
   * @param {number} now
   * @returns {string}
   */
  _entryStatus(entry, now) {
    if (entry.revoked) return 'revoked';
    if (entry.expiresAt !== null && now > entry.expiresAt) return 'expired';
    return 'active';
  }

  /**
   * Hashes an access key using a phi-weighted rolling hash.
   * @private
   * @param {string} key
   * @returns {string}
   */
  _hashAccessKey(key) {
    let h = 0x811c9dc5;
    for (let i = 0; i < key.length; i++) {
      const c = key.charCodeAt(i);
      h = ((h ^ c) * 0x01000193) >>> 0;
      h = (h + Math.floor(c * PHI * (i + 1))) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  }
}

export default TokenVault;
