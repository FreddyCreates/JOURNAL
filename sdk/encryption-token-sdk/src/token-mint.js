import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {Object} MintedToken
 * @property {string} tokenId
 * @property {string} token
 * @property {number} createdAt
 * @property {number} expiresAt
 * @property {string} fingerprint
 */

/**
 * @typedef {Object} MintSpec
 * @property {string} tokenId
 * @property {*} payload
 * @property {Object} [options]
 */

/**
 * @typedef {Object} MintStats
 * @property {number} totalMinted
 * @property {number} avgEntropyScore
 * @property {number} lastMintedAt
 */

/**
 * TokenMint — mints sovereign encrypted tokens with phi-weighted entropy.
 *
 * Each token is constructed from a payload that is serialised to JSON,
 * XOR-encrypted against phi-seeded entropy bytes, and hex-encoded.
 * The resulting token carries a fingerprint derived from the phi-weighted
 * hash of its ciphertext, allowing downstream verification without
 * revealing the plaintext content.
 */
export class TokenMint {
  /** @type {number} */
  #defaultTtlMs;

  /** @type {number} */
  #keyLength;

  /** @type {number} */
  #totalMinted;

  /** @type {number} */
  #entropyScoreSum;

  /** @type {number} */
  #lastMintedAt;

  /**
   * @param {Object} [config]
   * @param {number} [config.defaultTtlMs=3600000] — default time-to-live in ms (1 hour)
   * @param {number} [config.keyLength=32] — entropy key length in bytes
   */
  constructor(config = {}) {
    this.#defaultTtlMs = config.defaultTtlMs ?? 3600000;
    this.#keyLength = config.keyLength ?? 32;
    this.#totalMinted = 0;
    this.#entropyScoreSum = 0;
    this.#lastMintedAt = 0;
  }

  /**
   * Mints a single encrypted token from the given payload.
   *
   * The payload is JSON-serialised and then XOR-encrypted against a
   * phi-seeded entropy key. An expiration timestamp is computed from
   * either the supplied TTL or the default.
   *
   * @param {string} tokenId — unique token identifier
   * @param {*} payload — data to embed inside the token
   * @param {Object} [options]
   * @param {number} [options.ttlMs] — custom time-to-live
   * @param {number} [options.entropyBoost=1] — multiplier for entropy key length
   * @returns {MintedToken}
   */
  mint(tokenId, payload, options = {}) {
    if (!tokenId || typeof tokenId !== 'string') {
      throw new Error('tokenId must be a non-empty string');
    }

    const ttlMs = options.ttlMs ?? this.#defaultTtlMs;
    const entropyBoost = options.entropyBoost ?? 1;
    const keyLen = Math.max(1, Math.round(this.#keyLength * entropyBoost));

    const plainBytes = new TextEncoder().encode(JSON.stringify(payload));
    const entropyKey = this._generateEntropyKey(tokenId, keyLen);
    const entropyScore = this._computeEntropyScore(entropyKey);

    const cipherBytes = new Uint8Array(plainBytes.length);
    for (let i = 0; i < plainBytes.length; i++) {
      const keyIndex = Math.floor((i * PHI) % entropyKey.length);
      const offset = Math.floor((i / PHI) % 256);
      cipherBytes[i] = plainBytes[i] ^ ((entropyKey[keyIndex] + offset) % 256);
    }

    const token = this._bytesToHex(cipherBytes);
    const now = Date.now();
    const fingerprint = this.getFingerprint(token);

    this.#totalMinted++;
    this.#entropyScoreSum += entropyScore;
    this.#lastMintedAt = now;

    return {
      tokenId,
      token,
      createdAt: now,
      expiresAt: now + ttlMs,
      fingerprint,
    };
  }

  /**
   * Mints multiple tokens from an array of specifications.
   *
   * Each spec must include a tokenId and payload. Options are optional
   * and fall back to defaults when omitted.
   *
   * @param {MintSpec[]} specs
   * @returns {MintedToken[]}
   */
  batchMint(specs) {
    if (!Array.isArray(specs)) {
      throw new Error('specs must be an array of MintSpec objects');
    }
    return specs.map((s) => this.mint(s.tokenId, s.payload, s.options ?? {}));
  }

  /**
   * Computes a phi-weighted fingerprint of a hex-encoded token.
   *
   * The fingerprint is a 16-character hex digest derived from a
   * rolling hash that incorporates PHI as a multiplier at each byte
   * position, ensuring a non-linear spread across the output space.
   *
   * @param {string} token — hex-encoded token string
   * @returns {string} — 16-char hex fingerprint
   */
  getFingerprint(token) {
    let h1 = 0x811c9dc5;
    let h2 = 0xcbf29ce4;
    for (let i = 0; i < token.length; i++) {
      const c = token.charCodeAt(i);
      const phiFactor = Math.floor((c * PHI * (i + 1)) % 0xffffffff);
      h1 = ((h1 ^ c) * 0x01000193 + phiFactor) >>> 0;
      h2 = ((h2 ^ phiFactor) * 0x01000193 + c) >>> 0;
    }
    return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
  }

  /**
   * Returns statistics about minting activity.
   *
   * @returns {MintStats}
   */
  getMintStats() {
    return {
      totalMinted: this.#totalMinted,
      avgEntropyScore: this.#totalMinted > 0
        ? Math.round((this.#entropyScoreSum / this.#totalMinted) * 10000) / 10000
        : 0,
      lastMintedAt: this.#lastMintedAt,
    };
  }

  /* ---- internal helpers ---- */

  /**
   * Generates phi-seeded entropy bytes from a seed string.
   * @private
   * @param {string} seed
   * @param {number} length
   * @returns {Uint8Array}
   */
  _generateEntropyKey(seed, length) {
    const uuid = crypto.randomUUID();
    const combined = seed + uuid;
    let h = 0;
    for (let i = 0; i < combined.length; i++) {
      h = ((h << 5) - h + combined.charCodeAt(i)) | 0;
    }
    h = Math.abs(h);

    const key = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      key[i] = Math.floor(((h * PHI * (i + 1)) % 256 + 256) % 256);
    }
    return key;
  }

  /**
   * Computes an entropy score (0–1) for a byte array using bit variation.
   * @private
   * @param {Uint8Array} bytes
   * @returns {number}
   */
  _computeEntropyScore(bytes) {
    const counts = new Array(256).fill(0);
    for (const b of bytes) counts[b]++;
    let entropy = 0;
    for (const c of counts) {
      if (c > 0) {
        const p = c / bytes.length;
        entropy -= p * Math.log2(p);
      }
    }
    return Math.min(1, (entropy / 8) * PHI);
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
}

export default TokenMint;
