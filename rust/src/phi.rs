//! Phi-weighted constants and calculations
//!
//! High-performance φ calculations using Rust's zero-cost abstractions.

use serde::{Deserialize, Serialize};

/// Golden ratio φ = (1 + √5) / 2
pub const PHI: f64 = 1.618033988749895;

/// Inverse golden ratio φ⁻¹ = φ - 1
pub const PHI_INVERSE: f64 = 0.6180339887498949;

/// φ-complement = 1 - φ⁻¹ = 2 - φ  
pub const PHI_COMPLEMENT: f64 = 0.3819660112501051;

/// φ² = φ + 1
pub const PHI_SQUARED: f64 = 2.618033988749895;

/// Golden angle in radians
pub const GOLDEN_ANGLE: f64 = 2.399963229728653;

/// Two pi constant
pub const TWO_PI: f64 = std::f64::consts::TAU;

/// Heartbeat interval in milliseconds
pub const HEARTBEAT_MS: u64 = 618;

/// Three Hearts sync interval
pub const THREE_HEARTS_MS: u64 = 873;

/// Collection of φ constants for external use
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct PhiConstants {
    pub phi: f64,
    pub phi_inverse: f64,
    pub phi_complement: f64,
    pub phi_squared: f64,
    pub golden_angle: f64,
}

impl Default for PhiConstants {
    fn default() -> Self {
        Self {
            phi: PHI,
            phi_inverse: PHI_INVERSE,
            phi_complement: PHI_COMPLEMENT,
            phi_squared: PHI_SQUARED,
            golden_angle: GOLDEN_ANGLE,
        }
    }
}

impl PhiConstants {
    pub fn new() -> Self {
        Self::default()
    }
}

/// Apply φ-weighting to a value
/// 
/// # Arguments
/// * `x` - Value to weight
/// * `level` - Weighting level (positive = divide by φ^level, negative = multiply)
/// 
/// # Examples
/// ```
/// use medina_blockchain::phi::phi_weight;
/// 
/// let weighted = phi_weight(1.0, 1);
/// assert!((weighted - 0.618).abs() < 0.001);
/// ```
#[inline]
pub fn phi_weight(x: f64, level: i32) -> f64 {
    x * PHI.powi(-level)
}

/// Normalize a value to [0, 1] using φ-based sigmoid
/// 
/// σ_φ(x) = 1 / (1 + φ^(-x))
#[inline]
pub fn phi_normalize(x: f64) -> f64 {
    1.0 / (1.0 + PHI.powf(-x))
}

/// Compute Fibonacci number using matrix exponentiation (O(log n))
pub fn fibonacci(n: u64) -> u128 {
    if n == 0 {
        return 0;
    }
    if n == 1 {
        return 1;
    }
    
    // Matrix [[1,1],[1,0]]^n using fast exponentiation
    let mut result = [[1u128, 0], [0, 1]]; // Identity
    let mut base = [[1u128, 1], [1, 0]];
    let mut exp = n;
    
    while exp > 0 {
        if exp & 1 == 1 {
            result = matrix_mult(&result, &base);
        }
        base = matrix_mult(&base, &base);
        exp >>= 1;
    }
    
    result[0][1]
}

fn matrix_mult(a: &[[u128; 2]; 2], b: &[[u128; 2]; 2]) -> [[u128; 2]; 2] {
    [
        [
            a[0][0] * b[0][0] + a[0][1] * b[1][0],
            a[0][0] * b[0][1] + a[0][1] * b[1][1],
        ],
        [
            a[1][0] * b[0][0] + a[1][1] * b[1][0],
            a[1][0] * b[0][1] + a[1][1] * b[1][1],
        ],
    ]
}

/// Compute Lucas number
pub fn lucas(n: u64) -> u128 {
    if n == 0 {
        return 2;
    }
    if n == 1 {
        return 1;
    }
    
    let mut a: u128 = 2;
    let mut b: u128 = 1;
    
    for _ in 2..=n {
        let temp = b;
        b = a + b;
        a = temp;
    }
    
    b
}

