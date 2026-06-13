/**
 * Salience Engine — ranks what deserves token budget.
 * 
 * S_i = α·U_i + β·R_i + γ·M_i + δ·T_i + ε·N_i − ζ·K_i
 * 
 * Where:
 *   U = urgency
 *   R = risk / consequence
 *   M = mission relevance
 *   T = time sensitivity
 *   N = novelty / uncertainty
 *   K = known / already-settled context
 */
export class SalienceEngine {
  constructor(config = {}) {
    this.weights = {
      urgency: config.urgency ?? 1.0,
      risk: config.risk ?? 1.2,
      mission: config.mission ?? 1.0,
      timeSensitivity: config.timeSensitivity ?? 0.8,
      novelty: config.novelty ?? 0.9,
      knownContext: config.knownContext ?? 0.7
    };
  }

  /**
   * Score a single item's salience.
   * @param {object} item — { urgency, risk, mission, timeSensitivity, novelty, knownContext }
   *   each value 0–5
   * @returns {number} salience score
   */
  score(item) {
    const w = this.weights;
    return (
      w.urgency * (item.urgency ?? 0) +
      w.risk * (item.risk ?? 0) +
      w.mission * (item.mission ?? 0) +
      w.timeSensitivity * (item.timeSensitivity ?? 0) +
      w.novelty * (item.novelty ?? 0) -
      w.knownContext * (item.knownContext ?? 0)
    );
  }

  /**
   * Rank multiple items by salience and allocate token budgets proportionally.
   * @param {Array<object>} items — array of salience items (each with a `label` field)
   * @param {number} totalBudget — total token budget to distribute
   * @returns {Array<object>} ranked items with allocated budgets
   */
  allocate(items, totalBudget) {
    if (!items || items.length === 0) return [];

    const scored = items.map((item, idx) => ({
      ...item,
      index: idx,
      salience: this.score(item)
    }));

    // Floor negative salience to zero for allocation purposes
    const totalSalience = scored.reduce((sum, s) => sum + Math.max(0, s.salience), 0);

    if (totalSalience === 0) {
      // Equal distribution if everything is zero
      const equal = totalBudget / items.length;
      return scored.map(s => ({ ...s, budget: Math.round(equal) }))
        .sort((a, b) => b.salience - a.salience);
    }

    return scored
      .map(s => ({
        ...s,
        budget: Math.round(totalBudget * (Math.max(0, s.salience) / totalSalience))
      }))
      .sort((a, b) => b.salience - a.salience);
  }

  /**
   * Update weights.
   */
  setWeights(weights) {
    Object.assign(this.weights, weights);
  }

  /**
   * Get current weights.
   */
  getWeights() {
    return { ...this.weights };
  }
}
