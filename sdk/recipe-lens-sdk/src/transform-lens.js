/**
 * TransformLens — transforms data shapes through composable bidirectional optics.
 * @module @medina/recipe-lens-sdk/transform-lens
 */

const PHI = 1.618033988749895;

/**
 * @typedef {Object} TransformRecord
 * @property {string} id
 * @property {Function} forward
 * @property {Function} backward
 * @property {number} appliedCount
 * @property {number} fidelitySum
 * @property {number} fidelitySamples
 */

export class TransformLens {
  /** @type {Map<string, TransformRecord>} */
  #transforms;

  constructor() {
    this.#transforms = new Map();
  }

  /**
   * Create a bidirectional transform lens.
   * @param {string} lensId
   * @param {Function} transformFn - Forward transform (data) => transformed
   * @param {Function} [inverseFn] - Backward transform (data) => original
   * @returns {{ lensId: string, created: boolean }}
   */
  create(lensId, transformFn, inverseFn) {
    if (typeof transformFn !== 'function') throw new Error('transformFn must be a function');
    this.#transforms.set(lensId, {
      id: lensId,
      forward: transformFn,
      backward: typeof inverseFn === 'function' ? inverseFn : null,
      appliedCount: 0,
      fidelitySum: 0,
      fidelitySamples: 0,
      createdAt: Date.now()
    });
    return { lensId, created: true };
  }

  /**
   * Apply forward transformation.
   * @param {string} lensId
   * @param {*} data
   * @returns {*} transformed data
   */
  forward(lensId, data) {
    const t = this.#transforms.get(lensId);
    if (!t) throw new Error(`Transform lens not found: ${lensId}`);
    t.appliedCount++;
    return t.forward(data);
  }

  /**
   * Apply backward (inverse) transformation.
   * @param {string} lensId
   * @param {*} data
   * @returns {*} inverse-transformed data
   */
  backward(lensId, data) {
    const t = this.#transforms.get(lensId);
    if (!t) throw new Error(`Transform lens not found: ${lensId}`);
    if (!t.backward) throw new Error(`No inverse defined for lens: ${lensId}`);
    return t.backward(data);
  }

  /**
   * Chain multiple transforms in sequence (forward only).
   * @param {string[]} lensIds
   * @returns {Function} chained transform (data) => result
   */
  chain(lensIds) {
    const self = this;
    return function chained(data) {
      let result = data;
      for (const id of lensIds) {
        result = self.forward(id, result);
      }
      return result;
    };
  }

  /**
   * Apply forward then backward, measure fidelity (how well inverse recovers original).
   * @param {string} lensId
   * @param {*} data
   * @returns {{ forward: *, backward: *, fidelity: number }}
   */
  roundTrip(lensId, data) {
    const t = this.#transforms.get(lensId);
    if (!t) throw new Error(`Transform lens not found: ${lensId}`);
    if (!t.backward) throw new Error(`No inverse defined for lens: ${lensId}`);

    const fwd = t.forward(data);
    const bwd = t.backward(fwd);

    const original = JSON.stringify(data);
    const recovered = JSON.stringify(bwd);
    const fidelity = original === recovered ? 1.0 : this._computeFidelity(original, recovered);

    t.fidelitySum += fidelity;
    t.fidelitySamples++;

    return { forward: fwd, backward: bwd, fidelity: Math.round(fidelity * 1000) / 1000 };
  }

  /**
   * Compute character-level similarity as a fidelity proxy.
   * @param {string} a
   * @param {string} b
   * @returns {number} 0-1 fidelity score
   * @private
   */
  _computeFidelity(a, b) {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    let match = 0;
    const minLen = Math.min(a.length, b.length);
    for (let i = 0; i < minLen; i++) {
      if (a[i] === b[i]) match++;
    }
    return (match / maxLen) * PHI / PHI; // normalized 0-1
  }

  /**
   * Get average fidelity score for a lens.
   * @param {string} lensId
   * @returns {{ fidelity: number, samples: number }}
   */
  getFidelityScore(lensId) {
    const t = this.#transforms.get(lensId);
    if (!t) throw new Error(`Transform lens not found: ${lensId}`);
    const avg = t.fidelitySamples > 0 ? t.fidelitySum / t.fidelitySamples : 0;
    return {
      fidelity: Math.round(avg * 1000) / 1000,
      samples: t.fidelitySamples,
      phiWeighted: Math.round(avg * PHI * 1000) / 1000
    };
  }

  /**
   * Get transform info.
   * @param {string} lensId
   * @returns {Object|undefined}
   */
  get(lensId) {
    const t = this.#transforms.get(lensId);
    if (!t) return undefined;
    return { id: t.id, appliedCount: t.appliedCount, hasBidirectional: !!t.backward };
  }

  /**
   * Get overall stats.
   * @returns {Object}
   */
  getStats() {
    let total = 0;
    for (const t of this.#transforms.values()) total += t.appliedCount;
    return { totalLenses: this.#transforms.size, totalApplied: total, phi: PHI };
  }
}

export default TransformLens;
