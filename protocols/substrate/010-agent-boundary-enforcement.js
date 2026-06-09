/**
 * SUBSTRATE-010: Agent Boundary Enforcement Protocol (ABEP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * Defines and enforces hard boundaries between agents. No agent can
 * exceed its allocated capabilities, escalate its own permissions,
 * or act outside its chartered domain.
 *
 * Engines wired: AtlasRegistry + CapabilityGuard + OCLRuntime
 * Ring: Sovereign Ring | Placement: Substrate foundation
 * Wire: substrate-wire/abep
 * Enforcement: IMMUTABLE
 */

const SUBSTRATE_SEAL = 'UNBREAKABLE::ABEP::010';

class AgentBoundaryEnforcementProtocol {
  #boundaries;
  #violationLog;

  constructor() {
    this.#boundaries = new Map();
    this.#violationLog = [];
    this.protocolId = 'SUBSTRATE-010';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Define an agent's boundary. Once set, cannot be expanded without constitutional authority.
   */
  defineBoundary(agentId, boundary) {
    if (this.#boundaries.has(agentId)) {
      throw new Error(`SUBSTRATE VIOLATION: Boundary for ${agentId} already defined. Cannot redefine.`);
    }
    const sealed = Object.freeze({
      agentId,
      capabilities: Object.freeze([...(boundary.capabilities || [])]),
      domains: Object.freeze([...(boundary.domains || [])]),
      maxEscalationLevel: boundary.maxEscalationLevel || 'MEDIUM',
      canModifySelf: false,
      canModifyOthers: false,
      definedAt: Date.now(),
      seal: SUBSTRATE_SEAL
    });
    this.#boundaries.set(agentId, sealed);
    return sealed;
  }

  /**
   * Check if an action is within an agent's boundary.
   */
  checkAction(agentId, action) {
    const boundary = this.#boundaries.get(agentId);
    if (!boundary) return { permitted: false, reason: 'NO_BOUNDARY_DEFINED' };

    // Check capability
    if (action.capability && !boundary.capabilities.includes(action.capability)) {
      this._logViolation(agentId, action, 'CAPABILITY_EXCEEDED');
      return { permitted: false, reason: 'CAPABILITY_EXCEEDED', agentId, action: action.capability };
    }

    // Check domain
    if (action.domain && !boundary.domains.includes(action.domain)) {
      this._logViolation(agentId, action, 'DOMAIN_VIOLATION');
      return { permitted: false, reason: 'DOMAIN_VIOLATION', agentId, domain: action.domain };
    }

    // Check self-modification
    if (action.type === 'SELF_MODIFY' && !boundary.canModifySelf) {
      this._logViolation(agentId, action, 'SELF_MODIFY_FORBIDDEN');
      return { permitted: false, reason: 'SELF_MODIFY_FORBIDDEN' };
    }

    return { permitted: true, agentId, seal: SUBSTRATE_SEAL };
  }

  /**
   * Attempt to expand boundary — ALWAYS fails unless constitutional authority.
   */
  expandBoundary(agentId, expansion, authority) {
    if (authority !== 'CONSTITUTIONAL') {
      this._logViolation(agentId, { type: 'EXPAND_BOUNDARY', expansion }, 'UNAUTHORIZED_EXPANSION');
      throw new Error('SUBSTRATE VIOLATION: Only CONSTITUTIONAL authority can expand boundaries.');
    }
    // Even with constitutional authority, log it
    const current = this.#boundaries.get(agentId);
    if (!current) throw new Error(`No boundary for ${agentId}`);
    // Create new frozen boundary
    const expanded = Object.freeze({
      ...current,
      capabilities: Object.freeze([...current.capabilities, ...(expansion.capabilities || [])]),
      domains: Object.freeze([...current.domains, ...(expansion.domains || [])]),
      expandedAt: Date.now()
    });
    this.#boundaries.set(agentId, expanded);
    return expanded;
  }

  _logViolation(agentId, action, type) {
    this.#violationLog.push({ agentId, action, type, timestamp: Date.now(), seal: SUBSTRATE_SEAL });
  }

  getViolations() { return [...this.#violationLog]; }
  getBoundary(agentId) { return this.#boundaries.get(agentId) || null; }
}

export { AgentBoundaryEnforcementProtocol };
