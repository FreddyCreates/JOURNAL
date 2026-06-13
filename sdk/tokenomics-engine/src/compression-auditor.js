/**
 * Compression Auditor — checks whether shorter output preserved meaning.
 * 
 * CE = MeaningPreserved / TokensUsed
 * CEF = (InformationRetained + ActionClarity + RiskPreserved) / OutputTokens
 * 
 * Compression passes if: "Can the user still act correctly?"
 */
export class CompressionAuditor {
  constructor(config = {}) {
    this.minAcceptableScore = config.minAcceptableScore ?? 0.6;
    this._audits = [];
  }

  /**
   * Audit a compression attempt.
   * @param {object} params
   * @param {number} params.originalTokens — tokens in original output
   * @param {number} params.compressedTokens — tokens in compressed output
   * @param {number} params.informationRetained — 0–5 how much info was kept
   * @param {number} params.actionClarity — 0–5 can user still act correctly
   * @param {number} params.riskPreserved — 0–5 are risks still visible
   * @returns {object} audit result
   */
  audit(params) {
    const { originalTokens, compressedTokens, informationRetained, actionClarity, riskPreserved } = params;

    if (!originalTokens || !compressedTokens) {
      throw new Error('Both originalTokens and compressedTokens are required');
    }

    const info = Math.min(5, Math.max(0, informationRetained ?? 0));
    const action = Math.min(5, Math.max(0, actionClarity ?? 0));
    const risk = Math.min(5, Math.max(0, riskPreserved ?? 0));

    const compressionRatio = compressedTokens / originalTokens;
    const meaningScore = (info + action + risk) / 15; // normalized 0–1
    const cef = (info + action + risk) / compressedTokens;
    const passed = meaningScore >= this.minAcceptableScore;

    const result = {
      originalTokens,
      compressedTokens,
      compressionRatio,
      tokensSaved: originalTokens - compressedTokens,
      dimensions: { informationRetained: info, actionClarity: action, riskPreserved: risk },
      meaningScore,
      cef,
      passed,
      verdict: passed ? 'compression' : 'deletion',
      timestamp: Date.now()
    };

    this._audits.push(result);
    return result;
  }

  /**
   * Check if a compressed output passes the actionability test.
   * "Can the user still act correctly?"
   */
  canUserAct(actionClarity) {
    return (actionClarity ?? 0) >= 3;
  }

  /**
   * Get audit history.
   */
  getHistory() {
    return [...this._audits];
  }

  /**
   * Get average compression efficiency across all audits.
   */
  getAverageCEF() {
    if (this._audits.length === 0) return 0;
    return this._audits.reduce((sum, a) => sum + a.cef, 0) / this._audits.length;
  }

  /**
   * Get pass rate.
   */
  getPassRate() {
    if (this._audits.length === 0) return 0;
    const passed = this._audits.filter(a => a.passed).length;
    return passed / this._audits.length;
  }
}
