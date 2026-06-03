/**
 * PROTO-012: Memory Runtime Governance Protocol (MRGP)
 * Authority-Governed Memory Intelligence that enforces separation between generative
 * processes and canonical memory, implementing the Memory Runtime Hypothesis.
 *
 * Core Hypothesis: Durable intelligence requires runtime memory law.
 * Generative processes CANNOT directly mutate canonical memory without mediated review.
 *
 * Engines wired: SovereignMemorySDK + MemoryLineage + OrganismLifecycle + PhiResonance
 * Ring: Memory Ring | Organism placement: Memory authority layer
 * Wire: intelligence-wire/mrgp
 *
 * Four-Layer Authority Stack:
 *   NOVA_ROOT          — Lawful runtime authority (governance ceiling)
 *   MEMORY_RUNTIME     — Canonical, append-only memory (protected)
 *   ACTIVE_STATE       — Live cognition and synthesis (working memory)
 *   FOUNDATION_FLOOR   — Heavy compute, NO direct write access to canonical memory
 *
 * @module protocols/memory-runtime-governance-protocol
 */

import crypto from 'node:crypto';

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 2.399963229728653;
const HEARTBEAT = 873;
const PHI_INVERSE = 1 / PHI; // 0.618...

/**
 * Claim classes within the authority system.
 * Each class has different promotion requirements and release boundaries.
 */
const CLAIM_CLASS = Object.freeze({
  HYPOTHESIS: 'hypothesis',       // Unverified conjecture from FOUNDATION_FLOOR
  DRAFT: 'draft',                 // Working claim in ACTIVE_STATE
  CANDIDATE: 'candidate',         // Promoted for review, awaiting attestation
  CANONICAL: 'canonical',         // Attested and committed to MEMORY_RUNTIME
  SUPERSEDED: 'superseded',       // Replaced by newer canonical claim
  RETRACTED: 'retracted'          // Invalidated, marked for lineage preservation
});

/**
 * Authority layers in the Memory Runtime stack.
 */
const AUTHORITY_LAYER = Object.freeze({
  NOVA_ROOT: 'nova_root',
  MEMORY_RUNTIME: 'memory_runtime',
  ACTIVE_STATE: 'active_state',
  FOUNDATION_FLOOR: 'foundation_floor'
});

/**
 * Evidence postures — how strongly a claim is supported.
 */
const EVIDENCE_POSTURE = Object.freeze({
  SPECULATIVE: 'speculative',     // No supporting evidence
  INDICATIVE: 'indicative',       // Weak correlational support
  SUPPORTED: 'supported',         // Multiple independent sources
  DEMONSTRATED: 'demonstrated',   // Experimental validation
  PROVEN: 'proven'                // Formal proof or exhaustive test
});

/**
 * @typedef {Object} Claim
 * @property {string} id - Unique claim identifier
 * @property {string} sourceId - Who/what produced this claim
 * @property {string} content - The claim content
 * @property {string} claimClass - Current class (hypothesis → canonical)
 * @property {string} evidencePosture - Strength of evidence
 * @property {string} authorityLayer - Which layer currently holds this claim
 * @property {string|null} parentClaimId - Claim this descends from
 * @property {string[]} childClaimIds - Claims that descend from this
 * @property {string[]} evidenceIds - Supporting evidence references
 * @property {string|null} supersededBy - Claim that replaces this one
 * @property {string} releaseBoundary - Where this claim may be released
 * @property {number} promotionCount - Times this claim has been promoted
 * @property {number} denialCount - Times promotion was denied
 * @property {Object[]} promotionHistory - Full promotion audit trail
 * @property {number} phiResonance - Current resonance score (φ-weighted)
 * @property {number} createdAt - Creation timestamp
 * @property {number} lastMutatedAt - Last mutation timestamp
 * @property {string} contentHash - SHA-256 of content for integrity
 * @property {Object} metadata - Arbitrary metadata
 */

