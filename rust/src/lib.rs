//! # Medina Blockchain — High-Performance Rust Components
//!
//! ```text
//! ╔════════════════════════════════════════════════════════════════════════════════════════╗
//! ║  MEDINA BLOCKCHAIN — RUST PERFORMANCE LAYER                                          ║
//! ║  "Ferrum Velocitas — Iron Speed for Living Intelligence"                             ║
//! ║                                                                                        ║
//! ║  "Celeritas vincit. Securitas permanet. Intelligentia crescit."                      ║
//! ║  (Speed conquers. Security endures. Intelligence grows.)                              ║
//! ║                                                                                        ║
//! ║  RUST COMPONENTS:                                                                     ║
//! ║    • Circuit breaker with zero-copy state management                                 ║
//! ║    • Token operations with cryptographic attestation                                 ║
//! ║    • Phi-weighted calculations with SIMD optimization                                ║
//! ║    • Cross-chain phantom bridge                                                      ║
//! ║                                                                                        ║
//! ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
//! ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
//! ╚════════════════════════════════════════════════════════════════════════════════════════╝
//! ```

pub mod circuit;
pub mod token;
pub mod phi;
pub mod phantom;
pub mod attestation;
pub mod ais_bridge;
pub mod greek_math;

// Re-exports
pub use circuit::{CircuitBreaker, CircuitState, FlowGovernor, FlowMode};
pub use token::{SovereignToken, TokenPhase, TokenOperation};
pub use phi::{PhiConstants, phi_weight, phi_normalize};
pub use phantom::{PhantomBridge, ChainType, ChainSignal};
pub use attestation::{Attestation, AttestationChain};

// AIS Bridge re-exports
pub use ais_bridge::{
    AISMessage, Language, MessageType, Priority, PhiQueue,
    LanguageBridge, bridge_capabilities, can_communicate,
    handle_ping, handle_sync,
};

// Greek Math re-exports
pub use greek_math::{
    ALPHA, BETA, GAMMA, DELTA, EPSILON,
    ZETA_3, ETA, THETA, RHO, TAU, UPSILON, CHI, PSI, OMEGA,
    is_prime, prime_factors, sieve_of_eratosthenes,
    gcd, lcm, totient, mobius, divisors,
    tribonacci, pentagonal, triangular, harmonic_number,
    mean, geometric_mean, harmonic_mean, variance, standard_deviation, median,
    phi_weighted_mean, phi_blend, phi_sequence,
};

/// Crate version
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// φ-encoded identity
pub const ENCODED_ID: &str = "RUST.FERRUM.VELOCITAS";

/// Doctrine
pub const DOCTRINE: &str = "Celeritas vincit. Securitas permanet. Intelligentia crescit.";
pub const DOCTRINE_EN: &str = "Speed conquers. Security endures. Intelligence grows.";
