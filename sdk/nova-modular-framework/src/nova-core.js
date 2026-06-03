/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  NOVA CORE — Modular Nova Framework                                                     ║
 * ║              "Nova Fundamentum — The Living Protocol"                                    ║
 * ║                                                                                           ║
 * ║  "Nova nascitur. Nova crescit. Nova illuminat."                                           ║
 * ║  (Nova is born. Nova grows. Nova illuminates.)                                            ║
 * ║                                                                                           ║
 * ║  Core constants, phi-encoded identity, and utility functions                              ║
 * ║  for TT-012-NOVA — the sovereign Nova Token protocol.                                     ║
 * ║                                                                                           ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════╝
 */

// ================================================================== //
// PHI CONSTANTS (golden ratio encoding — the Nova frequency)          //
// ================================================================== //

/** Golden ratio — φ = (1 + √5) / 2 */
export const PHI = 1.618033988749895;

/** Inverse golden ratio — 1/φ */
export const PHI_INVERSE = 0.6180339887498949;

/** φ² */
export const PHI_SQUARED = PHI * PHI;

/** 1 − 1/φ */
export const PHI_COMPLEMENT = 1 - PHI_INVERSE;

/** Golden angle in radians — 2π / φ² */
export const PHI_ANGLE = 2.399963229728653;

/** 2π */
export const TWO_PI = 2 * Math.PI;

// ================================================================== //
// NOVA TOKEN IDENTITY                                                  //
// ================================================================== //

/** Nova protocol identifier */
export const NOVA_ID = 'TT-012-NOVA';

/** Human-readable name */
export const NOVA_NAME = 'NOVA TOKEN';

/** Full product name */
export const NOVA_FULL_NAME = 'TT-012-NOVA — Modular Nova Framework';

/** Sovereign identity string */
export const NOVA_SOVEREIGN_ID = 'NOVA::TOKEN::TT-012';

/** Substrate heartbeat (Three Hearts, ms) */
export const HEARTBEAT_MS = 873;

/** Sovereign heartbeat (φ × 1000, ms) */
export const SOVEREIGN_HEARTBEAT_MS = 618;

/** Framework version */
export const NOVA_VERSION = '1.0.0';

// ================================================================== //
// PHI UTILITY FUNCTIONS                                               //
// ================================================================== //

/**
 * Phi-weighted blend between two values.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function phiBlend(a, b) {
  return a * PHI_INVERSE + b * PHI_COMPLEMENT;
}

/**
 * Clamp a value to [0, 1].
 * @param {number} v
 * @returns {number}
 */
export function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

/**
 * Phi-weighted growth toward a ceiling.
 * @param {number} value  Current value
 * @param {number} ceiling  Maximum value
 * @param {number} rate  Growth rate scalar
 * @returns {number}
 */
export function phiGrow(value, ceiling, rate) {
  return clamp01(value + (ceiling - value) * PHI_INVERSE * rate);
}

/**
 * Phi-weighted decay from a value.
 * @param {number} value  Current value
 * @param {number} rate  Decay rate scalar
 * @returns {number}
 */
export function phiDecay(value, rate) {
  return clamp01(value * (1 - PHI_INVERSE * rate));
}

/**
 * Returns the nth Fibonacci number (0-indexed) using phi-approximation.
 * @param {number} n
 * @returns {number}
 */
export function fibonacci(n) {
  if (n < 0) throw new RangeError('n must be >= 0');
  if (n === 0) return 0;
  if (n === 1) return 1;
  return Math.round(Math.pow(PHI, n) / Math.sqrt(5));
}

/**
 * Generate a phi-encoded coherence score from a raw signal in [0, 1].
 * High coherence → score near 1; low coherence → score near 0.
 * @param {number} signal  Input signal in [0, 1]
 * @returns {number}  Phi-encoded coherence in [0, 1]
 */
export function phiCoherence(signal) {
  const clamped = clamp01(signal);
  return clamp01(clamped * PHI_INVERSE + (1 - clamped) * PHI_COMPLEMENT * PHI_INVERSE);
}

/**
 * Returns a Nova framework identity stamp with current timestamp.
 * @returns {{ id: string, name: string, sovereign: string, version: string, timestamp: number, phi: number }}
 */
export function novaStamp() {
  return {
    id: NOVA_ID,
    name: NOVA_NAME,
    sovereign: NOVA_SOVEREIGN_ID,
    version: NOVA_VERSION,
    timestamp: Date.now(),
    phi: PHI,
  };
}
