import crypto from 'node:crypto';

const PHI = 1.618033988749895;
const PHI_INVERSE = 1 / PHI;
const HEARTBEAT = 873;

/**
 * PromotionEngine — Manages the promotion lifecycle of claims through authority layers.
 *
 * Implements the Memory Runtime Hypothesis:
 *   hypothesis → draft → candidate → canonical
 *
 * Each promotion step requires increasing evidence and resonance.
 * The engine enforces cooldowns, evidence thresholds, and denial limits.
 *
 * Promotion is NEVER automatic — it always requires mediated review.
 */
export class PromotionEngine {
  /**
   * @param {Object} config
   * @param {Object} config.register - ClaimRegister instance
   * @param {Object} config.gate - AuthorityGate instance
   * @param {number} [config.cooldownMs=873] - Minimum time between promotion attempts
   * @param {number} [config.maxDenials=3] - Max denials before claim is frozen
   * @param {Object} [config.evidenceRequirements] - Evidence count per target class
   */
  constructor(config = {}) {
    if (!config.register) throw new Error('PromotionEngine requires a ClaimRegister');
    if (!config.gate) throw new Error('PromotionEngine requires an AuthorityGate');

    this.register = config.register;
    this.gate = config.gate;
    this.cooldownMs = config.cooldownMs ?? HEARTBEAT;
    this.maxDenials = config.maxDenials ?? 3;
    this.evidenceRequirements = config.evidenceRequirements ?? {
      draft: 0,
      candidate: 1,
      canonical: 2
    };

    /** @type {Map<string, number>} claimId → last attempt timestamp */
    this._cooldowns = new Map();
    /** @type {Object[]} */
    this._decisionLog = [];
  }

  /**
   * The ordered promotion path.
   */
  static PROMOTION_PATH = ['hypothesis', 'draft', 'candidate', 'canonical'];

  /**
   * Authority layers mapped to claim classes.
   */
  static LAYER_MAP = {
    hypothesis: 'foundation_floor',
    draft: 'active_state',
    candidate: 'active_state',
    canonical: 'memory_runtime'
  };

  /**
   * Attempt to promote a claim to the next class.
   * @param {string} claimId
   * @param {string} requestedBy - Source requesting promotion
   * @param {string} justification - Why promotion is warranted
   * @returns {{approved: boolean, claimId: string, reason: string, newClass?: string, layer?: string}}
   */
  promote(claimId, requestedBy, justification = '') {
    const claim = this.register.getMutable(claimId);
    const currentIdx = PromotionEngine.PROMOTION_PATH.indexOf(claim.claimClass);
    const targetClass = PromotionEngine.PROMOTION_PATH[currentIdx + 1];

    // Already at highest class
    if (!targetClass) {
      return this._logDecision(claimId, false, requestedBy, 'Claim is already canonical — no further promotion possible');
    }

    // Frozen claims
    if (claim.denialCount >= this.maxDenials) {
      return this._logDecision(claimId, false, requestedBy, `Claim frozen after ${this.maxDenials} denials`);
    }

    // Cooldown check
    const lastAttempt = this._cooldowns.get(claimId) || 0;
    if (Date.now() - lastAttempt < this.cooldownMs) {
      return this._logDecision(claimId, false, requestedBy, `Cooldown active (${this.cooldownMs}ms)`);
    }

    // Evidence requirement
    const required = this.evidenceRequirements[targetClass] ?? 0;
    if (claim.evidenceIds.length < required) {
      claim.denialCount++;
      this._cooldowns.set(claimId, Date.now());
      return this._logDecision(claimId, false, requestedBy, `Insufficient evidence: ${claim.evidenceIds.length}/${required} for ${targetClass}`);
    }

    // Resonance threshold (scales with promotion level)
    const requiredResonance = PHI_INVERSE * (currentIdx + 1) * 0.5;
    if (claim.phiResonance < requiredResonance) {
      claim.denialCount++;
      this._cooldowns.set(claimId, Date.now());
      return this._logDecision(claimId, false, requestedBy, `Resonance ${claim.phiResonance.toFixed(4)} below threshold ${requiredResonance.toFixed(4)}`);
    }

    // For canonical promotion, claim must pass through the AuthorityGate
    if (targetClass === 'canonical') {
      const gateResult = this.gate.evaluate(claim);
      if (!gateResult.permitted) {
        claim.denialCount++;
        this._cooldowns.set(claimId, Date.now());
        return this._logDecision(claimId, false, requestedBy, `Gate denied: ${gateResult.reason}`);
      }
    }

    // ─── APPROVED ───
    this._cooldowns.set(claimId, Date.now());
    this.register.updateClass(claimId, targetClass);
    claim.promotionCount++;
    claim.phiResonance = Math.min(PHI, claim.phiResonance + (PHI_INVERSE * 0.2));
    claim.lastMutatedAt = Date.now();

    return this._logDecision(claimId, true, requestedBy, justification || `Promoted to ${targetClass}`, targetClass);
  }

  /**
   * Force-promote via NOVA_ROOT authority (bypasses normal rules).
   * @param {string} claimId
   * @param {string} targetClass
   * @param {string} reason
   * @returns {{approved: boolean, claimId: string, reason: string, newClass?: string}}
   */
  novaOverride(claimId, targetClass, reason) {
    const claim = this.register.getMutable(claimId);

    if (claim.supersededBy) {
      return this._logDecision(claimId, false, 'NOVA_ROOT', 'Cannot override superseded claims');
    }

    this.register.updateClass(claimId, targetClass);
    claim.promotionCount++;
    claim.lastMutatedAt = Date.now();

    return this._logDecision(claimId, true, 'NOVA_ROOT', `[OVERRIDE] ${reason}`, targetClass);
  }

  /**
   * Get the decision log.
   * @returns {Object[]}
   */
  getDecisionLog() {
    return [...this._decisionLog];
  }

  /** @private */
  _logDecision(claimId, approved, decidedBy, reason, newClass = null) {
    const entry = {
      claimId,
      approved,
      decidedBy,
      reason,
      newClass,
      layer: newClass ? PromotionEngine.LAYER_MAP[newClass] : null,
      timestamp: Date.now()
    };
    this._decisionLog.push(entry);
    return entry;
  }
}
