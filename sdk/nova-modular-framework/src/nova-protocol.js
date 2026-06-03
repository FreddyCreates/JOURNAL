import crypto from 'node:crypto';
import {
  PHI,
  PHI_INVERSE,
  NOVA_ID,
  NOVA_NAME,
  NOVA_SOVEREIGN_ID,
  HEARTBEAT_MS,
  phiBlend,
  phiGrow,
  phiDecay,
  novaStamp,
} from './nova-core.js';

/**
 * @typedef {'genesis' | 'active' | 'evolving' | 'attesting' | 'dormant' | 'terminated'} NovaTokenStatus
 */

/**
 * @typedef {Object} NovaTokenRecord
 * @property {string} tokenId
 * @property {string} name
 * @property {NovaTokenStatus} status
 * @property {number} coherence       - [0, 1] phi-encoded coherence score
 * @property {number} evolutionCycle  - How many times this token has evolved
 * @property {string[]} lineage       - Ancestor token IDs (oldest first)
 * @property {number} createdAt
 * @property {number} attestedAt
 * @property {string} attestHash
 */

/**
 * NovaProtocol — JavaScript adapter for the TT-012-NOVA sovereign token protocol.
 *
 * Mirrors the four sovereign operations from the Motoko TT012Sovereign module:
 *   MERGE  — two tokens fuse into one with combined lineage
 *   SPLIT  — one token divides into N children with provenance
 *   EVOLVE — token mutates state through φ-weighted evolution cycles
 *   ATTEST — token self-signs its state hash
 */
export class NovaProtocol {
  /** @type {Map<string, NovaTokenRecord>} */
  #tokens;

  /** @type {string} */
  #protocolId;

  constructor() {
    this.#tokens = new Map();
    this.#protocolId = crypto.randomUUID();
  }

  /**
   * Protocol identifier.
   * @returns {string}
   */
  get protocolId() {
    return this.#protocolId;
  }

  /**
   * Returns a copy of the protocol's identity manifest.
   * @returns {Object}
   */
  identity() {
    return {
      ...novaStamp(),
      protocolId: this.#protocolId,
      tokenCount: this.#tokens.size,
    };
  }

  /**
   * Genesis — mints a new Nova token.
   * @param {string} name  Human-readable token name
   * @param {{ coherence?: number }} [opts]
   * @returns {NovaTokenRecord}
   */
  genesis(name, opts = {}) {
    if (!name || typeof name !== 'string') {
      throw new TypeError('Token name must be a non-empty string');
    }
    const tokenId = `${NOVA_ID}-${crypto.randomUUID()}`;
    const coherence = phiBlend(opts.coherence ?? 0.5, PHI_INVERSE);
    const now = Date.now();
    const record = {
      tokenId,
      name,
      status: 'genesis',
      coherence,
      evolutionCycle: 0,
      lineage: [],
      createdAt: now,
      attestedAt: now,
      attestHash: this.#computeHash({ tokenId, name, coherence, createdAt: now }),
    };
    this.#tokens.set(tokenId, record);
    return { ...record };
  }

  /**
   * Evolve — advances a token through one φ-weighted evolution cycle.
   * @param {string} tokenId
   * @param {{ rate?: number }} [opts]
   * @returns {NovaTokenRecord}
   */
  evolve(tokenId, opts = {}) {
    const token = this.#requireToken(tokenId);
    const rate = opts.rate ?? PHI_INVERSE;
    token.coherence = phiGrow(token.coherence, 1, rate);
    token.evolutionCycle += 1;
    token.status = 'evolving';
    token.attestHash = this.#computeHash(token);
    token.attestedAt = Date.now();
    return { ...token };
  }

  /**
   * Attest — token self-signs its current state.
   * @param {string} tokenId
   * @returns {NovaTokenRecord}
   */
  attest(tokenId) {
    const token = this.#requireToken(tokenId);
    token.status = 'attesting';
    token.attestedAt = Date.now();
    token.attestHash = this.#computeHash(token);
    token.status = 'active';
    return { ...token };
  }

