/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  RUNTIME SCRIBE — Nova Modular Framework Autonomous Scribe                              ║
 * ║  "Scriptor Temporis — The Time Keeper"                                                   ║
 * ║                                                                                           ║
 * ║  Running time primitives:                                                                 ║
 * ║    O(1)         — constant time                                                          ║
 * ║    O(log n)     — logarithmic                                                            ║
 * ║    O(n)         — linear                                                                  ║
 * ║    O(n log n)   — linearithmic                                                           ║
 * ║    O(n²)        — quadratic                                                              ║
 * ║    O(n³)        — cubic                                                                  ║
 * ║    O(2ⁿ)        — exponential                                                            ║
 * ║                                                                                           ║
 * ║  Modular floors:                                                                          ║
 * ║    floor(T(n))  — floor of measured time                                                 ║
 * ║    ceil(T(n))   — ceiling of measured time                                               ║
 * ║    T mod BEAT   — time modulo heartbeat period                                           ║
 * ║                                                                                           ║
 * ║  The RuntimeScribe wraps any function, measures its execution, classifies its            ║
 * ║  O-complexity class empirically, and inscribes the profiling record into its scroll.     ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════╝
 */

import crypto from 'node:crypto';
import { PHI_INVERSE, HEARTBEAT_MS, phiBlend, phiGrow } from '../nova-core.js';
import { O } from './math-scribe.js';

// ================================================================== //
// COMPLEXITY CLASSIFICATION                                           //
// ================================================================== //

/**
 * Empirically classify O-complexity from timing samples at input sizes [n, 2n, 4n].
 *
 * Given times T(n), T(2n), T(4n), use ratios to classify:
 *   ratio ≈ 1          → O(1)
 *   ratio ≈ log2(2)=1  → O(log n)  (but ratio of T(4n)/T(n) ≈ log2(4)/log2(1) — tricky; use growth rate)
 *   ratio ≈ 2          → O(n)
 *   ratio ≈ 4          → O(n²)
 *   ratio ≈ 8          → O(n³)
 *   ratio >> 8         → O(2ⁿ)
 *
 * In practice we look at the growth factor r = T(2n) / T(n) (or T(4n)/T(2n)).
 * @param {number} t1  Time for input size n
 * @param {number} t2  Time for input size 2n
 * @param {number} t4  Time for input size 4n
 * @returns {string}  One of O.*
 */
export function classifyComplexity(t1, t2, t4) {
  // Avoid divide-by-zero
  if (t1 <= 0 || t2 <= 0) return O.CONST;
  const ratio12 = t2 / t1;
  const ratio24 = t4 > 0 ? t4 / t2 : ratio12;
  const avgRatio = (ratio12 + ratio24) / 2;

  if (avgRatio < 1.15)  return O.CONST;
  if (avgRatio < 1.6)   return O.LOG;
  if (avgRatio < 2.5)   return O.LINEAR;
  if (avgRatio < 3.5)   return O.LINEARLOG;
  if (avgRatio < 6)     return O.QUADRATIC;
  if (avgRatio < 12)    return O.CUBIC;
  return O.EXPONENTIAL;
}

// ================================================================== //
// FLOOR / CEIL / MOD OF TIME VALUES                                  //
// ================================================================== //

/**
 * Floor a time value (μs) to the nearest whole microsecond.
 * @param {number} us
 * @returns {number}
 */
export const floorUs = (us) => Math.floor(us);

/**
 * Ceil a time value (μs) to the nearest whole microsecond.
 * @param {number} us
 * @returns {number}
 */
export const ceilUs = (us) => Math.ceil(us);

/**
 * Time modulo the Nova heartbeat period (873ms → 873000 μs).
 * Returns where in the current heartbeat cycle the time falls.
 * @param {number} us  Time in microseconds
 * @returns {number}  Position within [0, HEARTBEAT_US)
 */
export const timeMod = (us) => {
  const HEARTBEAT_US = HEARTBEAT_MS * 1000;
  return ((us % HEARTBEAT_US) + HEARTBEAT_US) % HEARTBEAT_US;
};

