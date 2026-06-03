import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {'pending'|'active'|'suspended'|'expired'|'destroyed'} LifecycleState
 * @typedef {{ tokenId: string, state: LifecycleState, createdAt: number, updatedAt: number, suspendReason: string|null, transitions: Array, spec: Object }} LifecycleEntry
 * @typedef {{ tokenId: string, payload?: *, ttlMs?: number, metadata?: Object }} LifecycleSpec
 */

/**
 * TokenLifecycle — manages the full lifecycle of tokens from creation
 * through destruction. States: pending → active → suspended ⇄ active
 * → expired → destroyed. Every transition is recorded for auditability.
 */
export class TokenLifecycle {
  /** @type {Map<string, LifecycleEntry>} */
  #entries;

  /** @type {number} */
  #totalCreated;

  /** @type {number} */
  #totalDestroyed;

  /** @type {Set<LifecycleState>} valid states */
  static #VALID_STATES = new Set(['pending', 'active', 'suspended', 'expired', 'destroyed']);

  /**
   * @param {Object} [config]
   */
  constructor(config = {}) {
    this.#entries = new Map();
    this.#totalCreated = 0;
    this.#totalDestroyed = 0;
  }

  /**
   * Creates a new token lifecycle entry in the `pending` state.
   *
   * @param {LifecycleSpec} spec — token specification
   * @returns {{ tokenId: string, state: LifecycleState, createdAt: number }}
   */
  create(spec) {
    if (!spec || !spec.tokenId || typeof spec.tokenId !== 'string') {
      throw new Error('spec.tokenId must be a non-empty string');
    }
    if (this.#entries.has(spec.tokenId)) {
      throw new Error(`Lifecycle entry already exists for "${spec.tokenId}"`);
    }

    const now = Date.now();
    this.#entries.set(spec.tokenId, {
      tokenId: spec.tokenId,
      state: 'pending',
      createdAt: now,
      updatedAt: now,
      suspendReason: null,
      transitions: [],
      spec: { ...spec },
    });

    this.#totalCreated++;
    return { tokenId: spec.tokenId, state: 'pending', createdAt: now };
  }

  /**
   * Activates a pending token.
   *
   * @param {string} tokenId
   * @returns {{ tokenId: string, state: LifecycleState, activatedAt: number }}
   */
  activate(tokenId) {
    const entry = this._getEntry(tokenId);
    this._assertState(entry, 'pending', 'activate');

    this._transition(entry, 'active');
    return { tokenId, state: 'active', activatedAt: entry.updatedAt };
  }

  /**
   * Suspends an active token with an optional reason.
   *
   * @param {string} tokenId
   * @param {string} [reason='Suspended by operator']
   * @returns {{ tokenId: string, state: LifecycleState, suspendedAt: number, reason: string }}
   */
  suspend(tokenId, reason = 'Suspended by operator') {
    const entry = this._getEntry(tokenId);
    this._assertState(entry, 'active', 'suspend');

    entry.suspendReason = reason;
    this._transition(entry, 'suspended', reason);
    return { tokenId, state: 'suspended', suspendedAt: entry.updatedAt, reason };
  }

  /**
   * Resumes a suspended token back to active.
   *
   * @param {string} tokenId
   * @returns {{ tokenId: string, state: LifecycleState, resumedAt: number }}
   */
  resume(tokenId) {
    const entry = this._getEntry(tokenId);
    this._assertState(entry, 'suspended', 'resume');

    entry.suspendReason = null;
    this._transition(entry, 'active', 'Resumed');
    return { tokenId, state: 'active', resumedAt: entry.updatedAt };
  }

  /**
   * Marks a token as expired.
   *
   * @param {string} tokenId
   * @returns {{ tokenId: string, state: LifecycleState, expiredAt: number }}
   */
  expire(tokenId) {
    const entry = this._getEntry(tokenId);
    if (entry.state === 'destroyed') {
      throw new Error(`Cannot expire a destroyed token "${tokenId}"`);
    }
    if (entry.state === 'expired') {
      throw new Error(`Token "${tokenId}" is already expired`);
    }

    this._transition(entry, 'expired', 'Token expired');
    return { tokenId, state: 'expired', expiredAt: entry.updatedAt };
  }

  /**
   * Permanently destroys a token. This is irreversible.
   *
   * @param {string} tokenId
   * @returns {{ tokenId: string, state: LifecycleState, destroyedAt: number }}
   */
  destroy(tokenId) {
    const entry = this._getEntry(tokenId);
    if (entry.state === 'destroyed') {
      throw new Error(`Token "${tokenId}" is already destroyed`);
    }

    this._transition(entry, 'destroyed', 'Permanently destroyed');
    this.#totalDestroyed++;
    return { tokenId, state: 'destroyed', destroyedAt: entry.updatedAt };
  }

  /**
   * Returns the current lifecycle state and transition history.
   *
   * The health score is a phi-weighted metric based on the number of
   * transitions and the token's age relative to its TTL.
   *
   * @param {string} tokenId
   * @returns {{ tokenId: string, state: LifecycleState, createdAt: number, updatedAt: number, transitions: Array, healthScore: number }}
   */
  getState(tokenId) {
    const entry = this._getEntry(tokenId);
    const healthScore = this._computeHealthScore(entry);

    return {
      tokenId: entry.tokenId,
      state: entry.state,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      transitions: [...entry.transitions],
      healthScore,
    };
  }

  /* ---- internal helpers ---- */

  /**
   * Retrieves an entry or throws.
   * @private
   * @param {string} tokenId
   * @returns {LifecycleEntry}
   */
  _getEntry(tokenId) {
    const entry = this.#entries.get(tokenId);
    if (!entry) {
      throw new Error(`No lifecycle entry found for "${tokenId}"`);
    }
    return entry;
  }

  /**
   * Asserts the current state matches the expected state.
   * @private
   * @param {LifecycleEntry} entry
   * @param {LifecycleState} expected
   * @param {string} action
   */
  _assertState(entry, expected, action) {
    if (entry.state !== expected) {
      throw new Error(
        `Cannot ${action} token "${entry.tokenId}": expected state "${expected}" but found "${entry.state}"`
      );
    }
  }

  /**
   * Records a state transition.
   * @private
   * @param {LifecycleEntry} entry
   * @param {LifecycleState} newState
   * @param {string} [reason]
   */
  _transition(entry, newState, reason) {
    const now = Date.now();
    entry.transitions.push({
      from: entry.state,
      to: newState,
      at: now,
      ...(reason ? { reason } : {}),
    });
    entry.state = newState;
    entry.updatedAt = now;
  }

  /**
   * Computes a phi-weighted health score for a lifecycle entry.
   * @private
   * @param {LifecycleEntry} entry
   * @returns {number}
   */
  _computeHealthScore(entry) {
    if (entry.state === 'destroyed') return 0;
    if (entry.state === 'expired') return 0.1;

    const ageMs = Date.now() - entry.createdAt;
    const ttlMs = entry.spec.ttlMs ?? 86400000;
    const ageFraction = Math.min(1, ageMs / ttlMs);
    const freshness = 1 - ageFraction;

    const transitionPenalty = Math.min(0.5, entry.transitions.length * 0.05);
    const suspendedPenalty = entry.state === 'suspended' ? 0.2 : 0;

    const raw = freshness * PHI - transitionPenalty - suspendedPenalty;
    return Math.round(Math.max(0, Math.min(1, raw)) * 10000) / 10000;
  }
}

export default TokenLifecycle;
