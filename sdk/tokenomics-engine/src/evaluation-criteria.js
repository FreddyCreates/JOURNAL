/**
 * Evaluation Criteria — Section 15.7 maturity scoring for tokenomic systems.
 *
 * Criteria:
 * | Criterion                  | Definition                                                     |
 * | Cognitive Return Per Token | Useful cognition generated per total token spent                |
 * | Compression Fidelity       | Degree to which compressed output preserves meaning             |
 * | Action Conversion Rate     | Percentage of outputs that lead directly to correct action      |
 * | Risk Preservation          | Ability to stay concise without hiding important uncertainty    |
 * | Reuse Extraction Rate      | Frequency of converting interactions into reusable memory       |
 * | Context Hygiene            | Ability to avoid polluting context with irrelevant info         |
 * | Adaptive Depth Accuracy    | Ability to expand or compress based on task stakes              |
 * | Error Avoidance            | Ability to prevent math, scope, logic, or operational mistakes  |
 */
export class EvaluationCriteria {
  constructor(config = {}) {
    this.criteria = [
      { id: 'crpt', label: 'Cognitive Return Per Token', maxScore: 5 },
      { id: 'compression-fidelity', label: 'Compression Fidelity', maxScore: 5 },
      { id: 'action-conversion', label: 'Action Conversion Rate', maxScore: 5 },
      { id: 'risk-preservation', label: 'Risk Preservation', maxScore: 5 },
      { id: 'reuse-extraction', label: 'Reuse Extraction Rate', maxScore: 5 },
      { id: 'context-hygiene', label: 'Context Hygiene', maxScore: 5 },
      { id: 'adaptive-depth', label: 'Adaptive Depth Accuracy', maxScore: 5 },
      { id: 'error-avoidance', label: 'Error Avoidance', maxScore: 5 }
    ];
    this.weights = config.weights ?? {};
    this._assessments = [];
  }

  /**
   * Get all criteria definitions.
   */
  getCriteria() {
    return [...this.criteria];
  }

  /**
   * Assess a system against all criteria.
   * @param {object} scores — { crpt, compressionFidelity, actionConversion, riskPreservation,
   *                            reuseExtraction, contextHygiene, adaptiveDepth, errorAvoidance }
   *   each value 0–5
   * @param {object} [meta] — optional metadata { systemId, taskType, notes }
   * @returns {object} assessment result
   */
  assess(scores, meta = {}) {
    if (!scores || typeof scores !== 'object') {
      throw new Error('scores object is required');
    }

    const maxScore = 5;
    const dimensions = {
      crpt: clamp(scores.crpt ?? 0, 0, maxScore),
      compressionFidelity: clamp(scores.compressionFidelity ?? 0, 0, maxScore),
      actionConversion: clamp(scores.actionConversion ?? 0, 0, maxScore),
      riskPreservation: clamp(scores.riskPreservation ?? 0, 0, maxScore),
      reuseExtraction: clamp(scores.reuseExtraction ?? 0, 0, maxScore),
      contextHygiene: clamp(scores.contextHygiene ?? 0, 0, maxScore),
      adaptiveDepth: clamp(scores.adaptiveDepth ?? 0, 0, maxScore),
      errorAvoidance: clamp(scores.errorAvoidance ?? 0, 0, maxScore)
    };

    const w = {
      crpt: this.weights.crpt ?? 1.0,
      compressionFidelity: this.weights.compressionFidelity ?? 1.0,
      actionConversion: this.weights.actionConversion ?? 1.0,
      riskPreservation: this.weights.riskPreservation ?? 1.0,
      reuseExtraction: this.weights.reuseExtraction ?? 1.0,
      contextHygiene: this.weights.contextHygiene ?? 1.0,
      adaptiveDepth: this.weights.adaptiveDepth ?? 1.0,
      errorAvoidance: this.weights.errorAvoidance ?? 1.0
    };

    const weightedTotal =
      w.crpt * dimensions.crpt +
      w.compressionFidelity * dimensions.compressionFidelity +
      w.actionConversion * dimensions.actionConversion +
      w.riskPreservation * dimensions.riskPreservation +
      w.reuseExtraction * dimensions.reuseExtraction +
      w.contextHygiene * dimensions.contextHygiene +
      w.adaptiveDepth * dimensions.adaptiveDepth +
      w.errorAvoidance * dimensions.errorAvoidance;

    const totalWeight = Object.values(w).reduce((s, v) => s + v, 0);
    const maxWeightedTotal = totalWeight * maxScore;
    const normalizedScore = maxWeightedTotal > 0 ? weightedTotal / maxWeightedTotal : 0;

    const rawTotal = Object.values(dimensions).reduce((s, v) => s + v, 0);
    const rawMax = this.criteria.length * maxScore;

    const maturityLevel = getMaturityLevel(normalizedScore);

    const assessment = {
      dimensions,
      weights: w,
      weightedTotal,
      rawTotal,
      rawMax,
      normalizedScore,
      maturityLevel,
      strengths: getStrengths(dimensions),
      weaknesses: getWeaknesses(dimensions),
      meta: {
        systemId: meta.systemId ?? null,
        taskType: meta.taskType ?? null,
        notes: meta.notes ?? null
      },
      timestamp: Date.now()
    };

    this._assessments.push(assessment);
    return assessment;
  }

