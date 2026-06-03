/**
 * Advanced Greek Mathematics Test Suite
 * =====================================
 * Extended mathematical testing for balancing
 * Target: 110+ additional tests
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import GreekMath from '../gml/greek-math.js';

const {
  PHI, PHI_INVERSE, PHI_SQUARED, PI, TAU, EULER,
  fibonacci, fibonacciN, lucas, lucasN, isFibonacci,
  goldenSection, goldenRectangle, goldenAngle,
  degreesToRadians, radiansToDegrees, sec, csc, cot,
  isPerfectSquare, gcd, lcm, isPrime, sieveOfEratosthenes,
  factorial, binomial, eulerTotient,
  arithmeticSum, geometricSum, harmonicSum, baselSum,
  complex, complexAdd, complexMultiply, complexMagnitude, complexConjugate,
  identityMatrix, matrixMultiply, matrixDeterminant, matrixTranspose,
  mean, variance, standardDeviation, median, geometricMean, harmonicMean,
  GREEK_ALPHABET, toGreekNumeral, greekLetter
} = GreekMath;

// ═══════════════════════════════════════════════════════════════════════════════
// ADVANCED PHI IDENTITIES
// ═══════════════════════════════════════════════════════════════════════════════

describe('Advanced Golden Ratio Identities', () => {
  test('φ³ = 2φ + 1', () => {
    const phiCubed = PHI * PHI * PHI;
    const expected = 2 * PHI + 1;
    assert.ok(Math.abs(phiCubed - expected) < 1e-10);
  });

  test('φ⁴ = 3φ + 2', () => {
    const phiFourth = Math.pow(PHI, 4);
    const expected = 3 * PHI + 2;
    assert.ok(Math.abs(phiFourth - expected) < 1e-10);
  });

  test('φ⁵ = 5φ + 3', () => {
    const phiFifth = Math.pow(PHI, 5);
    const expected = 5 * PHI + 3;
    assert.ok(Math.abs(phiFifth - expected) < 1e-10);
  });

  test('1/φ + 1/φ² = 1', () => {
    const sum = 1/PHI + 1/(PHI * PHI);
    assert.ok(Math.abs(sum - 1) < 1e-10);
  });

  test('φ - 1/φ = 1', () => {
    const diff = PHI - 1/PHI;
    assert.ok(Math.abs(diff - 1) < 1e-10);
  });

  test('φ² - φ = 1', () => {
    const diff = PHI_SQUARED - PHI;
    assert.ok(Math.abs(diff - 1) < 1e-10);
  });

  test('√5 = φ + 1/φ', () => {
    const sqrt5 = Math.sqrt(5);
    const phiSum = PHI + 1/PHI;
    assert.ok(Math.abs(sqrt5 - phiSum) < 1e-10);
  });

  test('2cos(π/5) = φ', () => {
    const cosResult = 2 * Math.cos(Math.PI / 5);
    assert.ok(Math.abs(cosResult - PHI) < 1e-10);
  });

  test('φ = 2sin(3π/10)', () => {
    const sinResult = 2 * Math.sin(3 * Math.PI / 10);
    assert.ok(Math.abs(sinResult - PHI) < 1e-10);
  });

  test('φ continued fraction converges', () => {
    // φ = 1 + 1/(1 + 1/(1 + 1/(1 + ...)))
    let approx = 1;
    for (let i = 0; i < 50; i++) {
      approx = 1 + 1 / approx;
    }
    assert.ok(Math.abs(approx - PHI) < 1e-8);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FIBONACCI-LUCAS RELATIONSHIPS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Fibonacci-Lucas Relationships', () => {
  test('L(n) = F(n-1) + F(n+1)', () => {
    for (let n = 2; n <= 10; n++) {
      const lucasN = lucas(n + 2)[n];
      const fibPrev = fibonacci(n + 2)[n - 1];
      const fibNext = fibonacci(n + 2)[n + 1];
      assert.ok(Math.abs(lucasN - (fibPrev + fibNext)) < 1e-10);
    }
  });

  test('F(2n) = F(n) × L(n)', () => {
    const fibs = fibonacci(20);
    const lucs = lucas(20);
    for (let n = 2; n <= 8; n++) {
      assert.strictEqual(fibs[2 * n], fibs[n] * lucs[n]);
    }
  });

  test('L(n)² - 5F(n)² = 4(-1)ⁿ', () => {
    const fibs = fibonacci(15);
    const lucs = lucas(15);
    for (let n = 1; n <= 10; n++) {
      const left = lucs[n] * lucs[n] - 5 * fibs[n] * fibs[n];
      const right = 4 * Math.pow(-1, n);
      assert.strictEqual(left, right);
    }
  });

  test('F(n+1)² - F(n)F(n+2) = (-1)ⁿ', () => {
    const fibs = fibonacci(15);
    for (let n = 1; n <= 10; n++) {
      const left = fibs[n + 1] * fibs[n + 1] - fibs[n] * fibs[n + 2];
      const right = Math.pow(-1, n);
      assert.strictEqual(left, right);
    }
  });

  test('Ratio F(n+1)/F(n) approaches φ', () => {
    const fibs = fibonacci(30);
    const ratio = fibs[29] / fibs[28];
    assert.ok(Math.abs(ratio - PHI) < 1e-10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADVANCED TRIGONOMETRY
// ═══════════════════════════════════════════════════════════════════════════════

describe('Advanced Trigonometric Identities', () => {
  test('sin²(x) + cos²(x) = 1', () => {
    for (const angle of [0, PI/6, PI/4, PI/3, PI/2, PI]) {
      const sin2 = Math.sin(angle) ** 2;
      const cos2 = Math.cos(angle) ** 2;
      assert.ok(Math.abs(sin2 + cos2 - 1) < 1e-10);
    }
  });

  test('sec²(x) - tan²(x) = 1', () => {
    for (const angle of [0, PI/6, PI/4, PI/3]) {
      const sec2 = sec(angle) ** 2;
      const tan2 = Math.tan(angle) ** 2;
      assert.ok(Math.abs(sec2 - tan2 - 1) < 1e-10);
    }
  });

  test('csc²(x) - cot²(x) = 1', () => {
    for (const angle of [PI/6, PI/4, PI/3, PI/2]) {
      const csc2 = csc(angle) ** 2;
      const cot2 = cot(angle) ** 2;
      assert.ok(Math.abs(csc2 - cot2 - 1) < 1e-10);
    }
  });

  test('sin(2x) = 2sin(x)cos(x)', () => {
    for (const x of [PI/6, PI/4, PI/3]) {
      const left = Math.sin(2 * x);
      const right = 2 * Math.sin(x) * Math.cos(x);
      assert.ok(Math.abs(left - right) < 1e-10);
    }
  });

  test('cos(2x) = cos²(x) - sin²(x)', () => {
    for (const x of [PI/6, PI/4, PI/3]) {
      const left = Math.cos(2 * x);
      const right = Math.cos(x) ** 2 - Math.sin(x) ** 2;
      assert.ok(Math.abs(left - right) < 1e-10);
    }
  });

  test('tan(x) = sin(x)/cos(x)', () => {
    for (const x of [PI/6, PI/4, PI/3]) {
      const left = Math.tan(x);
      const right = Math.sin(x) / Math.cos(x);
      assert.ok(Math.abs(left - right) < 1e-10);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADVANCED NUMBER THEORY
// ═══════════════════════════════════════════════════════════════════════════════

describe('Advanced Number Theory', () => {
  test('GCD(a,b) × LCM(a,b) = a × b', () => {
    const pairs = [[12, 18], [7, 13], [24, 36], [100, 35]];
    for (const [a, b] of pairs) {
      assert.strictEqual(gcd(a, b) * lcm(a, b), a * b);
    }
  });

  test('φ(p) = p-1 for prime p', () => {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19];
    for (const p of primes) {
      assert.strictEqual(eulerTotient(p), p - 1);
    }
  });

  test('Prime counting function approximation', () => {
    const primes = sieveOfEratosthenes(100);
    assert.strictEqual(primes.length, 25); // 25 primes below 100
  });

  test('Wilson theorem: (p-1)! ≡ -1 (mod p) for small primes', () => {
    const primes = [2, 3, 5, 7];
    for (const p of primes) {
      assert.strictEqual((factorial(p - 1) + 1) % p, 0);
    }
  });

  test('Binomial symmetry: C(n,k) = C(n,n-k)', () => {
    for (let n = 1; n <= 10; n++) {
      for (let k = 0; k <= n; k++) {
        assert.strictEqual(binomial(n, k), binomial(n, n - k));
      }
    }
  });

  test('Pascal identity: C(n,k) = C(n-1,k-1) + C(n-1,k)', () => {
    for (let n = 2; n <= 10; n++) {
      for (let k = 1; k < n; k++) {
        assert.strictEqual(binomial(n, k), binomial(n - 1, k - 1) + binomial(n - 1, k));
      }
    }
  });

  test('Sum of binomial row: Σ C(n,k) = 2ⁿ', () => {
    for (let n = 0; n <= 10; n++) {
      let sum = 0;
      for (let k = 0; k <= n; k++) {
        sum += binomial(n, k);
      }
      assert.strictEqual(sum, Math.pow(2, n));
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADVANCED SERIES
// ═══════════════════════════════════════════════════════════════════════════════

describe('Advanced Series Tests', () => {
  test('Arithmetic series: n(n+1)/2', () => {
    for (let n = 1; n <= 20; n++) {
      const sum = arithmeticSum(1, 1, n);
      const expected = (n * (n + 1)) / 2;
      assert.strictEqual(sum, expected);
    }
  });

  test('Sum of squares: n(n+1)(2n+1)/6', () => {
    const sumOfSquares = n => {
      let sum = 0;
      for (let i = 1; i <= n; i++) sum += i * i;
      return sum;
    };
    for (let n = 1; n <= 10; n++) {
      const expected = (n * (n + 1) * (2 * n + 1)) / 6;
      assert.strictEqual(sumOfSquares(n), expected);
    }
  });

  test('Geometric series: (1-rⁿ)/(1-r)', () => {
    assert.strictEqual(geometricSum(1, 2, 5), 31);
    assert.strictEqual(geometricSum(1, 3, 4), 40);
  });

  test('Harmonic series diverges slowly', () => {
    const h10 = harmonicSum(10);
    const h100 = harmonicSum(100);
    assert.ok(h100 > h10);
    assert.ok(h10 < 3);
    assert.ok(h100 < 6);
  });

  test('Basel series approaches π²/6', () => {
    const sum = baselSum(1000);
    const target = (PI * PI) / 6;
    assert.ok(Math.abs(sum - target) < 0.01);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADVANCED COMPLEX NUMBERS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Advanced Complex Numbers', () => {
  test('i² = -1 (multiply)', () => {
    const i = complex(0, 1);
    const result = complexMultiply(i, i);
    assert.strictEqual(result.real, -1);
    assert.ok(Math.abs(result.imag) < 1e-10);
  });

  test('(a+bi)(a-bi) = a² + b²', () => {
    const z = complex(3, 4);
    const conj = complexConjugate(z);
    const product = complexMultiply(z, conj);
    assert.strictEqual(product.real, 25);
    assert.ok(Math.abs(product.imag) < 1e-10);
  });

  test('|z|² = z × z*', () => {
    const z = complex(3, 4);
    const conj = complexConjugate(z);
    const product = complexMultiply(z, conj);
    const magSquared = complexMagnitude(z) ** 2;
    assert.ok(Math.abs(product.real - magSquared) < 1e-10);
  });

  test('Complex addition is commutative', () => {
    const a = complex(1, 2);
    const b = complex(3, 4);
    const ab = complexAdd(a, b);
    const ba = complexAdd(b, a);
    assert.strictEqual(ab.real, ba.real);
    assert.strictEqual(ab.imag, ba.imag);
  });

  test('Complex multiplication is commutative', () => {
    const a = complex(1, 2);
    const b = complex(3, 4);
    const ab = complexMultiply(a, b);
    const ba = complexMultiply(b, a);
    assert.ok(Math.abs(ab.real - ba.real) < 1e-10);
    assert.ok(Math.abs(ab.imag - ba.imag) < 1e-10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADVANCED MATRIX OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Advanced Matrix Operations', () => {
  test('(AB)ᵀ = BᵀAᵀ', () => {
    const A = [[1, 2], [3, 4]];
    const B = [[5, 6], [7, 8]];
    
    const AB = matrixMultiply(A, B);
    const ABt = matrixTranspose(AB);
    
    const At = matrixTranspose(A);
    const Bt = matrixTranspose(B);
    const BtAt = matrixMultiply(Bt, At);
    
    assert.deepStrictEqual(ABt, BtAt);
  });

  test('(Aᵀ)ᵀ = A', () => {
    const A = [[1, 2, 3], [4, 5, 6]];
    const At = matrixTranspose(A);
    const Att = matrixTranspose(At);
    assert.deepStrictEqual(Att, A);
  });

  test('det(I) = 1 for any size', () => {
    assert.strictEqual(matrixDeterminant(identityMatrix(1)), 1);
    assert.strictEqual(matrixDeterminant(identityMatrix(2)), 1);
    assert.strictEqual(matrixDeterminant(identityMatrix(3)), 1);
  });

  test('det(AB) = det(A) × det(B)', () => {
    const A = [[1, 2], [3, 4]];
    const B = [[2, 0], [1, 2]];
    
    const AB = matrixMultiply(A, B);
    const detAB = matrixDeterminant(AB);
    const detA = matrixDeterminant(A);
    const detB = matrixDeterminant(B);
    
    assert.ok(Math.abs(detAB - detA * detB) < 1e-10);
  });

  test('det(Aᵀ) = det(A)', () => {
    const A = [[1, 2], [3, 4]];
    const At = matrixTranspose(A);
    assert.strictEqual(matrixDeterminant(A), matrixDeterminant(At));
  });

  test('Singular matrix has determinant 0', () => {
    const singular = [[1, 2], [2, 4]];
    assert.strictEqual(matrixDeterminant(singular), 0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADVANCED STATISTICS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Advanced Statistics', () => {
  test('AM ≥ GM ≥ HM for positive numbers', () => {
    const arr = [1, 2, 4, 8];
    const am = mean(arr);
    const gm = geometricMean(arr);
    const hm = harmonicMean(arr);
    assert.ok(am >= gm);
    assert.ok(gm >= hm);
  });

  test('AM = GM = HM for equal values', () => {
    const arr = [5, 5, 5, 5];
    const am = mean(arr);
    const gm = geometricMean(arr);
    const hm = harmonicMean(arr);
    assert.ok(Math.abs(am - gm) < 1e-10);
    assert.ok(Math.abs(gm - hm) < 1e-10);
  });

  test('Variance is non-negative', () => {
    assert.ok(variance([1, 2, 3, 4, 5]) >= 0);
    assert.ok(variance([1, 1, 1]) >= 0);
    assert.ok(variance([10, 20, 30]) >= 0);
  });

  test('Variance of constant is 0', () => {
    assert.strictEqual(variance([5, 5, 5, 5]), 0);
  });

  test('SD² = Variance', () => {
    const arr = [2, 4, 4, 4, 5, 5, 7, 9];
    const v = variance(arr);
    const sd = standardDeviation(arr);
    assert.ok(Math.abs(sd * sd - v) < 1e-10);
  });

  test('Median is between min and max', () => {
    const arr = [3, 1, 4, 1, 5, 9, 2, 6];
    const med = median(arr);
    assert.ok(med >= Math.min(...arr));
    assert.ok(med <= Math.max(...arr));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GREEK NUMERAL SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

describe('Greek Numeral System', () => {
  test('Single digits (1-9)', () => {
    assert.strictEqual(toGreekNumeral(1), 'α');
    assert.strictEqual(toGreekNumeral(2), 'β');
    assert.strictEqual(toGreekNumeral(3), 'γ');
    assert.strictEqual(toGreekNumeral(4), 'δ');
    assert.strictEqual(toGreekNumeral(5), 'ε');
  });

  test('Tens (10-90)', () => {
    assert.strictEqual(toGreekNumeral(10), 'ι');
    assert.strictEqual(toGreekNumeral(20), 'κ');
    assert.strictEqual(toGreekNumeral(30), 'λ');
  });

  test('Hundreds (100-900)', () => {
    assert.strictEqual(toGreekNumeral(100), 'ρ');
    assert.strictEqual(toGreekNumeral(200), 'σ');
    assert.strictEqual(toGreekNumeral(300), 'τ');
  });

  test('Combined numbers', () => {
    assert.strictEqual(toGreekNumeral(11), 'ια');
    assert.strictEqual(toGreekNumeral(21), 'κα');
    assert.strictEqual(toGreekNumeral(111), 'ρια');
    assert.strictEqual(toGreekNumeral(123), 'ρκγ');
  });

  test('Out of range returns string', () => {
    assert.strictEqual(toGreekNumeral(0), '0');
    assert.strictEqual(toGreekNumeral(1000), '1000');
  });

  test('greekLetter cycles through alphabet', () => {
    const letters = Object.values(GREEK_ALPHABET);
    for (let i = 0; i < 48; i++) {
      assert.strictEqual(greekLetter(i), letters[i % 24]);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MATHEMATICAL CONSTANTS RELATIONSHIPS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Mathematical Constants Relationships', () => {
  test('e^(iπ) + 1 = 0 (Euler identity components)', () => {
    // Using e^(iπ) = cos(π) + i×sin(π) = -1
    const eipi_real = Math.cos(PI);
    const eipi_imag = Math.sin(PI);
    assert.ok(Math.abs(eipi_real + 1) < 1e-10);
    assert.ok(Math.abs(eipi_imag) < 1e-10);
  });

  test('ln(e) = 1', () => {
    assert.ok(Math.abs(Math.log(EULER) - 1) < 1e-10);
  });

  test('e^(ln(x)) = x', () => {
    for (const x of [1, 2, PI, PHI, 10]) {
      assert.ok(Math.abs(Math.exp(Math.log(x)) - x) < 1e-10);
    }
  });

  test('log₁₀(10) = 1', () => {
    assert.ok(Math.abs(Math.log10(10) - 1) < 1e-10);
  });

  test('log₂(2) = 1', () => {
    assert.ok(Math.abs(Math.log2(2) - 1) < 1e-10);
  });

  test('τ = 2π', () => {
    assert.strictEqual(TAU, 2 * PI);
  });
});

console.log('Advanced Greek Mathematics Test Suite Loaded');
