/**
 * @medina/production-intelligence-sdk — PHI Constants
 * 
 * GOLDEN RATIO INTELLIGENCE CONSTANTS
 * Mathematical foundation for all intelligence protocols
 * 
 * @module @medina/production-intelligence-sdk/core/phi-constants
 * @copyright Medina Intelligence Systems — All Rights Reserved
 * @license PROPRIETARY — Commercial Use License Required
 */

// ════════════════════════════════════════════════════════════════════════════════
// CORE PHI CONSTANTS
// ════════════════════════════════════════════════════════════════════════════════

/** The Golden Ratio φ = (1 + √5) / 2 */
export const PHI = 1.618033988749895;

/** PHI inverse 1/φ = φ - 1 */
export const PHI_INVERSE = 0.6180339887498949;

/** PHI complement 1 - 1/φ */
export const PHI_COMPLEMENT = 0.3819660112501051;

/** PHI squared φ² */
export const PHI_SQUARED = 2.618033988749895;

/** PHI cubed φ³ */
export const PHI_CUBED = 4.23606797749979;

/** PHI to the fourth power φ⁴ */
export const PHI_FOURTH = 6.854101966249685;

/** PHI to the fifth power φ⁵ */
export const PHI_FIFTH = 11.09016994374948;

// ════════════════════════════════════════════════════════════════════════════════
// DERIVED MATHEMATICAL CONSTANTS
// ════════════════════════════════════════════════════════════════════════════════

/** 2π for circular/wave calculations */
export const TWO_PI = 2 * Math.PI;

/** π × φ for golden spiral calculations */
export const PI_PHI = Math.PI * PHI;

/** Euler's number e */
export const EULER = Math.E;

/** Natural log of PHI */
export const LN_PHI = Math.log(PHI);

/** Cognitive Planck constant - minimum quantum of thought */
export const PLANCK_COGNITIVE = PHI_INVERSE * 1e-3;

// ════════════════════════════════════════════════════════════════════════════════
// TIME SCALES (in seconds)
// ════════════════════════════════════════════════════════════════════════════════

export const TIME_SCALES = Object.freeze({
  /** Immediate perception ~100ms */
  IMMEDIATE: 0.1,
  
  /** Short-term processing ~1s */
  SHORT: 1,
  
  /** Working memory span ~10s */
  WORKING: 10,
  
  /** Attention cycle ~60s */
  ATTENTION: 60,
  
  /** Extended focus ~10min */
  EXTENDED: 600,
  
  /** Long-term encoding ~1hr */
  LONG: 3600,
  
  /** Narrative memory ~30min (half of long) */
  NARRATIVE: 1800,
  
  /** Strategic planning ~5min */
  STRATEGIC: 300,
  
  /** Daily cycle ~24hr */
  DAILY: 86400,
  
  /** Weekly cycle ~7 days */
  WEEKLY: 604800
});

// ════════════════════════════════════════════════════════════════════════════════
// SWARM CONSTANTS
// ════════════════════════════════════════════════════════════════════════════════

export const SWARM_CONSTANTS = Object.freeze({
  /** Inertia weight for velocity update */
  INERTIA_WEIGHT: 0.729,
  
  /** Cognitive weight (personal best attraction) */
  COGNITIVE_WEIGHT: PHI,
  
  /** Social weight (global best attraction) */
  SOCIAL_WEIGHT: PHI_INVERSE,
  
  /** Pheromone evaporation rate */
  PHEROMONE_DECAY: 0.1,
  
  /** Pheromone deposit strength */
  PHEROMONE_DEPOSIT: PHI,
  
  /** Default swarm size */
  DEFAULT_SWARM_SIZE: 50,
  
  /** Maximum velocity factor */
  MAX_VELOCITY_FACTOR: 0.2
});

// ════════════════════════════════════════════════════════════════════════════════
// QUANTUM CONSTANTS
// ════════════════════════════════════════════════════════════════════════════════

export const QUANTUM_CONSTANTS = Object.freeze({
  /** Default quantum state dimensions */
  DEFAULT_DIMENSIONS: 8,
  
  /** Default coherence time in ms */
  DEFAULT_COHERENCE_TIME: 10000,
  
  /** Minimum amplitude threshold */
  MIN_AMPLITUDE: 1e-10,
  
  /** Phase precision */
  PHASE_PRECISION: 1e-6,
  
  /** Entanglement strength default */
  DEFAULT_ENTANGLEMENT: PHI_INVERSE
});

// ════════════════════════════════════════════════════════════════════════════════
// FIBONACCI UTILITIES
// ════════════════════════════════════════════════════════════════════════════════

const FIB_CACHE = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181];

/**
 * Get Fibonacci number by index (cached for performance)
 * @param {number} n - Index (0-based)
 * @returns {number} Fibonacci number
 */
export function fibonacci(n) {
  if (n < 0) return 0;
  if (n < FIB_CACHE.length) return FIB_CACHE[n];
  
  // Compute using Binet's formula for large n
  return Math.round((PHI ** n - ((-PHI_INVERSE) ** n)) / Math.sqrt(5));
}

/**
 * Generate first n Fibonacci numbers
 * @param {number} n - Count of numbers to generate
 * @returns {number[]} Array of Fibonacci numbers
 */
export function fibonacciN(n) {
  if (n <= 0) return [];
  if (n <= FIB_CACHE.length) return FIB_CACHE.slice(0, n);
  
  const result = [...FIB_CACHE];
  while (result.length < n) {
    result.push(result[result.length - 1] + result[result.length - 2]);
  }
  return result;
}

// ════════════════════════════════════════════════════════════════════════════════
// PHI SCALING UTILITIES
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Scale a value by PHI power
 * @param {number} value - Base value
 * @param {number} power - PHI exponent
 * @returns {number} Scaled value
 */
export function phiScale(value, power = 1) {
  return value * (PHI ** power);
}

/**
 * Apply PHI-based decay
 * @param {number} value - Initial value
 * @param {number} t - Time/distance parameter
 * @param {number} rate - Decay rate
 * @returns {number} Decayed value
 */
export function phiDecay(value, t, rate = PHI_INVERSE) {
  return value * Math.exp(-rate * t);
}

/**
 * Compute golden section of a value
 * @param {number} value - Total value
 * @returns {{major: number, minor: number}} Golden section parts
 */
export function goldenSection(value) {
  return {
    major: value * PHI_INVERSE,
    minor: value * PHI_COMPLEMENT
  };
}

/**
 * Check if ratio is golden
 * @param {number} a - First value
 * @param {number} b - Second value
 * @param {number} tolerance - Acceptable deviation
 * @returns {boolean} True if golden ratio
 */
export function isGoldenRatio(a, b, tolerance = 0.01) {
  if (b === 0) return false;
  const ratio = a / b;
  return Math.abs(ratio - PHI) < tolerance || Math.abs(ratio - PHI_INVERSE) < tolerance;
}

// ════════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ════════════════════════════════════════════════════════════════════════════════

export default {
  // Core constants
  PHI,
  PHI_INVERSE,
  PHI_COMPLEMENT,
  PHI_SQUARED,
  PHI_CUBED,
  PHI_FOURTH,
  PHI_FIFTH,
  
  // Derived constants
  TWO_PI,
  PI_PHI,
  EULER,
  LN_PHI,
  PLANCK_COGNITIVE,
  
  // Configuration objects
  TIME_SCALES,
  SWARM_CONSTANTS,
  QUANTUM_CONSTANTS,
  
  // Utilities
  fibonacci,
  fibonacciN,
  phiScale,
  phiDecay,
  goldenSection,
  isGoldenRatio
};