  /**
   * Merge — two tokens fuse into one with combined lineage.
   * @param {string} tokenIdA
   * @param {string} tokenIdB
   * @param {string} [mergedName]
   * @returns {NovaTokenRecord}  The newly merged token
   */
  merge(tokenIdA, tokenIdB, mergedName) {
    const a = this.#requireToken(tokenIdA);
    const b = this.#requireToken(tokenIdB);
    const name = mergedName ?? `${a.name}⊕${b.name}`;
    const mergedCoherence = phiBlend(a.coherence, b.coherence);
    const now = Date.now();
    const tokenId = `${NOVA_ID}-MERGE-${crypto.randomUUID()}`;
    const lineage = [...new Set([...a.lineage, tokenIdA, ...b.lineage, tokenIdB])];
    const record = {
      tokenId,
      name,
      status: 'active',
      coherence: mergedCoherence,
      evolutionCycle: Math.max(a.evolutionCycle, b.evolutionCycle) + 1,
      lineage,
      createdAt: now,
      attestedAt: now,
      attestHash: '',
    };
    record.attestHash = this.#computeHash(record);
    this.#tokens.set(tokenId, record);
    a.status = 'terminated';
    b.status = 'terminated';
    return { ...record };
  }

  /**
   * Split — one token divides into N children with provenance.
   * @param {string} tokenId
   * @param {number} [n=2]  Number of children (must be >= 2)
   * @returns {NovaTokenRecord[]}  Array of child token records
   */
  split(tokenId, n = 2) {
    if (!Number.isInteger(n) || n < 2) {
      throw new RangeError('Split count must be an integer >= 2');
    }
    const parent = this.#requireToken(tokenId);
    const now = Date.now();
    const childCoherence = phiDecay(parent.coherence, 1 / n);
    const children = [];
    for (let i = 0; i < n; i++) {
      const childId = `${NOVA_ID}-SPLIT-${crypto.randomUUID()}`;
      const record = {
        tokenId: childId,
        name: `${parent.name}.${i + 1}`,
        status: 'active',
        coherence: childCoherence,
        evolutionCycle: 0,
        lineage: [...parent.lineage, tokenId],
        createdAt: now,
        attestedAt: now,
        attestHash: '',
      };
      record.attestHash = this.#computeHash(record);
      this.#tokens.set(childId, record);
      children.push({ ...record });
    }
    parent.status = 'terminated';
    return children;
  }

  /**
   * Retrieve a token record (read-only copy).
   * @param {string} tokenId
   * @returns {NovaTokenRecord}
   */
  getToken(tokenId) {
    return { ...this.#requireToken(tokenId) };
  }

  /**
   * Returns all token records as an array.
   * @returns {NovaTokenRecord[]}
   */
  listTokens() {
    return Array.from(this.#tokens.values()).map(t => ({ ...t }));
  }

  /**
   * Total number of tokens (all statuses).
   * @returns {number}
   */
  get size() {
    return this.#tokens.size;
  }

  // ------------------------------------------------------------------ //
  // Private helpers                                                      //
  // ------------------------------------------------------------------ //

  /**
   * @param {string} tokenId
   * @returns {NovaTokenRecord}
   */
  #requireToken(tokenId) {
    const token = this.#tokens.get(tokenId);
    if (!token) throw new Error(`Nova token not found: "${tokenId}"`);
    return token;
  }

  /**
   * @param {Object} data
   * @returns {string}
   */
  #computeHash(data) {
    const payload = JSON.stringify({
      tokenId: data.tokenId,
      name: data.name,
      coherence: data.coherence,
      evolutionCycle: data.evolutionCycle,
      createdAt: data.createdAt,
    });
    return crypto.createHash('sha256').update(payload).digest('hex');
  }
}
