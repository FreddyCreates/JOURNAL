/**
 * FocusLens — focuses data views by filtering and magnifying relevant information.
 * @module @medina/recipe-lens-sdk/focus-lens
 */

const PHI = 1.618033988749895;

/**
 * @typedef {Object} LensConfig
 * @property {string[]} [include] - Keys to include
 * @property {string[]} [exclude] - Keys to exclude
 * @property {number}   [magnify=1] - Magnification factor
 * @property {number}   [depth=0]   - Recursive depth for nested magnification
 */

export class FocusLens {
  /** @type {Map<string, LensConfig>} */
  #lenses;
  /** @type {number} */
  #totalApplied;

  constructor() {
    this.#lenses = new Map();
    this.#totalApplied = 0;
  }

  /**
   * Create a new focus lens.
   * @param {string} lensId
   * @param {LensConfig} config
   * @returns {{ lensId: string, created: boolean }}
   */
  create(lensId, config = {}) {
    const lens = {
      id: lensId,
      include: Array.isArray(config.include) ? config.include : null,
      exclude: Array.isArray(config.exclude) ? config.exclude : [],
      magnify: config.magnify || 1,
      depth: config.depth || 0,
      appliedCount: 0,
      createdAt: Date.now()
    };
    this.#lenses.set(lensId, lens);
    return { lensId, created: true };
  }

  /**
   * Apply a lens to data, returning a focused view.
   * @param {string} lensId
   * @param {Object} data
   * @returns {Object} focused view
   */
  apply(lensId, data) {
    const lens = this.#lenses.get(lensId);
    if (!lens) throw new Error(`Lens not found: ${lensId}`);
    lens.appliedCount++;
    this.#totalApplied++;

    if (data === null || typeof data !== 'object') return data;

    let result = {};
    const keys = Object.keys(data);

    for (const key of keys) {
      if (lens.exclude.includes(key)) continue;
      if (lens.include && !lens.include.includes(key)) continue;
      let value = data[key];
      if (typeof value === 'number') {
        const mag = lens.magnify * Math.pow(PHI, lens.depth);
        value = value * mag;
      }
      result[key] = value;
    }
    return result;
  }

  /**
   * Compose multiple lenses into a compound lens (left-to-right).
   * @param {string[]} lensIds
   * @returns {Function} compound lens function (data) => focused
   */
  compose(lensIds) {
    const self = this;
    return function compoundLens(data) {
      let result = data;
      for (const id of lensIds) {
        result = self.apply(id, result);
      }
      return result;
    };
  }

  /**
   * Create an inverse lens that shows only what the original excludes.
   * @param {string} lensId
   * @returns {string} new inverse lens ID
   */
  invert(lensId) {
    const lens = this.#lenses.get(lensId);
    if (!lens) throw new Error(`Lens not found: ${lensId}`);
    const invertedId = lensId + '-inverted';
    this.create(invertedId, {
      include: lens.exclude.length > 0 ? lens.exclude : null,
      exclude: lens.include || [],
      magnify: 1 / (lens.magnify || 1),
      depth: lens.depth
    });
    return invertedId;
  }

  /**
   * Get lens aperture — fraction of data keys that pass through.
   * @param {string} lensId
   * @param {Object} sampleData - Sample data to measure against
   * @returns {{ aperture: number, passedKeys: number, totalKeys: number }}
   */
  getAperture(lensId, sampleData) {
    const lens = this.#lenses.get(lensId);
    if (!lens) throw new Error(`Lens not found: ${lensId}`);
    const keys = Object.keys(sampleData || {});
    if (keys.length === 0) return { aperture: 0, passedKeys: 0, totalKeys: 0 };
    let passed = 0;
    for (const key of keys) {
      if (lens.exclude.includes(key)) continue;
      if (lens.include && !lens.include.includes(key)) continue;
      passed++;
    }
    return {
      aperture: Math.round((passed / keys.length) * 1000) / 1000,
      passedKeys: passed,
      totalKeys: keys.length
    };
  }

  /**
   * Get lens info.
   * @param {string} lensId
   * @returns {Object|undefined}
   */
  get(lensId) {
    return this.#lenses.get(lensId);
  }

  /**
   * Get overall stats.
   * @returns {Object}
   */
  getStats() {
    return {
      totalLenses: this.#lenses.size,
      totalApplied: this.#totalApplied,
      phiConstant: PHI
    };
  }
}

export default FocusLens;