/**
 * Heartbeat beat number for a given elapsed time.
 * @param {number} us  Elapsed time in microseconds
 * @returns {number}   Beat index (1-based)
 */
export const beatNumber = (us) => Math.floor(us / (HEARTBEAT_MS * 1000)) + 1;

// ================================================================== //
// BENCHMARK RUNNER                                                    //
// ================================================================== //

/**
 * @typedef {Object} BenchmarkResult
 * @property {string} label
 * @property {string} complexity    - Classified O-class
 * @property {number} n             - Input size used for the primary run
 * @property {number} executionUs   - Primary run time in μs
 * @property {number} floorUs       - Floor of execution time
 * @property {number} ceilUs        - Ceil of execution time
 * @property {number} beatPhaseUs   - Time mod heartbeat
 * @property {number} beatNum       - Heartbeat beat number at completion
 * @property {unknown} result       - Return value of the function
 */

/**
 * Benchmark a function at three input sizes for empirical complexity classification.
 *
 * The inputFactory(n) is called to produce input for a given size n.
 * The fn(input) is the function under test.
 * Times are collected at sizes n, 2n, 4n.
 *
 * @param {string} label        Human-readable function label
 * @param {function} fn         Function under test: (input) => result
 * @param {function} inputFactory  Produces input from size: (n) => input
 * @param {number} [n=100]      Base input size
 * @returns {BenchmarkResult}
 */
export function benchmark(label, fn, inputFactory, n = 100) {
  const run = (size) => {
    const input = inputFactory(size);
    const t0 = performance.now();
    const result = fn(input);
    return { us: (performance.now() - t0) * 1000, result };
  };

  const r1 = run(n);
  const r2 = run(n * 2);
  const r4 = run(n * 4);

  const complexity = classifyComplexity(r1.us, r2.us, r4.us);
  const startUs = performance.now() * 1000;

  return {
    label,
    complexity,
    n,
    executionUs: r1.us,
    floorUs: floorUs(r1.us),
    ceilUs: ceilUs(r1.us),
    beatPhaseUs: timeMod(startUs),
    beatNum: beatNumber(startUs),
    result: r1.result,
  };
}

/**
 * Measure a single function call (no complexity classification).
 * @param {string} label
 * @param {function} fn       Function under test: () => result
 * @returns {{ label: string, executionUs: number, floorUs: number, ceilUs: number, beatPhaseUs: number, beatNum: number, result: unknown }}
 */
export function measure(label, fn) {
  const startUs = performance.now() * 1000;
  const t0 = performance.now();
  const result = fn();
  const executionUs = (performance.now() - t0) * 1000;
  return {
    label,
    executionUs,
    floorUs: floorUs(executionUs),
    ceilUs: ceilUs(executionUs),
    beatPhaseUs: timeMod(startUs),
    beatNum: beatNumber(startUs),
    result,
  };
}

// ================================================================== //
// RUNTIME SCRIBE — Autonomous Observer & Recorder                    //
// ================================================================== //

/**
 * @typedef {Object} RuntimeEntry
 * @property {string} entryId
 * @property {string} label
 * @property {string} complexity
 * @property {number} n
 * @property {number} executionUs
 * @property {number} floorUs
 * @property {number} ceilUs
 * @property {number} beatPhaseUs
 * @property {number} beatNum
 * @property {unknown} result
 * @property {number} phiWeight
 * @property {number} timestamp
 */

/**
 * RuntimeScribe — autonomous scribe that profiles function execution.
 *
 * Wraps arbitrary functions (via measure or benchmark), records their
 * execution time, O-complexity class, floor/ceil/mod-beat time values,
 * and inscribes every profiling record into the scroll.
 */
export class RuntimeScribe {
  /** @type {string} */
  #scribeId;

  /** @type {string} */
  #name;

  /** @type {RuntimeEntry[]} */
  #scroll;

  /** @type {number} */
  #coherence;

  /** @type {Map<string, number>} */
  #labelCount;

  constructor(name = 'RuntimeScribe') {
    this.#scribeId = `SCRIBE-RUNTIME-${crypto.randomUUID()}`;
    this.#name = name;
    this.#scroll = [];
    this.#coherence = PHI_INVERSE;
    this.#labelCount = new Map();
  }

