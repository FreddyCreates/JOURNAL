/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  MATH SCRIBE — Nova Modular Framework Autonomous Scribe                                 ║
 * ║  "Scriptor Mathematicus — The Number Keeper"                                             ║
 * ║                                                                                           ║
 * ║  Primitives : add · sub · mul · div · mod · floor · ceil · abs                          ║
 * ║  Advances   : GCD · LCM · prime sieve · modular exponentiation · phi-weighted ops       ║
 * ║  Floors     : floor(n) · ceil(n) · round(n) · floorDiv(a,b) · floorMod(a,b)            ║
 * ║  Modular    : mod(a,m) · modAdd · modMul · modPow · modInverse (extended Euclidean)     ║
 * ║  Running    : every operation tagged with its O-complexity class                         ║
 * ║                                                                                           ║
 * ║  The MathScribe autonomously records every computation into its scroll,                  ║
 * ║  maintaining phi-weighted accuracy and operation count statistics.                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════╝
 */

import crypto from 'node:crypto';
import { PHI, PHI_INVERSE, phiBlend, phiGrow } from '../nova-core.js';

// ================================================================== //
// COMPLEXITY CLASS CONSTANTS                                          //
// ================================================================== //

/** O-complexity class descriptors */
export const O = Object.freeze({
  CONST:      'O(1)',
  LOG:        'O(log n)',
  LINEAR:     'O(n)',
  LINEARLOG:  'O(n log n)',
  QUADRATIC:  'O(n²)',
  CUBIC:      'O(n³)',
  EXPONENTIAL:'O(2ⁿ)',
});

// ================================================================== //
// PRIMITIVE ARITHMETIC                                                //
// ================================================================== //

/** Add: a + b — O(1) */
export const add = (a, b) => a + b;

/** Subtract: a − b — O(1) */
export const sub = (a, b) => a - b;

/** Multiply: a × b — O(1) */
export const mul = (a, b) => a * b;

/**
 * Divide: a / b — O(1)
 * @throws {RangeError} if b === 0
 */
export function div(a, b) {
  if (b === 0) throw new RangeError('Division by zero');
  return a / b;
}

/**
 * Modulo: a mod m — always non-negative (mathematical modulo) — O(1)
 * Differs from JS `%` which can return negatives.
 * @param {number} a
 * @param {number} m  Modulus (must be > 0)
 * @returns {number}
 */
export function mod(a, m) {
  if (!Number.isInteger(m) || m <= 0) throw new RangeError('Modulus must be a positive integer');
  return ((a % m) + m) % m;
}

// ================================================================== //
// FLOOR / CEILING / ROUND                                             //
// ================================================================== //

/** floor(n) — largest integer ≤ n — O(1) */
export const floorN = (n) => Math.floor(n);

/** ceil(n) — smallest integer ≥ n — O(1) */
export const ceilN = (n) => Math.ceil(n);

/** round(n) — nearest integer — O(1) */
export const roundN = (n) => Math.round(n);

/**
 * floorDiv(a, b) — integer floor division — O(1)
 * Always rounds toward −∞ (unlike truncation which rounds toward 0).
 * @param {number} a
 * @param {number} b
 */
export function floorDiv(a, b) {
  if (b === 0) throw new RangeError('Division by zero');
  return Math.floor(a / b);
}

/**
 * floorMod(a, b) — modulo consistent with floorDiv — O(1)
 * Satisfies: a = floorDiv(a, b) * b + floorMod(a, b)
 * @param {number} a
 * @param {number} b
 */
export function floorMod(a, b) {
  if (b === 0) throw new RangeError('Division by zero');
  return a - floorDiv(a, b) * b;
}

// ================================================================== //
// MODULAR ARITHMETIC ADVANCES                                         //
// ================================================================== //

/**
 * modAdd(a, b, m) — (a + b) mod m — O(1)
 * @param {number} a
 * @param {number} b
 * @param {number} m  Modulus
 */
export function modAdd(a, b, m) { return mod(a + b, m); }

/**
 * modMul(a, b, m) — (a × b) mod m — O(1)
 */
export function modMul(a, b, m) { return mod(a * b, m); }

/**
 * modPow(base, exp, m) — fast modular exponentiation — O(log exp)
 * Uses binary exponentiation (square-and-multiply).
 * @param {number} base
 * @param {number} exp  Non-negative integer exponent
 * @param {number} m   Modulus
 */
export function modPow(base, exp, m) {
  if (!Number.isInteger(exp) || exp < 0) throw new RangeError('Exponent must be a non-negative integer');
  if (m === 1) return 0;
  let result = 1;
  let b = mod(base, m);
  let e = exp;
  while (e > 0) {
    if (e % 2 === 1) result = mod(result * b, m);
    b = mod(b * b, m);
    e = Math.floor(e / 2);
  }
  return result;
}