  /**
   * Compare two system assessments.
   * @param {object} scoresA — baseline scores
   * @param {object} scoresB — tokenomic scores
   * @returns {object} comparison result
   */
  compare(scoresA, scoresB) {
    const assessA = this.assess(scoresA, { systemId: 'baseline' });
    const assessB = this.assess(scoresB, { systemId: 'tokenomic' });

    const improvements = {};
    for (const key of Object.keys(assessA.dimensions)) {
      improvements[key] = assessB.dimensions[key] - assessA.dimensions[key];
    }

    return {
      baseline: assessA,
      tokenomic: assessB,
      improvements,
      overallGain: assessB.normalizedScore - assessA.normalizedScore,
      isImprovement: assessB.normalizedScore > assessA.normalizedScore,
      biggestGain: Object.entries(improvements).sort((a, b) => b[1] - a[1])[0],
      biggestLoss: Object.entries(improvements).sort((a, b) => a[1] - b[1])[0]
    };
  }

  /**
   * Get assessment history.
   */
  getHistory() {
    return [...this._assessments];
  }

  /**
   * Get average scores across all assessments.
   */
  getAverages() {
    if (this._assessments.length === 0) return null;

    const sums = {};
    for (const a of this._assessments) {
      for (const [key, val] of Object.entries(a.dimensions)) {
        sums[key] = (sums[key] ?? 0) + val;
      }
    }

    const averages = {};
    for (const [key, total] of Object.entries(sums)) {
      averages[key] = total / this._assessments.length;
    }

    return averages;
  }

  /**
   * Set criterion weights.
   */
  setWeights(weights) {
    Object.assign(this.weights, weights);
  }

  /**
   * Reset assessment history.
   */
  reset() {
    this._assessments = [];
  }
}

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

function getMaturityLevel(normalizedScore) {
  if (normalizedScore >= 0.9) return 'sovereign';
  if (normalizedScore >= 0.75) return 'advanced';
  if (normalizedScore >= 0.55) return 'operational';
  if (normalizedScore >= 0.35) return 'developing';
  return 'nascent';
}

function getStrengths(dimensions) {
  return Object.entries(dimensions)
    .filter(([, v]) => v >= 4)
    .map(([k]) => k)
    .sort();
}

function getWeaknesses(dimensions) {
  return Object.entries(dimensions)
    .filter(([, v]) => v <= 2)
    .map(([k]) => k)
    .sort();
}
