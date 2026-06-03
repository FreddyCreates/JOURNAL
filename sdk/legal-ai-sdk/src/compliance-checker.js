const PHI = 1.618033988749895;

/**
 * @typedef {Object} ComplianceRule
 * @property {string} ruleId
 * @property {string} regulation
 * @property {string} jurisdiction
 * @property {string} category
 * @property {Function} condition
 * @property {string} severity
 * @property {number} registeredAt
 */

/**
 * @typedef {Object} Violation
 * @property {string} ruleId
 * @property {string} regulation
 * @property {string} category
 * @property {string} severity
 * @property {string} description
 * @property {number} detectedAt
 */

/**
 * ComplianceChecker — AI regulatory compliance checking with rule-based
 * analysis. Registers compliance rules with condition functions, checks
 * entity data against them, and generates phi-weighted compliance reports
 * with risk scores across multiple regulatory frameworks.
 */
export class ComplianceChecker {
  /** @type {Map<string, ComplianceRule>} */
  #rules;

  /** @type {Violation[]} */
  #violations;

  /** @type {string[]} */
  #validCategories;

  /** @type {string[]} */
  #validSeverities;

  /** @type {number} */
  #checkCount;

  /** @type {number} */
  #reportCount;

  constructor() {
    this.#rules = new Map();
    this.#violations = [];
    this.#validCategories = [
      'gdpr', 'hipaa', 'sox', 'pci-dss', 'ccpa',
      'aml', 'kyc', 'sec', 'osha',
    ];
    this.#validSeverities = ['critical', 'high', 'medium', 'low'];
    this.#checkCount = 0;
    this.#reportCount = 0;
  }

  /**
   * Registers a compliance rule with a condition function.
   *
   * The condition function receives entity data and returns true if
   * the entity violates the rule. Severity controls the phi-weighted
   * impact on the overall compliance score.
   *
   * @param {string} ruleId — unique rule identifier
   * @param {Object} config — rule configuration
   * @param {string} config.regulation — regulation name
   * @param {string} config.jurisdiction — applicable jurisdiction
   * @param {string} config.category — regulatory category
   * @param {Function} config.condition — violation test: (entityData) => boolean
   * @param {string} config.severity — violation severity
   * @param {string} [config.description] — human-readable description
   * @returns {{ ruleId: string, category: string, severity: string, registeredAt: number }}
   */
  registerRule(ruleId, config) {
    if (this.#rules.has(ruleId)) {
      throw new Error(`Rule "${ruleId}" already registered.`);
    }
    if (!this.#validCategories.includes(config.category)) {
      throw new Error(`Invalid category "${config.category}". Valid: ${this.#validCategories.join(', ')}`);
    }
    if (!this.#validSeverities.includes(config.severity)) {
      throw new Error(`Invalid severity "${config.severity}". Valid: ${this.#validSeverities.join(', ')}`);
    }
    if (typeof config.condition !== 'function') {
      throw new Error('Condition must be a function.');
    }

    const rule = {
      ruleId,
      regulation: config.regulation,
      jurisdiction: config.jurisdiction ?? 'global',
      category: config.category,
      condition: config.condition,
      severity: config.severity,
      description: config.description ?? `Compliance rule ${ruleId}`,
      registeredAt: Date.now(),
    };

    this.#rules.set(ruleId, rule);
    return { ruleId, category: rule.category, severity: rule.severity, registeredAt: rule.registeredAt };
  }

  /**
   * Checks entity data against specified rules.
   *
   * Each rule's condition function is invoked with the entity data.
   * If the condition returns true, a violation is recorded.
   *
   * @param {Object} entityData — entity data to check
   * @param {string[]} ruleIds — list of rule IDs to check against
   * @returns {Violation[]}
   */
  check(entityData, ruleIds) {
    this.#checkCount++;
    const found = [];

    for (const ruleId of ruleIds) {
      const rule = this.#rules.get(ruleId);
      if (!rule) throw new Error(`Rule "${ruleId}" not found.`);

      if (rule.condition(entityData)) {
        const violation = {
          ruleId: rule.ruleId,
          regulation: rule.regulation,
          category: rule.category,
          severity: rule.severity,
          description: rule.description,
          detectedAt: Date.now(),
        };
        found.push(violation);
        this.#violations.push(violation);
      }
    }

    return found;
  }

  /**
   * Checks entity data against all registered rules.
   *
   * @param {Object} entityData — entity data to check
   * @returns {Violation[]}
   */
  checkAll(entityData) {
    return this.check(entityData, [...this.#rules.keys()]);
  }

  /**
   * Returns violations filtered by severity.
   *
   * @param {string} severity — severity level to filter
   * @returns {Violation[]}
   */
  getViolations(severity) {
    if (!this.#validSeverities.includes(severity)) {
      throw new Error(`Invalid severity "${severity}". Valid: ${this.#validSeverities.join(', ')}`);
    }
    return this.#violations.filter((v) => v.severity === severity);
  }

  /**
   * Generates a full compliance report with phi-weighted risk score.
   *
   * The report breaks down violations by category and severity, then
   * computes an overall risk score where critical violations are
   * weighted by PHI^3, high by PHI^2, medium by PHI, and low by 1.
   *
   * @param {string} entityId — entity identifier for the report
   * @param {Object} entityData — entity data to check
   * @returns {{ entityId: string, generatedAt: number, violations: Violation[], riskScore: number, breakdown: Object, recommendation: string }}
   */
  generateReport(entityId, entityData) {
    this.#reportCount++;
    const violations = this.checkAll(entityData);

    const breakdown = { byCategory: {}, bySeverity: {} };
    for (const v of violations) {
      breakdown.byCategory[v.category] = (breakdown.byCategory[v.category] ?? 0) + 1;
      breakdown.bySeverity[v.severity] = (breakdown.bySeverity[v.severity] ?? 0) + 1;
    }

    const severityWeights = {
      critical: PHI * PHI * PHI,
      high: PHI * PHI,
      medium: PHI,
      low: 1,
    };

    let weightedSum = 0;
    let maxPossible = 0;
    for (const rule of this.#rules.values()) {
      const w = severityWeights[rule.severity] ?? 1;
      maxPossible += w;
    }
    for (const v of violations) {
      weightedSum += severityWeights[v.severity] ?? 1;
    }

    const riskScore = maxPossible > 0
      ? Math.round((weightedSum / maxPossible) * 10000) / 10000
      : 0;

    let recommendation;
    if (riskScore > 1 / PHI) {
      recommendation = 'Immediate remediation required. Engage compliance counsel.';
    } else if (riskScore > 1 / (PHI * PHI)) {
      recommendation = 'Significant gaps detected. Prioritize corrective actions.';
    } else if (riskScore > 0) {
      recommendation = 'Minor issues found. Schedule routine review.';
    } else {
      recommendation = 'Full compliance achieved. Maintain current controls.';
    }

    return { entityId, generatedAt: Date.now(), violations, riskScore, breakdown, recommendation };
  }

  /**
   * Returns an overall compliance score from 0 to 1.
   *
   * A score of 1 means full compliance; 0 means total non-compliance.
   * The score is the inverse of the phi-weighted risk score.
   *
   * @param {Object} entityData — entity data to check
   * @returns {{ score: number, totalRules: number, violationCount: number }}
   */
  getComplianceScore(entityData) {
    const violations = this.checkAll(entityData);

    const severityWeights = {
      critical: PHI * PHI * PHI,
      high: PHI * PHI,
      medium: PHI,
      low: 1,
    };

    let weightedSum = 0;
    let maxPossible = 0;
    for (const rule of this.#rules.values()) {
      maxPossible += severityWeights[rule.severity] ?? 1;
    }
    for (const v of violations) {
      weightedSum += severityWeights[v.severity] ?? 1;
    }

    const riskRatio = maxPossible > 0 ? weightedSum / maxPossible : 0;
    const score = Math.round((1 - riskRatio) * 10000) / 10000;

    return { score: Math.max(0, score), totalRules: this.#rules.size, violationCount: violations.length };
  }

  /**
   * Returns aggregate checking statistics.
   *
   * @returns {{ totalRules: number, totalViolations: number, checkCount: number, reportCount: number, rulesByCategory: Object }}
   */
  getStats() {
    const rulesByCategory = {};
    for (const r of this.#rules.values()) {
      rulesByCategory[r.category] = (rulesByCategory[r.category] ?? 0) + 1;
    }
    return {
      totalRules: this.#rules.size,
      totalViolations: this.#violations.length,
      checkCount: this.#checkCount,
      reportCount: this.#reportCount,
      rulesByCategory,
    };
  }
}

export default ComplianceChecker;