/**
 * GCD — Greatest Common Divisor via Euclidean algorithm — O(log min(a,b))
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b !== 0) { [a, b] = [b, a % b]; }
  return a;
}

/**
 * LCM — Least Common Multiple — O(log min(a,b))
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a) / gcd(a, b) * Math.abs(b);
}

/**
 * extendedGCD — Extended Euclidean Algorithm — O(log min(a,b))
 * Returns { g, x, y } such that a*x + b*y = g = gcd(a, b)
 * @param {number} a
 * @param {number} b
 * @returns {{ g: number, x: number, y: number }}
 */
export function extendedGCD(a, b) {
  if (b === 0) return { g: a, x: 1, y: 0 };
  const { g, x: x1, y: y1 } = extendedGCD(b, a % b);
  return { g, x: y1, y: x1 - Math.floor(a / b) * y1 };
}

/**
 * modInverse(a, m) — Modular multiplicative inverse via Extended Euclidean — O(log m)
 * Returns x such that (a * x) ≡ 1 (mod m), or throws if no inverse exists.
 * @param {number} a
 * @param {number} m
 * @returns {number}
 */
export function modInverse(a, m) {
  const { g, x } = extendedGCD(mod(a, m), m);
  if (g !== 1) throw new RangeError(`No modular inverse: gcd(${a}, ${m}) = ${g} ≠ 1`);
  return mod(x, m);
}

// ================================================================== //
// PRIME SIEVE                                                         //
// ================================================================== //

/**
 * sieveOfEratosthenes(limit) — returns all primes ≤ limit — O(n log log n)
 * @param {number} limit
 * @returns {number[]}
 */
export function sieveOfEratosthenes(limit) {
  if (limit < 2) return [];
  const sieve = new Uint8Array(limit + 1).fill(1);
  sieve[0] = sieve[1] = 0;
  for (let i = 2; i * i <= limit; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= limit; j += i) sieve[j] = 0;
    }
  }
  const primes = [];
  for (let i = 2; i <= limit; i++) { if (sieve[i]) primes.push(i); }
  return primes;
}

/**
 * isPrime(n) — primality test — O(√n)
 * @param {number} n
 * @returns {boolean}
 */
