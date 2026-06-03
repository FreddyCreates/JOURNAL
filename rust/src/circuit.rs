//! Circuit Breaker and Flow Governor
//!
//! High-performance circuit breaker implementation for sovereign tokens.

use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use chrono::{DateTime, Utc};

use crate::phi::{PHI, PHI_INVERSE, PHI_COMPLEMENT};

/// Circuit breaker state
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CircuitState {
    /// Normal operation — all flows permitted
    Closed,
    /// Circuit tripped — operations halted for protection
    Open,
    /// Testing phase — limited operations to verify recovery
    HalfOpen,
}

impl Default for CircuitState {
    fn default() -> Self {
        CircuitState::Closed
    }
}

/// Reason for circuit trip
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TripReason {
    CoherenceCollapse,
    EnergyDepletion,
    AttestationFailure,
    GovernanceHalt,
    ResonanceDesync,
    ExternalThreat,
    EvolutionInstability,
    MergeConflict,
    SplitCascade,
    ManualOverride,
}

/// Record of a circuit trip event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TripRecord {
    pub trip_id: String,
    pub timestamp: DateTime<Utc>,
    pub reason: TripReason,
    pub coherence_at_trip: f64,
    pub energy_at_trip: f64,
    pub attestation_failures_at_trip: u32,
    pub recovered_at: Option<DateTime<Utc>>,
    pub recovery_method: Option<String>,
}

/// Circuit breaker thresholds
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CircuitThresholds {
    /// Below this coherence = circuit opens
    pub coherence_collapse: f64,
    /// Below this energy = emergency halt
    pub energy_critical: f64,
    /// Consecutive failures to trip
    pub attestation_failure_limit: u32,
    /// Tests before closing in half-open
    pub half_open_test_limit: u32,
    /// Recovery window in milliseconds
    pub recovery_window_ms: u64,
}

impl Default for CircuitThresholds {
    fn default() -> Self {
        Self {
            coherence_collapse: PHI_COMPLEMENT,  // 0.382
            energy_critical: 0.1,
            attestation_failure_limit: 5,
            half_open_test_limit: 3,
            recovery_window_ms: 3819,  // φ-complement × 10s
        }
    }
}

/// Circuit breaker protecting a sovereign token
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CircuitBreaker {
    pub id: String,
    pub token_id: String,
    pub state: CircuitState,
    
    // Trip history
    pub trip_count: u64,
    pub last_trip: Option<DateTime<Utc>>,
    pub last_trip_reason: Option<TripReason>,
    trip_history: VecDeque<TripRecord>,
    
    // Recovery tracking
    pub recovery_attempts: u64,
    pub successful_recoveries: u64,
    pub half_open_tests: u32,
    pub half_open_successes: u32,
    
    // Monitoring metrics
    coherence_readings: VecDeque<f64>,
    energy_readings: VecDeque<f64>,
    pub attestation_failures: u32,
    pub last_health_check: DateTime<Utc>,
    
    // Configuration
    pub thresholds: CircuitThresholds,
    pub auto_recovery: bool,
    
    // Timestamps
    pub created_at: DateTime<Utc>,
    pub last_state_change: DateTime<Utc>,
}

impl CircuitBreaker {
    /// Create a new circuit breaker for a token
    pub fn new(token_id: &str) -> Self {
        let now = Utc::now();
        Self {
            id: format!("CB::{}", token_id),
            token_id: token_id.to_string(),
            state: CircuitState::Closed,
            
            trip_count: 0,
            last_trip: None,
            last_trip_reason: None,
            trip_history: VecDeque::with_capacity(10),
            
            recovery_attempts: 0,
            successful_recoveries: 0,
            half_open_tests: 0,
            half_open_successes: 0,
            
            coherence_readings: VecDeque::with_capacity(10),
            energy_readings: VecDeque::with_capacity(10),
            attestation_failures: 0,
            last_health_check: now,
            
            thresholds: CircuitThresholds::default(),
            auto_recovery: true,
            
            created_at: now,
            last_state_change: now,
        }
    }
    
