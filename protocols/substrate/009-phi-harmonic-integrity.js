/**
 * SUBSTRATE-009: Phi-Harmonic Integrity Protocol (PHIP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * Ensures all system timing, resource allocation, and structural proportions
 * adhere to φ (1.618...) harmonic ratios. The golden ratio is the organism's
 * heartbeat signature — it cannot be overridden.
 *
 * Engines wired: PhiResonance + Heartbeat + GeometryEngine
 * Ring: Geometry Ring | Placement: Substrate foundation
 * Wire: substrate-wire/phip
 * Enforcement: IMMUTABLE
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_SQUARED = PHI * PHI;
const GOLDEN_ANGLE = 2.399963229728653;
const HEARTBEAT = 873;
const SUBSTRATE_SEAL = 'UNBREAKABLE::PHIP::009';

class PhiHarmonicIntegrityProtocol {
  #harmonicRegistry;

  constructor() {
    this.#harmonicRegistry = new Map();
    this.protocolId = 'SUBSTRATE-009';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Validate that a ratio conforms to phi-harmonic standards.
   * @param {number} a - First quantity
   * @param {number} b - Second quantity (b > a)
   * @returns {Object} Conformance result
   */
  validateRatio(a, b) {
    if (b === 0) return { conforms: false, reason: 'DIVISION_BY_ZERO' };
    const ratio = Math.max(a, b) / Math.min(a, b);
    const deviation = Math.abs(ratio - PHI) / PHI;
    const conforms = deviation < 0.05; // 5% tolerance

    return {
      conforms,
      ratio,
      phi: PHI,
      deviation,
      tolerance: 0.05,
      seal: SUBSTRATE_SEAL
    };
  }

  /**
   * Generate phi-harmonic allocation for N resources.
   * @param {number} total - Total resource pool
   * @param {number} n - Number of divisions
   * @returns {number[]} Phi-proportional allocation
   */
  allocate(total, n) {
    const weights = [];
    for (let i = 0; i < n; i++) {
      weights.push(Math.pow(PHI_INVERSE, i));
    }
    const sum = weights.reduce((a, b) => a + b, 0);
    return weights.map(w => (w / sum) * total);
  }

  /**
   * Compute the phi-spiral coordinate for index i.
   * Used for spatial placement of organism components.
   */
  spiralCoordinate(index, radius = 1) {
    const angle = index * GOLDEN_ANGLE;
    const r = radius * Math.sqrt(index);
    return {
      x: r * Math.cos(angle),
      y: r * Math.sin(angle),
      angle,
      index,
      seal: SUBSTRATE_SEAL
    };
  }

  /**
   * Validate timing against heartbeat multiples.
   * All system timings must be multiples of HEARTBEAT / PHI^n.
   */
  validateTiming(intervalMs) {
    for (let n = -3; n <= 5; n++) {
      const expected = HEARTBEAT * Math.pow(PHI, n);
      if (Math.abs(intervalMs - expected) / expected < 0.05) {
        return { valid: true, harmonic: n, expected, actual: intervalMs, seal: SUBSTRATE_SEAL };
      }
    }
    return { valid: false, interval: intervalMs, reason: 'NOT_PHI_HARMONIC', seal: SUBSTRATE_SEAL };
  }

  /**
   * Register a component's structural proportion for ongoing monitoring.
   */
  registerHarmonic(componentId, ratio) {
    const valid = this.validateRatio(ratio, 1);
    this.#harmonicRegistry.set(componentId, { ratio, valid: valid.conforms, registeredAt: Date.now() });
    return { componentId, registered: true, conforms: valid.conforms };
  }

  getConstants() {
    return { PHI, PHI_INVERSE, PHI_SQUARED, GOLDEN_ANGLE, HEARTBEAT, seal: SUBSTRATE_SEAL };
  }
}

export { PhiHarmonicIntegrityProtocol };
