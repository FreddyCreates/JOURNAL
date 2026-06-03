/**
 * PROTO-013: Lens Intelligence Protocol (LIP)
 * AI lens system for transforming and focusing data views through composable optics.
 * Supports lens registration, composition, multi-view analysis, calibration,
 * and aberration detection using phi-weighted error bounds.
 *
 * Engines wired: LensRegistry + OpticComposer + FocusAnalyzer + AberrationDetector
 * Ring: Intelligence Ring | Organism placement: Data / perception layer
 * Wire: intelligence-wire/lip
 */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 2.399963229728653;
const HEARTBEAT = 873;

/**
 * @typedef {'magnify'|'filter'|'refract'|'prism'|'telescope'|'microscope'} LensFocusType
 */

/**
 * @typedef {Object} LensDef
 * @property {string} id - Lens identifier
 * @property {string} name - Lens name
 * @property {Function} transformFn - Transform function (data) => transformedData
 * @property {LensFocusType} focusType - Type of lens
 * @property {number} magnification - Current magnification factor
 * @property {number} aberration - Current aberration index
 * @property {number} totalFocuses - Total times this lens has been used
 * @property {number} createdAt - Creation timestamp
 * @property {Object|null} calibration - Calibration data
 */

class LensIntelligenceProtocol {
  /**
   * @param {Object} config - Configuration
   * @param {number} [config.defaultMagnification=1.0] - Default magnification
   * @param {number} [config.aberrationThreshold=0.1] - Max acceptable aberration
   * @param {number} [config.maxLenses=200] - Max registered lenses
   */
  constructor(config = {}) {
    /** @type {Map<string, LensDef>} */
    this.lenses = new Map();
    /** @type {Map<string, LensDef>} */
    this.compoundLenses = new Map();
    this.defaultMagnification = config.defaultMagnification || 1.0;
    this.aberrationThreshold = config.aberrationThreshold || 0.1;
    this.maxLenses = config.maxLenses || 200;
    this.eventLog = [];
    this.metrics = {
      totalFocuses: 0,
      totalAnalyses: 0,
      totalCalibrations: 0,
      totalCompositions: 0,
      avgMagnification: 0,
      aberrationIndex: 0,
      cumulativeMagnification: 0
    };
  }

  /* ─── Logging ─── */

  /**
   * Log an internal event.
   * @param {string} type - Event type
   * @param {string} detail - Event detail
   */
  _log(type, detail) {
    this.eventLog.push({ type, detail, timestamp: Date.now() });
    if (this.eventLog.length > 10000) {
      this.eventLog = this.eventLog.slice(-5000);
    }
  }

  /* ─── Lens Registration ─── */

  /**
   * Register a lens with a transform function and focus type.
   * @param {string} id - Unique lens identifier
   * @param {string} name - Human-readable name
   * @param {Function} transformFn - Transform function: (data) => transformedData
   * @param {LensFocusType} focusType - Type: 'magnify', 'filter', 'refract', 'prism', 'telescope', 'microscope'
   * @returns {Object} - { id, name, focusType, registered }
   */
  registerLens(id, name, transformFn, focusType = 'magnify') {
    if (this.lenses.has(id)) {
      return { id, name, focusType, registered: false, error: 'Lens already exists' };
    }
    if (typeof transformFn !== 'function') {
      return { id, name, focusType, registered: false, error: 'transformFn must be a function' };
    }
    if (this.lenses.size >= this.maxLenses) {
      return { id, name, focusType, registered: false, error: `Max lenses reached (${this.maxLenses})` };
    }

    const validTypes = ['magnify', 'filter', 'refract', 'prism', 'telescope', 'microscope'];
    if (!validTypes.includes(focusType)) {
      focusType = 'magnify';
    }

    const magnification = this._computeBaseMagnification(focusType);

    /** @type {LensDef} */
    const lens = {
      id,
      name,
      transformFn,
      focusType,
      magnification,
      aberration: 0,
      totalFocuses: 0,
      createdAt: Date.now(),
      calibration: null
    };

    this.lenses.set(id, lens);
    this._log('register', `Lens "${name}" (${id}) registered as ${focusType}`);
    return { id, name, focusType, magnification, registered: true };
  }

  /**
   * Compute base magnification for a focus type using phi relationships.
   * @param {LensFocusType} focusType
   * @returns {number}
   */
  _computeBaseMagnification(focusType) {
    const magnifications = {
      'magnify': PHI,
      'filter': 1.0,
      'refract': PHI * PHI,
      'prism': Math.pow(PHI, 3),
      'telescope': Math.pow(PHI, 4),
      'microscope': Math.pow(PHI, 5)
    };
    return magnifications[focusType] || this.defaultMagnification;
  }

  /* ─── Focus (Apply Lens) ─── */