    /// Trip the circuit breaker
    pub fn trip(&mut self, reason: TripReason, coherence: f64, energy: f64) {
        let now = Utc::now();
        
        let trip_record = TripRecord {
            trip_id: format!("TRIP::{}::{}", self.token_id, now.timestamp_nanos_opt().unwrap_or(0)),
            timestamp: now,
            reason,
            coherence_at_trip: coherence,
            energy_at_trip: energy,
            attestation_failures_at_trip: self.attestation_failures,
            recovered_at: None,
            recovery_method: None,
        };
        
        // Keep last 10 records
        if self.trip_history.len() >= 10 {
            self.trip_history.pop_front();
        }
        self.trip_history.push_back(trip_record);
        
        self.state = CircuitState::Open;
        self.trip_count += 1;
        self.last_trip = Some(now);
        self.last_trip_reason = Some(reason);
        self.last_state_change = now;
    }
    
    /// Attempt to move from Open to HalfOpen
    pub fn attempt_recovery(&mut self) -> bool {
        if self.state != CircuitState::Open {
            return false;
        }
        
        let now = Utc::now();
        
        if let Some(trip_time) = self.last_trip {
            let elapsed = now.signed_duration_since(trip_time);
            let recovery_duration = chrono::Duration::milliseconds(self.thresholds.recovery_window_ms as i64);
            
            if elapsed >= recovery_duration {
                self.state = CircuitState::HalfOpen;
                self.recovery_attempts += 1;
                self.half_open_tests = 0;
                self.half_open_successes = 0;
                self.last_state_change = now;
                return true;
            }
        }
        
        false
    }
    
    /// Record a test result in half-open state
    pub fn record_half_open_test(&mut self, success: bool) {
        if self.state != CircuitState::HalfOpen {
            return;
        }
        
        let now = Utc::now();
        self.half_open_tests += 1;
        
        if success {
            self.half_open_successes += 1;
            
            if self.half_open_successes >= self.thresholds.half_open_test_limit {
                // Close the circuit
                self.state = CircuitState::Closed;
                self.successful_recoveries += 1;
                self.attestation_failures = 0;
                self.last_state_change = now;
                
                // Update last trip record with recovery info
                if let Some(record) = self.trip_history.back_mut() {
                    record.recovered_at = Some(now);
                    record.recovery_method = Some("HalfOpenTestSuccess".to_string());
                }
            }
        } else {
            // Re-open the circuit
            self.trip(TripReason::CoherenceCollapse, 0.0, 0.0);
        }
    }
    
    /// Check if an operation should be permitted
    pub fn should_permit(&self) -> bool {
        match self.state {
            CircuitState::Closed => true,
            CircuitState::HalfOpen => self.half_open_tests < self.thresholds.half_open_test_limit,
            CircuitState::Open => false,
        }
    }
    
    /// Record health metrics and potentially trip breaker
    pub fn record_health(&mut self, coherence: f64, energy: f64, attestation_failed: bool) {
        let now = Utc::now();
        
        // Update readings
        if self.coherence_readings.len() >= 10 {
            self.coherence_readings.pop_front();
        }
        self.coherence_readings.push_back(coherence);
        
        if self.energy_readings.len() >= 10 {
            self.energy_readings.pop_front();
        }
        self.energy_readings.push_back(energy);
        
        // Update attestation failures
        if attestation_failed {
            self.attestation_failures += 1;
        } else {
            self.attestation_failures = 0;
        }
        
        self.last_health_check = now;
        
        // Check trip conditions (only if closed)
        if self.state == CircuitState::Closed {
            if coherence < self.thresholds.coherence_collapse {
                self.trip(TripReason::CoherenceCollapse, coherence, energy);
            } else if energy < self.thresholds.energy_critical {
                self.trip(TripReason::EnergyDepletion, coherence, energy);
            } else if self.attestation_failures >= self.thresholds.attestation_failure_limit {
                self.trip(TripReason::AttestationFailure, coherence, energy);
            }
        }
    }
    