/// Compute Kuramoto order parameter from phases
/// 
/// R·e^(iΨ) = (1/N)·Σe^(iθ_j)
/// 
/// Returns (R, Ψ) where R is coherence magnitude and Ψ is mean phase
pub fn order_parameter(phases: &[f64]) -> (f64, f64) {
    if phases.is_empty() {
        return (0.0, 0.0);
    }
    
    let n = phases.len() as f64;
    
    let sum_cos: f64 = phases.iter().map(|&θ| θ.cos()).sum();
    let sum_sin: f64 = phases.iter().map(|&θ| θ.sin()).sum();
    
    let avg_cos = sum_cos / n;
    let avg_sin = sum_sin / n;
    
    let r = (avg_cos * avg_cos + avg_sin * avg_sin).sqrt();
    let psi = avg_sin.atan2(avg_cos);
    
    (r, psi)
}

/// φ-weighted mean of values
pub fn phi_weighted_mean(values: &[f64]) -> f64 {
    if values.is_empty() {
        return 0.0;
    }
    
    let weights: Vec<f64> = (0..values.len())
        .map(|i| PHI_INVERSE.powi(i as i32))
        .collect();
    
    let total_weight: f64 = weights.iter().sum();
    let weighted_sum: f64 = values.iter()
        .zip(weights.iter())
        .map(|(v, w)| v * w)
        .sum();
    
    weighted_sum / total_weight
}

/// Generate golden spiral point at angle θ
/// 
/// r = φ^(2θ/π)
pub fn golden_spiral_point(theta: f64) -> (f64, f64) {
    let r = PHI.powf(2.0 * theta / std::f64::consts::PI);
    (r * theta.cos(), r * theta.sin())
}

/// Generate sunflower pattern points for optimal 2D packing
pub fn sunflower_pattern(n: usize, radius: f64) -> Vec<(f64, f64)> {
    (1..=n)
        .map(|i| {
            let r = radius * (i as f64 / n as f64).sqrt();
            let theta = i as f64 * GOLDEN_ANGLE;
            (r * theta.cos(), r * theta.sin())
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_phi_constants() {
        assert!((PHI * PHI_INVERSE - 1.0).abs() < 1e-10);
        assert!((PHI_INVERSE + PHI_COMPLEMENT - 1.0).abs() < 1e-10);
        assert!((PHI_SQUARED - PHI - 1.0).abs() < 1e-10);
    }
    
    #[test]
    fn test_fibonacci() {
        assert_eq!(fibonacci(0), 0);
        assert_eq!(fibonacci(1), 1);
        assert_eq!(fibonacci(10), 55);
        assert_eq!(fibonacci(20), 6765);
        assert_eq!(fibonacci(50), 12586269025);
    }
    
    #[test]
    fn test_lucas() {
        assert_eq!(lucas(0), 2);
        assert_eq!(lucas(1), 1);
        assert_eq!(lucas(5), 11);
    }
    
    #[test]
    fn test_phi_weight() {
        let w1 = phi_weight(1.0, 1);
        assert!((w1 - PHI_INVERSE).abs() < 1e-10);
        
        let w_neg = phi_weight(1.0, -1);
        assert!((w_neg - PHI).abs() < 1e-10);
    }
    
    #[test]
    fn test_phi_normalize() {
        let mid = phi_normalize(0.0);
        assert!(mid > 0.3 && mid < 0.7);
        
        let high = phi_normalize(10.0);
        assert!(high > 0.99);
        
        let low = phi_normalize(-10.0);
        assert!(low < 0.01);
    }
    
    #[test]
    fn test_order_parameter_synchronized() {
        let phases = vec![std::f64::consts::FRAC_PI_4; 10];
        let (r, _) = order_parameter(&phases);
        assert!((r - 1.0).abs() < 1e-10);
    }
    
    #[test]
    fn test_order_parameter_random() {
        let phases: Vec<f64> = (0..100)
            .map(|i| (i as f64) * 0.1)
            .collect();
        let (r, _) = order_parameter(&phases);
        assert!(r < 1.0);
    }
}
