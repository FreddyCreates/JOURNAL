/**
 * Policy Engine Protocol
 * 
 * Governs how policies are created, evaluated, enforced, versioned, and retired.
 * Provides the rule engine for all governance decisions across the organism.
 * 
 * Protocol ID: GOV-POLICY-001
 * Layer: Governance Macro
 * Authority: CIVOS PRIME
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

export class PolicyEngineProtocol {
  constructor() {
    this.id = 'GOV-POLICY-001';
    this.name = 'Policy Engine Protocol';
    this.version = '1.0.0';
    this.status = 'ACTIVE';
    this.policies = new Map();
    this.evaluations = [];
    this.enforcementLog = [];
    this._counter = 0;
  }

  /**
   * Register a new policy
   */
  registerPolicy(policyId, definition) {
    if (this.policies.has(policyId)) {
      return { success: false, reason: 'Policy already exists' };
    }
    const policy = {
      id: policyId,
      name: definition.name || policyId,
      version: definition.version || '1.0.0',
      status: 'draft',
      scope: definition.scope || 'global',
      rules: definition.rules || [],
      conditions: definition.conditions || [],
      actions: definition.actions || [],
      priority: definition.priority || 0,
      createdAt: new Date().toISOString(),
      activatedAt: null,
      retiredAt: null,
      evaluationCount: 0,
      violationCount: 0,
    };
    this.policies.set(policyId, policy);
    return { success: true, policy };
  }

  /**
   * Activate a policy (move from draft to enforced)
   */
  activatePolicy(policyId) {
    const policy = this.policies.get(policyId);
    if (!policy) return { success: false, reason: 'Policy not found' };
    if (policy.rules.length === 0) return { success: false, reason: 'Policy has no rules' };
    policy.status = 'active';
    policy.activatedAt = new Date().toISOString();
    return { success: true, policy };
  }

  /**
   * Retire a policy
   */
  retirePolicy(policyId, reason = 'superseded') {
    const policy = this.policies.get(policyId);
    if (!policy) return { success: false, reason: 'Policy not found' };
    policy.status = 'retired';
    policy.retiredAt = new Date().toISOString();
    policy.retirementReason = reason;
    return { success: true };
  }

  /**
   * Evaluate a context against all active policies
   */
  evaluate(context) {
    const activePolicies = [...this.policies.values()]
      .filter(p => p.status === 'active')
      .sort((a, b) => b.priority - a.priority);

    const results = [];
    for (const policy of activePolicies) {
      policy.evaluationCount++;
      const result = this._evaluatePolicy(policy, context);
      results.push(result);
      if (!result.passed) {
        policy.violationCount++;
      }
    }

    const evaluation = {
      id: `EVAL-${Date.now()}-${this._counter++}`,
      timestamp: new Date().toISOString(),
      context: typeof context === 'object' ? { ...context } : context,
      results,
      allPassed: results.every(r => r.passed),
      violations: results.filter(r => !r.passed),
    };
    this.evaluations.push(evaluation);
    return evaluation;
  }

  /**
   * Enforce a policy action
   */
  enforce(policyId, action, target) {
    const policy = this.policies.get(policyId);
    if (!policy) return { success: false, reason: 'Policy not found' };

    const enforcement = {
      id: `ENF-${Date.now()}`,
      policyId,
      action,
      target,
      timestamp: new Date().toISOString(),
      status: 'applied',
    };
    this.enforcementLog.push(enforcement);
    return { success: true, enforcement };
  }

  /**
   * Get policy compliance score
   */
  getComplianceScore() {
    const active = [...this.policies.values()].filter(p => p.status === 'active');
    if (active.length === 0) return { score: 1.0, status: 'no-policies' };

    const totalEvals = active.reduce((sum, p) => sum + p.evaluationCount, 0);
    const totalViolations = active.reduce((sum, p) => sum + p.violationCount, 0);

    if (totalEvals === 0) return { score: 1.0, status: 'unevaluated' };

    const complianceRatio = 1 - (totalViolations / totalEvals);
    return {
      score: complianceRatio,
      status: complianceRatio >= PHI_INV ? 'compliant' : 'non-compliant',
      totalEvaluations: totalEvals,
      totalViolations,
      activePolicies: active.length,
    };
  }

  /**
   * List all policies by status
   */
  listPolicies(status = null) {
    let policies = [...this.policies.values()];
    if (status) policies = policies.filter(p => p.status === status);
    return policies.map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      priority: p.priority,
      rules: p.rules.length,
      evaluations: p.evaluationCount,
      violations: p.violationCount,
    }));
  }

  _evaluatePolicy(policy, context) {
    const ruleResults = policy.rules.map(rule => {
      const passed = this._evaluateRule(rule, context);
      return { rule: rule.id || rule.name, passed };
    });

    return {
      policyId: policy.id,
      policyName: policy.name,
      passed: ruleResults.every(r => r.passed),
      ruleResults,
    };
  }

  _evaluateRule(rule, context) {
    if (typeof rule.condition === 'function') {
      try { return rule.condition(context); } catch { return false; }
    }
    if (rule.field && rule.operator && rule.value !== undefined) {
      const fieldValue = context[rule.field];
      switch (rule.operator) {
        case 'eq': return fieldValue === rule.value;
        case 'neq': return fieldValue !== rule.value;
        case 'gt': return fieldValue > rule.value;
        case 'gte': return fieldValue >= rule.value;
        case 'lt': return fieldValue < rule.value;
        case 'lte': return fieldValue <= rule.value;
        case 'in': return Array.isArray(rule.value) && rule.value.includes(fieldValue);
        case 'contains': return typeof fieldValue === 'string' && fieldValue.includes(rule.value);
        case 'exists': return fieldValue !== undefined && fieldValue !== null;
        default: return false;
      }
    }
    return true; // If rule has no evaluable condition, pass by default
  }
}

export default PolicyEngineProtocol;