    /// Get average coherence from recent readings
    pub fn average_coherence(&self) -> Option<f64> {
        if self.coherence_readings.is_empty() {
            return None;
        }
        let sum: f64 = self.coherence_readings.iter().sum();
        Some(sum / self.coherence_readings.len() as f64)
    }
    
    /// Get average energy from recent readings
    pub fn average_energy(&self) -> Option<f64> {
        if self.energy_readings.is_empty() {
            return None;
        }
        let sum: f64 = self.energy_readings.iter().sum();
        Some(sum / self.energy_readings.len() as f64)
    }
}

// ════════════════════════════════════════════════════════════════════════════════
// FLOW GOVERNOR
// ════════════════════════════════════════════════════════════════════════════════

/// Flow control mode
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum FlowMode {
    /// Full throughput allowed
    Normal,
    /// Reduced throughput (φ⁻¹ scaling)
    Throttled,
    /// Minimal throughput (φ-complement scaling)
    Emergency,
    /// No throughput
    Halted,
}

impl Default for FlowMode {
    fn default() -> Self {
        FlowMode::Normal
    }
}

/// Operation type for rate limiting
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum OperationType {
    Transfer,
    Merge,
    Split,
    Evolve,
    Attest,
    Governance,
    Query,
}

/// Flow governor managing token operation rates
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlowGovernor {
    pub id: String,
    pub token_id: String,
    pub mode: FlowMode,
    
    // Rate limits per window
    pub transfer_limit: u32,
    pub merge_limit: u32,
    pub split_limit: u32,
    pub evolve_limit: u32,
    pub attest_limit: u32,
    pub governance_limit: u32,
    
    // Current window counters
    transfer_count: u32,
    merge_count: u32,
    split_count: u32,
    evolve_count: u32,
    attest_count: u32,
    governance_count: u32,
    
    // Window tracking
    window_start: DateTime<Utc>,
    window_duration_ms: u64,
    
    // Energy
    pub energy_pool: f64,
    pub energy_allocation_rate: f64,
    
    // Statistics
    pub total_operations: u64,
    pub throttled_operations: u64,
    pub rejected_operations: u64,
    
    pub created_at: DateTime<Utc>,
}

impl FlowGovernor {
    /// Create a new flow governor
    pub fn new(token_id: &str) -> Self {
        let now = Utc::now();
        let phi_window_ms = (PHI * 1000.0) as u64;
        
        Self {
            id: format!("FG::{}", token_id),
            token_id: token_id.to_string(),
            mode: FlowMode::Normal,
            
            transfer_limit: 100,
            merge_limit: 5,
            split_limit: 5,
            evolve_limit: 10,
            attest_limit: 20,
            governance_limit: 3,
            
            transfer_count: 0,
            merge_count: 0,
            split_count: 0,
            evolve_count: 0,
            attest_count: 0,
            governance_count: 0,
            
            window_start: now,
            window_duration_ms: phi_window_ms,
            
            energy_pool: 1.0,
            energy_allocation_rate: PHI_INVERSE,
            
            total_operations: 0,
            throttled_operations: 0,
            rejected_operations: 0,
            
            created_at: now,
        }
    }
    
    /// Get effective limit based on flow mode
    fn effective_limit(&self, base_limit: u32) -> u32 {
        match self.mode {
            FlowMode::Normal => base_limit,
            FlowMode::Throttled => (base_limit as f64 * PHI_INVERSE) as u32,
            FlowMode::Emergency => (base_limit as f64 * PHI_COMPLEMENT) as u32,
            FlowMode::Halted => 0,
        }
    }
    
    /// Check and reset window if needed
    fn check_window(&mut self) {
        let now = Utc::now();
        let elapsed = now.signed_duration_since(self.window_start);
        
        if elapsed.num_milliseconds() >= self.window_duration_ms as i64 {
            self.transfer_count = 0;
            self.merge_count = 0;
            self.split_count = 0;
            self.evolve_count = 0;
            self.attest_count = 0;
            self.governance_count = 0;
            self.window_start = now;
        }
    }
    
