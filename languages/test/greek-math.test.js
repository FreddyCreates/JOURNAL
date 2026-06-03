/**
 * Greek Mathematics Test Suite
 * ============================
 * Comprehensive tests for Greek mathematical functions
 * Target: 120+ tests for Greek math module
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import GreekMath from '../gml/greek-math.js';

const {
  // Constants
  PHI, PHI_INVERSE, PHI_SQUARED, PHI_COMPLEMENT, PSI,
  PI, TAU, HALF_PI, QUARTER_PI, TWO_PI,
  EULER, EULER_MASCHERONI, OMEGA,
  SQRT_2, SQRT_3, SQRT_5, SQRT_PHI,
  LN_2, LN_10, LOG2_E, LOG10_E,
  ALPHA, BETA, GAMMA_CONST, DELTA, EPSILON, ZETA, ETA, THETA, IOTA, KAPPA,
  
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
} = GreekMath;

// ═══════════════════════════════════════════════════════════════════════════════
// MATHEMATICAL CONSTANTS TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Greek Mathematical Constants', () => {
  test('PHI (Golden Ratio) equals (1 + √5) / 2', () => {
    const expected = (1 + Math.sqrt(5)) / 2;
    assert.strictEqual(PHI, expected);
    assert.ok(Math.abs(PHI - 1.618033988749895) < 1e-10);
  });

  test('PHI_INVERSE equals 1/φ', () => {
    assert.ok(Math.abs(PHI_INVERSE - 1/PHI) < 1e-10);
  });

  test('PHI_SQUARED equals φ²', () => {
    assert.ok(Math.abs(PHI_SQUARED - PHI * PHI) < 1e-10);
  });

  test('PHI_COMPLEMENT equals 2 - φ', () => {
    assert.ok(Math.abs(PHI_COMPLEMENT - (2 - PHI)) < 1e-10);
  });

  test('PSI equals φ - 1', () => {
    assert.ok(Math.abs(PSI - (PHI - 1)) < 1e-10);
  });

  test('PHI identity: φ = 1 + 1/φ', () => {
    assert.ok(Math.abs(PHI - (1 + PHI_INVERSE)) < 1e-10);
  });

  test('PHI identity: φ² = φ + 1', () => {
    assert.ok(Math.abs(PHI_SQUARED - (PHI + 1)) < 1e-10);
  });

  test('PI equals Math.PI', () => {
    assert.strictEqual(PI, Math.PI);
  });

  test('TAU equals 2π', () => {
    assert.strictEqual(TAU, 2 * Math.PI);
  });

  test('TWO_PI equals TAU', () => {
    assert.strictEqual(TWO_PI, TAU);
  });

  test('HALF_PI equals π/2', () => {
    assert.strictEqual(HALF_PI, Math.PI / 2);
  });

  test('QUARTER_PI equals π/4', () => {
    assert.strictEqual(QUARTER_PI, Math.PI / 4);
  });

  test('EULER equals Math.E', () => {
    assert.strictEqual(EULER, Math.E);
  });

  test('EULER_MASCHERONI is approximately 0.5772', () => {
    assert.ok(Math.abs(EULER_MASCHERONI - 0.5772156649015329) < 1e-10);
  });

  test('OMEGA constant is approximately 0.5671', () => {
    assert.ok(Math.abs(OMEGA - 0.5671432904097838) < 1e-10);
  });

  test('SQRT_2 equals Math.SQRT2', () => {
    assert.strictEqual(SQRT_2, Math.SQRT2);
  });

  test('SQRT_3 equals √3', () => {
    assert.ok(Math.abs(SQRT_3 - Math.sqrt(3)) < 1e-10);
  });

  test('SQRT_5 equals √5', () => {
    assert.ok(Math.abs(SQRT_5 - Math.sqrt(5)) < 1e-10);
  });

  test('SQRT_PHI equals √φ', () => {
    assert.ok(Math.abs(SQRT_PHI - Math.sqrt(PHI)) < 1e-10);
  });

  test('LN_2 equals Math.LN2', () => {
    assert.strictEqual(LN_2, Math.LN2);
  });

  test('LN_10 equals Math.LN10', () => {
    assert.strictEqual(LN_10, Math.LN10);
  });

  test('LOG2_E equals Math.LOG2E', () => {
    assert.strictEqual(LOG2_E, Math.LOG2E);
  });

  test('LOG10_E equals Math.LOG10E', () => {
    assert.strictEqual(LOG10_E, Math.LOG10E);
  });

  test('Greek letter constants are sequential', () => {
    assert.strictEqual(ALPHA, 1);
    assert.strictEqual(BETA, 2);
    assert.strictEqual(GAMMA_CONST, 3);
    assert.strictEqual(DELTA, 4);
    assert.strictEqual(EPSILON, 5);
    assert.strictEqual(ZETA, 6);
    assert.strictEqual(ETA, 7);
    assert.strictEqual(THETA, 8);
    assert.strictEqual(IOTA, 9);
    assert.strictEqual(KAPPA, 10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FIBONACCI AND LUCAS TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Fibonacci Sequence', () => {
  test('fibonacci(0) returns empty array', () => {
    assert.deepStrictEqual(fibonacci(0), []);
  });

  test('fibonacci(1) returns [0]', () => {
    assert.deepStrictEqual(fibonacci(1), [0]);
  });

  test('fibonacci(2) returns [0, 1]', () => {
    assert.deepStrictEqual(fibonacci(2), [0, 1]);
  });

  test('fibonacci(10) returns first 10 Fibonacci numbers', () => {
    assert.deepStrictEqual(fibonacci(10), [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
  });

  test('fibonacci(15) continues correctly', () => {
    const fib15 = fibonacci(15);
    assert.strictEqual(fib15.length, 15);
    assert.strictEqual(fib15[14], 377);
  });

  test('fibonacciN(0) equals 0', () => {
    assert.strictEqual(fibonacciN(0), 0);
  });

  test('fibonacciN(1) equals 1', () => {
    assert.strictEqual(fibonacciN(1), 1);
  });

  test('fibonacciN(10) equals 55', () => {
    assert.strictEqual(fibonacciN(10), 55);
  });

  test('fibonacciN(20) equals 6765', () => {
    assert.strictEqual(fibonacciN(20), 6765);
  });

  test('fibonacciN(-1) returns 0', () => {
    assert.strictEqual(fibonacciN(-1), 0);
  });

  test('isFibonacci returns true for Fibonacci numbers', () => {
    assert.strictEqual(isFibonacci(0), true);
    assert.strictEqual(isFibonacci(1), true);
    assert.strictEqual(isFibonacci(2), true);
    assert.strictEqual(isFibonacci(3), true);
    assert.strictEqual(isFibonacci(5), true);
    assert.strictEqual(isFibonacci(8), true);
    assert.strictEqual(isFibonacci(13), true);
    assert.strictEqual(isFibonacci(21), true);
    assert.strictEqual(isFibonacci(34), true);
    assert.strictEqual(isFibonacci(55), true);
    assert.strictEqual(isFibonacci(89), true);
  });

  test('isFibonacci returns false for non-Fibonacci numbers', () => {
    assert.strictEqual(isFibonacci(4), false);
    assert.strictEqual(isFibonacci(6), false);
    assert.strictEqual(isFibonacci(7), false);
    assert.strictEqual(isFibonacci(9), false);
    assert.strictEqual(isFibonacci(10), false);
    assert.strictEqual(isFibonacci(100), false);
  });

  test('isFibonacci(-5) returns false', () => {
    assert.strictEqual(isFibonacci(-5), false);
  });
});

describe('Lucas Sequence', () => {
  test('lucas(0) returns empty array', () => {
    assert.deepStrictEqual(lucas(0), []);
  });

  test('lucas(1) returns [2]', () => {
    assert.deepStrictEqual(lucas(1), [2]);
  });

  test('lucas(2) returns [2, 1]', () => {
    assert.deepStrictEqual(lucas(2), [2, 1]);
  });

  test('lucas(10) returns first 10 Lucas numbers', () => {
    assert.deepStrictEqual(lucas(10), [2, 1, 3, 4, 7, 11, 18, 29, 47, 76]);
  });

  test('lucasN(0) equals 2', () => {
    assert.strictEqual(lucasN(0), 2);
  });

  test('lucasN(1) equals 1', () => {
    assert.strictEqual(lucasN(1), 1);
  });

  test('lucasN(10) equals 123', () => {
    assert.strictEqual(lucasN(10), 123);
  });

  test('lucasN(-1) returns 0', () => {
    assert.strictEqual(lucasN(-1), 0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GOLDEN RATIO FUNCTIONS TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Golden Ratio Functions', () => {
  test('goldenSection divides value by φ', () => {
    const result = goldenSection(100);
    assert.ok(Math.abs(result.major - 61.803398874989485) < 1e-10);
    assert.ok(Math.abs(result.minor - 38.196601125010515) < 1e-10);
  });

  test('goldenSection parts sum to original', () => {
    const result = goldenSection(100);
    assert.ok(Math.abs(result.major + result.minor - 100) < 1e-10);
  });

  test('goldenSpiralRadius at θ=0 equals a', () => {
    assert.strictEqual(goldenSpiralRadius(0, 1), 1);
  });

  test('goldenSpiralRadius increases with θ', () => {
    const r1 = goldenSpiralRadius(1);
    const r2 = goldenSpiralRadius(2);
    assert.ok(r2 > r1);
  });

  test('goldenRectangle returns correct dimensions', () => {
    const rect = goldenRectangle(100);
    assert.strictEqual(rect.width, 100);
    assert.ok(Math.abs(rect.height - 61.803398874989485) < 1e-10);
  });

  test('goldenRectangle ratio is φ', () => {
    const rect = goldenRectangle(100);
    assert.ok(Math.abs(rect.width / rect.height - PHI) < 1e-10);
  });

  test('phiWeightedAverage calculates correctly', () => {
    const result = phiWeightedAverage(10, 20);
    assert.ok(typeof result === 'number');
    assert.ok(result >= 10 && result <= 20);
  });

  test('goldenAngle is approximately 2.399963', () => {
    assert.ok(Math.abs(goldenAngle() - 2.399963229728653) < 1e-10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TRIGONOMETRIC FUNCTIONS TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Trigonometric Functions', () => {
  test('degreesToRadians(180) equals π', () => {
    assert.ok(Math.abs(degreesToRadians(180) - Math.PI) < 1e-10);
  });

  test('degreesToRadians(90) equals π/2', () => {
    assert.ok(Math.abs(degreesToRadians(90) - Math.PI / 2) < 1e-10);
  });

  test('degreesToRadians(360) equals 2π', () => {
    assert.ok(Math.abs(degreesToRadians(360) - 2 * Math.PI) < 1e-10);
  });

  test('radiansToDegrees(π) equals 180', () => {
    assert.ok(Math.abs(radiansToDegrees(Math.PI) - 180) < 1e-10);
  });

  test('radiansToDegrees(π/2) equals 90', () => {
    assert.ok(Math.abs(radiansToDegrees(Math.PI / 2) - 90) < 1e-10);
  });

  test('sec(0) equals 1', () => {
    assert.strictEqual(sec(0), 1);
  });

  test('csc(π/2) equals 1', () => {
    assert.ok(Math.abs(csc(Math.PI / 2) - 1) < 1e-10);
  });

  test('cot(π/4) equals 1', () => {
    assert.ok(Math.abs(cot(Math.PI / 4) - 1) < 1e-10);
  });

  test('sech(0) equals 1', () => {
    assert.strictEqual(sech(0), 1);
  });

  test('coth(1) is defined', () => {
    assert.ok(typeof coth(1) === 'number');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// NUMBER THEORY TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Number Theory Functions', () => {
  test('isPerfectSquare(16) is true', () => {
    assert.strictEqual(isPerfectSquare(16), true);
  });

  test('isPerfectSquare(15) is false', () => {
    assert.strictEqual(isPerfectSquare(15), false);
  });

  test('isPerfectSquare(0) is true', () => {
    assert.strictEqual(isPerfectSquare(0), true);
  });

  test('isPerfectSquare(1) is true', () => {
    assert.strictEqual(isPerfectSquare(1), true);
  });

  test('isPerfectSquare(-4) is false', () => {
    assert.strictEqual(isPerfectSquare(-4), false);
  });

  test('gcd(12, 8) equals 4', () => {
    assert.strictEqual(gcd(12, 8), 4);
  });

  test('gcd(17, 13) equals 1', () => {
    assert.strictEqual(gcd(17, 13), 1);
  });

  test('gcd(100, 25) equals 25', () => {
    assert.strictEqual(gcd(100, 25), 25);
  });

  test('lcm(4, 6) equals 12', () => {
    assert.strictEqual(lcm(4, 6), 12);
  });

  test('lcm(3, 5) equals 15', () => {
    assert.strictEqual(lcm(3, 5), 15);
  });

  test('isPrime(2) is true', () => {
    assert.strictEqual(isPrime(2), true);
  });

  test('isPrime(17) is true', () => {
    assert.strictEqual(isPrime(17), true);
  });

  test('isPrime(4) is false', () => {
    assert.strictEqual(isPrime(4), false);
  });

  test('isPrime(1) is false', () => {
    assert.strictEqual(isPrime(1), false);
  });

  test('sieveOfEratosthenes(20) returns correct primes', () => {
    assert.deepStrictEqual(sieveOfEratosthenes(20), [2, 3, 5, 7, 11, 13, 17, 19]);
  });

  test('sieveOfEratosthenes(1) returns empty', () => {
    assert.deepStrictEqual(sieveOfEratosthenes(1), []);
  });

  test('eulerTotient(10) equals 4', () => {
    assert.strictEqual(eulerTotient(10), 4);
  });

  test('eulerTotient(1) equals 1', () => {
    assert.strictEqual(eulerTotient(1), 1);
  });

  test('factorial(0) equals 1', () => {
    assert.strictEqual(factorial(0), 1);
  });

  test('factorial(5) equals 120', () => {
    assert.strictEqual(factorial(5), 120);
  });

  test('factorial(10) equals 3628800', () => {
    assert.strictEqual(factorial(10), 3628800);
  });

  test('binomial(5, 2) equals 10', () => {
    assert.strictEqual(binomial(5, 2), 10);
  });

  test('binomial(10, 3) equals 120', () => {
    assert.strictEqual(binomial(10, 3), 120);
  });

  test('binomial(n, 0) equals 1', () => {
    assert.strictEqual(binomial(5, 0), 1);
  });

  test('binomial(n, n) equals 1', () => {
    assert.strictEqual(binomial(5, 5), 1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SERIES AND SUMMATIONS TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Series and Summations', () => {
  test('arithmeticSum(1, 1, 10) equals 55', () => {
    assert.strictEqual(arithmeticSum(1, 1, 10), 55);
  });

  test('arithmeticSum(2, 3, 5) equals 40', () => {
    assert.strictEqual(arithmeticSum(2, 3, 5), 40);
  });

  test('geometricSum(1, 2, 5) equals 31', () => {
    assert.strictEqual(geometricSum(1, 2, 5), 31);
  });

  test('geometricSum(1, 1, 5) equals 5', () => {
    assert.strictEqual(geometricSum(1, 1, 5), 5);
  });

  test('infiniteGeometricSum(1, 0.5) equals 2', () => {
    assert.strictEqual(infiniteGeometricSum(1, 0.5), 2);
  });

  test('infiniteGeometricSum(1, 1) returns Infinity', () => {
    assert.strictEqual(infiniteGeometricSum(1, 1), Infinity);
  });

  test('harmonicSum(1) equals 1', () => {
    assert.strictEqual(harmonicSum(1), 1);
  });

  test('harmonicSum(4) equals 1 + 1/2 + 1/3 + 1/4', () => {
    assert.ok(Math.abs(harmonicSum(4) - (1 + 0.5 + 1/3 + 0.25)) < 1e-10);
  });

  test('baselSum converges to π²/6', () => {
    const sum = baselSum(10000);
    const target = Math.PI * Math.PI / 6;
    assert.ok(Math.abs(sum - target) < 0.001);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLEX NUMBER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Complex Numbers', () => {
  test('complex(3, 4) creates correct complex number', () => {
    const z = complex(3, 4);
    assert.strictEqual(z.real, 3);
    assert.strictEqual(z.imag, 4);
  });

  test('complex(5) has zero imaginary part', () => {
    const z = complex(5);
    assert.strictEqual(z.real, 5);
    assert.strictEqual(z.imag, 0);
  });

  test('complexAdd adds correctly', () => {
    const a = complex(1, 2);
    const b = complex(3, 4);
    const sum = complexAdd(a, b);
    assert.strictEqual(sum.real, 4);
    assert.strictEqual(sum.imag, 6);
  });

  test('complexMultiply multiplies correctly', () => {
    const a = complex(1, 2);
    const b = complex(3, 4);
    const product = complexMultiply(a, b);
    assert.strictEqual(product.real, -5);
    assert.strictEqual(product.imag, 10);
  });

  test('complexMagnitude of (3, 4) equals 5', () => {
    const z = complex(3, 4);
    assert.strictEqual(complexMagnitude(z), 5);
  });

  test('complexPhase of (1, 1) equals π/4', () => {
    const z = complex(1, 1);
    assert.ok(Math.abs(complexPhase(z) - Math.PI / 4) < 1e-10);
  });

  test('complexConjugate negates imaginary', () => {
    const z = complex(3, 4);
    const conj = complexConjugate(z);
    assert.strictEqual(conj.real, 3);
    assert.strictEqual(conj.imag, -4);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MATRIX OPERATIONS TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Matrix Operations', () => {
  test('identityMatrix(2) is correct', () => {
    const I = identityMatrix(2);
    assert.deepStrictEqual(I, [[1, 0], [0, 1]]);
  });

  test('identityMatrix(3) is correct', () => {
    const I = identityMatrix(3);
    assert.deepStrictEqual(I, [[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  });

  test('matrixMultiply with identity returns same matrix', () => {
    const A = [[1, 2], [3, 4]];
    const I = identityMatrix(2);
    const result = matrixMultiply(A, I);
    assert.deepStrictEqual(result, A);
  });

  test('matrixMultiply calculates correctly', () => {
    const A = [[1, 2], [3, 4]];
    const B = [[5, 6], [7, 8]];
    const result = matrixMultiply(A, B);
    assert.deepStrictEqual(result, [[19, 22], [43, 50]]);
  });

  test('matrixDeterminant of 2x2', () => {
    const A = [[1, 2], [3, 4]];
    assert.strictEqual(matrixDeterminant(A), -2);
  });

  test('matrixDeterminant of identity is 1', () => {
    const I = identityMatrix(2);
    assert.strictEqual(matrixDeterminant(I), 1);
  });

  test('matrixTranspose swaps rows and columns', () => {
    const A = [[1, 2, 3], [4, 5, 6]];
    const T = matrixTranspose(A);
    assert.deepStrictEqual(T, [[1, 4], [2, 5], [3, 6]]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STATISTICAL FUNCTIONS TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Statistical Functions', () => {
  test('mean of [1,2,3,4,5] equals 3', () => {
    assert.strictEqual(mean([1, 2, 3, 4, 5]), 3);
  });

  test('mean of empty array is NaN', () => {
    assert.ok(isNaN(mean([])));
  });

  test('geometricMean of [2,8] equals 4', () => {
    assert.strictEqual(geometricMean([2, 8]), 4);
  });

  test('harmonicMean of [1,2] equals 4/3', () => {
    assert.ok(Math.abs(harmonicMean([1, 2]) - 4/3) < 1e-10);
  });

  test('variance of [2,4,4,4,5,5,7,9] equals 4', () => {
    assert.strictEqual(variance([2, 4, 4, 4, 5, 5, 7, 9]), 4);
  });

  test('standardDeviation of [2,4,4,4,5,5,7,9] equals 2', () => {
    assert.strictEqual(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9]), 2);
  });

  test('median of [1,3,5] equals 3', () => {
    assert.strictEqual(median([1, 3, 5]), 3);
  });

  test('median of [1,2,3,4] equals 2.5', () => {
    assert.strictEqual(median([1, 2, 3, 4]), 2.5);
  });

  test('median of empty array is NaN', () => {
    assert.ok(isNaN(median([])));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GREEK ALPHABET TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Greek Alphabet Utilities', () => {
  test('GREEK_ALPHABET has 24 letters', () => {
    assert.strictEqual(Object.keys(GREEK_ALPHABET).length, 24);
  });

  test('GREEK_ALPHABET.alpha equals α', () => {
    assert.strictEqual(GREEK_ALPHABET.alpha, 'α');
  });

  test('GREEK_ALPHABET.omega equals ω', () => {
    assert.strictEqual(GREEK_ALPHABET.omega, 'ω');
  });

  test('GREEK_UPPERCASE has 24 letters', () => {
    assert.strictEqual(Object.keys(GREEK_UPPERCASE).length, 24);
  });

  test('GREEK_UPPERCASE.Alpha equals Α', () => {
    assert.strictEqual(GREEK_UPPERCASE.Alpha, 'Α');
  });

  test('toGreekNumeral(1) returns α', () => {
    assert.strictEqual(toGreekNumeral(1), 'α');
  });

  test('toGreekNumeral(10) returns ι', () => {
    assert.strictEqual(toGreekNumeral(10), 'ι');
  });

  test('toGreekNumeral(100) returns ρ', () => {
    assert.strictEqual(toGreekNumeral(100), 'ρ');
  });

  test('toGreekNumeral(0) returns string', () => {
    assert.strictEqual(toGreekNumeral(0), '0');
  });

  test('greekLetter(0) returns α', () => {
    assert.strictEqual(greekLetter(0), 'α');
  });

  test('greekLetter(23) returns ω', () => {
    assert.strictEqual(greekLetter(23), 'ω');
  });

  test('greekLetter wraps around', () => {
    assert.strictEqual(greekLetter(24), 'α');
  });
});

console.log('Greek Mathematics Test Suite Loaded');
