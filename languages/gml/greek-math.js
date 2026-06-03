/**
 * Greek Mathematics Module
 * ========================
 * Advanced Greek mathematical constants, functions, and computational tools
 * For the Cognitive Language Universe AGI system
 * 
 * φ (PHI) = Golden Ratio = (1 + √5) / 2 ≈ 1.618033988749895
 * π (PI) = Circle constant ≈ 3.141592653589793
 * τ (TAU) = 2π ≈ 6.283185307179586
 * e (EULER) = Euler's number ≈ 2.718281828459045
 * γ (GAMMA) = Euler-Mascheroni constant ≈ 0.5772156649015329
 */

// ═══════════════════════════════════════════════════════════════════════════════
// GREEK MATHEMATICAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const PHI = (1 + Math.sqrt(5)) / 2;                    // φ Golden Ratio
export const PHI_INVERSE = 1 / PHI;                            // φ⁻¹ = φ - 1
export const PHI_SQUARED = PHI * PHI;                          // φ²
export const PHI_COMPLEMENT = 2 - PHI;                         // 2 - φ
export const PSI = PHI - 1;                                    // ψ = φ - 1 = 1/φ

export const PI = Math.PI;                                     // π
export const TAU = 2 * Math.PI;                                // τ = 2π
export const HALF_PI = Math.PI / 2;                            // π/2
export const QUARTER_PI = Math.PI / 4;                         // π/4
export const TWO_PI = TAU;                                     // 2π alias

export const EULER = Math.E;                                   // e
export const EULER_MASCHERONI = 0.5772156649015329;            // γ (Euler-Mascheroni)
export const OMEGA = 0.5671432904097838;                       // Ω (Omega constant)

export const SQRT_2 = Math.SQRT2;                              // √2
export const SQRT_3 = Math.sqrt(3);                            // √3
export const SQRT_5 = Math.sqrt(5);                            // √5
export const SQRT_PHI = Math.sqrt(PHI);                        // √φ

export const LN_2 = Math.LN2;                                  // ln(2)
export const LN_10 = Math.LN10;                                // ln(10)
export const LOG2_E = Math.LOG2E;                              // log₂(e)
export const LOG10_E = Math.LOG10E;                            // log₁₀(e)

// Greek letter symbolic constants
export const ALPHA = 1;
export const BETA = 2;
export const GAMMA_CONST = 3;
export const DELTA = 4;
export const EPSILON = 5;
export const ZETA = 6;
export const ETA = 7;
export const THETA = 8;
export const IOTA = 9;
export const KAPPA = 10;
export const LAMBDA_CONST = 11;
export const MU = 12;
export const NU = 13;
export const XI = 14;
export const OMICRON = 15;
export const PI_CONST = 16;
export const RHO = 17;
export const SIGMA = 18;
export const TAU_CONST = 19;
export const UPSILON = 20;
export const CHI = 22;
export const PSI_CONST = 23;
export const OMEGA_CONST = 24;

// ═══════════════════════════════════════════════════════════════════════════════
// FIBONACCI AND LUCAS SEQUENCES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate Fibonacci sequence
 * @param {number} n - Number of terms
 * @returns {number[]} Fibonacci sequence
 */