export function isPrime(n) {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

// ================================================================== //
// PHI-WEIGHTED ARITHMETIC                                             //
// ================================================================== //

/**
 * phiWeightedSum(values) — sum of values weighted by successive φ⁻ⁿ — O(n)
 * Each element receives weight PHI_INVERSE^(i+1), giving the first element
 * the highest phi-weight and later elements exponentially less.
 * @param {number[]} values
 * @returns {number}
 */
export function phiWeightedSum(values) {
  let weight = PHI_INVERSE;
  let sum = 0;
  for (const v of values) {
    sum += v * weight;
    weight *= PHI_INVERSE;
  }
  return sum;
}

/**
 * phiFloor(x) — floor of x rounded to nearest φ-multiple — O(1)
 * Returns floor(x / φ) * φ
 * @param {number} x
 * @returns {number}
 */
export function phiFloor(x) {
  return Math.floor(x / PHI) * PHI;
}

/**
 * phiCeil(x) — ceil of x to nearest φ-multiple — O(1)
 * @param {number} x
 * @returns {number}
 */
export function phiCeil(x) {
  return Math.ceil(x / PHI) * PHI;
}

// ================================================================== //
// MATH SCRIBE — Autonomous Autonomous Observer & Recorder             //
// ================================================================== //

/**
 * @typedef {Object} MathEntry
 * @property {string} entryId
 * @property {string} operation
 * @property {number[]} inputs
 * @property {number} output
 * @property {string} complexity    - O-class string from O constant
 * @property {number} executionUs   - Execution time in microseconds
 * @property {number} timestamp
 */

/**
 * MathScribe — autonomous scribe that records all mathematical computations.
 *
 * Wraps arithmetic operations, tracks their O-complexity class, execution time,
 * and inscribes every result into the scroll with phi-weighted significance scoring.
 */
export class MathScribe {
  /** @type {string} */
  #scribeId;

  /** @type {string} */
  #name;

  /** @type {MathEntry[]} */
  #scroll;

  /** @type {number} */
  #coherence;

  /** @type {Map<string, number>} */
  #opCount;

  constructor(name = 'MathScribe') {
    this.#scribeId = `SCRIBE-MATH-${crypto.randomUUID()}`;
    this.#name = name;
    this.#scroll = [];
    this.#coherence = PHI_INVERSE;
    this.#opCount = new Map();
  }

  get scribeId() { return this.#scribeId; }
  get name() { return this.#name; }
  get coherence() { return this.#coherence; }
  get scrollLength() { return this.#scroll.length; }

  /**
   * Execute a math operation and scribe the result.
   * @param {string} operation  Operation name (e.g. 'add', 'modPow', 'gcd')
   * @param {string} complexity  One of the O.* constants
   * @param {function} fn       The math function to execute
   * @param  {...number} inputs
   * @returns {number}
   */
  compute(operation, complexity, fn, ...inputs) {
    const t0 = performance.now();
    const output = fn(...inputs);
    const executionUs = (performance.now() - t0) * 1000;

    this.#opCount.set(operation, (this.#opCount.get(operation) ?? 0) + 1);

    const significance = phiBlend(PHI_INVERSE, Math.min(1, Math.abs(output) / (Math.abs(output) + 1)));
    this.#coherence = phiGrow(this.#coherence, 1, 0.01);

    this.#scroll.push({
      entryId: crypto.randomUUID(),
      operation,
      inputs: [...inputs],
      output,
      complexity,
      executionUs,
      timestamp: Date.now(),
    });

    return output;
  }

  // ------------------------------------------------------------------ //
  // Convenience scribe methods for each primitive / advance             //
  // ------------------------------------------------------------------ //

  /** Scribed add */
  add(a, b)          { return this.compute('add',          O.CONST,      add,          a, b); }
  /** Scribed sub */
  sub(a, b)          { return this.compute('sub',          O.CONST,      sub,          a, b); }
  /** Scribed mul */
  mul(a, b)          { return this.compute('mul',          O.CONST,      mul,          a, b); }
  /** Scribed div */
  div(a, b)          { return this.compute('div',          O.CONST,      div,          a, b); }
  /** Scribed mod */
  mod(a, m)          { return this.compute('mod',          O.CONST,      mod,          a, m); }
  /** Scribed floorN */
  floor(n)           { return this.compute('floor',        O.CONST,      floorN,       n); }
  /** Scribed ceilN */
  ceil(n)            { return this.compute('ceil',         O.CONST,      ceilN,        n); }
  /** Scribed roundN */
  round(n)           { return this.compute('round',        O.CONST,      roundN,       n); }
  /** Scribed floorDiv */
  floorDiv(a, b)     { return this.compute('floorDiv',     O.CONST,      floorDiv,     a, b); }
  /** Scribed floorMod */
  floorMod(a, b)     { return this.compute('floorMod',     O.CONST,      floorMod,     a, b); }
  /** Scribed modAdd */
  modAdd(a, b, m)    { return this.compute('modAdd',       O.CONST,      modAdd,       a, b, m); }
  /** Scribed modMul */
  modMul(a, b, m)    { return this.compute('modMul',       O.CONST,      modMul,       a, b, m); }
  /** Scribed modPow */
  modPow(b, e, m)    { return this.compute('modPow',       O.LOG,        modPow,       b, e, m); }
  /** Scribed gcd */
  gcd(a, b)          { return this.compute('gcd',          O.LOG,        gcd,          a, b); }
  /** Scribed lcm */
  lcm(a, b)          { return this.compute('lcm',          O.LOG,        lcm,          a, b); }
  /** Scribed modInverse */
  modInverse(a, m)   { return this.compute('modInverse',   O.LOG,        modInverse,   a, m); }
  /** Scribed isPrime */
  isPrime(n)         { return this.compute('isPrime',      O.LINEAR,     (x) => Number(isPrime(x)), n); }
  /** Scribed phiWeightedSum */
  phiSum(values)     { return this.compute('phiSum',       O.LINEAR,     phiWeightedSum, ...values); }
  /** Scribed phiFloor */
  phiFloor(x)        { return this.compute('phiFloor',     O.CONST,      phiFloor,     x); }
  /** Scribed phiCeil */
  phiCeil(x)         { return this.compute('phiCeil',      O.CONST,      phiCeil,      x); }

  /**
   * Run the prime sieve and scribe all discovered primes as a batch.
   * @param {number} limit
   * @returns {number[]}
   */
  sieve(limit) {
    const t0 = performance.now();
    const primes = sieveOfEratosthenes(limit);
    const executionUs = (performance.now() - t0) * 1000;
    this.#opCount.set('sieve', (this.#opCount.get('sieve') ?? 0) + 1);
    this.#scroll.push({
      entryId: crypto.randomUUID(),
      operation: 'sieve',
      inputs: [limit],
      output: primes.length,
      complexity: O.LINEARLOG,
      executionUs,
      timestamp: Date.now(),
    });
    return primes;
  }

  /**
   * Return the full scroll (read-only copies).
   * @returns {MathEntry[]}
   */
  readScroll() {
    return this.#scroll.map(e => ({ ...e }));
  }

  /**
   * Return a summary manifest.
   * @returns {Object}
   */
  manifest() {
    const opCounts = Object.fromEntries(this.#opCount);
    const complexityCounts = {};
    for (const e of this.#scroll) {
      complexityCounts[e.complexity] = (complexityCounts[e.complexity] ?? 0) + 1;
    }
    return {
      scribeId: this.#scribeId,
      name: this.#name,
      type: 'MathScribe',
      scrollLength: this.#scroll.length,
      coherence: this.#coherence,
      operationCounts: opCounts,
      complexityCounts,
    };
  }

  /** Reset the scroll. */
  clear() { this.#scroll = []; this.#coherence = PHI_INVERSE; this.#opCount.clear(); }
}
