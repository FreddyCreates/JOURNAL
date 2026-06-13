import crypto from 'node:crypto';

/**
 * Cognitive Return Scorer — scores output usefulness after generation.
 * 
 * TV = DQ + ACT + RISK + REUSE + LEARN − WASTE
 * CRPT = TV / TotalTokens
 * 
 * Each dimension scored 0–5.
 */
export class CognitiveReturnScorer {
  constructor(config = {}) {
    this.dimensions = config.dimensions ?? [
      'decisionQuality',
      'actionability',
      'riskControl',
      'reuseValue',
      'learningGain'
    ];
    this.maxScore = config.maxScore ?? 5;
    this._scores = [];
  }

  /**
   * Score an output's cognitive return.
   * @param {object} scores — { decisionQuality, actionability, riskControl, reuseValue, learningGain, waste }
   * @param {number} totalTokens — total tokens used (prompt + output)
   * @returns {object} scored result with TV and CRPT
   */
  score(scores, totalTokens) {
    if (!totalTokens || totalTokens <= 0) {
      throw new Error('totalTokens must be a positive number');
    }

    const dq = Math.min(this.maxScore, Math.max(0, scores.decisionQuality ?? 0));
    const act = Math.min(this.maxScore, Math.max(0, scores.actionability ?? 0));
    const risk = Math.min(this.maxScore, Math.max(0, scores.riskControl ?? 0));
    const reuse = Math.min(this.maxScore, Math.max(0, scores.reuseValue ?? 0));
    const learn = Math.min(this.maxScore, Math.max(0, scores.learningGain ?? 0));
    const waste = Math.min(this.maxScore, Math.max(0, scores.waste ?? 0));

    const tokenValue = dq + act + risk + reuse + learn - waste;
    const crpt = tokenValue / totalTokens;

    const result = {
      scoreId: crypto.randomUUID(),
      dimensions: { decisionQuality: dq, actionability: act, riskControl: risk, reuseValue: reuse, learningGain: learn, waste },
      tokenValue,
      totalTokens,
      crpt,
      maxPossibleTV: this.maxScore * this.dimensions.length,
      efficiency: tokenValue / (this.maxScore * this.dimensions.length),
      timestamp: Date.now()
    };

    this._scores.push(result);
    return result;
  }

  /**
   * Compare two outputs (A = non-tokenomic, B = tokenomic).
   * Returns the tokenomic gain.
   */
  compare(scoreA, tokensA, scoreB, tokensB) {
    const resultA = this.score(scoreA, tokensA);
    const resultB = this.score(scoreB, tokensB);

    const gain = resultB.crpt - resultA.crpt;

    return {
      systemA: resultA,
      systemB: resultB,
      tokenomicGain: gain,
      isImprovement: gain > 0,
      percentImprovement: resultA.crpt > 0 ? ((gain / resultA.crpt) * 100) : null
    };
  }

  /**
   * Get scoring history.
   */
  getHistory() {
    return [...this._scores];
  }

  /**
   * Get average CRPT across all scored outputs.
   */
  getAverageCRPT() {
    if (this._scores.length === 0) return 0;
    return this._scores.reduce((sum, s) => sum + s.crpt, 0) / this._scores.length;
  }

  /**
   * Reset scoring history.
   */
  reset() {
    this._scores = [];
  }
}
