/**
 * Testing Division Integration Test Suite
 * =======================================
 * Comprehensive integration tests for the testing division
 * Combining all mathematical modules into unified testing
 * Target: 100+ additional tests
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import GreekMath from '../gml/greek-math.js';

const {
  PHI, PHI_INVERSE, PI, TAU, EULER,
  fibonacci, fibonacciN, lucas, lucasN, isFibonacci,
  goldenSection, goldenRectangle, goldenAngle, phiWeightedAverage,
  degreesToRadians, radiansToDegrees, sec, csc, cot, sech, csch, coth,
  isPerfectSquare, gcd, lcm, isPrime, sieveOfEratosthenes,
  factorial, binomial, eulerTotient,
  arithmeticSum, geometricSum, infiniteGeometricSum, harmonicSum, baselSum,
  complex, complexAdd, complexMultiply, complexMagnitude, complexPhase, complexConjugate,
  identityMatrix, matrixMultiply, matrixDeterminant, matrixTranspose,
  mean, geometricMean, harmonicMean, variance, standardDeviation, median,
  GREEK_ALPHABET, GREEK_UPPERCASE, toGreekNumeral, greekLetter
} = GreekMath;

// ═══════════════════════════════════════════════════════════════════════════════
// TESTING DIVISION: BALANCE VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Testing Division - Balance Verification', () => {
  test('All Greek letters are present in lowercase', () => {
    const expected = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta',
                      'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi',
                      'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega'];
    const actual = Object.keys(GREEK_ALPHABET);
    assert.deepStrictEqual(actual, expected);
  });

  test('All Greek letters are present in uppercase', () => {
    const expected = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
                      'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi',
                      'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'];
    const actual = Object.keys(GREEK_UPPERCASE);
    assert.deepStrictEqual(actual, expected);
  });

  test('Lowercase and uppercase match count', () => {
    assert.strictEqual(Object.keys(GREEK_ALPHABET).length, Object.keys(GREEK_UPPERCASE).length);
  });

  test('PHI and PHI_INVERSE are balanced', () => {
    assert.ok(Math.abs(PHI * PHI_INVERSE - 1) < 1e-10);
  });

  test('PI and TAU are balanced (TAU = 2*PI)', () => {
    assert.strictEqual(TAU, 2 * PI);
  });

  test('Fibonacci and Lucas are balanced sequences', () => {
    const fibs = fibonacci(20);
    const lucs = lucas(20);
    assert.strictEqual(fibs.length, lucs.length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTING DIVISION: CROSS-MODULE INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Testing Division - Cross-Module Integration', () => {
  test('Golden ratio in Fibonacci sequence', () => {
    const fibs = fibonacci(30);
    const ratio = fibs[29] / fibs[28];
    assert.ok(Math.abs(ratio - PHI) < 1e-10);
  });

  test('Golden section creates Fibonacci-like proportions', () => {
    const section = goldenSection(PHI * 100);
    assert.ok(Math.abs(section.major - 100) < 1e-10);
  });

  test('Trigonometry and PI relationship', () => {
    assert.ok(Math.abs(Math.sin(PI) - 0) < 1e-10);
    assert.ok(Math.abs(Math.cos(PI) + 1) < 1e-10);
  });

  test('Complex numbers and trigonometry (Euler formula)', () => {
    const theta = PI / 4;
    const z = complex(Math.cos(theta), Math.sin(theta));
    assert.ok(Math.abs(complexMagnitude(z) - 1) < 1e-10);
    assert.ok(Math.abs(complexPhase(z) - theta) < 1e-10);
  });

  test('Statistics on Fibonacci sequence', () => {
    const fibs = fibonacci(10);
    const m = mean(fibs);
    const v = variance(fibs);
    assert.ok(m > 0);
    assert.ok(v > 0);
  });

  test('Matrix with golden ratio', () => {
    const goldenMatrix = [[PHI, 1], [1, PHI_INVERSE]];
    const det = matrixDeterminant(goldenMatrix);
    assert.ok(Math.abs(det - (PHI * PHI_INVERSE - 1)) < 1e-10);
  });

  test('Binomial and factorial relationship', () => {
    for (let n = 0; n <= 10; n++) {
      for (let k = 0; k <= n; k++) {
        const binomialValue = binomial(n, k);
        const expected = factorial(n) / (factorial(k) * factorial(n - k));
        assert.ok(Math.abs(binomialValue - expected) < 1e-10);
      }
    }
  });

  test('Prime factorization using GCD', () => {
    const primes = sieveOfEratosthenes(20);
    for (let i = 0; i < primes.length - 1; i++) {
      assert.strictEqual(gcd(primes[i], primes[i + 1]), 1);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTING DIVISION: EDGE CASES
// ═══════════════════════════════════════════════════════════════════════════════

describe('Testing Division - Edge Cases', () => {
  test('Fibonacci edge: empty and single', () => {
    assert.deepStrictEqual(fibonacci(0), []);
    assert.deepStrictEqual(fibonacci(1), [0]);
    assert.deepStrictEqual(fibonacci(2), [0, 1]);
  });

  test('Lucas edge: empty and single', () => {
    assert.deepStrictEqual(lucas(0), []);
    assert.deepStrictEqual(lucas(1), [2]);
    assert.deepStrictEqual(lucas(2), [2, 1]);
  });

  test('Factorial edge cases', () => {
    assert.strictEqual(factorial(0), 1);
    assert.strictEqual(factorial(1), 1);
    assert.ok(isNaN(factorial(-1)));
  });

  test('Binomial edge cases', () => {
    assert.strictEqual(binomial(5, 0), 1);
    assert.strictEqual(binomial(5, 5), 1);
    assert.strictEqual(binomial(5, -1), 0);
    assert.strictEqual(binomial(5, 6), 0);
  });

  test('GCD edge cases', () => {
    assert.strictEqual(gcd(0, 5), 5);
    assert.strictEqual(gcd(5, 0), 5);
    assert.strictEqual(gcd(-12, 8), 4);
  });

  test('Prime edge cases', () => {
    assert.strictEqual(isPrime(0), false);
    assert.strictEqual(isPrime(1), false);
    assert.strictEqual(isPrime(2), true);
    assert.strictEqual(isPrime(-7), false);
  });

  test('Perfect square edge cases', () => {
    assert.strictEqual(isPerfectSquare(0), true);
    assert.strictEqual(isPerfectSquare(1), true);
    assert.strictEqual(isPerfectSquare(-4), false);
  });

  test('Statistics edge: empty array', () => {
    assert.ok(isNaN(mean([])));
    assert.ok(isNaN(median([])));
  });

  test('Identity matrix edge: 1x1', () => {
    assert.deepStrictEqual(identityMatrix(1), [[1]]);
  });

  test('Complex number edge: zero', () => {
    const zero = complex(0, 0);
    assert.strictEqual(complexMagnitude(zero), 0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTING DIVISION: PRECISION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Testing Division - Precision Tests', () => {
  test('PHI precision to 15 decimal places', () => {
    const expected = 1.618033988749895;
    assert.ok(Math.abs(PHI - expected) < 1e-15);
  });

  test('PI precision to 15 decimal places', () => {
    const expected = 3.141592653589793;
    assert.ok(Math.abs(PI - expected) < 1e-15);
  });

  test('EULER precision to 15 decimal places', () => {
    const expected = 2.718281828459045;
    assert.ok(Math.abs(EULER - expected) < 1e-15);
  });

  test('Trigonometric precision at special angles', () => {
    assert.ok(Math.abs(Math.sin(PI/6) - 0.5) < 1e-10);
    assert.ok(Math.abs(Math.cos(PI/3) - 0.5) < 1e-10);
    assert.ok(Math.abs(Math.tan(PI/4) - 1) < 1e-10);
  });

  test('Degree-radian conversion precision', () => {
    assert.ok(Math.abs(degreesToRadians(180) - PI) < 1e-15);
    assert.ok(Math.abs(radiansToDegrees(PI) - 180) < 1e-10);
  });

  test('Golden rectangle precision', () => {
    const rect = goldenRectangle(1000);
    const ratio = rect.width / rect.height;
    assert.ok(Math.abs(ratio - PHI) < 1e-10);
  });

  test('Fibonacci ratio precision', () => {
    const fibs = fibonacci(50);
    const ratio = fibs[49] / fibs[48];
    assert.ok(Math.abs(ratio - PHI) < 1e-10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTING DIVISION: PROPERTY-BASED TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Testing Division - Property-Based Tests', () => {
  test('Fibonacci property: F(n+2) = F(n+1) + F(n)', () => {
    const fibs = fibonacci(20);
    for (let i = 2; i < fibs.length; i++) {
      assert.strictEqual(fibs[i], fibs[i - 1] + fibs[i - 2]);
    }
  });

  test('Lucas property: L(n+2) = L(n+1) + L(n)', () => {
    const lucs = lucas(20);
    for (let i = 2; i < lucs.length; i++) {
      assert.strictEqual(lucs[i], lucs[i - 1] + lucs[i - 2]);
    }
  });

  test('GCD commutativity: gcd(a,b) = gcd(b,a)', () => {
    const pairs = [[12, 8], [17, 13], [100, 35], [7, 21]];
    for (const [a, b] of pairs) {
      assert.strictEqual(gcd(a, b), gcd(b, a));
    }
  });

  test('LCM commutativity: lcm(a,b) = lcm(b,a)', () => {
    const pairs = [[4, 6], [7, 11], [15, 25], [8, 12]];
    for (const [a, b] of pairs) {
      assert.strictEqual(lcm(a, b), lcm(b, a));
    }
  });

  test('Mean of symmetric array equals middle', () => {
    const arr = [1, 2, 3, 4, 5];
    assert.strictEqual(mean(arr), 3);
  });

  test('Variance is scale-invariant formula', () => {
    const arr = [1, 2, 3, 4, 5];
    const scaled = arr.map(x => x * 2);
    assert.strictEqual(variance(scaled), variance(arr) * 4);
  });

  test('Complex addition identity', () => {
    const z = complex(3, 4);
    const zero = complex(0, 0);
    const sum = complexAdd(z, zero);
    assert.strictEqual(sum.real, z.real);
    assert.strictEqual(sum.imag, z.imag);
  });

  test('Matrix identity property: A × I = A', () => {
    const A = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    const I = identityMatrix(3);
    const result = matrixMultiply(A, I);
    assert.deepStrictEqual(result, A);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTING DIVISION: COMPREHENSIVE NUMERIC TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Testing Division - Comprehensive Numeric Tests', () => {
  test('All primes under 50 identified correctly', () => {
    const primes = sieveOfEratosthenes(50);
    const expected = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    assert.deepStrictEqual(primes, expected);
  });

  test('First 15 Fibonacci numbers', () => {
    const expected = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377];
    assert.deepStrictEqual(fibonacci(15), expected);
  });

  test('First 15 Lucas numbers', () => {
    const expected = [2, 1, 3, 4, 7, 11, 18, 29, 47, 76, 123, 199, 322, 521, 843];
    assert.deepStrictEqual(lucas(15), expected);
  });

  test('Factorials 0-10', () => {
    const expected = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800];
    for (let i = 0; i <= 10; i++) {
      assert.strictEqual(factorial(i), expected[i]);
    }
  });

  test('Perfect squares 1-100', () => {
    const squares = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];
    for (const sq of squares) {
      assert.strictEqual(isPerfectSquare(sq), true);
    }
  });

  test('Non-perfect squares identified', () => {
    const nonSquares = [2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15];
    for (const n of nonSquares) {
      assert.strictEqual(isPerfectSquare(n), false);
    }
  });

  test('Euler totient for powers of 2', () => {
    assert.strictEqual(eulerTotient(2), 1);
    assert.strictEqual(eulerTotient(4), 2);
    assert.strictEqual(eulerTotient(8), 4);
    assert.strictEqual(eulerTotient(16), 8);
  });

  test('GCD of consecutive integers is 1', () => {
    for (let i = 1; i <= 20; i++) {
      assert.strictEqual(gcd(i, i + 1), 1);
    }
  });

  test('isFibonacci correctly identifies first 20 Fibonacci numbers', () => {
    const fibs = fibonacci(20);
    for (const f of fibs) {
      assert.strictEqual(isFibonacci(f), true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTING DIVISION: GREEK ALPHABET COMPLETENESS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Testing Division - Greek Alphabet Completeness', () => {
  test('All 24 lowercase Greek letters present', () => {
    const letters = Object.values(GREEK_ALPHABET);
    assert.strictEqual(letters.length, 24);
    assert.ok(letters.includes('α'));
    assert.ok(letters.includes('ω'));
  });

  test('All 24 uppercase Greek letters present', () => {
    const letters = Object.values(GREEK_UPPERCASE);
    assert.strictEqual(letters.length, 24);
    assert.ok(letters.includes('Α'));
    assert.ok(letters.includes('Ω'));
  });

  test('Greek numerals 1-9', () => {
    const numerals = ['α', 'β', 'γ', 'δ', 'ε', 'ϛ', 'ζ', 'η', 'θ'];
    for (let i = 1; i <= 9; i++) {
      assert.strictEqual(toGreekNumeral(i), numerals[i - 1]);
    }
  });

  test('greekLetter produces all letters in sequence', () => {
    const letters = Object.values(GREEK_ALPHABET);
    for (let i = 0; i < 24; i++) {
      assert.strictEqual(greekLetter(i), letters[i]);
    }
  });

  test('Greek letter cycling works', () => {
    assert.strictEqual(greekLetter(0), greekLetter(24));
    assert.strictEqual(greekLetter(1), greekLetter(25));
    assert.strictEqual(greekLetter(23), greekLetter(47));
  });
});

console.log('Testing Division Integration Test Suite Loaded');
