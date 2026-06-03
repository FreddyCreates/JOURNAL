//! Greek Mathematics - Number Theory and Constants
//!
//! Complete implementation of Greek mathematical constants, number theory,
//! and geometric operations in high-performance Rust.
//!
//! "Πάντα ῥεῖ" (Panta rhei - Everything flows)

use crate::phi::{PHI, PHI_INVERSE, PHI_SQUARED};

// ════════════════════════════════════════════════════════════════════════════════
// GREEK LETTER CONSTANTS (Mathematical Values)
// ════════════════════════════════════════════════════════════════════════════════

/// Fine structure constant α ≈ 1/137
pub const ALPHA: f64 = 0.0072973525693;

/// Bernstein's constant β
pub const BETA: f64 = 0.2801694990;

/// Euler-Mascheroni constant γ ≈ 0.5772
pub const GAMMA: f64 = 0.5772156649015329;

/// Silver ratio δ = 1 + √2
pub const DELTA: f64 = 2.414213562373095;

/// Machine epsilon (precision threshold)
pub const EPSILON: f64 = 1e-10;

/// Apéry's constant ζ(3) ≈ 1.202
pub const ZETA_3: f64 = 1.2020569031595943;

/// Dirichlet eta function η(1) = ln(2)
pub const ETA: f64 = 0.6931471805599453;

/// Chebyshev's constant θ
pub const THETA: f64 = 1.0;

/// Imaginary unit coefficient ι
pub const IOTA: f64 = 1.0;

/// Landau's constant κ
pub const KAPPA: f64 = 0.5;

/// Liouville-Roth constant λ
pub const LAMBDA: f64 = 1.0;

/// Ramanujan-Soldner constant μ
pub const MU: f64 = 1.451369234883381;

/// First Feigenbaum constant ξ
pub const XI: f64 = 4.6692016091029906718532038;

/// Omega constant ο = W(1)
pub const OMICRON: f64 = 0.5671432904097838729999686622;

/// Plastic number ρ ≈ 1.3247
pub const RHO: f64 = 1.324717957244746;

/// Circle constant τ = 2π
pub const TAU: f64 = std::f64::consts::TAU;

/// Golden ratio conjugate υ = (√5-1)/2
pub const UPSILON: f64 = 0.6180339887498949;

/// Gauss-Kuzmin-Wirsing constant χ
pub const CHI: f64 = 0.3036630028987326;

/// Reciprocal Fibonacci constant ψ
pub const PSI: f64 = 3.359885666243177;

/// Omega constant ω
pub const OMEGA: f64 = 0.5671432904097838;

// ════════════════════════════════════════════════════════════════════════════════
// MATHEMATICAL CONSTANTS
// ════════════════════════════════════════════════════════════════════════════════

/// √2 = 1.41421356237...
pub const SQRT_2: f64 = std::f64::consts::SQRT_2;

/// √3 = 1.73205080757...
pub const SQRT_3: f64 = 1.7320508075688772;

/// √5 = 2.2360679775...
pub const SQRT_5: f64 = 2.23606797749979;

/// Plastic number ≈ 1.324717957244746
pub const PLASTIC_NUMBER: f64 = RHO;

/// Silver ratio = 1 + √2 ≈ 2.414213562373095
pub const SILVER_RATIO: f64 = DELTA;

// ════════════════════════════════════════════════════════════════════════════════
// NUMBER THEORY FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════════

/// Check if n is a prime number
pub fn is_prime(n: u64) -> bool {
    if n < 2 {
        return false;
    }
    if n == 2 {
        return true;
    }
    if n % 2 == 0 {
        return false;
    }
    let sqrt_n = (n as f64).sqrt() as u64;
    for i in (3..=sqrt_n).step_by(2) {
        if n % i == 0 {
            return false;
        }
    }
    true
}

/// Return the prime factorization of n
pub fn prime_factors(n: u64) -> Vec<u64> {
    if n <= 1 {
        return vec![];
    }
    let mut factors = Vec::new();
    let mut m = n;
    let mut d = 2;

    while d * d <= m {
        while m % d == 0 {
            factors.push(d);
            m /= d;
        }
        d += if d == 2 { 1 } else { 2 };
    }
    if m > 1 {
        factors.push(m);
    }
    factors
}

/// Sieve of Eratosthenes - return all primes up to n
pub fn sieve_of_eratosthenes(n: usize) -> Vec<u64> {
    if n < 2 {
        return vec![];
    }
    let mut is_prime = vec![true; n + 1];
    is_prime[0] = false;
    is_prime[1] = false;

    let sqrt_n = (n as f64).sqrt() as usize;
    for i in 2..=sqrt_n {
        if is_prime[i] {
            for j in (i * i..=n).step_by(i) {
                is_prime[j] = false;
            }
        }
    }

    is_prime
        .iter()
        .enumerate()
        .filter_map(|(i, &p)| if p { Some(i as u64) } else { None })
        .collect()
}

