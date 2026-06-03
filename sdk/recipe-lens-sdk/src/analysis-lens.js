/**
 * AnalysisLens — analyzes data through multiple concurrent analytical perspectives.
 * @module @medina/recipe-lens-sdk/analysis-lens
 */

const PHI = 1.618033988749895;

/**
 * @typedef {Object} Perspective
 * @property {string} id
 * @property {Function} analyzeFn
 * @property {number} executionCount
 * @property {number} totalConfidence
 */

export class AnalysisLens {
  /** @type {Map<string, Perspective>} */
  #perspectives;

  constructor() {
    this.#perspectives = new Map();
  }

  /**
   * Register an analysis perspective.
   * @param {string} perspectiveId
   * @param {Function} analyzeFn - (data) => { result, confidence }
   * @returns {{ perspectiveId: string, registered: boolean }}
   */
  registerPerspective(perspectiveId, analyzeFn) {
    if (typeof analyzeFn !== 'function') throw new Error('analyzeFn must be a function');
    this.#perspectives.set(perspectiveId, {
      id: perspectiveId,
      analyzeFn,
      executionCount: 0,
      totalConfidence: 0,
      registeredAt: Date.now()
    });
    return { perspectiveId, registered: true };
  }

  /**
   * Analyze data through selected perspectives.
   * @param {*} data
   * @param {string[]} [perspectiveIds] - IDs to use (all if omitted)
   * @returns {Object[]} array of { perspectiveId, result, confidence }
   */
  analyze(data, perspectiveIds) {
    const ids = perspectiveIds || [...this.#perspectives.keys()];
    const results = [];
    for (const id of ids) {
      const p = this.#perspectives.get(id);
      if (!p) continue;
      try {
        const output = p.analyzeFn(data);
        const confidence = (output && typeof output.confidence === 'number') ? output.confidence : 0.5;
        p.executionCount++;
        p.totalConfidence += confidence;
        results.push({
          perspectiveId: id,
          result: output.result !== undefined ? output.result : output,
          confidence: Math.round(confidence * 1000) / 1000
        });
      } catch (err) {
        results.push({ perspectiveId: id, result: null, confidence: 0, error: err.message });
      }
    }
    return results;
  }

  /**
   * Compare outputs from multiple perspectives on the same data.
   * @param {string[]} perspectiveIds
   * @param {*} data
   * @returns {{ analyses: Object[], agreement: number }}
   */
  compareViews(perspectiveIds, data) {
    const analyses = this.analyze(data, perspectiveIds);
    if (analyses.length <= 1) return { analyses, agreement: 1 };

    // Phi-weighted agreement: higher-confidence perspectives count more
    let weightedAgree = 0;
    let totalWeight = 0;
    const serialized = analyses.map(a => JSON.stringify(a.result));
    for (let i = 0; i < analyses.length; i++) {
      const weight = analyses[i].confidence * Math.pow(PHI, -i);
      totalWeight += weight;
      // Count how many others agree with this perspective
      let agrees = 0;
      for (let j = 0; j < analyses.length; j++) {
        if (i !== j && serialized[i] === serialized[j]) agrees++;
      }
      weightedAgree += weight * (agrees / Math.max(1, analyses.length - 1));
    }
    const agreement = totalWeight > 0 ? weightedAgree / totalWeight : 0;
    return { analyses, agreement: Math.round(agreement * 1000) / 1000 };
  }

  /**
   * Synthesize multiple analysis results into a unified insight.
   * @param {Object[]} analysisResults - Array from analyze()
   * @returns {{ synthesized: *, totalConfidence: number, contributorCount: number }}
   */
  synthesize(analysisResults) {
    if (!Array.isArray(analysisResults) || analysisResults.length === 0) {
      return { synthesized: null, totalConfidence: 0, contributorCount: 0 };
    }

    // Pick the result with highest phi-weighted confidence
    let bestResult = null;
    let bestScore = -1;
    let totalConf = 0;

    for (let i = 0; i < analysisResults.length; i++) {
      const r = analysisResults[i];
      const score = (r.confidence || 0) * Math.pow(PHI, -i);
      totalConf += r.confidence || 0;
      if (score > bestScore) {
        bestScore = score;
        bestResult = r.result;
      }
    }

    return {
      synthesized: bestResult,
      totalConfidence: Math.round(totalConf * 1000) / 1000,
      contributorCount: analysisResults.length,
      phiScore: Math.round(bestScore * 1000) / 1000
    };
  }

  /**
   * Get confidence score for a perspective.
   * @param {string} perspectiveId
   * @returns {{ confidence: number, executions: number }}
   */
  getConfidence(perspectiveId) {
    const p = this.#perspectives.get(perspectiveId);
    if (!p) throw new Error(`Perspective not found: ${perspectiveId}`);
    const avg = p.executionCount > 0 ? p.totalConfidence / p.executionCount : 0;
    return {
      confidence: Math.round(avg * 1000) / 1000,
      executions: p.executionCount,
      phiWeighted: Math.round(avg * PHI * 1000) / 1000
    };
  }

  /**
   * Get overall stats.
   * @returns {Object}
   */
  getStats() {
    let totalExec = 0;
    for (const p of this.#perspectives.values()) totalExec += p.executionCount;
    return { totalPerspectives: this.#perspectives.size, totalExecutions: totalExec, phi: PHI };
  }
}

export default AnalysisLens;
