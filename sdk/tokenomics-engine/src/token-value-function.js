/**
 * Token Value Function — scores each token by the value it contributes.
 *
 * TV(t) = w_d·D_t + w_a·A_t + w_r·R_t + w_c·C_t + w_m·M_t − w_n·N_t
 *
 * Simplified operational form:
 * TV = DQ + ACT + RISK + REUSE + LEARN − WASTE
 *
 * Rule: Do not optimize for fewer tokens. Optimize for higher-value tokens.
 */
export class TokenValueFunction {
  /**
   * @param {object} config
   * @param {object} [config.weights] — dimension weight overrides
   * @param {object} [config.taskProfiles] — predefined weight profiles by task type
   */
  constructor(config = {}) {
    this.defaultWeights = {
      decision: config.weights?.decision ?? 1.0,
      action: config.weights?.action ?? 1.0,
      risk: config.weights?.risk ?? 1.0,
      compression: config.weights?.compression ?? 1.0,
      memory: config.weights?.memory ?? 1.0,
      noise: config.weights?.noise ?? 1.0
    };

    this.taskProfiles = config.taskProfiles ?? {
      invoice: { decision: 0.8, action: 1.5, risk: 1.2, compression: 0.6, memory: 0.5, noise: 1.0 },
      estimating: { decision: 1.2, action: 1.3, risk: 1.0, compression: 0.8, memory: 0.7, noise: 1.0 },
      cashflow: { decision: 1.5, action: 1.2, risk: 1.4, compression: 0.6, memory: 0.5, noise: 1.0 },
      research: { decision: 1.0, action: 0.6, risk: 0.5, compression: 1.5, memory: 1.4, noise: 1.0 },
      architecture: { decision: 1.2, action: 0.8, risk: 1.0, compression: 1.3, memory: 1.3, noise: 1.0 },
      'red-team': { decision: 0.8, action: 0.7, risk: 1.8, compression: 0.5, memory: 1.0, noise: 1.2 },
      memory: { decision: 0.6, action: 0.5, risk: 0.4, compression: 1.2, memory: 1.8, noise: 1.0 },
      proposal: { decision: 1.0, action: 1.4, risk: 0.8, compression: 1.0, memory: 0.8, noise: 1.2 }
    };

    this._evaluations = [];
  }

  /**
   * Get the weight profile for a task type.
   * @param {string} taskType
   * @returns {object} weight profile
   */
  getProfile(taskType) {
    return this.taskProfiles[taskType] ?? { ...this.defaultWeights };
  }

  /**
   * Set a custom weight profile for a task type.
   * @param {string} taskType
   * @param {object} weights — { decision, action, risk, compression, memory, noise }
   */
  setProfile(taskType, weights) {
    if (!taskType) throw new Error('taskType is required');
    this.taskProfiles[taskType] = { ...this.defaultWeights, ...weights };
  }

  /**
   * Evaluate the value of a token (or group of tokens) using the weighted formula.
   *
   * @param {object} dimensions — raw dimension scores (0–5 each)
   * @param {number} dimensions.decision — decision value contributed
   * @param {number} dimensions.action — action usefulness
   * @param {number} dimensions.risk — risk reduction
   * @param {number} dimensions.compression — compression contribution
   * @param {number} dimensions.memory — memory / reuse value
   * @param {number} dimensions.noise — noise, redundancy, attention waste
   * @param {string} [taskType] — task type to use profile weights; uses defaults if omitted
   * @returns {object} evaluation result
   */
  evaluate(dimensions, taskType) {
    const w = this.getProfile(taskType);
    const maxDim = 5;

    const d = Math.min(maxDim, Math.max(0, dimensions.decision ?? 0));
    const a = Math.min(maxDim, Math.max(0, dimensions.action ?? 0));
    const r = Math.min(maxDim, Math.max(0, dimensions.risk ?? 0));
    const c = Math.min(maxDim, Math.max(0, dimensions.compression ?? 0));
    const m = Math.min(maxDim, Math.max(0, dimensions.memory ?? 0));
    const n = Math.min(maxDim, Math.max(0, dimensions.noise ?? 0));

    const tokenValue =
      w.decision * d +
      w.action * a +
      w.risk * r +
      w.compression * c +
      w.memory * m -
      w.noise * n;

    const maxPossible =
      w.decision * maxDim +
      w.action * maxDim +
      w.risk * maxDim +
      w.compression * maxDim +
      w.memory * maxDim;

    const result = {
      dimensions: { decision: d, action: a, risk: r, compression: c, memory: m, noise: n },
      weights: { ...w },
      taskType: taskType ?? 'default',
      tokenValue,
      maxPossible,
      efficiency: maxPossible > 0 ? tokenValue / maxPossible : 0,
      isPositive: tokenValue > 0,
      timestamp: Date.now()
    };

    this._evaluations.push(result);
    return result;
  }

  /**
   * Batch evaluate multiple tokens/segments.
   * @param {Array<object>} segments — array of { dimensions, taskType? }
   * @returns {object} aggregate result
   */
  evaluateBatch(segments) {
    if (!segments || segments.length === 0) {
      return { segments: [], totalValue: 0, averageValue: 0, positiveRate: 0 };
    }

    const results = segments.map(s => this.evaluate(s.dimensions, s.taskType));
    const totalValue = results.reduce((sum, r) => sum + r.tokenValue, 0);
    const positives = results.filter(r => r.isPositive).length;

    return {
      segments: results,
      totalValue,
      averageValue: totalValue / results.length,
      positiveRate: positives / results.length,
      negativeTokens: results.length - positives
    };
  }

  /**
   * Get evaluation history.
   */
  getHistory() {
    return [...this._evaluations];
  }

  /**
   * Get all registered task profiles.
   */
  getProfiles() {
    return { ...this.taskProfiles };
  }

  /**
   * Reset evaluation history.
   */
  reset() {
    this._evaluations = [];
  }
}