    /// Request permission for an operation
    pub fn request_operation(&mut self, op_type: OperationType) -> bool {
        self.check_window();
        
        let (count, limit) = match op_type {
            OperationType::Transfer => (self.transfer_count, self.transfer_limit),
            OperationType::Merge => (self.merge_count, self.merge_limit),
            OperationType::Split => (self.split_count, self.split_limit),
            OperationType::Evolve => (self.evolve_count, self.evolve_limit),
            OperationType::Attest => (self.attest_count, self.attest_limit),
            OperationType::Governance => (self.governance_count, self.governance_limit),
            OperationType::Query => return true, // Queries always permitted
        };
        
        let effective = self.effective_limit(limit);
        
        if count >= effective {
            self.rejected_operations += 1;
            return false;
        }
        
        // Increment counter
        match op_type {
            OperationType::Transfer => self.transfer_count += 1,
            OperationType::Merge => self.merge_count += 1,
            OperationType::Split => self.split_count += 1,
            OperationType::Evolve => self.evolve_count += 1,
            OperationType::Attest => self.attest_count += 1,
            OperationType::Governance => self.governance_count += 1,
            OperationType::Query => {},
        }
        
        self.total_operations += 1;
        true
    }
    
    /// Set flow mode
    pub fn set_mode(&mut self, mode: FlowMode) {
        self.mode = mode;
    }
    
    /// Allocate energy for an operation
    pub fn allocate_energy(&mut self, base_cost: f64) -> bool {
        let scaled_cost = base_cost * self.energy_allocation_rate;
        
        if self.energy_pool >= scaled_cost {
            self.energy_pool -= scaled_cost;
            true
        } else {
            false
        }
    }
    
    /// Replenish energy pool
    pub fn replenish_energy(&mut self, amount: f64) {
        self.energy_pool = (self.energy_pool + amount * PHI_INVERSE).min(1.0);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_circuit_breaker_creation() {
        let cb = CircuitBreaker::new("TEST-001");
        assert_eq!(cb.state, CircuitState::Closed);
        assert!(cb.should_permit());
    }
    
    #[test]
    fn test_circuit_trip() {
        let mut cb = CircuitBreaker::new("TEST-002");
        cb.trip(TripReason::CoherenceCollapse, 0.2, 0.5);
        
        assert_eq!(cb.state, CircuitState::Open);
        assert!(!cb.should_permit());
        assert_eq!(cb.trip_count, 1);
    }
    
    #[test]
    fn test_health_monitoring() {
        let mut cb = CircuitBreaker::new("TEST-003");
        
        // Good health
        cb.record_health(0.8, 0.9, false);
        assert_eq!(cb.state, CircuitState::Closed);
        
        // Bad coherence triggers trip
        cb.record_health(0.2, 0.5, false);
        assert_eq!(cb.state, CircuitState::Open);
    }
    
    #[test]
    fn test_flow_governor_creation() {
        let fg = FlowGovernor::new("TEST-001");
        assert_eq!(fg.mode, FlowMode::Normal);
        assert!(fg.energy_pool > 0.9);
    }
    
    #[test]
    fn test_flow_governor_operations() {
        let mut fg = FlowGovernor::new("TEST-002");
        
        // Should permit operations up to limit
        for _ in 0..5 {
            assert!(fg.request_operation(OperationType::Merge));
        }
        
        // Should reject over limit
        assert!(!fg.request_operation(OperationType::Merge));
    }
    
    #[test]
    fn test_flow_governor_throttling() {
        let mut fg = FlowGovernor::new("TEST-003");
        fg.set_mode(FlowMode::Throttled);
        
        // Throttled mode has lower limits
        let effective = fg.effective_limit(10);
        assert!(effective < 10);
    }
}
