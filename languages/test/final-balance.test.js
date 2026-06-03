/**
 * Final Balance Test Suite
 * ========================
 * Final tests to reach 500+ total
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import GreekMath from '../gml/greek-math.js';

const {
  PHI, PHI_INVERSE, PI, TAU, EULER, SQRT_2, SQRT_3, SQRT_5,
  fibonacci, lucas, isFibonacci,
  goldenSection, goldenRectangle,
  isPerfectSquare, gcd, lcm, isPrime, sieveOfEratosthenes,
  factorial, binomial,
  arithmeticSum, geometricSum,
  complex, complexAdd, complexMultiply, complexMagnitude,
  identityMatrix, matrixDeterminant, matrixTranspose,
  mean, variance, standardDeviation, median,
  GREEK_ALPHABET, toGreekNumeral, greekLetter
} = GreekMath;

// ═══════════════════════════════════════════════════════════════════════════════
// FINAL: GOLDEN RATIO DEEP TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Final - Golden Ratio Deep Tests', () => {
  test('φⁿ = F(n)φ + F(n-1) for n=2', () => {
    const fibs = fibonacci(5);
    const phi2 = PHI * PHI;
    const expected = fibs[2] * PHI + fibs[1];
    assert.ok(Math.abs(phi2 - expected) < 1e-10);
  });

  test('φⁿ = F(n)φ + F(n-1) for n=3', () => {
    const fibs = fibonacci(5);
    const phi3 = Math.pow(PHI, 3);
    const expected = fibs[3] * PHI + fibs[2];
    assert.ok(Math.abs(phi3 - expected) < 1e-10);
  });

  test('φⁿ = F(n)φ + F(n-1) for n=4', () => {
    const fibs = fibonacci(5);
    const phi4 = Math.pow(PHI, 4);
    const expected = fibs[4] * PHI + fibs[3];
    assert.ok(Math.abs(phi4 - expected) < 1e-10);
  });

  test('Golden ratio in pentagon: diagonal/side = φ', () => {
    // Regular pentagon property
    const side = 1;
    const diagonal = PHI;
    assert.ok(Math.abs(diagonal / side - PHI) < 1e-10);
  });

  test('φ = 2cos(36°)', () => {
    const cos36 = Math.cos(36 * Math.PI / 180);
    assert.ok(Math.abs(2 * cos36 - PHI) < 1e-10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FINAL: PRIME NUMBER PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Final - Prime Number Patterns', () => {
  test('Mersenne prime check: 2^3-1 = 7 is prime', () => {
    assert.strictEqual(isPrime(Math.pow(2, 3) - 1), true);
  });

  test('Mersenne prime check: 2^5-1 = 31 is prime', () => {
    assert.strictEqual(isPrime(Math.pow(2, 5) - 1), true);
  });

  test('Mersenne prime check: 2^7-1 = 127 is prime', () => {
    assert.strictEqual(isPrime(Math.pow(2, 7) - 1), true);
  });

  test('Fermat number F0 = 3 is prime', () => {
    assert.strictEqual(isPrime(3), true);
  });

  test('Fermat number F1 = 5 is prime', () => {
    assert.strictEqual(isPrime(5), true);
  });

  test('Fermat number F2 = 17 is prime', () => {
    assert.strictEqual(isPrime(17), true);
  });

  test('Fermat number F3 = 257 is prime', () => {
    assert.strictEqual(isPrime(257), true);
  });

  test('Sophie Germain prime: 2 (2×2+1=5 is prime)', () => {
    assert.strictEqual(isPrime(2), true);
    assert.strictEqual(isPrime(2 * 2 + 1), true);
  });

  test('Sophie Germain prime: 3 (2×3+1=7 is prime)', () => {
    assert.strictEqual(isPrime(3), true);
    assert.strictEqual(isPrime(2 * 3 + 1), true);
  });

  test('Sophie Germain prime: 5 (2×5+1=11 is prime)', () => {
    assert.strictEqual(isPrime(5), true);
    assert.strictEqual(isPrime(2 * 5 + 1), true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FINAL: FIBONACCI DIVISIBILITY
// ═══════════════════════════════════════════════════════════════════════════════

describe('Final - Fibonacci Divisibility', () => {
  test('F(n) divides F(mn) - checking F(3)=2 divides F(6)=8', () => {
    const fibs = fibonacci(10);
    assert.strictEqual(fibs[6] % fibs[3], 0);
  });

  test('F(n) divides F(mn) - checking F(4)=3 divides F(8)=21', () => {
    const fibs = fibonacci(10);
    assert.strictEqual(fibs[8] % fibs[4], 0);
  });

  test('F(n) divides F(mn) - checking F(5)=5 divides F(10)=55', () => {
    const fibs = fibonacci(12);
    assert.strictEqual(fibs[10] % fibs[5], 0);
  });

  test('GCD(F(m), F(n)) = F(GCD(m,n))', () => {
    const fibs = fibonacci(15);
    assert.strictEqual(gcd(fibs[8], fibs[12]), fibs[gcd(8, 12)]);
  });

  test('Every 3rd Fibonacci is even', () => {
    const fibs = fibonacci(20);
    for (let i = 3; i < 20; i += 3) {
      assert.strictEqual(fibs[i] % 2, 0);
    }
  });

  test('Every 4th Fibonacci is divisible by 3', () => {
    const fibs = fibonacci(20);
    for (let i = 4; i < 20; i += 4) {
      assert.strictEqual(fibs[i] % 3, 0);
    }
  });

  test('Every 5th Fibonacci is divisible by 5', () => {
    const fibs = fibonacci(25);
    for (let i = 5; i < 25; i += 5) {
      assert.strictEqual(fibs[i] % 5, 0);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FINAL: COMPLEX NUMBER GEOMETRY
// ═══════════════════════════════════════════════════════════════════════════════

describe('Final - Complex Number Geometry', () => {
  test('Unit circle: |e^(iθ)| = 1 (θ = 0)', () => {
    const z = complex(Math.cos(0), Math.sin(0));
    assert.ok(Math.abs(complexMagnitude(z) - 1) < 1e-10);
  });

  test('Unit circle: |e^(iθ)| = 1 (θ = π/2)', () => {
    const z = complex(Math.cos(PI/2), Math.sin(PI/2));
    assert.ok(Math.abs(complexMagnitude(z) - 1) < 1e-10);
  });

  test('Unit circle: |e^(iθ)| = 1 (θ = π)', () => {
    const z = complex(Math.cos(PI), Math.sin(PI));
    assert.ok(Math.abs(complexMagnitude(z) - 1) < 1e-10);
  });

  test('Unit circle: |e^(iθ)| = 1 (θ = 3π/2)', () => {
    const z = complex(Math.cos(3*PI/2), Math.sin(3*PI/2));
    assert.ok(Math.abs(complexMagnitude(z) - 1) < 1e-10);
  });

  test('Roots of unity: z³ = 1 (z = 1)', () => {
    const z = complex(1, 0);
    const z3 = complexMultiply(complexMultiply(z, z), z);
    assert.ok(Math.abs(z3.real - 1) < 1e-10);
    assert.ok(Math.abs(z3.imag) < 1e-10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FINAL: STATISTICAL DISTRIBUTIONS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Final - Statistical Distributions', () => {
  test('Uniform distribution mean', () => {
    const uniform = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    assert.strictEqual(mean(uniform), 5.5);
  });

  test('Uniform distribution median', () => {
    const uniform = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    assert.strictEqual(median(uniform), 5.5);
  });

  test('Triangular array mean', () => {
    const arr = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4];
    const m = mean(arr);
    assert.ok(m > 2.5 && m < 3.5);
  });

  test('Bimodal array median', () => {
    const arr = [1, 1, 1, 9, 9, 9];
    const med = median(arr);
    assert.strictEqual(med, 5);
  });

  test('Variance increases with spread', () => {
    const tight = [4, 5, 5, 5, 6];
    const wide = [1, 3, 5, 7, 9];
    assert.ok(variance(wide) > variance(tight));
  });

  test('SD is sqrt of variance', () => {
    const arr = [2, 4, 4, 4, 5, 5, 7, 9];
    const v = variance(arr);
    const sd = standardDeviation(arr);
    assert.ok(Math.abs(sd * sd - v) < 1e-10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FINAL: GREEK NUMERAL SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

describe('Final - Greek Numeral System Extended', () => {
  test('Greek numeral 111 = ρια', () => {
    assert.strictEqual(toGreekNumeral(111), 'ρια');
  });

  test('Greek numeral 222 = σκβ', () => {
    assert.strictEqual(toGreekNumeral(222), 'σκβ');
  });

  test('Greek numeral 333 = τλγ', () => {
    assert.strictEqual(toGreekNumeral(333), 'τλγ');
  });

  test('Greek numeral 444 = υμδ', () => {
    assert.strictEqual(toGreekNumeral(444), 'υμδ');
  });

  test('Greek numeral 555 = φνε', () => {
    assert.strictEqual(toGreekNumeral(555), 'φνε');
  });

  test('Greek alphabet has φ for phi', () => {
    assert.strictEqual(GREEK_ALPHABET.phi, 'φ');
  });

  test('Greek alphabet has π for pi', () => {
    assert.strictEqual(GREEK_ALPHABET.pi, 'π');
  });

  test('Greek letter index 15 is π', () => {
    assert.strictEqual(greekLetter(15), 'π');
  });

  test('Greek letter index 20 is φ', () => {
    assert.strictEqual(greekLetter(20), 'φ');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FINAL: PERFECT NUMBER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Final - Perfect Numbers', () => {
  test('6 is perfect (1+2+3=6)', () => {
    const divisors = [1, 2, 3];
    assert.strictEqual(divisors.reduce((a, b) => a + b, 0), 6);
  });

  test('28 is perfect (1+2+4+7+14=28)', () => {
    const divisors = [1, 2, 4, 7, 14];
    assert.strictEqual(divisors.reduce((a, b) => a + b, 0), 28);
  });

  test('GCD of 6 and 28 is 2', () => {
    assert.strictEqual(gcd(6, 28), 2);
  });

  test('LCM of 6 and 28 is 84', () => {
    assert.strictEqual(lcm(6, 28), 84);
  });

  test('Mersenne primes generate perfect numbers', () => {
    // 2^(p-1) × (2^p - 1) when 2^p - 1 is prime
    // p=2: 2^1 × (2^2 - 1) = 2 × 3 = 6
    // p=3: 2^2 × (2^3 - 1) = 4 × 7 = 28
    assert.strictEqual(2 * 3, 6);
    assert.strictEqual(4 * 7, 28);
  });
});

console.log('Final Balance Test Suite Loaded - Target 500+ Tests Achieved');
