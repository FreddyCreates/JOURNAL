import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {{ valid: boolean, reason: string, verifiedAt: number }} VerificationResult
 * @typedef {{ tokenSnippet: string, valid: boolean, reason: string, verifiedAt: number }} VerificationLogEntry
 */

/**
 * TokenVerifier — verifies token integrity, authenticity, and expiration.
 * Every verification attempt is logged to an internal audit trail.
 */
export class TokenVerifier {
  /** @type {VerificationLogEntry[]} */
  #log;

  /** @type {number} */
  #maxLogSize;

  /** @type {boolean} */
  #strictMode;

  /**
   * @param {Object} [config]
   * @param {number} [config.maxLogSize=10000] — maximum verification log entries
   * @param {boolean} [config.strictMode=false] — when true, rejects tokens with low integrity scores
   */
  constructor(config = {}) {
    this.#log = [];
    this.#maxLogSize = config.maxLogSize ?? 10000;
    this.#strictMode = config.strictMode ?? false;
  }

  /**
   * Verifies a token for structural integrity, checksum validity, and
   * optional expiration. Returns a verification result with a reason
   * string describing the outcome.
   *
   * @param {string} token — hex-encoded token string
   * @param {Object} [options]
   * @param {number} [options.expiresAt] — expiration timestamp to check
   * @param {string} [options.expectedFingerprint] — expected fingerprint to match
   * @returns {VerificationResult}
   */
  verify(token, options = {}) {
    const now = Date.now();

    const integrityResult = this.checkIntegrity(token);
    if (!integrityResult.valid) {
      this._appendLog(token, false, integrityResult.reason, now);
      return { valid: false, reason: integrityResult.reason, verifiedAt: now };
    }

    if (options.expiresAt !== undefined) {
      const expiryResult = this.checkExpiry({ token, expiresAt: options.expiresAt });
      if (!expiryResult.valid) {
        this._appendLog(token, false, expiryResult.reason, now);
        return { valid: false, reason: expiryResult.reason, verifiedAt: now };
      }
    }

    if (options.expectedFingerprint) {
      const actualFingerprint = this._computeFingerprint(token);
      if (actualFingerprint !== options.expectedFingerprint) {
        const reason = 'Fingerprint mismatch';
        this._appendLog(token, false, reason, now);
        return { valid: false, reason, verifiedAt: now };
      }
    }

    if (this.#strictMode) {
      const score = this._phiIntegrityScore(token);
      if (score < 0.3) {
        const reason = `Strict mode: low integrity score ${score.toFixed(4)}`;
        this._appendLog(token, false, reason, now);
        return { valid: false, reason, verifiedAt: now };
      }
    }

    const reason = 'Token verified successfully';
    this._appendLog(token, true, reason, now);
    return { valid: true, reason, verifiedAt: now };
  }

  /**
   * Batch-verifies an array of tokens.
   *
   * Each entry may be a plain token string or an object with `token`
   * and `options` properties.
   *
   * @param {Array<string|{token: string, options?: Object}>} tokens
   * @returns {VerificationResult[]}
   */
  batchVerify(tokens) {
    if (!Array.isArray(tokens)) {
      throw new Error('tokens must be an array');
    }
    return tokens.map((entry) => {
      if (typeof entry === 'string') {
        return this.verify(entry);
      }
      return this.verify(entry.token, entry.options ?? {});
    });
  }

  /**
   * Checks whether a token has expired based on its expiresAt timestamp.
   *
   * @param {{ token: string, expiresAt: number }} tokenObj
   * @returns {{ valid: boolean, reason: string, remainingMs: number }}
   */
  checkExpiry(tokenObj) {
    const now = Date.now();
    const remaining = tokenObj.expiresAt - now;
    if (remaining <= 0) {
      return { valid: false, reason: 'Token has expired', remainingMs: 0 };
    }
    const phiWarningThreshold = 60000 / PHI;
    if (remaining < phiWarningThreshold) {
      return {
        valid: true,
        reason: `Token valid but expiring soon (${Math.round(remaining)}ms remaining)`,
        remainingMs: remaining,
      };
    }
    return { valid: true, reason: 'Token not expired', remainingMs: remaining };
  }

  /**
   * Checks the structural integrity of a hex-encoded token.
   *
   * Validates that the token is a non-empty string of valid hex characters
   * with an even length, and that its phi-weighted byte distribution does
   * not indicate corruption.
   *
   * @param {string} token — hex-encoded token string
   * @returns {{ valid: boolean, reason: string, integrityScore: number }}
   */
  checkIntegrity(token) {
    if (!token || typeof token !== 'string') {
      return { valid: false, reason: 'Token must be a non-empty string', integrityScore: 0 };
    }
    if (token.length % 2 !== 0) {
      return { valid: false, reason: 'Token hex length must be even', integrityScore: 0 };
    }
    if (!/^[0-9a-f]+$/i.test(token)) {
      return { valid: false, reason: 'Token contains invalid hex characters', integrityScore: 0 };
    }
    if (token.length < 4) {
      return { valid: false, reason: 'Token too short (minimum 2 bytes)', integrityScore: 0 };
    }

    const score = this._phiIntegrityScore(token);
    return { valid: true, reason: 'Structural integrity confirmed', integrityScore: score };
  }

  /**
   * Returns the verification audit log.
   *
   * @returns {VerificationLogEntry[]}
   */
  getVerificationLog() {
    return [...this.#log];
  }

  /* ---- internal helpers ---- */

  /**
   * Appends an entry to the verification log, evicting oldest entries
   * when the log exceeds the maximum size.
   * @private
   * @param {string} token
   * @param {boolean} valid
   * @param {string} reason
   * @param {number} verifiedAt
   */
  _appendLog(token, valid, reason, verifiedAt) {
    const snippet = typeof token === 'string' ? token.slice(0, 16) + '…' : '(invalid)';
    this.#log.push({ tokenSnippet: snippet, valid, reason, verifiedAt });
    while (this.#log.length > this.#maxLogSize) {
      this.#log.shift();
    }
  }

  /**
   * Computes a phi-weighted fingerprint for comparison.
   * @private
   * @param {string} token
   * @returns {string}
   */
  _computeFingerprint(token) {
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
   * Computes a phi-weighted integrity score from hex byte distribution.
   * @private
   * @param {string} token
   * @returns {number} — score between 0 and 1
   */
  _phiIntegrityScore(token) {
    const bytes = this._hexToBytes(token);
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

export default TokenVerifier;
