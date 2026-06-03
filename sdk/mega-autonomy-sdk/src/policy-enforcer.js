import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class PolicyEnforcer {
  constructor(config = {}) {
    this.strictMode = config.strictMode ?? true;
    this._policies = new Map();
    this.enforcementLevel = config.enforcementLevel ?? 'standard';
    this.phiTolerance = config.phiTolerance ?? (1 / PHI);
    this._log = [];
  }

  addPolicy(name, condition, action) {
    const policyId = crypto.randomUUID();
    const priority = Math.pow(PHI, -this._policies.size);
    const entry = { policyId, name, condition, action, priority, active: true, createdAt: Date.now() };
    this._policies.set(policyId, entry);
    return { policyId, name, priority, active: true };
  }

  enforce(event) {
    const violations = [];
    const actionsTriggered = [];
    for (const [, policy] of this._policies) {
      if (!policy.active) continue;
      const eventStr = JSON.stringify(event);
      const condStr = typeof policy.condition === 'string' ? policy.condition : JSON.stringify(policy.condition);
      if (eventStr.includes(condStr) || condStr === '*') {
        violations.push({ policyId: policy.policyId, severity: this.strictMode ? 'high' : 'low' });
        actionsTriggered.push(policy.action);
      }
    }
    const compliant = violations.length === 0;
    const entry = { eventId: crypto.randomUUID(), event, violations, compliant, actionsTriggered, timestamp: Date.now() };
    this._log.push(entry);
    return { eventId: entry.eventId, violations, compliant, actionsTriggered };
  }

  getPolicy(policyId) { return this._policies.get(policyId) ?? null; }
  getPolicies() { return [...this._policies.values()]; }
  togglePolicy(policyId, active) {
    const p = this._policies.get(policyId);
    if (!p) throw new Error('Policy not found');
    p.active = active;
    return { policyId, active };
  }
  getEnforcementLog() { return [...this._log]; }
}
