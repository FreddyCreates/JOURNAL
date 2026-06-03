import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {Object} RotationSchedule
 * @property {string} tokenId
 * @property {number} baseIntervalMs
 * @property {number} rotationCount
 * @property {number} nextRotationAt
 * @property {boolean} active
 */

/**
 * @typedef {Object} RotationRecord
 * @property {string} tokenId
 * @property {string} previousFingerprint
 * @property {string} newFingerprint
 * @property {number} rotatedAt
 * @property {number} generation
 */

/**
 * TokenRotator — manages automatic token rotation with phi-weighted
 * scheduling.
 *
 * Rotation intervals are adjusted by PHI^(rotation_count % 5) so that
 * successive rotations follow the golden-ratio scaling pattern. Each
 * rotation preserves the lineage of the original token by recording
 * the previous fingerprint and generation number.
 */
export class TokenRotator {
  /** @type {Map<string, RotationSchedule>} */
  #schedules;

  /** @type {Map<string, RotationRecord[]>} */
  #history;

  /** @type {Map<string, string>} */
  #currentTokens;

  /** @type {number} */
  #keyLength;

  /**
   * @param {Object} [config]
   * @param {number} [config.keyLength=32] — byte length for rotated token entropy
   */
  constructor(config = {}) {
    this.#schedules = new Map();
    this.#history = new Map();
    this.#currentTokens = new Map();
    this.#keyLength = config.keyLength ?? 32;
  }

  /**
   * Schedules automatic rotation for a token.
   *
   * The actual first rotation interval equals `intervalMs / PHI^0 = intervalMs`.
   * Subsequent rotations use `intervalMs * PHI^(count % 5)`.
   *
   * @param {string} tokenId — identifier for the token
   * @param {number} intervalMs — base rotation interval in milliseconds
   * @param {string} [currentToken] — optional current token value
   * @returns {{ tokenId: string, nextRotationAt: number, phiFactor: number }}
   */
  scheduleRotation(tokenId, intervalMs, currentToken) {
    if (!tokenId || typeof tokenId !== 'string') {
      throw new Error('tokenId must be a non-empty string');
    }
    if (typeof intervalMs !== 'number' || intervalMs <= 0) {
      throw new Error('intervalMs must be a positive number');
    }
    if (this.#schedules.has(tokenId)) {
      throw new Error(`Rotation already scheduled for "${tokenId}"`);
    }

    const now = Date.now();
    const phiFactor = Math.pow(PHI, 0);
    const nextRotationAt = now + Math.round(intervalMs * phiFactor);

    this.#schedules.set(tokenId, {
      tokenId,
      baseIntervalMs: intervalMs,
      rotationCount: 0,
      nextRotationAt,
      active: true,
    });

    if (currentToken) {
      this.#currentTokens.set(tokenId, currentToken);
    }
    this.#history.set(tokenId, []);

    return { tokenId, nextRotationAt, phiFactor };
  }

  /**
   * Manually rotates a token, preserving lineage.
   *
   * A new token is generated from phi-seeded entropy. The previous
   * token's fingerprint and the generation number are recorded in
   * the rotation history.
   *
   * @param {string} tokenId
   * @returns {{ tokenId: string, newToken: string, generation: number, rotatedAt: number }}
   */
  rotate(tokenId) {
    const schedule = this.#schedules.get(tokenId);
    if (!schedule) {
      throw new Error(`No rotation schedule found for "${tokenId}"`);
    }

    const previousToken = this.#currentTokens.get(tokenId) ?? '';
    const previousFingerprint = this._computeFingerprint(previousToken);

    const newToken = this._generateToken(tokenId, schedule.rotationCount);
    const newFingerprint = this._computeFingerprint(newToken);
    const now = Date.now();

    schedule.rotationCount++;
    const phiExponent = schedule.rotationCount % 5;
    const phiFactor = Math.pow(PHI, phiExponent);
    schedule.nextRotationAt = now + Math.round(schedule.baseIntervalMs * phiFactor);

    const record = {
      tokenId,
      previousFingerprint,
      newFingerprint,
      rotatedAt: now,
      generation: schedule.rotationCount,
    };

    const historyList = this.#history.get(tokenId);
    historyList.push(record);
    this.#currentTokens.set(tokenId, newToken);

    return {
      tokenId,
      newToken,
      generation: schedule.rotationCount,
      rotatedAt: now,
    };
  }

  /**
   * Returns the full rotation history for a token.
   *
   * @param {string} tokenId
   * @returns {RotationRecord[]}
   */
  getRotationHistory(tokenId) {
    const history = this.#history.get(tokenId);
    if (!history) {
      throw new Error(`No rotation history found for "${tokenId}"`);
    }
    return [...history];
  }

  /**
   * Returns the next scheduled rotation time and phi-factor for a token.
   *
   * @param {string} tokenId
   * @returns {{ tokenId: string, nextRotationAt: number, remainingMs: number, phiFactor: number }}
   */
  getNextRotation(tokenId) {
    const schedule = this.#schedules.get(tokenId);
    if (!schedule) {
      throw new Error(`No rotation schedule found for "${tokenId}"`);
    }

    const now = Date.now();
    const phiFactor = Math.pow(PHI, schedule.rotationCount % 5);
    return {
      tokenId,
      nextRotationAt: schedule.nextRotationAt,
      remainingMs: Math.max(0, schedule.nextRotationAt - now),
      phiFactor: Math.round(phiFactor * 10000) / 10000,
    };
  }

  /**
   * Cancels a scheduled rotation.
   *
   * @param {string} tokenId
   * @returns {{ tokenId: string, cancelledAt: number, totalRotations: number }}
   */
  cancelRotation(tokenId) {
    const schedule = this.#schedules.get(tokenId);
    if (!schedule) {
      throw new Error(`No rotation schedule found for "${tokenId}"`);
    }

    schedule.active = false;
    const cancelledAt = Date.now();
    return {
      tokenId,
      cancelledAt,
      totalRotations: schedule.rotationCount,
    };
  }

  /* ---- internal helpers ---- */

  /**
   * Generates a new hex-encoded token from phi-seeded entropy.
   * @private
   * @param {string} seed
   * @param {number} generation
   * @returns {string}
   */
  _generateToken(seed, generation) {
    const uuid = crypto.randomUUID();
    const combined = seed + uuid + String(generation);
    let h = 0;
    for (let i = 0; i < combined.length; i++) {
      h = ((h << 5) - h + combined.charCodeAt(i)) | 0;
    }
    h = Math.abs(h);

    const bytes = new Uint8Array(this.#keyLength);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(((h * PHI * (i + 1)) % 256 + 256) % 256);
    }
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Computes a phi-weighted fingerprint of a token string.
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
}

export default TokenRotator;