/**
 * @typedef {Object} PromotionRequest
 * @property {string} claimId - Claim to promote
 * @property {string} requestedBy - Source requesting promotion
 * @property {string} targetClass - Target claim class
 * @property {string[]} evidenceIds - Evidence supporting promotion
 * @property {string} justification - Why promotion is warranted
 */

/**
 * @typedef {Object} PromotionDecision
 * @property {string} claimId - Claim being evaluated
 * @property {boolean} approved - Whether promotion was approved
 * @property {string} decidedBy - Authority that made decision
 * @property {string} reason - Explanation of decision
 * @property {number} timestamp - Decision timestamp
 * @property {number} resonanceAtDecision - φ-resonance at time of decision
 */

class MemoryRuntimeGovernanceProtocol {
  /**
   * @param {Object} config - Configuration
   * @param {number} [config.promotionThreshold=0.618] - φ-inverse resonance required for promotion
   * @param {number} [config.maxDenials=3] - Max denials before claim is frozen
   * @param {number} [config.canonicalCapacity=10000] - Max canonical claims before compaction
   * @param {boolean} [config.strictMode=true] - Enforce all authority boundaries
   * @param {number} [config.reviewCooldown=873] - Minimum ms between promotion attempts (1 heartbeat)
   */
  constructor(config = {}) {
    /** @type {Map<string, Claim>} */
    this.claims = new Map();
    /** @type {Map<string, PromotionDecision[]>} */
    this.decisions = new Map();
    /** @type {Set<string>} */
    this.canonicalIds = new Set();
    /** @type {Map<string, number>} sourceId → last promotion request timestamp */
    this._promotionCooldowns = new Map();

    this.promotionThreshold = config.promotionThreshold ?? PHI_INVERSE;
    this.maxDenials = config.maxDenials ?? 3;
    this.canonicalCapacity = config.canonicalCapacity ?? 10000;
    this.strictMode = config.strictMode ?? true;
    this.reviewCooldown = config.reviewCooldown ?? HEARTBEAT;

    this.metrics = {
      totalClaims: 0,
      totalPromotions: 0,
      totalDenials: 0,
      totalRetractions: 0,
      totalSupersessions: 0,
      canonicalCount: 0,
      boundaryViolationsBlocked: 0,
      averagePromotionLatency: 0
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // CLAIM LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Register a new claim at FOUNDATION_FLOOR as a hypothesis.
   * This is the ONLY entry point for new knowledge into the system.
   * @param {string} sourceId - Who/what produced this claim
   * @param {string} content - The claim content
   * @param {Object} [metadata={}] - Additional metadata
   * @returns {Claim}
   */
  registerClaim(sourceId, content, metadata = {}) {
    const id = crypto.randomUUID();
    const contentHash = this._hash(content);

    const claim = {
      id,
      sourceId,
      content,
      claimClass: CLAIM_CLASS.HYPOTHESIS,
      evidencePosture: EVIDENCE_POSTURE.SPECULATIVE,
      authorityLayer: AUTHORITY_LAYER.FOUNDATION_FLOOR,
      parentClaimId: null,
      childClaimIds: [],
      evidenceIds: [],
      supersededBy: null,
      releaseBoundary: 'private',
      promotionCount: 0,
      denialCount: 0,
      promotionHistory: [],
      phiResonance: PHI_INVERSE, // Start at golden ratio inverse
      createdAt: Date.now(),
      lastMutatedAt: Date.now(),
      contentHash,
      metadata
    };

    this.claims.set(id, claim);
    this.decisions.set(id, []);
    this.metrics.totalClaims++;

    return { ...claim };
  }

  /**
   * Attach evidence to a claim (does NOT promote it — evidence alone is not authority).
   * @param {string} claimId - Target claim
   * @param {string} evidenceId - Reference to evidence
   * @param {string} evidencePosture - New posture if evidence warrants upgrade
   * @returns {Claim}
   */
  attachEvidence(claimId, evidenceId, evidencePosture = null) {
    const claim = this._getClaim(claimId);
    claim.evidenceIds.push(evidenceId);

    if (evidencePosture && this._isPostureUpgrade(claim.evidencePosture, evidencePosture)) {
      claim.evidencePosture = evidencePosture;
    }

    // Phi-resonance increases with evidence (bounded by φ)
    claim.phiResonance = Math.min(PHI, claim.phiResonance + (PHI_INVERSE * 0.1));
    claim.lastMutatedAt = Date.now();

    return { ...claim };
  }

  // ═══════════════════════════════════════════════════════════════════
  // AUTHORITY GATE — THE BOUNDED AUTHORITY MEMBRANE
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Request promotion of a claim to a higher class.
   * This is the MEDIATED REVIEW that the Memory Runtime Hypothesis requires.
   * FOUNDATION_FLOOR cannot directly write to MEMORY_RUNTIME.
   *
   * Promotion path:
   *   hypothesis → draft → candidate → canonical
   *
   * @param {PromotionRequest} request
   * @returns {PromotionDecision}
   */
  requestPromotion(request) {
    const { claimId, requestedBy, targetClass, evidenceIds = [], justification = '' } = request;
    const claim = this._getClaim(claimId);

    // ─── BOUNDARY ENFORCEMENT ───
    // Rule 1: Cannot skip classes
    const nextClass = this._getNextClass(claim.claimClass);
    if (targetClass !== nextClass) {
      this.metrics.boundaryViolationsBlocked++;
      return this._deny(claim, requestedBy, `Cannot promote from ${claim.claimClass} to ${targetClass}. Next valid class: ${nextClass}`);
    }

    // Rule 2: Cannot promote frozen claims (max denials reached)
    if (claim.denialCount >= this.maxDenials) {
      this.metrics.boundaryViolationsBlocked++;
      return this._deny(claim, requestedBy, `Claim frozen after ${this.maxDenials} denials. Requires NOVA_ROOT override.`);
    }

    // Rule 3: Cooldown enforcement (minimum 1 heartbeat between attempts)
    const lastAttempt = this._promotionCooldowns.get(claimId) || 0;
    if (Date.now() - lastAttempt < this.reviewCooldown) {
      this.metrics.boundaryViolationsBlocked++;
      return this._deny(claim, requestedBy, `Cooldown active. Wait ${this.reviewCooldown}ms between promotion attempts.`);
    }

    // Rule 4: Resonance threshold — claim must have sufficient φ-resonance
    if (claim.phiResonance < this.promotionThreshold) {
      return this._deny(claim, requestedBy, `Insufficient resonance: ${claim.phiResonance.toFixed(4)} < ${this.promotionThreshold}`);
    }

    // Rule 5: Evidence requirement scales with promotion level
    const requiredEvidence = this._getRequiredEvidence(targetClass);
    if (claim.evidenceIds.length < requiredEvidence) {
      return this._deny(claim, requestedBy, `Insufficient evidence: ${claim.evidenceIds.length} < ${requiredEvidence} required for ${targetClass}`);
    }

    // Rule 6: Strict mode — superseded or retracted claims cannot be promoted
    if (this.strictMode && (claim.claimClass === CLAIM_CLASS.SUPERSEDED || claim.claimClass === CLAIM_CLASS.RETRACTED)) {
      this.metrics.boundaryViolationsBlocked++;
      return this._deny(claim, requestedBy, 'Cannot promote superseded or retracted claims');
    }

    // ─── PROMOTION APPROVED ───
    this._promotionCooldowns.set(claimId, Date.now());
    return this._approve(claim, requestedBy, targetClass, justification);
  }

  /**
   * NOVA_ROOT override — force promotion regardless of rules.
   * This is the highest authority and should be used sparingly.
   * @param {string} claimId
   * @param {string} targetClass
   * @param {string} reason
   * @returns {PromotionDecision}
   */
  novaRootOverride(claimId, targetClass, reason) {
    const claim = this._getClaim(claimId);

    // Even NOVA_ROOT respects the append-only nature — superseded claims cannot be un-superseded
    if (claim.supersededBy && targetClass === CLAIM_CLASS.CANONICAL) {
      return this._deny(claim, 'NOVA_ROOT', 'Cannot re-canonicalize superseded claim. Create new claim instead.');
    }

    return this._approve(claim, 'NOVA_ROOT', targetClass, `[NOVA_ROOT OVERRIDE] ${reason}`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // DENIAL PATH — EXPLICIT REFUSAL TRACKING
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Explicitly deny a claim's validity (different from promotion denial).
   * This is an active refutation with evidence.
   * @param {string} claimId
   * @param {string} deniedBy
   * @param {string} reason
   * @param {string[]} counterEvidenceIds
   * @returns {Claim}
   */
  refuteClaim(claimId, deniedBy, reason, counterEvidenceIds = []) {
    const claim = this._getClaim(claimId);

    claim.claimClass = CLAIM_CLASS.RETRACTED;
    claim.phiResonance = Math.max(0, claim.phiResonance - PHI_INVERSE);
    claim.lastMutatedAt = Date.now();
    claim.promotionHistory.push({
      action: 'refuted',
      by: deniedBy,
      reason,
      counterEvidence: counterEvidenceIds,
      timestamp: Date.now()
    });

    this.metrics.totalRetractions++;
    return { ...claim };
  }

  // ═══════════════════════════════════════════════════════════════════
  // SUPERSESSION — LINEAGE PRESERVATION
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Supersede a canonical claim with a newer version.
   * The old claim is preserved in lineage but marked superseded.
   * @param {string} oldClaimId - Existing canonical claim
   * @param {string} newClaimId - New claim that supersedes it
   * @param {string} reason
   * @returns {{oldClaim: Claim, newClaim: Claim}}
   */
  supersedeClaim(oldClaimId, newClaimId, reason) {
    const oldClaim = this._getClaim(oldClaimId);
    const newClaim = this._getClaim(newClaimId);

    if (oldClaim.claimClass !== CLAIM_CLASS.CANONICAL) {
      throw new Error(`Only canonical claims can be superseded. Current class: ${oldClaim.claimClass}`);
    }

    if (newClaim.claimClass !== CLAIM_CLASS.CANONICAL) {
      throw new Error(`Superseding claim must be canonical. Current class: ${newClaim.claimClass}`);
    }

    oldClaim.claimClass = CLAIM_CLASS.SUPERSEDED;
    oldClaim.supersededBy = newClaimId;
    oldClaim.lastMutatedAt = Date.now();
    oldClaim.promotionHistory.push({
      action: 'superseded',
      by: newClaimId,
      reason,
      timestamp: Date.now()
    });

    newClaim.parentClaimId = oldClaimId;
    oldClaim.childClaimIds.push(newClaimId);

    this.canonicalIds.delete(oldClaimId);
    this.metrics.totalSupersessions++;

    return { oldClaim: { ...oldClaim }, newClaim: { ...newClaim } };
  }

  // ═══════════════════════════════════════════════════════════════════
  // ROLLBACK — STATE RESTORATION
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Rollback a claim to a previous state (undo last promotion).
   * Preserves audit trail — does NOT delete history.
   * @param {string} claimId
   * @param {string} reason
   * @returns {Claim}
   */
  rollbackClaim(claimId, reason) {
    const claim = this._getClaim(claimId);
    const previousClass = this._getPreviousClass(claim.claimClass);

    if (!previousClass) {
      throw new Error('Cannot rollback: claim is already at lowest class (hypothesis)');
    }

    if (claim.claimClass === CLAIM_CLASS.CANONICAL) {
      this.canonicalIds.delete(claimId);
      this.metrics.canonicalCount--;
    }

    claim.claimClass = previousClass;
    claim.authorityLayer = this._getLayerForClass(previousClass);
    claim.lastMutatedAt = Date.now();
    claim.promotionHistory.push({
      action: 'rollback',
      from: claim.claimClass,
      to: previousClass,
      reason,
      timestamp: Date.now()
    });

    return { ...claim };
  }

  // ═══════════════════════════════════════════════════════════════════
  // RELEASE BOUNDARY — WHERE CLAIMS MAY BE PUBLISHED
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Set the release boundary for a claim.
   * Controls where this knowledge is allowed to be shared.
   * @param {string} claimId
   * @param {'private'|'internal'|'research'|'public'} boundary
   * @returns {Claim}
   */
  setReleaseBoundary(claimId, boundary) {
    const validBoundaries = ['private', 'internal', 'research', 'public'];
    if (!validBoundaries.includes(boundary)) {
      throw new Error(`Invalid boundary: ${boundary}. Valid: ${validBoundaries.join(', ')}`);
    }

    const claim = this._getClaim(claimId);

    // Only canonical claims may be released publicly
    if (boundary === 'public' && claim.claimClass !== CLAIM_CLASS.CANONICAL) {
      throw new Error('Only canonical claims may have public release boundary');
    }

    claim.releaseBoundary = boundary;
    claim.lastMutatedAt = Date.now();
    return { ...claim };
  }

  // ═══════════════════════════════════════════════════════════════════
  // QUERY & INSPECTION
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Get a claim by ID.
   * @param {string} claimId
   * @returns {Claim|undefined}
   */
  getClaim(claimId) {
    const claim = this.claims.get(claimId);
    return claim ? { ...claim } : undefined;
  }

  /**
   * Get all canonical claims (the MEMORY_RUNTIME contents).
   * @returns {Claim[]}
   */
  getCanonicalMemory() {
    return [...this.canonicalIds].map(id => ({ ...this.claims.get(id) }));
  }

  /**
   * Get full promotion history for a claim.
   * @param {string} claimId
   * @returns {PromotionDecision[]}
   */
  getPromotionHistory(claimId) {
    return [...(this.decisions.get(claimId) || [])];
  }

  /**
   * Get claims by source.
   * @param {string} sourceId
   * @returns {Claim[]}
   */
  getClaimsBySource(sourceId) {
    return [...this.claims.values()]
      .filter(c => c.sourceId === sourceId)
      .map(c => ({ ...c }));
  }

  /**
   * Get claims by class.
   * @param {string} claimClass
   * @returns {Claim[]}
   */
  getClaimsByClass(claimClass) {
    return [...this.claims.values()]
      .filter(c => c.claimClass === claimClass)
      .map(c => ({ ...c }));
  }

  /**
   * Get protocol metrics.
   * @returns {Object}
   */
  getMetrics() {
    return { ...this.metrics };
  }

  // ═══════════════════════════════════════════════════════════════════
  // POISONING RESISTANCE — INTEGRITY VERIFICATION
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Verify integrity of a claim's content against its stored hash.
   * Detects tampering or corruption.
   * @param {string} claimId
   * @returns {{valid: boolean, claimId: string, storedHash: string, computedHash: string}}
   */
  verifyIntegrity(claimId) {
    const claim = this._getClaim(claimId);
    const computedHash = this._hash(claim.content);
    const valid = computedHash === claim.contentHash;

    if (!valid) {
      this.metrics.boundaryViolationsBlocked++;
    }

    return { valid, claimId, storedHash: claim.contentHash, computedHash };
  }

  /**
   * Run full integrity scan of all canonical memory.
   * @returns {{totalScanned: number, corrupted: string[], healthy: number}}
   */
  integrityAudit() {
    const corrupted = [];
    for (const id of this.canonicalIds) {
      const result = this.verifyIntegrity(id);
      if (!result.valid) corrupted.push(id);
    }
    return {
      totalScanned: this.canonicalIds.size,
      corrupted,
      healthy: this.canonicalIds.size - corrupted.length
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // INTERNAL HELPERS
  // ═══════════════════════════════════════════════════════════════════

  /** @private */
  _getClaim(claimId) {
    const claim = this.claims.get(claimId);
    if (!claim) throw new Error(`Claim ${claimId} not found`);
    return claim;
  }

  /** @private */
  _hash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /** @private */
  _getNextClass(current) {
    const order = [CLAIM_CLASS.HYPOTHESIS, CLAIM_CLASS.DRAFT, CLAIM_CLASS.CANDIDATE, CLAIM_CLASS.CANONICAL];
    const idx = order.indexOf(current);
    return idx < order.length - 1 ? order[idx + 1] : null;
  }

  /** @private */
  _getPreviousClass(current) {
    const order = [CLAIM_CLASS.HYPOTHESIS, CLAIM_CLASS.DRAFT, CLAIM_CLASS.CANDIDATE, CLAIM_CLASS.CANONICAL];
    const idx = order.indexOf(current);
    return idx > 0 ? order[idx - 1] : null;
  }

  /** @private */
  _getLayerForClass(claimClass) {
    const map = {
      [CLAIM_CLASS.HYPOTHESIS]: AUTHORITY_LAYER.FOUNDATION_FLOOR,
      [CLAIM_CLASS.DRAFT]: AUTHORITY_LAYER.ACTIVE_STATE,
      [CLAIM_CLASS.CANDIDATE]: AUTHORITY_LAYER.ACTIVE_STATE,
      [CLAIM_CLASS.CANONICAL]: AUTHORITY_LAYER.MEMORY_RUNTIME
    };
    return map[claimClass] || AUTHORITY_LAYER.FOUNDATION_FLOOR;
  }

  /** @private */
  _getRequiredEvidence(targetClass) {
    const map = {
      [CLAIM_CLASS.DRAFT]: 0,
      [CLAIM_CLASS.CANDIDATE]: 1,
      [CLAIM_CLASS.CANONICAL]: 2
    };
    return map[targetClass] ?? 0;
  }

  /** @private */
  _isPostureUpgrade(current, proposed) {
    const order = [
      EVIDENCE_POSTURE.SPECULATIVE,
      EVIDENCE_POSTURE.INDICATIVE,
      EVIDENCE_POSTURE.SUPPORTED,
      EVIDENCE_POSTURE.DEMONSTRATED,
      EVIDENCE_POSTURE.PROVEN
    ];
    return order.indexOf(proposed) > order.indexOf(current);
  }

  /** @private */
  _approve(claim, approvedBy, targetClass, justification) {
    claim.claimClass = targetClass;
    claim.authorityLayer = this._getLayerForClass(targetClass);
    claim.promotionCount++;
    claim.phiResonance = Math.min(PHI, claim.phiResonance * PHI_INVERSE + PHI_INVERSE);
    claim.lastMutatedAt = Date.now();

    const decision = {
      claimId: claim.id,
      approved: true,
      decidedBy: approvedBy,
      reason: justification,
      timestamp: Date.now(),
      resonanceAtDecision: claim.phiResonance
    };

    claim.promotionHistory.push({ action: 'promoted', to: targetClass, ...decision });
    this.decisions.get(claim.id).push(decision);

    if (targetClass === CLAIM_CLASS.CANONICAL) {
      this.canonicalIds.add(claim.id);
      this.metrics.canonicalCount++;
    }

    this.metrics.totalPromotions++;
    return decision;
  }

  /** @private */
  _deny(claim, deniedBy, reason) {
    claim.denialCount++;
    claim.phiResonance = Math.max(0, claim.phiResonance - (PHI_INVERSE * 0.05));
    claim.lastMutatedAt = Date.now();

    const decision = {
      claimId: claim.id,
      approved: false,
      decidedBy: deniedBy,
      reason,
      timestamp: Date.now(),
      resonanceAtDecision: claim.phiResonance
    };

    claim.promotionHistory.push({ action: 'denied', ...decision });
    this.decisions.get(claim.id).push(decision);
    this.metrics.totalDenials++;

    return decision;
  }
}

export { MemoryRuntimeGovernanceProtocol, CLAIM_CLASS, AUTHORITY_LAYER, EVIDENCE_POSTURE };
