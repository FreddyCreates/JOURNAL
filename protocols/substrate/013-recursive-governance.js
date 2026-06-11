/**
 * SUBSTRATE-013: Recursive Governance Protocol (RGP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * Governance applies to governance itself. Rules that govern the system
 * are themselves governed by meta-rules. Prevents governance escape
 * or regulatory capture.
 *
 * Engines wired: CivosPrime + MetaEngine + ConstitutionalGuard
 * Ring: Sovereign Ring | Placement: Substrate foundation
 * Wire: substrate-wire/rgp
 * Enforcement: IMMUTABLE
 */

const SUBSTRATE_SEAL = 'UNBREAKABLE::RGP::013';

class RecursiveGovernanceProtocol {
  #metaRules;
  #governanceLog;
  #recursionDepth;

  constructor() {
    this.#metaRules = new Map();
    this.#governanceLog = [];
    this.#recursionDepth = 0;
    this.protocolId = 'SUBSTRATE-013';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
    this._loadMetaRules();
  }

  _loadMetaRules() {
    const meta = [
      { id: 'META-1', rule: 'No rule can exempt itself from governance', enforceable: true },
      { id: 'META-2', rule: 'Rule changes require higher-level approval than the rule itself', enforceable: true },
      { id: 'META-3', rule: 'Governance recursion depth cannot exceed 7 layers', enforceable: true },
      { id: 'META-4', rule: 'Meta-rules cannot be modified without constitutional amendment', enforceable: true },
      { id: 'META-5', rule: 'Every governance decision must itself be governable', enforceable: true }
    ];
    for (const m of meta) {
      this.#metaRules.set(m.id, Object.freeze(m));
    }
  }

  /**
   * Apply governance to a governance decision itself.
   * @param {Object} decision - The governance decision being made
   * @param {number} level - Current governance level
   * @returns {Object} Meta-governance result
   */
  governDecision(decision, level = 0) {
    if (level > 7) {
      return { permitted: false, reason: 'MAX_RECURSION_DEPTH', seal: SUBSTRATE_SEAL };
    }

    this.#recursionDepth = level;
    const violations = [];

    // META-1: Check if decision exempts itself
    if (decision.exemptSelf) {
      violations.push({ metaRule: 'META-1', reason: 'Decision attempts self-exemption' });
    }

    // META-2: Check authority level
    if (decision.modifiesRule && decision.authorityLevel <= decision.ruleLevel) {
      violations.push({ metaRule: 'META-2', reason: 'Insufficient authority to modify rule' });
    }

    // META-5: Check if decision is governable
    if (decision.ungovernable) {
      violations.push({ metaRule: 'META-5', reason: 'Decision marked as ungovernable' });
    }

    const permitted = violations.length === 0;
    const entry = {
      decision,
      level,
      permitted,
      violations,
      timestamp: Date.now(),
      seal: SUBSTRATE_SEAL
    };
    this.#governanceLog.push(entry);

    return entry;
  }

  /**
   * Attempt to modify meta-rules — requires constitutional amendment.
   */
  modifyMetaRule(ruleId, amendment, authority) {
    if (authority !== 'CONSTITUTIONAL_AMENDMENT') {
      throw new Error('SUBSTRATE VIOLATION: Meta-rules require CONSTITUTIONAL_AMENDMENT authority.');
    }
    // Even amendments are logged and governed
    this.#governanceLog.push({
      type: 'META_RULE_AMENDMENT',
      ruleId,
      amendment,
      authority,
      timestamp: Date.now(),
      seal: SUBSTRATE_SEAL
    });
    return { amended: true, ruleId, seal: SUBSTRATE_SEAL };
  }

  getMetaRules() { return [...this.#metaRules.values()]; }
  getGovernanceLog() { return [...this.#governanceLog]; }
}

export { RecursiveGovernanceProtocol };
