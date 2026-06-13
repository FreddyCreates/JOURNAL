/**
 * Ethics Framework Protocol
 * 
 * Governs ethical constraints, bias detection, fairness metrics, transparency
 * requirements, harm prevention, and accountability across the organism.
 * 
 * Protocol ID: GOV-ETHICS-001
 * Layer: Governance Macro
 * Authority: CIVOS PRIME + SENTINEL + Human Sovereign
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

export class EthicsFrameworkProtocol {
  constructor() {
    this.id = 'GOV-ETHICS-001';
    this.name = 'Ethics Framework Protocol';
    this.version = '1.0.0';
    this.status = 'ACTIVE';
    this.principles = new Map();
    this.assessments = [];
    this.violations = [];
    this.constraints = [];
    this._counter = 0;
  }

  /**
   * Register an ethical principle
   */
  registerPrinciple(principleId, definition) {
    const principle = {
      id: principleId,
      name: definition.name,
      category: definition.category || 'general',
      description: definition.description || '',
      weight: definition.weight || 1.0,
      mandatory: definition.mandatory !== false,
      registeredAt: new Date().toISOString(),
    };
    this.principles.set(principleId, principle);
    return { success: true, principle };
  }

  /**
   * Add ethical constraint (hard limit that cannot be violated)
   */
  addConstraint(constraint) {
    const c = {
      id: `CONSTRAINT-${Date.now()}-${this.constraints.length}`,
      name: constraint.name,
      type: constraint.type || 'prohibition', // prohibition, obligation, permission
      scope: constraint.scope || 'global',
      condition: constraint.condition || null,
      severity: constraint.severity || 'critical',
      createdAt: new Date().toISOString(),
    };
    this.constraints.push(c);
    return c;
  }

  /**
   * Assess an action against ethical principles
   */
  assess(action) {
    const results = [];
    let totalWeight = 0;
    let passedWeight = 0;

    for (const [id, principle] of this.principles) {
      totalWeight += principle.weight;
      const passed = this._checkPrinciple(principle, action);
      if (passed) passedWeight += principle.weight;
      results.push({
        principleId: id,
        principleName: principle.name,
        passed,
        mandatory: principle.mandatory,
        weight: principle.weight,
      });
    }

    const constraintResults = this.constraints.map(c => ({
      constraintId: c.id,
      name: c.name,
      respected: this._checkConstraint(c, action),
      severity: c.severity,
    }));

    const mandatoryViolations = results.filter(r => r.mandatory && !r.passed);
    const constraintViolations = constraintResults.filter(r => !r.respected);
    const ethicsScore = totalWeight > 0 ? passedWeight / totalWeight : 1.0;

    const assessment = {
      id: `ASSESS-${Date.now()}-${this._counter++}`,
      timestamp: new Date().toISOString(),
      action: typeof action === 'object' ? { ...action } : { description: action },
      principleResults: results,
      constraintResults,
      ethicsScore,
      approved: mandatoryViolations.length === 0 && constraintViolations.length === 0,
      mandatoryViolations: mandatoryViolations.length,
      constraintViolations: constraintViolations.length,
    };

    this.assessments.push(assessment);

    if (!assessment.approved) {
      this.violations.push({
        assessmentId: assessment.id,
        timestamp: assessment.timestamp,
        mandatoryViolations,
        constraintViolations,
      });
    }

    return assessment;
  }

  /**
   * Get fairness metrics
   */
  getFairnessMetrics() {
    if (this.assessments.length === 0) return { score: 1.0, status: 'no-data' };
    const approved = this.assessments.filter(a => a.approved).length;
    const ratio = approved / this.assessments.length;
    return {
      score: ratio,
      status: ratio >= PHI_INV ? 'fair' : 'concerning',
      totalAssessments: this.assessments.length,
      approved,
      rejected: this.assessments.length - approved,
      averageEthicsScore: this.assessments.reduce((s, a) => s + a.ethicsScore, 0) / this.assessments.length,
    };
  }

  /**
   * Get transparency report
   */
  getTransparencyReport() {
    return {
      protocolId: this.id,
      version: this.version,
      totalPrinciples: this.principles.size,
      totalConstraints: this.constraints.length,
      totalAssessments: this.assessments.length,
      totalViolations: this.violations.length,
      principles: [...this.principles.values()].map(p => ({
        id: p.id, name: p.name, category: p.category, mandatory: p.mandatory
      })),
      constraints: this.constraints.map(c => ({
        id: c.id, name: c.name, type: c.type, severity: c.severity
      })),
      fairness: this.getFairnessMetrics(),
    };
  }

  /**
   * Check for bias in assessments
   */
  detectBias(groupField) {
    if (this.assessments.length < 2) return { biasDetected: false, reason: 'insufficient-data' };
    const groups = {};
    for (const assessment of this.assessments) {
      const group = assessment.action[groupField] || 'unknown';
      if (!groups[group]) groups[group] = { total: 0, approved: 0 };
      groups[group].total++;
      if (assessment.approved) groups[group].approved++;
    }

    const rates = Object.entries(groups).map(([group, data]) => ({
      group,
      approvalRate: data.total > 0 ? data.approved / data.total : 0,
      ...data,
    }));

    if (rates.length < 2) return { biasDetected: false, reason: 'single-group' };

    const maxRate = Math.max(...rates.map(r => r.approvalRate));
    const minRate = Math.min(...rates.map(r => r.approvalRate));
    const disparity = maxRate - minRate;

    return {
      biasDetected: disparity > (1 - PHI_INV), // Bias if disparity exceeds 0.382
      disparity,
      threshold: 1 - PHI_INV,
      groups: rates,
    };
  }

  _checkPrinciple(principle, action) {
    if (principle.category === 'harm-prevention') {
      return !action.causesHarm;
    }
    if (principle.category === 'transparency') {
      return action.isTransparent !== false;
    }
    if (principle.category === 'consent') {
      return action.hasConsent !== false;
    }
    if (principle.category === 'fairness') {
      return action.isFair !== false;
    }
    if (principle.category === 'privacy') {
      return action.respectsPrivacy !== false;
    }
    if (principle.category === 'accountability') {
      return action.hasAccountability !== false;
    }
    return true;
  }

  _checkConstraint(constraint, action) {
    if (constraint.type === 'prohibition') {
      if (constraint.name.includes('harm') && action.causesHarm) return false;
      if (constraint.name.includes('discriminat') && action.isDiscriminatory) return false;
      if (constraint.name.includes('deception') && action.isDeceptive) return false;
    }
    if (constraint.type === 'obligation') {
      if (constraint.name.includes('transparency') && !action.isTransparent) return false;
      if (constraint.name.includes('consent') && !action.hasConsent) return false;
    }
    return true;
  }
}

export default EthicsFrameworkProtocol;