/// Euclidean GCD algorithm
pub fn gcd(mut a: u64, mut b: u64) -> u64 {
    while b != 0 {
        let temp = b;
        b = a % b;
        a = temp;
    }
    a
}

/// Least common multiple
pub fn lcm(a: u64, b: u64) -> u64 {
    (a * b) / gcd(a, b)
}

/// Euler's totient function φ(n)
pub fn totient(n: u64) -> u64 {
    if n == 0 {
        return 0;
    }
    if n == 1 {
        return 1;
    }

    let mut result = n;
    let mut temp_n = n;
    let mut d = 2u64;

    while d * d <= temp_n {
        if temp_n % d == 0 {
            while temp_n % d == 0 {
                temp_n /= d;
            }
            result -= result / d;
        }
        d += 1;
    }
    if temp_n > 1 {
        result -= result / temp_n;
    }
    result
}

/// Möbius function μ(n)
pub fn mobius(n: u64) -> i32 {
    if n < 1 {
        return 0;
    }
    if n == 1 {
        return 1;
    }

    let factors = prime_factors(n);
    let unique_len = {
        let mut sorted = factors.clone();
        sorted.sort();
        sorted.dedup();
        sorted.len()
    };

    if factors.len() != unique_len {
        return 0; // Has squared factor
    }

    if factors.len() % 2 == 0 {
        1
    } else {
        -1
    }
}

/// Return all divisors of n in sorted order
pub fn divisors(n: u64) -> Vec<u64> {
    if n < 1 {
        return vec![];
    }
    let mut divs = Vec::new();
    let sqrt_n = (n as f64).sqrt() as u64;

    for i in 1..=sqrt_n {
        if n % i == 0 {
            divs.push(i);
            if i * i != n {
                divs.push(n / i);
            }
        }
    }
    divs.sort();
    divs
}

// ════════════════════════════════════════════════════════════════════════════════
// SPECIAL SEQUENCES
// ════════════════════════════════════════════════════════════════════════════════

/// Compute the n-th Tribonacci number
/// T(0)=0, T(1)=0, T(2)=1, T(n) = T(n-1)+T(n-2)+T(n-3)
pub fn tribonacci(n: u64) -> u128 {
    match n {
        0 => 0,
        1 => 0,
        2 => 1,
        _ => {
            let mut a: u128 = 0;
            let mut b: u128 = 0;
            let mut c: u128 = 1;
            for _ in 3..=n {
                let temp = a + b + c;
                a = b;
                b = c;
                c = temp;
            }
            c
        }
    }
}

/// Generate first n Tribonacci numbers
pub fn tribonacci_list(n: usize) -> Vec<u128> {
    (0..n as u64).map(tribonacci).collect()
}

/// n-th pentagonal number: P(n) = n(3n-1)/2
pub fn pentagonal(n: u64) -> u64 {
    n * (3 * n - 1) / 2
}

/// n-th triangular number: T(n) = n(n+1)/2
pub fn triangular(n: u64) -> u64 {
    n * (n + 1) / 2
}

/// n-th harmonic number H_n = Σ(1/k) for k=1 to n
pub fn harmonic_number(n: u64) -> f64 {
    if n == 0 {
        return 0.0;
    }
    (1..=n).map(|k| 1.0 / k as f64).sum()
}

// ════════════════════════════════════════════════════════════════════════════════
// GEOMETRY
// ════════════════════════════════════════════════════════════════════════════════

/// Area of regular n-gon with side length s
pub fn regular_polygon_area(n: u32, s: f64) -> f64 {
    let n_f = n as f64;
    (n_f * s * s) / (4.0 * (std::f64::consts::PI / n_f).tan())
}

/// Perimeter of regular n-gon with side length s
pub fn regular_polygon_perimeter(n: u32, s: f64) -> f64 {
    n as f64 * s
}

/// Area of circle with radius r
pub fn circle_area(r: f64) -> f64 {
    std::f64::consts::PI * r * r
}

/// Circumference of circle with radius r
pub fn circle_circumference(r: f64) -> f64 {
    2.0 * std::f64::consts::PI * r
}

/// Volume of sphere with radius r
pub fn sphere_volume(r: f64) -> f64 {
    (4.0 / 3.0) * std::f64::consts::PI * r * r * r
}

/// Surface area of sphere with radius r
pub fn sphere_surface_area(r: f64) -> f64 {
    4.0 * std::f64::consts::PI * r * r
}

// ════════════════════════════════════════════════════════════════════════════════
// STATISTICS
// ════════════════════════════════════════════════════════════════════════════════

/// Arithmetic mean
pub fn mean(values: &[f64]) -> f64 {
    if values.is_empty() {
        return 0.0;
    }
    values.iter().sum::<f64>() / values.len() as f64
}