  /**
   * Apply a lens transformation to data, returning a focused view.
   * Magnification is applied as a phi-weighted scaling factor.
   * @param {string} lensId - Lens identifier
   * @param {*} data - Input data to transform
   * @returns {Object} - { lensId, focusType, magnification, result, aberration }
   */
  focus(lensId, data) {
    const lens = this.lenses.get(lensId) || this.compoundLenses.get(lensId);
    if (!lens) {
      return { lensId, focusType: null, magnification: 0, result: null, error: 'Lens not found' };
    }

    const startTime = Date.now();
    let result;

    try {
      result = lens.transformFn(data);
    } catch (err) {
      this._log('focus-error', `Lens "${lens.name}" threw: ${err.message}`);
      return { lensId, focusType: lens.focusType, magnification: lens.magnification, result: null, error: err.message };
    }

    // Apply phi-weighted magnification metadata
    const phiMag = lens.magnification * Math.pow(PHI, -(lens.totalFocuses % 10) / 10);

    lens.totalFocuses++;
    this.metrics.totalFocuses++;
    this.metrics.cumulativeMagnification += phiMag;
    this.metrics.avgMagnification = this.metrics.cumulativeMagnification / this.metrics.totalFocuses;

    const latencyMs = Date.now() - startTime;
    this._log('focus', `Lens "${lens.name}" focused on data (${latencyMs}ms, mag=${phiMag.toFixed(4)})`);

    return {
      lensId,
      focusType: lens.focusType,
      magnification: phiMag,
      result,
      aberration: lens.aberration,
      latencyMs
    };
  }

  /* ─── Lens Composition ─── */

  /**
   * Compose multiple lenses into a compound lens via function composition.
   * Lenses are applied left-to-right: L1 → L2 → L3.
   * Compound magnification = product of individual magnifications weighted by PHI.
   * @param {string[]} lensIds - Ordered list of lens IDs to compose
   * @returns {Object} - { id, name, magnification, composed }
   */
  compose(lensIds) {
    const lensesArr = [];
    for (const lid of lensIds) {
      const lens = this.lenses.get(lid);
      if (!lens) {
        return { id: null, name: null, magnification: 0, composed: false, error: `Lens ${lid} not found` };
      }
      lensesArr.push(lens);
    }

    const compoundId = `compound-${lensIds.join('+')}`;
    const compoundName = `Compound: ${lensesArr.map(l => l.name).join(' → ')}`;

    // Compose transform functions left to right
    const compoundFn = (data) => {
      let current = data;
      for (const lens of lensesArr) {
        current = lens.transformFn(current);
      }
      return current;
    };

    // Compound magnification: product weighted by phi
    let compoundMag = 1.0;
    for (let i = 0; i < lensesArr.length; i++) {
      compoundMag *= lensesArr[i].magnification * Math.pow(PHI, -(i / lensesArr.length));
    }

    /** @type {LensDef} */
    const compound = {
      id: compoundId,
      name: compoundName,
      transformFn: compoundFn,
      focusType: 'prism',
      magnification: compoundMag,
      aberration: 0,
      totalFocuses: 0,
      createdAt: Date.now(),
      calibration: null
    };

    this.compoundLenses.set(compoundId, compound);
    this.metrics.totalCompositions++;
    this._log('compose', `Compound lens "${compoundName}" created (mag=${compoundMag.toFixed(4)})`);

    return { id: compoundId, name: compoundName, magnification: compoundMag, composed: true };
  }

  /* ─── Multi-View Analysis ─── */

  /**
   * Run data through multiple lenses and return a multi-view analysis.
   * Each lens provides a different perspective on the same data.
   * @param {*} data - Input data
   * @param {string[]} lensIds - Lenses to analyze with
   * @returns {Object} - { views, summary }
   */
  analyze(data, lensIds) {
    const views = [];
    let totalAberration = 0;
    let totalMagnification = 0;

    for (const lid of lensIds) {
      const focusResult = this.focus(lid, data);
      views.push({
        lensId: lid,
        focusType: focusResult.focusType,
        magnification: focusResult.magnification,
        result: focusResult.result,
        aberration: focusResult.aberration,
        error: focusResult.error || null
      });
      if (!focusResult.error) {
        totalAberration += focusResult.aberration || 0;
        totalMagnification += focusResult.magnification || 0;
      }
    }

    this.metrics.totalAnalyses++;
    const viewCount = views.filter(v => !v.error).length;

    const summary = {
      totalViews: views.length,
      successfulViews: viewCount,
      avgMagnification: viewCount > 0 ? totalMagnification / viewCount : 0,
      avgAberration: viewCount > 0 ? totalAberration / viewCount : 0,
      phiCoherence: viewCount > 0 ? (1 / PHI) * (viewCount / views.length) : 0
    };

    this._log('analyze', `Multi-view analysis: ${viewCount}/${views.length} views successful`);
    return { views, summary };
  }

  /* ─── Aberration Detection ─── */

