/**
 * Balance Suite Test File
 * =======================
 * Final tests to reach 500+ total
 * Comprehensive validation across all modules
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import GreekMath from '../gml/greek-math.js';

const {
  PHI, PHI_INVERSE, PHI_SQUARED, PHI_COMPLEMENT, PSI,
  PI, TAU, HALF_PI, QUARTER_PI, EULER,
  SQRT_2, SQRT_3, SQRT_5, SQRT_PHI,
  fibonacci, fibonacciN, lucas, lucasN, isFibonacci,
  goldenSection, goldenRectangle, goldenAngle, goldenSpiralRadius, phiWeightedAverage,
  degreesToRadians, radiansToDegrees, sec, csc, cot,
  isPerfectSquare, gcd, lcm, isPrime, sieveOfEratosthenes,
  factorial, binomial, eulerTotient,
  arithmeticSum, geometricSum, infiniteGeometricSum, harmonicSum, baselSum,
  complex, complexAdd, complexMultiply, complexMagnitude, complexPhase, complexConjugate,
  identityMatrix, matrixMultiply, matrixDeterminant, matrixTranspose,
  mean, geometricMean, harmonicMean, variance, standardDeviation, median,
  GREEK_ALPHABET, toGreekNumeral, greekLetter
} = GreekMath;

// ═══════════════════════════════════════════════════════════════════════════════
// BALANCE: MATHEMATICAL HARMONY
// ═══════════════════════════════════════════════════════════════════════════════

describe('Balance - Mathematical Harmony', () => {
  test('φ and 1/φ sum to √5', () => {
    assert.ok(Math.abs((PHI + PHI_INVERSE) - SQRT_5) < 1e-10);
  });

  test('φ × 1/φ = 1', () => {
    assert.ok(Math.abs(PHI * PHI_INVERSE - 1) < 1e-10);
  });

  test('φ² - φ - 1 = 0 (golden equation)', () => {
    assert.ok(Math.abs(PHI_SQUARED - PHI - 1) < 1e-10);
  });

  test('PSI = 1/φ = φ - 1', () => {
    assert.ok(Math.abs(PSI - PHI_INVERSE) < 1e-10);
    assert.ok(Math.abs(PSI - (PHI - 1)) < 1e-10);
  });

  test('PHI_COMPLEMENT = 2 - φ', () => {
    assert.ok(Math.abs(PHI_COMPLEMENT - (2 - PHI)) < 1e-10);
  });

  test('√φ × √φ = φ', () => {
    assert.ok(Math.abs(SQRT_PHI * SQRT_PHI - PHI) < 1e-10);
  });

  test('π/2 + π/2 = π', () => {
    assert.ok(Math.abs(HALF_PI + HALF_PI - PI) < 1e-10);
  });

  test('4 × π/4 = π', () => {
    assert.ok(Math.abs(4 * QUARTER_PI - PI) < 1e-10);
  });

  test('TAU/2 = π', () => {
    assert.ok(Math.abs(TAU/2 - PI) < 1e-10);
  });

  test('√2 × √2 = 2', () => {
    assert.ok(Math.abs(SQRT_2 * SQRT_2 - 2) < 1e-10);
  });

  test('√3 × √3 = 3', () => {
    assert.ok(Math.abs(SQRT_3 * SQRT_3 - 3) < 1e-10);
  });

  test('√5 × √5 = 5', () => {
    assert.ok(Math.abs(SQRT_5 * SQRT_5 - 5) < 1e-10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BALANCE: SEQUENCE VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Balance - Sequence Verification', () => {
  test('First 10 Fibonacci sums correctly', () => {
    const fibs = fibonacci(10);
    const sum = fibs.reduce((a, b) => a + b, 0);
    assert.strictEqual(sum, 88);
  });

  test('First 10 Lucas sums correctly', () => {
    const lucs = lucas(10);
    const sum = lucs.reduce((a, b) => a + b, 0);
    assert.strictEqual(sum, 198);
  });

  test('fibonacciN matches fibonacci array', () => {
    const fibs = fibonacci(20);
    for (let i = 0; i < 20; i++) {
      assert.strictEqual(fibonacciN(i), fibs[i]);
    }
  });

  test('lucasN matches lucas array', () => {
    const lucs = lucas(15);
    for (let i = 0; i < 15; i++) {
      assert.strictEqual(lucasN(i), lucs[i]);
    }
  });

  test('All Fibonacci numbers below 100 are identified', () => {
    const fibsBelow100 = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
    for (let n = 0; n < 100; n++) {
      const expected = fibsBelow100.includes(n);
      assert.strictEqual(isFibonacci(n), expected);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BALANCE: GOLDEN RATIO APPLICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Balance - Golden Ratio Applications', () => {
  test('Golden section preserves total', () => {
    for (const value of [50, 100, 200, 1000]) {
      const section = goldenSection(value);
      assert.ok(Math.abs(section.major + section.minor - value) < 1e-10);
    }
  });

  test('Golden section ratio is φ', () => {
    for (const value of [50, 100, 200, 1000]) {
      const section = goldenSection(value);
      const ratio = value / section.major;
      assert.ok(Math.abs(ratio - PHI) < 1e-10);
    }
  });

  test('Golden rectangle aspect ratio is φ', () => {
    for (const width of [50, 100, 200, 1000]) {
      const rect = goldenRectangle(width);
      const ratio = rect.width / rect.height;
      assert.ok(Math.abs(ratio - PHI) < 1e-10);
    }
  });

  test('Golden angle is 2π/φ²', () => {
    const expected = TAU * PHI_INVERSE * PHI_INVERSE;
    assert.ok(Math.abs(goldenAngle() - expected) < 1e-10);
  });

  test('Golden spiral grows exponentially', () => {
    const r0 = goldenSpiralRadius(0);
    const r1 = goldenSpiralRadius(1);
    const r2 = goldenSpiralRadius(2);
    assert.ok(r1 > r0);
    assert.ok(r2 > r1);
  });

  test('phiWeightedAverage is between inputs', () => {
    const avg = phiWeightedAverage(10, 30);
    assert.ok(avg >= 10 && avg <= 30);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BALANCE: TRIGONOMETRIC VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Balance - Trigonometric Validation', () => {
  test('Degree-radian round trip', () => {
    for (const deg of [0, 30, 45, 60, 90, 180, 270, 360]) {
      const rad = degreesToRadians(deg);
      const back = radiansToDegrees(rad);
      assert.ok(Math.abs(back - deg) < 1e-10);
    }
  });

  test('sec is reciprocal of cos', () => {
    for (const x of [0, PI/6, PI/4, PI/3]) {
      assert.ok(Math.abs(sec(x) * Math.cos(x) - 1) < 1e-10);
    }
  });

  test('csc is reciprocal of sin', () => {
    for (const x of [PI/6, PI/4, PI/3, PI/2]) {
      assert.ok(Math.abs(csc(x) * Math.sin(x) - 1) < 1e-10);
    }
  });

  test('cot is reciprocal of tan', () => {
    for (const x of [PI/6, PI/4, PI/3]) {
      assert.ok(Math.abs(cot(x) * Math.tan(x) - 1) < 1e-10);
    }
  });

  test('Special angle sin values', () => {
    assert.ok(Math.abs(Math.sin(0) - 0) < 1e-10);
    assert.ok(Math.abs(Math.sin(PI/6) - 0.5) < 1e-10);
    assert.ok(Math.abs(Math.sin(PI/2) - 1) < 1e-10);
  });

  test('Special angle cos values', () => {
    assert.ok(Math.abs(Math.cos(0) - 1) < 1e-10);
    assert.ok(Math.abs(Math.cos(PI/3) - 0.5) < 1e-10);
    assert.ok(Math.abs(Math.cos(PI/2)) < 1e-10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BALANCE: NUMBER THEORY COMPLETENESS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Balance - Number Theory Completeness', () => {
  test('GCD of same number is itself', () => {
    for (const n of [1, 5, 12, 100]) {
      assert.strictEqual(gcd(n, n), n);
    }
  });

  test('LCM of same number is itself', () => {
    for (const n of [1, 5, 12, 100]) {
      assert.strictEqual(lcm(n, n), n);
    }
  });

  test('GCD(n, 1) = 1', () => {
    for (const n of [1, 5, 12, 100]) {
      assert.strictEqual(gcd(n, 1), 1);
    }
  });

  test('LCM(n, 1) = n', () => {
    for (const n of [1, 5, 12, 100]) {
      assert.strictEqual(lcm(n, 1), n);
    }
  });

  test('Twin primes identified', () => {
    const twins = [[3, 5], [5, 7], [11, 13], [17, 19], [29, 31], [41, 43]];
    for (const [a, b] of twins) {
      assert.strictEqual(isPrime(a), true);
      assert.strictEqual(isPrime(b), true);
      assert.strictEqual(b - a, 2);
    }
  });

  test('Sieve generates correct count of primes', () => {
    assert.strictEqual(sieveOfEratosthenes(10).length, 4);
    assert.strictEqual(sieveOfEratosthenes(20).length, 8);
    assert.strictEqual(sieveOfEratosthenes(30).length, 10);
    assert.strictEqual(sieveOfEratosthenes(50).length, 15);
    assert.strictEqual(sieveOfEratosthenes(100).length, 25);
  });

  test('Euler totient multiplicative', () => {
    // φ(mn) = φ(m)φ(n) when gcd(m,n) = 1
    assert.strictEqual(eulerTotient(6), eulerTotient(2) * eulerTotient(3));
    assert.strictEqual(eulerTotient(15), eulerTotient(3) * eulerTotient(5));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BALANCE: SERIES CONVERGENCE
// ═══════════════════════════════════════════════════════════════════════════════

describe('Balance - Series Convergence', () => {
  test('Arithmetic series formula verification', () => {
    // Sum 1+2+...+n = n(n+1)/2
    for (let n = 1; n <= 20; n++) {
      const sum = arithmeticSum(1, 1, n);
      const expected = (n * (n + 1)) / 2;
      assert.strictEqual(sum, expected);
    }
  });

  test('Geometric series formula verification', () => {
    // Sum r^0 + r^1 + ... + r^(n-1) = (1-r^n)/(1-r)
    for (const r of [0.5, 2, 3]) {
      const sum = geometricSum(1, r, 5);
      const expected = (1 - Math.pow(r, 5)) / (1 - r);
      assert.ok(Math.abs(sum - expected) < 1e-10);
    }
  });

  test('Infinite geometric series for |r| < 1', () => {
    assert.strictEqual(infiniteGeometricSum(1, 0.5), 2);
    assert.strictEqual(infiniteGeometricSum(4, 0.5), 8);
    assert.ok(Math.abs(infiniteGeometricSum(1, 0.9) - 10) < 1e-10);
  });

  test('Harmonic series grows logarithmically', () => {
    const h10 = harmonicSum(10);
    const h100 = harmonicSum(100);
    const h1000 = harmonicSum(1000);
    assert.ok(h100 - h10 < h10);
    assert.ok(h1000 - h100 < h100);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BALANCE: COMPLEX NUMBER ALGEBRA
// ═══════════════════════════════════════════════════════════════════════════════

describe('Balance - Complex Number Algebra', () => {
  test('Complex zero is additive identity', () => {
    const z = complex(5, 7);
    const zero = complex(0, 0);
    const sum = complexAdd(z, zero);
    assert.strictEqual(sum.real, 5);
    assert.strictEqual(sum.imag, 7);
  });

  test('Complex one is multiplicative identity', () => {
    const z = complex(3, 4);
    const one = complex(1, 0);
    const prod = complexMultiply(z, one);
    assert.strictEqual(prod.real, 3);
    assert.strictEqual(prod.imag, 4);
  });

  test('z + conj(z) = 2*Re(z)', () => {
    const z = complex(3, 4);
    const conj = complexConjugate(z);
    const sum = complexAdd(z, conj);
    assert.strictEqual(sum.real, 6);
    assert.ok(Math.abs(sum.imag) < 1e-10);
  });

  test('|z|² = Re(z)² + Im(z)²', () => {
    const z = complex(3, 4);
    const mag = complexMagnitude(z);
    const expected = Math.sqrt(9 + 16);
    assert.strictEqual(mag, expected);
  });

  test('Phase of pure imaginary', () => {
    const z = complex(0, 1);
    assert.ok(Math.abs(complexPhase(z) - PI/2) < 1e-10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BALANCE: MATRIX PROPERTIES
// ═══════════════════════════════════════════════════════════════════════════════

describe('Balance - Matrix Properties', () => {
  test('Identity matrix sizes 1-4', () => {
    for (let n = 1; n <= 4; n++) {
      const I = identityMatrix(n);
      assert.strictEqual(I.length, n);
      assert.strictEqual(I[0].length, n);
    }
  });

  test('Identity diagonal is 1s', () => {
    for (let n = 1; n <= 4; n++) {
      const I = identityMatrix(n);
      for (let i = 0; i < n; i++) {
        assert.strictEqual(I[i][i], 1);
      }
    }
  });

  test('Identity off-diagonal is 0s', () => {
    const I = identityMatrix(3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (i !== j) {
          assert.strictEqual(I[i][j], 0);
        }
      }
    }
  });

  test('A × I = A', () => {
    const A = [[1, 2], [3, 4]];
    const I = identityMatrix(2);
    const result = matrixMultiply(A, I);
    assert.deepStrictEqual(result, A);
  });

  test('I × A = A', () => {
    const A = [[1, 2], [3, 4]];
    const I = identityMatrix(2);
    const result = matrixMultiply(I, A);
    assert.deepStrictEqual(result, A);
  });

  test('Transpose of identity is identity', () => {
    for (let n = 1; n <= 3; n++) {
      const I = identityMatrix(n);
      const It = matrixTranspose(I);
      assert.deepStrictEqual(It, I);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BALANCE: STATISTICAL MEASURES
// ═══════════════════════════════════════════════════════════════════════════════

describe('Balance - Statistical Measures', () => {
  test('Mean of single element is element', () => {
    assert.strictEqual(mean([5]), 5);
    assert.strictEqual(mean([100]), 100);
  });

  test('Median of single element is element', () => {
    assert.strictEqual(median([5]), 5);
    assert.strictEqual(median([100]), 100);
  });

  test('Variance of single element is 0', () => {
    assert.strictEqual(variance([5]), 0);
  });

  test('Standard deviation of single element is 0', () => {
    assert.strictEqual(standardDeviation([5]), 0);
  });

  test('Geometric mean of [a, b] = √(ab)', () => {
    const gm = geometricMean([4, 9]);
    assert.strictEqual(gm, 6);
  });

  test('Harmonic mean of [a, b] = 2ab/(a+b)', () => {
    const hm = harmonicMean([4, 6]);
    const expected = (2 * 4 * 6) / (4 + 6);
    assert.ok(Math.abs(hm - expected) < 1e-10);
  });
});

console.log('Balance Suite Test File Loaded');