/// Geometric mean
pub fn geometric_mean(values: &[f64]) -> f64 {
    if values.is_empty() {
        return 0.0;
    }
    let product: f64 = values.iter().product();
    product.powf(1.0 / values.len() as f64)
}

/// Harmonic mean
pub fn harmonic_mean(values: &[f64]) -> f64 {
    if values.is_empty() {
        return 0.0;
    }
    let reciprocal_sum: f64 = values.iter().map(|&x| 1.0 / x).sum();
    values.len() as f64 / reciprocal_sum
}

/// Population variance
pub fn variance(values: &[f64]) -> f64 {
    if values.is_empty() {
        return 0.0;
    }
    let m = mean(values);
    values.iter().map(|&x| (x - m).powi(2)).sum::<f64>() / values.len() as f64
}

/// Standard deviation
pub fn standard_deviation(values: &[f64]) -> f64 {
    variance(values).sqrt()
}

/// Median
pub fn median(values: &[f64]) -> f64 {
    if values.is_empty() {
        return 0.0;
    }
    let mut sorted = values.to_vec();
    sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let mid = sorted.len() / 2;
    if sorted.len() % 2 == 0 {
        (sorted[mid - 1] + sorted[mid]) / 2.0
    } else {
        sorted[mid]
    }
}

// ════════════════════════════════════════════════════════════════════════════════
// φ-WEIGHTED OPERATIONS
// ════════════════════════════════════════════════════════════════════════════════

/// φ-weighted arithmetic mean
pub fn phi_weighted_mean(values: &[f64]) -> f64 {
    if values.is_empty() {
        return 0.0;
    }
    let weights: Vec<f64> = (0..values.len())
        .map(|i| PHI_INVERSE.powi(i as i32))
        .collect();
    let total_weight: f64 = weights.iter().sum();
    let weighted_sum: f64 = values.iter().zip(weights.iter()).map(|(v, w)| v * w).sum();
    weighted_sum / total_weight
}

/// φ-balanced blend between two values
pub fn phi_blend(a: f64, b: f64) -> f64 {
    a * PHI_INVERSE + b * (1.0 - PHI_INVERSE)
}

/// Generate φ-scaled sequence
pub fn phi_sequence(start: f64, n: usize) -> Vec<f64> {
    (0..n).map(|i| start * PHI.powi(i as i32)).collect()
}

/// Generate inverse φ-scaled sequence
pub fn phi_inverse_sequence(start: f64, n: usize) -> Vec<f64> {
    (0..n).map(|i| start * PHI_INVERSE.powi(i as i32)).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greek_constants() {
        assert!((PHI * UPSILON - 1.0).abs() < 1e-10);
        assert!((DELTA - SILVER_RATIO).abs() < 1e-10);
    }

    #[test]
    fn test_is_prime() {
        assert!(!is_prime(0));
        assert!(!is_prime(1));
        assert!(is_prime(2));
        assert!(is_prime(17));
        assert!(!is_prime(18));
        assert!(is_prime(97));
    }

    #[test]
    fn test_prime_factors() {
        assert_eq!(prime_factors(12), vec![2, 2, 3]);
        assert_eq!(prime_factors(97), vec![97]);
        assert_eq!(prime_factors(100), vec![2, 2, 5, 5]);
    }

    #[test]
    fn test_sieve() {
        let primes = sieve_of_eratosthenes(30);
        assert_eq!(primes, vec![2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
    }

    #[test]
    fn test_gcd_lcm() {
        assert_eq!(gcd(12, 18), 6);
        assert_eq!(lcm(4, 6), 12);
    }

    #[test]
    fn test_totient() {
        assert_eq!(totient(1), 1);
        assert_eq!(totient(10), 4);
        assert_eq!(totient(12), 4);
    }

    #[test]
    fn test_mobius() {
        assert_eq!(mobius(1), 1);
        assert_eq!(mobius(2), -1);
        assert_eq!(mobius(4), 0);
        assert_eq!(mobius(6), 1);
    }

    #[test]
    fn test_tribonacci() {
        assert_eq!(tribonacci(0), 0);
        assert_eq!(tribonacci(1), 0);
        assert_eq!(tribonacci(2), 1);
        assert_eq!(tribonacci(10), 149);
    }

    #[test]
    fn test_geometry() {
        let area = circle_area(1.0);
        assert!((area - std::f64::consts::PI).abs() < 1e-10);
    }

    #[test]
    fn test_statistics() {
        let vals = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        assert_eq!(mean(&vals), 3.0);
        assert_eq!(median(&vals), 3.0);
    }

    #[test]
    fn test_phi_operations() {
        let seq = phi_sequence(1.0, 5);
        assert_eq!(seq.len(), 5);
        assert!((seq[1] - PHI).abs() < 1e-10);
    }
}
