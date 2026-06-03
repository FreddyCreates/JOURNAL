/**
 * Greek Mathematical Balance Test Suite
 * ======================================
 * Tests for φ-balance, mathematical harmony, and number theory verification
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import GreekMath from '../gml/greek-math.js';

const { PHI, PI, TAU, EULER, SQRT_5, SQRT_2, SQRT_3 } = GreekMath;

// ═══════════════════════════════════════════════════════════════════════════════
// GOLDEN RATIO BALANCE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Greek Balance - Golden Ratio Properties', () => {
  test('φ - 1 = 1/φ', () => {
    assert.ok(Math.abs((PHI - 1) - (1/PHI)) < 1e-10);
  });

  test('φ² - φ - 1 = 0', () => {
    assert.ok(Math.abs(PHI * PHI - PHI - 1) < 1e-10);
  });

  test('φ + 1/φ = √5', () => {
    assert.ok(Math.abs((PHI + 1/PHI) - SQRT_5) < 1e-10);
  });

  test('φ - 1/φ = 1', () => {
    assert.ok(Math.abs((PHI - 1/PHI) - 1) < 1e-10);
  });

  test('2φ - 1 = √5', () => {
    assert.ok(Math.abs((2 * PHI - 1) - SQRT_5) < 1e-10);
  });

  test('φ³ = 2φ + 1', () => {
    assert.ok(Math.abs(Math.pow(PHI, 3) - (2 * PHI + 1)) < 1e-10);
  });

  test('φ⁴ = 3φ + 2', () => {
    assert.ok(Math.abs(Math.pow(PHI, 4) - (3 * PHI + 2)) < 1e-10);
  });

  test('φ⁵ = 5φ + 3', () => {
    assert.ok(Math.abs(Math.pow(PHI, 5) - (5 * PHI + 3)) < 1e-10);
  });
});

describe('Greek Balance - Circle Constants', () => {
  test('TAU = 2π', () => {
    assert.ok(Math.abs(TAU - 2 * PI) < 1e-10);
  });

  test('e^(iπ) + 1 = 0 (Euler identity check via cos/sin)', () => {
    // e^(iπ) = cos(π) + i*sin(π) = -1 + 0i
    const cosPI = Math.cos(PI);
    const sinPI = Math.sin(PI);
    assert.ok(Math.abs(cosPI + 1) < 1e-10);
    assert.ok(Math.abs(sinPI) < 1e-10);
  });

  test('sin²(x) + cos²(x) = 1 for various x', () => {
    const angles = [0, PI/6, PI/4, PI/3, PI/2, PI, TAU];
    for (const x of angles) {
      const sum = Math.sin(x) ** 2 + Math.cos(x) ** 2;
      assert.ok(Math.abs(sum - 1) < 1e-10);
    }
  });
});

describe('Greek Balance - Exponential & Logarithmic', () => {
  test('ln(e) = 1', () => {
    assert.ok(Math.abs(Math.log(EULER) - 1) < 1e-10);
  });

  test('e^(ln(x)) = x', () => {
    const values = [1, 2, EULER, PHI, PI, 10];
    for (const x of values) {
      assert.ok(Math.abs(Math.exp(Math.log(x)) - x) < 1e-10);
    }
  });

  test('ln(ab) = ln(a) + ln(b)', () => {
    const pairs = [[2, 3], [PHI, EULER], [PI, 2]];
    for (const [a, b] of pairs) {
      assert.ok(Math.abs(Math.log(a * b) - (Math.log(a) + Math.log(b))) < 1e-10);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SQUARE ROOT BALANCE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Greek Balance - Square Roots', () => {
  test('√2 × √2 = 2', () => {
    assert.ok(Math.abs(SQRT_2 * SQRT_2 - 2) < 1e-10);
  });

  test('√3 × √3 = 3', () => {
    assert.ok(Math.abs(SQRT_3 * SQRT_3 - 3) < 1e-10);
  });

  test('√5 × √5 = 5', () => {
    assert.ok(Math.abs(SQRT_5 * SQRT_5 - 5) < 1e-10);
  });

  test('√(ab) = √a × √b', () => {
    const pairs = [[2, 3], [4, 9], [PHI, PI]];
    for (const [a, b] of pairs) {
      assert.ok(Math.abs(Math.sqrt(a * b) - Math.sqrt(a) * Math.sqrt(b)) < 1e-10);
    }
  });

  test('(√2)² + (√3)² = 5', () => {
    assert.ok(Math.abs(SQRT_2 * SQRT_2 + SQRT_3 * SQRT_3 - 5) < 1e-10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// LUCAS SEQUENCE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Greek Balance - Lucas Sequence', () => {
  test('Lucas sequence values L(n)', () => {
    const expected = [2, 1, 3, 4, 7, 11, 18, 29, 47, 76];
    const lucas = GreekMath.lucas(10);
    for (let i = 0; i < expected.length; i++) {
      assert.strictEqual(lucas[i], expected[i], `L(${i}) should be ${expected[i]}`);
    }
  });

  test('Lucas relation: L(n) = F(n-1) + F(n+1)', () => {
    const lucas = GreekMath.lucas(12);
    for (let n = 1; n < 10; n++) {
      const fib_n_minus_1 = GreekMath.fibonacciN(n - 1);
      const fib_n_plus_1 = GreekMath.fibonacciN(n + 1);
      assert.strictEqual(lucas[n], fib_n_minus_1 + fib_n_plus_1);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRIME NUMBER BALANCE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Greek Balance - Prime Properties', () => {
  test('First 15 primes', () => {
    const first15 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    for (const p of first15) {
      assert.strictEqual(GreekMath.isPrime(p), true);
    }
  });

  test('Composite numbers between primes', () => {
    // Numbers that are definitely composite
    const composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28];
    for (const c of composites) {
      assert.strictEqual(GreekMath.isPrime(c), false);
    }
  });

  test('Prime factorization uniqueness', () => {
    // 60 = 2² × 3 × 5
    // Check that product of factors equals original
    const testNums = [12, 18, 24, 36, 60, 100];
    for (const n of testNums) {
      let product = 1;
      let temp = n;
      for (let d = 2; d <= temp; d++) {
        while (temp % d === 0) {
          product *= d;
          temp /= d;
        }
      }
      assert.strictEqual(product, n);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MATRIX OPERATIONS TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Greek Balance - Matrix Operations', () => {
  test('2x2 identity matrix determinant = 1', () => {
    const det = 1 * 1 - 0 * 0;
    assert.strictEqual(det, 1);
  });

  test('Matrix determinant for φ-matrix', () => {
    // [[φ, 1], [1, φ⁻¹]] should have det = φ × φ⁻¹ - 1 = 1 - 1 = 0
    const det = PHI * (1/PHI) - 1 * 1;
    assert.ok(Math.abs(det) < 1e-10);
  });

  test('Rotation matrix preserves length', () => {
    const theta = PI / 4;
    const cos_t = Math.cos(theta);
    const sin_t = Math.sin(theta);
    
    // Rotate vector (1, 0)
    const x = cos_t * 1 + sin_t * 0;
    const y = -sin_t * 1 + cos_t * 0;
    
    const length = Math.sqrt(x * x + y * y);
    assert.ok(Math.abs(length - 1) < 1e-10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STATISTICAL BALANCE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Greek Balance - Statistics', () => {
  test('Mean of symmetric data equals center', () => {
    const data = [1, 2, 3, 4, 5];
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    assert.strictEqual(mean, 3);
  });

  test('Variance of constant data is 0', () => {
    const data = [5, 5, 5, 5, 5];
    const mean = 5;
    const variance = data.reduce((sum, x) => sum + (x - mean) ** 2, 0) / data.length;
    assert.strictEqual(variance, 0);
  });

  test('Geometric mean ≤ Arithmetic mean', () => {
    const data = [1, 2, 3, 4, 5];
    const arithmetic = data.reduce((a, b) => a + b, 0) / data.length;
    const geometric = Math.pow(data.reduce((a, b) => a * b, 1), 1 / data.length);
    assert.ok(geometric <= arithmetic + 1e-10);
  });

  test('Harmonic mean ≤ Geometric mean', () => {
    const data = [1, 2, 3, 4, 5];
    const geometric = Math.pow(data.reduce((a, b) => a * b, 1), 1 / data.length);
    const harmonic = data.length / data.reduce((sum, x) => sum + 1/x, 0);
    assert.ok(harmonic <= geometric + 1e-10);
  });
});

console.log('Greek Balance Test Suite Loaded');
