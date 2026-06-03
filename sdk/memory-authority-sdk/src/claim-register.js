import crypto from 'node:crypto';

const PHI = 1.618033988749895;
const PHI_INVERSE = 1 / PHI;

/**
 * ClaimRegister — Append-only registry of all claims in the authority system.
 *
 * Enforces the principle: Memory is not a log. A research agent's memory must encode
 * source identity, claim class, evidence posture, release boundary, and promotion history.
 *
 * This register is the SINGLE SOURCE OF TRUTH for claim existence and lineage.
 */
export class ClaimRegister {
  constructor() {
    /** @type {Map<string, Object>} */
    this._claims = new Map();
    /** @type {Map<string, string[]>} sourceId → claimIds */
    this._bySource = new Map();
    /** @type {Map<string, Set<string>>} claimClass → claimIds */
    this._byClass = new Map();
    /** @type {number} */
    this._sequenceNumber = 0;
  }

  /**
   * Register a new claim. Append-only — claims cannot be deleted, only retracted.
   * @param {Object} params
   * @param {string} params.sourceId - Who produced this claim
   * @param {string} params.content - The claim content
   * @param {string} [params.evidencePosture='speculative']
   * @param {string} [params.parentClaimId=null]
   * @param {Object} [params.metadata={}]
   * @returns {Object} The registered claim
   */
  register(params) {
    const { sourceId, content, evidencePosture = 'speculative', parentClaimId = null, metadata = {} } = params;

    const id = crypto.randomUUID();
    const contentHash = crypto.createHash('sha256').update(content).digest('hex');
    const sequenceNumber = this._sequenceNumber++;

    const claim = {
      id,
      sequenceNumber,
      sourceId,
      content,
      contentHash,
      claimClass: 'hypothesis',
      evidencePosture,
      parentClaimId,
      childClaimIds: [],
      evidenceIds: [],
      supersededBy: null,
      releaseBoundary: 'private',
      phiResonance: PHI_INVERSE,
      promotionCount: 0,
      denialCount: 0,
      createdAt: Date.now(),
      lastMutatedAt: Date.now(),
      metadata
    };

    this._claims.set(id, claim);

    // Index by source
    const sourceClaims = this._bySource.get(sourceId) || [];
    sourceClaims.push(id);
    this._bySource.set(sourceId, sourceClaims);

    // Index by class
    if (!this._byClass.has('hypothesis')) this._byClass.set('hypothesis', new Set());
    this._byClass.get('hypothesis').add(id);

    // Link to parent
    if (parentClaimId) {
      const parent = this._claims.get(parentClaimId);
      if (parent) {
        parent.childClaimIds.push(id);
      }
    }

    return { ...claim };
  }

  /**
   * Get a claim by ID.
   * @param {string} id
   * @returns {Object|undefined}
   */
  get(id) {
    const claim = this._claims.get(id);
    return claim ? { ...claim } : undefined;
  }

  /**
   * Get the internal mutable claim (for engines that need to mutate).
   * @param {string} id
   * @returns {Object}
   */
  getMutable(id) {
    const claim = this._claims.get(id);
    if (!claim) throw new Error(`Claim ${id} not found in register`);
    return claim;
  }

  /**
   * Update claim class and re-index.
   * @param {string} id
   * @param {string} newClass
   */
  updateClass(id, newClass) {
    const claim = this._claims.get(id);
    if (!claim) throw new Error(`Claim ${id} not found`);

    const oldClass = claim.claimClass;
    if (this._byClass.has(oldClass)) this._byClass.get(oldClass).delete(id);
    if (!this._byClass.has(newClass)) this._byClass.set(newClass, new Set());
    this._byClass.get(newClass).add(id);

    claim.claimClass = newClass;
    claim.lastMutatedAt = Date.now();
  }

  /**
   * Get all claims by source.
   * @param {string} sourceId
   * @returns {Object[]}
   */
  getBySource(sourceId) {
    const ids = this._bySource.get(sourceId) || [];
    return ids.map(id => ({ ...this._claims.get(id) }));
  }

  /**
   * Get all claims by class.
   * @param {string} claimClass
   * @returns {Object[]}
   */
  getByClass(claimClass) {
    const ids = this._byClass.get(claimClass);
    if (!ids) return [];
    return [...ids].map(id => ({ ...this._claims.get(id) }));
  }

  /**
   * Get total claim count.
   * @returns {number}
   */
  get size() {
    return this._claims.size;
  }

  /**
   * Verify integrity of a claim's content.
   * @param {string} id
   * @returns {{valid: boolean, id: string}}
   */
  verifyIntegrity(id) {
    const claim = this._claims.get(id);
    if (!claim) throw new Error(`Claim ${id} not found`);
    const computed = crypto.createHash('sha256').update(claim.content).digest('hex');
    return { valid: computed === claim.contentHash, id };
  }

  /**
   * Get the full lineage chain (ancestors) for a claim.
   * @param {string} id
   * @returns {string[]} Ordered ancestor IDs, oldest first
   */
  getLineage(id) {
    const chain = [];
    let current = id;
    const visited = new Set();

    while (current) {
      if (visited.has(current)) break;
      visited.add(current);
      const claim = this._claims.get(current);
      if (!claim || !claim.parentClaimId) break;
      chain.unshift(claim.parentClaimId);
      current = claim.parentClaimId;
    }

    return chain;
  }
}