export function fibonacci(n) {
  if (n <= 0) return [];
  if (n === 1) return [0];
  if (n === 2) return [0, 1];
  
  const seq = [0, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq;
}

/**
 * Get nth Fibonacci number using Binet's formula
 * @param {number} n - Index (0-based)
 * @returns {number} nth Fibonacci number
 */
export function fibonacciN(n) {
  if (n < 0) return 0;
  return Math.round((Math.pow(PHI, n) - Math.pow(-PHI_INVERSE, n)) / SQRT_5);
}

/**
 * Generate Lucas sequence
 * @param {number} n - Number of terms
 * @returns {number[]} Lucas sequence
 */
export function lucas(n) {
  if (n <= 0) return [];
  if (n === 1) return [2];
  if (n === 2) return [2, 1];
  
  const seq = [2, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq;
}

/**
 * Get nth Lucas number
 * @param {number} n - Index (0-based)
 * @returns {number} nth Lucas number
 */
export function lucasN(n) {
  if (n < 0) return 0;
  return Math.round(Math.pow(PHI, n) + Math.pow(-PHI_INVERSE, n));
}

/**
 * Check if a number is a Fibonacci number
 * @param {number} num - Number to check
 * @returns {boolean} True if Fibonacci number
 */
export function isFibonacci(num) {
  if (num < 0) return false;
  const a = 5 * num * num + 4;
  const b = 5 * num * num - 4;
  return isPerfectSquare(a) || isPerfectSquare(b);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOLDEN RATIO FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Golden section of a value
 * @param {number} value - Input value
 * @returns {{major: number, minor: number}} Golden section parts
 */
export function goldenSection(value) {
  const major = value / PHI;
  const minor = value - major;
  return { major, minor };
}

/**
 * Golden spiral radius at angle theta
 * @param {number} theta - Angle in radians
 * @param {number} a - Initial radius (default 1)
 * @param {number} b - Growth factor (default PHI^(2/π))
 * @returns {number} Radius
 */
export function goldenSpiralRadius(theta, a = 1, b = Math.pow(PHI, 2 / PI)) {
  return a * Math.pow(b, theta);
}

/**
 * Golden rectangle dimensions
 * @param {number} width - Width of rectangle
 * @returns {{width: number, height: number}} Rectangle dimensions
 */
export function goldenRectangle(width) {
  return {
    width,
    height: width / PHI
  };
}

/**
 * Calculate phi-weighted average
 * @param {number} a - First value
 * @param {number} b - Second value
 * @returns {number} Phi-weighted average
 */
export function phiWeightedAverage(a, b) {
  return (a * PHI + b * PHI_INVERSE) / (PHI + PHI_INVERSE);
}

/**
 * Golden angle in radians
 * @returns {number} Golden angle ≈ 2.399963...
 */
export function goldenAngle() {
  return TAU * PHI_INVERSE * PHI_INVERSE;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRIGONOMETRIC FUNCTIONS (Extended)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function degreesToRadians(degrees) {
  return degrees * (PI / 180);
}

/**
 * Radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
export function radiansToDegrees(radians) {
  return radians * (180 / PI);
}

/**
 * Secant function
 * @param {number} x - Angle in radians
 * @returns {number} sec(x)
 */
export function sec(x) {
  return 1 / Math.cos(x);
}

/**
 * Cosecant function
 * @param {number} x - Angle in radians
 * @returns {number} csc(x)
 */
export function csc(x) {
  return 1 / Math.sin(x);
}

/**
 * Cotangent function
 * @param {number} x - Angle in radians
 * @returns {number} cot(x)
 */
export function cot(x) {
  return 1 / Math.tan(x);
}

/**
 * Hyperbolic secant
 * @param {number} x - Input value
 * @returns {number} sech(x)
 */
export function sech(x) {
  return 1 / Math.cosh(x);
}

/**
 * Hyperbolic cosecant
 * @param {number} x - Input value
 * @returns {number} csch(x)
 */
export function csch(x) {
  return 1 / Math.sinh(x);
}

/**
 * Hyperbolic cotangent
 * @param {number} x - Input value
 * @returns {number} coth(x)
 */
export function coth(x) {
  return 1 / Math.tanh(x);
}

// ═══════════════════════════════════════════════════════════════════════════════
// NUMBER THEORY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if number is perfect square
 * @param {number} n - Number to check
 * @returns {boolean} True if perfect square
 */
export function isPerfectSquare(n) {
  if (n < 0) return false;
  const sqrt = Math.sqrt(n);
  return sqrt === Math.floor(sqrt);
}

/**
 * Greatest common divisor using Euclidean algorithm
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} GCD of a and b
 */
export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

/**
 * Least common multiple
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} LCM of a and b
 */
export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

/**
 * Check if number is prime
 * @param {number} n - Number to check
 * @returns {boolean} True if prime
 */
export function isPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

/**
 * Generate prime numbers up to n using Sieve of Eratosthenes
 * @param {number} n - Upper limit
 * @returns {number[]} Array of primes
 */
export function sieveOfEratosthenes(n) {
  if (n < 2) return [];
  const sieve = new Array(n + 1).fill(true);
  sieve[0] = sieve[1] = false;
  
  for (let i = 2; i * i <= n; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= n; j += i) {
        sieve[j] = false;
      }
    }
  }
  
  return sieve.map((isPrime, index) => isPrime ? index : -1).filter(n => n !== -1);
}

/**
 * Euler's totient function φ(n)
 * @param {number} n - Input number
 * @returns {number} Count of numbers coprime to n
 */
export function eulerTotient(n) {
  if (n <= 0) return 0;
  let result = n;
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      while (n % p === 0) {
        n /= p;
      }
      result -= result / p;
    }
  }
  if (n > 1) {
    result -= result / n;
  }
  return Math.round(result);
}

/**
 * Factorial
 * @param {number} n - Input number
 * @returns {number} n!
 */