  /**
   * Compute lens aberration (distortion metric) using phi-weighted error bounds.
   * Aberration = |1 - (observed_mag / expected_mag)| × PHI
   * @param {string} lensId - Lens identifier
   * @returns {Object} - { lensId, aberration, withinThreshold, magnification }
   */
  getAberration(lensId) {
    const lens = this.lenses.get(lensId) || this.compoundLenses.get(lensId);
    if (!lens) {
      return { lensId, aberration: null, withinThreshold: false, error: 'Lens not found' };
    }

    const expectedMag = this._computeBaseMagnification(lens.focusType);
    const observedMag = lens.magnification;
    const aberration = Math.abs(1 - (observedMag / expectedMag)) * PHI;

    lens.aberration = aberration;
    const withinThreshold = aberration <= this.aberrationThreshold;

    // Update global aberration index
    let totalAberration = 0;
    let lensCount = 0;
    for (const l of this.lenses.values()) {
      totalAberration += l.aberration;
      lensCount++;
    }
    this.metrics.aberrationIndex = lensCount > 0 ? totalAberration / lensCount : 0;

    this._log('aberration', `Lens "${lens.name}" aberration=${aberration.toFixed(6)} (${withinThreshold ? 'OK' : 'HIGH'})`);

    return { lensId, aberration, withinThreshold, magnification: observedMag, expectedMagnification: expectedMag };
  }

  /* ─── Calibration ─── */

  /**
   * Calibrate a lens against reference data.
   * Adjusts magnification so that lens output matches reference within phi-bounds.
   * @param {string} lensId - Lens identifier
   * @param {*} referenceData - Reference data to calibrate against
   * @returns {Object} - { lensId, calibrated, oldMagnification, newMagnification, aberration }
   */
  calibrate(lensId, referenceData) {
    const lens = this.lenses.get(lensId);
    if (!lens) {
      return { lensId, calibrated: false, error: 'Lens not found' };
    }

    const oldMagnification = lens.magnification;

    // Apply lens to reference data and compute output characteristics
    let refOutput;
    try {
      refOutput = lens.transformFn(referenceData);
    } catch (err) {
      return { lensId, calibrated: false, error: `Calibration failed: ${err.message}` };
    }

    // Compute calibration adjustment based on phi-weighted reference comparison
    let adjustmentFactor = 1.0;
    if (typeof referenceData === 'number' && typeof refOutput === 'number' && referenceData !== 0) {
      const ratio = refOutput / referenceData;
      adjustmentFactor = ratio / PHI;
    } else if (typeof referenceData === 'string' && typeof refOutput === 'string') {
      const ratio = refOutput.length / Math.max(1, referenceData.length);
      adjustmentFactor = ratio / PHI;
    } else {
      adjustmentFactor = 1 / PHI;
    }

    // Apply phi-damped calibration
    const newMagnification = oldMagnification * (1 + (adjustmentFactor - 1) / PHI);
    lens.magnification = newMagnification;

    lens.calibration = {
      referenceData: typeof referenceData === 'object' ? '[object]' : String(referenceData).slice(0, 100),
      calibratedAt: Date.now(),
      adjustmentFactor,
      oldMagnification,
      newMagnification
    };

    const aberration = this.getAberration(lensId);
    this.metrics.totalCalibrations++;

    this._log('calibrate', `Lens "${lens.name}" calibrated: mag ${oldMagnification.toFixed(4)} → ${newMagnification.toFixed(4)}`);

    return {
      lensId,
      calibrated: true,
      oldMagnification,
      newMagnification,
      aberration: aberration.aberration
    };
  }

  /* ─── Diagnostics ─── */

  /**
   * Get lens intelligence metrics.
   * @returns {Object} - Metrics snapshot
   */
  getMetrics() {
    return {
      totalLenses: this.lenses.size,
      totalCompoundLenses: this.compoundLenses.size,
      totalFocuses: this.metrics.totalFocuses,
      totalAnalyses: this.metrics.totalAnalyses,
      totalCalibrations: this.metrics.totalCalibrations,
      totalCompositions: this.metrics.totalCompositions,
      avgMagnification: this.metrics.avgMagnification,
      aberrationIndex: this.metrics.aberrationIndex,
      heartbeatInterval: HEARTBEAT,
      goldenAngle: GOLDEN_ANGLE
    };
  }

  /**
   * Get recent event log entries.
   * @param {number} [count=50] - Number of recent events
   * @returns {Object[]} - Recent events
   */
  getRecentEvents(count = 50) {
    return this.eventLog.slice(-count);
  }

  /**
   * List all registered lenses.
   * @returns {Object[]} - Array of lens summaries
   */
  listLenses() {
    const result = [];
    for (const [id, lens] of this.lenses) {
      result.push({
        id,
        name: lens.name,
        focusType: lens.focusType,
        magnification: lens.magnification,
        aberration: lens.aberration,
        totalFocuses: lens.totalFocuses,
        isCalibrated: !!lens.calibration
      });
    }
    return result;
  }
}

export { LensIntelligenceProtocol };
export default LensIntelligenceProtocol;
