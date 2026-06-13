/**
 * Waste Detector — flags redundancy, filler, generic explanation, repeated context.
 * 
 * Bad tokens:
 * - Restate obvious context
 * - Sound smart but do not change action
 * - Add structure without leverage
 * - Expand when the user needs execution
 * - Hide uncertainty under clean language
 */
export class WasteDetector {
  constructor(config = {}) {
    this.patterns = config.patterns ?? [
      { id: 'context-restatement', label: 'Restates obvious context', weight: 1.0 },
      { id: 'empty-sophistication', label: 'Sounds smart but changes nothing', weight: 1.2 },
      { id: 'structure-without-leverage', label: 'Adds structure without leverage', weight: 0.8 },
      { id: 'expansion-over-execution', label: 'Expands when execution is needed', weight: 1.5 },
      { id: 'false-confidence', label: 'Hides uncertainty under clean language', weight: 1.3 }
    ];
    this._detections = [];
  }

  /**
   * Detect waste in an output.
   * @param {object} params
   * @param {number} params.totalTokens — total output tokens
   * @param {Array<object>} params.findings — array of { patternId, tokenCount, example? }
   * @returns {object} waste detection result
   */
  detect(params) {
    const { totalTokens, findings } = params;

    if (!totalTokens || totalTokens <= 0) {
      throw new Error('totalTokens must be a positive number');
    }
    if (!findings || !Array.isArray(findings)) {
      throw new Error('findings must be an array');
    }

    const scored = findings.map(f => {
      const pattern = this.patterns.find(p => p.id === f.patternId);
      const weight = pattern ? pattern.weight : 1.0;
      return {
        ...f,
        label: pattern?.label ?? f.patternId,
        weight,
        wasteScore: (f.tokenCount ?? 0) * weight
      };
    });

    const totalWaste = scored.reduce((sum, s) => sum + s.wasteScore, 0);
    const wasteRatio = totalWaste / totalTokens;
    const wastedTokens = scored.reduce((sum, s) => sum + (s.tokenCount ?? 0), 0);

    const result = {
      totalTokens,
      findings: scored,
      totalWaste,
      wastedTokens,
      wasteRatio,
      usefulTokens: totalTokens - wastedTokens,
      grade: wasteRatio < 0.1 ? 'excellent' : wasteRatio < 0.25 ? 'good' : wasteRatio < 0.5 ? 'fair' : 'poor',
      timestamp: Date.now()
    };

    this._detections.push(result);
    return result;
  }

  /**
   * Quick check — is this output mostly waste?
   */
  isMostlyWaste(wasteRatio) {
    return wasteRatio >= 0.5;
  }

  /**
   * Get detection history.
   */
  getHistory() {
    return [...this._detections];
  }

  /**
   * Get all registered waste patterns.
   */
  getPatterns() {
    return [...this.patterns];
  }

  /**
   * Add a custom waste pattern.
   */
  addPattern(pattern) {
    this.patterns.push(pattern);
  }
}