export function factorial(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Binomial coefficient C(n, k)
 * @param {number} n - Total items
 * @param {number} k - Items to choose
 * @returns {number} Number of combinations
 */
export function binomial(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERIES AND SUMMATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Arithmetic series sum
 * @param {number} a - First term
 * @param {number} d - Common difference
 * @param {number} n - Number of terms
 * @returns {number} Sum of arithmetic series
 */
export function arithmeticSum(a, d, n) {
  return (n / 2) * (2 * a + (n - 1) * d);
}

/**
 * Geometric series sum
 * @param {number} a - First term
 * @param {number} r - Common ratio
 * @param {number} n - Number of terms
 * @returns {number} Sum of geometric series
 */
export function geometricSum(a, r, n) {
  if (r === 1) return a * n;
  return a * (1 - Math.pow(r, n)) / (1 - r);
}

/**
 * Infinite geometric series sum (|r| < 1)
 * @param {number} a - First term
 * @param {number} r - Common ratio (must be |r| < 1)
 * @returns {number} Sum of infinite series
 */
export function infiniteGeometricSum(a, r) {
  if (Math.abs(r) >= 1) return Infinity;
  return a / (1 - r);
}

/**
 * Harmonic series partial sum
 * @param {number} n - Number of terms
 * @returns {number} Partial sum H_n
 */
export function harmonicSum(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += 1 / i;
  }
  return sum;
}

/**
 * Basel series partial sum (π²/6)
 * @param {number} n - Number of terms
 * @returns {number} Partial sum approaching π²/6
 */
export function baselSum(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += 1 / (i * i);
  }
  return sum;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLEX NUMBER OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create complex number
 * @param {number} real - Real part
 * @param {number} imag - Imaginary part
 * @returns {{real: number, imag: number}} Complex number
 */
export function complex(real, imag = 0) {
  return { real, imag };
}

/**
 * Complex addition
 * @param {{real: number, imag: number}} a - First complex
 * @param {{real: number, imag: number}} b - Second complex
 * @returns {{real: number, imag: number}} Sum
 */
export function complexAdd(a, b) {
  return { real: a.real + b.real, imag: a.imag + b.imag };
}

/**
 * Complex multiplication
 * @param {{real: number, imag: number}} a - First complex
 * @param {{real: number, imag: number}} b - Second complex
 * @returns {{real: number, imag: number}} Product
 */
export function complexMultiply(a, b) {
  return {
    real: a.real * b.real - a.imag * b.imag,
    imag: a.real * b.imag + a.imag * b.real
  };
}

/**
 * Complex magnitude
 * @param {{real: number, imag: number}} z - Complex number
 * @returns {number} Magnitude |z|
 */
export function complexMagnitude(z) {
  return Math.sqrt(z.real * z.real + z.imag * z.imag);
}

/**
 * Complex phase (argument)
 * @param {{real: number, imag: number}} z - Complex number
 * @returns {number} Phase in radians
 */
export function complexPhase(z) {
  return Math.atan2(z.imag, z.real);
}

/**
 * Complex conjugate
 * @param {{real: number, imag: number}} z - Complex number
 * @returns {{real: number, imag: number}} Conjugate
 */
export function complexConjugate(z) {
  return { real: z.real, imag: -z.imag };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MATRIX OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create identity matrix
 * @param {number} n - Size
 * @returns {number[][]} Identity matrix
 */
export function identityMatrix(n) {
  const matrix = [];
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      matrix[i][j] = i === j ? 1 : 0;
    }
  }
  return matrix;
}

/**
 * Matrix multiplication
 * @param {number[][]} a - First matrix
 * @param {number[][]} b - Second matrix
 * @returns {number[][]} Product matrix
 */