  get scribeId() { return this.#scribeId; }
  get name() { return this.#name; }
  get coherence() { return this.#coherence; }
  get scrollLength() { return this.#scroll.length; }

  /**
   * Measure a single function call and scribe the result.
   * @param {string} label
   * @param {function} fn  () => result
   * @param {string} [complexity=O.CONST]  Declared or known O-class
   * @returns {RuntimeEntry}
   */
  measure(label, fn, complexity = O.CONST) {
    const m = measure(label, fn);
    return this.#inscribe({ ...m, complexity, n: 1 });
  }

  /**
   * Benchmark a function at n, 2n, 4n and scribe with empirical O-class.
   * @param {string} label
   * @param {function} fn          (input) => result
   * @param {function} inputFactory  (n) => input
   * @param {number} [n=100]
   * @returns {RuntimeEntry}
   */
  benchmark(label, fn, inputFactory, n = 100) {
    const b = benchmark(label, fn, inputFactory, n);
    return this.#inscribe(b);
  }

  /**
   * Wrap a function so every call is automatically scribed.
   * @param {string} label
   * @param {function} fn
   * @param {string} [complexity=O.CONST]
   * @returns {function}  Wrapped function with same signature
   */
  wrap(label, fn, complexity = O.CONST) {
    const scribe = this;
    return function (...args) {
      return scribe.measure(label, () => fn(...args), complexity).result;
    };
  }

  // ------------------------------------------------------------------ //
  // Private helper                                                       //
  // ------------------------------------------------------------------ //

  /**
   * @param {BenchmarkResult | object} m
   * @returns {RuntimeEntry}
   */
  #inscribe(m) {
    this.#labelCount.set(m.label, (this.#labelCount.get(m.label) ?? 0) + 1);

    // Phi-weight: faster functions (lower executionUs) score higher
    const speedScore = Math.min(1, 1 / (1 + m.executionUs * 0.001));
    const phiWeight = phiBlend(PHI_INVERSE, speedScore);
    this.#coherence = phiGrow(this.#coherence, 1, 0.005);

    /** @type {RuntimeEntry} */
    const entry = {
      entryId: crypto.randomUUID(),
      label: m.label,
      complexity: m.complexity,
      n: m.n ?? 1,
      executionUs: m.executionUs,
      floorUs: m.floorUs,
      ceilUs: m.ceilUs,
      beatPhaseUs: m.beatPhaseUs,
      beatNum: m.beatNum,
      result: m.result,
      phiWeight,
      timestamp: Date.now(),
    };

    this.#scroll.push(entry);
    return { ...entry };
  }

  /**
   * Return the full scroll (read-only copies).
   * @returns {RuntimeEntry[]}
   */
  readScroll() {
    return this.#scroll.map(e => ({ ...e }));
  }

  /**
   * Aggregate statistics across all scroll entries.
   * @returns {{ avgUs: number, minUs: number, maxUs: number, totalUs: number, complexityCounts: Object }}
   */
  stats() {
    if (this.#scroll.length === 0) return { avgUs: 0, minUs: 0, maxUs: 0, totalUs: 0, complexityCounts: {} };
    const times = this.#scroll.map(e => e.executionUs);
    const totalUs = times.reduce((a, b) => a + b, 0);
    const complexityCounts = {};
    for (const e of this.#scroll) {
      complexityCounts[e.complexity] = (complexityCounts[e.complexity] ?? 0) + 1;
    }
    return {
      avgUs: totalUs / times.length,
      minUs: Math.min(...times),
      maxUs: Math.max(...times),
      totalUs,
      complexityCounts,
    };
  }

  /**
   * Summary manifest.
   * @returns {Object}
   */
  manifest() {
    const s = this.stats();
    return {
      scribeId: this.#scribeId,
      name: this.#name,
      type: 'RuntimeScribe',
      scrollLength: this.#scroll.length,
      coherence: this.#coherence,
      heartbeatMs: HEARTBEAT_MS,
      ...s,
    };
  }

  /** Reset the scroll. */
  clear() { this.#scroll = []; this.#coherence = PHI_INVERSE; this.#labelCount.clear(); }
}