export function matrixMultiply(a, b) {
  const rowsA = a.length;
  const colsA = a[0].length;
  const colsB = b[0].length;
  
  const result = [];
  for (let i = 0; i < rowsA; i++) {
    result[i] = [];
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

/**
 * Matrix determinant (2x2 or 3x3)
 * @param {number[][]} m - Square matrix
 * @returns {number} Determinant
 */
export function matrixDeterminant(m) {
  const n = m.length;
  if (n === 1) return m[0][0];
  if (n === 2) {
    return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  }
  if (n === 3) {
    return (
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
      m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
      m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    );
  }
  throw new Error('Matrix must be 1x1, 2x2, or 3x3');
}

/**
 * Matrix transpose
 * @param {number[][]} m - Matrix
 * @returns {number[][]} Transposed matrix
 */
export function matrixTranspose(m) {
  const rows = m.length;
  const cols = m[0].length;
  const result = [];
  for (let j = 0; j < cols; j++) {
    result[j] = [];
    for (let i = 0; i < rows; i++) {
      result[j][i] = m[i][j];
    }
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATISTICAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Arithmetic mean
 * @param {number[]} arr - Array of numbers
 * @returns {number} Mean
 */
export function mean(arr) {
  if (arr.length === 0) return NaN;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Geometric mean
 * @param {number[]} arr - Array of positive numbers
 * @returns {number} Geometric mean
 */
export function geometricMean(arr) {
  if (arr.length === 0) return NaN;
  const product = arr.reduce((a, b) => a * b, 1);
  return Math.pow(product, 1 / arr.length);
}

/**
 * Harmonic mean
 * @param {number[]} arr - Array of positive numbers
 * @returns {number} Harmonic mean
 */
export function harmonicMean(arr) {
  if (arr.length === 0) return NaN;
  const reciprocalSum = arr.reduce((a, b) => a + 1 / b, 0);
  return arr.length / reciprocalSum;
}

/**
 * Variance
 * @param {number[]} arr - Array of numbers
 * @returns {number} Variance
 */
export function variance(arr) {
  const m = mean(arr);
  return mean(arr.map(x => Math.pow(x - m, 2)));
}

/**
 * Standard deviation
 * @param {number[]} arr - Array of numbers
 * @returns {number} Standard deviation
 */
export function standardDeviation(arr) {
  return Math.sqrt(variance(arr));
}

/**
 * Median
 * @param {number[]} arr - Array of numbers
 * @returns {number} Median
 */
export function median(arr) {
  if (arr.length === 0) return NaN;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GREEK ALPHABET UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

export const GREEK_ALPHABET = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε',
  zeta: 'ζ', eta: 'η', theta: 'θ', iota: 'ι', kappa: 'κ',
  lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', omicron: 'ο',
  pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', upsilon: 'υ',
  phi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω'
};

export const GREEK_UPPERCASE = {
  Alpha: 'Α', Beta: 'Β', Gamma: 'Γ', Delta: 'Δ', Epsilon: 'Ε',
  Zeta: 'Ζ', Eta: 'Η', Theta: 'Θ', Iota: 'Ι', Kappa: 'Κ',
  Lambda: 'Λ', Mu: 'Μ', Nu: 'Ν', Xi: 'Ξ', Omicron: 'Ο',
  Pi: 'Π', Rho: 'Ρ', Sigma: 'Σ', Tau: 'Τ', Upsilon: 'Υ',
  Phi: 'Φ', Chi: 'Χ', Psi: 'Ψ', Omega: 'Ω'
};

/**
 * Convert number to Greek numeral (ancient Attic/Ionian system)
 * @param {number} n - Number (1-999)
 * @returns {string} Greek numeral representation
 */
export function toGreekNumeral(n) {
  if (n < 1 || n > 999) return String(n);
  
  const ones = ['', 'α', 'β', 'γ', 'δ', 'ε', 'ϛ', 'ζ', 'η', 'θ'];
  const tens = ['', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ϙ'];
  const hundreds = ['', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'ϡ'];
  
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;
  
  return hundreds[h] + tens[t] + ones[o];
}

/**
 * Get Greek letter for index
 * @param {number} index - 0-based index
 * @returns {string} Greek letter
 */
export function greekLetter(index) {
  const letters = Object.values(GREEK_ALPHABET);
  return letters[index % letters.length];
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT ALL FOR TESTING
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  // Constants
  PHI, PHI_INVERSE, PHI_SQUARED, PHI_COMPLEMENT, PSI,
  PI, TAU, HALF_PI, QUARTER_PI, TWO_PI,
  EULER, EULER_MASCHERONI, OMEGA,
  SQRT_2, SQRT_3, SQRT_5, SQRT_PHI,
  LN_2, LN_10, LOG2_E, LOG10_E,
  ALPHA, BETA, GAMMA_CONST, DELTA, EPSILON, ZETA, ETA, THETA, IOTA, KAPPA,
  LAMBDA_CONST, MU, NU, XI, OMICRON, PI_CONST, RHO, SIGMA, TAU_CONST, UPSILON,
  CHI, PSI_CONST, OMEGA_CONST,
  
  // Fibonacci/Lucas
  fibonacci, fibonacciN, lucas, lucasN, isFibonacci,
  
  // Golden ratio
  goldenSection, goldenSpiralRadius, goldenRectangle, phiWeightedAverage, goldenAngle,
  
  // Trigonometry
  degreesToRadians, radiansToDegrees, sec, csc, cot, sech, csch, coth,
  
  // Number theory
  isPerfectSquare, gcd, lcm, isPrime, sieveOfEratosthenes, eulerTotient,
  factorial, binomial,
  
  // Series
  arithmeticSum, geometricSum, infiniteGeometricSum, harmonicSum, baselSum,
  
  // Complex numbers
  complex, complexAdd, complexMultiply, complexMagnitude, complexPhase, complexConjugate,
  
  // Matrices
  identityMatrix, matrixMultiply, matrixDeterminant, matrixTranspose,
  
  // Statistics
  mean, geometricMean, harmonicMean, variance, standardDeviation, median,
  
  // Greek alphabet
  GREEK_ALPHABET, GREEK_UPPERCASE, toGreekNumeral, greekLetter
};
