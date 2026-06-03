//! Attestation System
//!
//! Cryptographic attestation chain for sovereign tokens.

use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use chrono::{DateTime, Utc};
use std::collections::VecDeque;

use crate::phi::{PHI, PHI_INVERSE};

/// A single attestation record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Attestation {
    pub id: String,
    pub token_id: String,
    pub sequence: u64,
    pub state_hash: String,
    pub prev_hash: String,
    pub coherence_at_attest: f64,
    pub energy_at_attest: f64,
    pub timestamp: DateTime<Utc>,
    pub signature: String,
}

impl Attestation {
    /// Create a new attestation
    pub fn new(
        token_id: &str,
        sequence: u64,
        prev_hash: &str,
        coherence: f64,
        energy: f64,
    ) -> Self {
        let now = Utc::now();
        
        let state_data = format!(
            "{}|{}|{}|{}|{}|{}",
            token_id,
            sequence,
            prev_hash,
            coherence,
            energy,
            now.timestamp_nanos_opt().unwrap_or(0)
        );
        
        let state_hash = Self::compute_hash(&state_data);
        let signature = Self::compute_hash(&format!("SIG::{}", state_hash));
        
        Self {
            id: format!("ATTEST::{}::{}", token_id, sequence),
            token_id: token_id.to_string(),
            sequence,
            state_hash,
            prev_hash: prev_hash.to_string(),
            coherence_at_attest: coherence,
            energy_at_attest: energy,
            timestamp: now,
            signature,
        }
    }
    
    fn compute_hash(input: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(input.as_bytes());
        hex::encode(hasher.finalize())
    }
    
    /// Verify this attestation links to the previous one
    pub fn verify_chain(&self, prev: &Attestation) -> bool {
        self.prev_hash == prev.state_hash && self.sequence == prev.sequence + 1
    }
}

/// An attestation chain for a token
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttestationChain {
    pub token_id: String,
    chain: VecDeque<Attestation>,
    pub max_length: usize,
    pub genesis_hash: String,
    pub current_sequence: u64,
    pub chain_coherence: f64,
    pub total_attestations: u64,
}

impl AttestationChain {
    /// Create a new attestation chain for a token
    pub fn new(token_id: &str, max_length: usize) -> Self {
        let genesis_hash = Self::compute_genesis_hash(token_id);
        
        Self {
            token_id: token_id.to_string(),
            chain: VecDeque::with_capacity(max_length),
            max_length,
            genesis_hash,
            current_sequence: 0,
            chain_coherence: 1.0,
            total_attestations: 0,
        }
    }
    
    fn compute_genesis_hash(token_id: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(format!("GENESIS::{}", token_id).as_bytes());
        hex::encode(hasher.finalize())
    }
    
    /// Get the previous hash (either from last attestation or genesis)
    pub fn prev_hash(&self) -> &str {
        self.chain
            .back()
            .map(|a| a.state_hash.as_str())
            .unwrap_or(&self.genesis_hash)
    }
    
    /// Add a new attestation to the chain
    pub fn attest(&mut self, coherence: f64, energy: f64) -> Attestation {
        let prev = self.prev_hash().to_string();
        self.current_sequence += 1;
        
        let attestation = Attestation::new(
            &self.token_id,
            self.current_sequence,
            &prev,
            coherence,
            energy,
        );
        
        // Maintain max length
        if self.chain.len() >= self.max_length {
            self.chain.pop_front();
        }
        
        self.chain.push_back(attestation.clone());
        self.total_attestations += 1;
        
        // Update chain coherence
        self.update_coherence();
        
        attestation
    }
    
    /// Update chain coherence based on attestation history
    fn update_coherence(&mut self) {
        if self.chain.is_empty() {
            self.chain_coherence = 1.0;
            return;
        }
        
        // φ-weighted average of attestation coherences
        let mut weighted_sum = 0.0;
        let mut weight_total = 0.0;
        
        for (i, attest) in self.chain.iter().rev().enumerate() {
            let weight = PHI_INVERSE.powi(i as i32);
            weighted_sum += attest.coherence_at_attest * weight;
            weight_total += weight;
        }
        
        self.chain_coherence = weighted_sum / weight_total;
    }
    
    /// Verify the entire chain integrity
    pub fn verify_integrity(&self) -> bool {
        if self.chain.is_empty() {
            return true;
        }
        
        // First should link to genesis
        if self.chain[0].prev_hash != self.genesis_hash {
            return false;
        }
        
        // Each subsequent should link to previous
        for i in 1..self.chain.len() {
            if !self.chain[i].verify_chain(&self.chain[i - 1]) {
                return false;
            }
        }
        
        true
    }
    
    /// Get the latest attestation
    pub fn latest(&self) -> Option<&Attestation> {
        self.chain.back()
    }
    
    /// Get attestation by sequence number
    pub fn get_by_sequence(&self, sequence: u64) -> Option<&Attestation> {
        self.chain.iter().find(|a| a.sequence == sequence)
    }
    
    /// Get chain length
    pub fn len(&self) -> usize {
        self.chain.len()
    }
    
    /// Check if chain is empty
    pub fn is_empty(&self) -> bool {
        self.chain.is_empty()
    }
    
    /// Calculate coherence drift (how much coherence has changed)
    pub fn coherence_drift(&self) -> f64 {
        if self.chain.len() < 2 {
            return 0.0;
        }
        
        let latest = self.chain.back().unwrap().coherence_at_attest;
        let oldest = self.chain.front().unwrap().coherence_at_attest;
        
        (latest - oldest).abs()
    }
    
    /// Calculate energy drift
    pub fn energy_drift(&self) -> f64 {
        if self.chain.len() < 2 {
            return 0.0;
        }
        
        let latest = self.chain.back().unwrap().energy_at_attest;
        let oldest = self.chain.front().unwrap().energy_at_attest;
        
        (latest - oldest).abs()
    }
}

/// Multi-token attestation registry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttestationRegistry {
    pub chains: std::collections::HashMap<String, AttestationChain>,
    pub total_attestations: u64,
    pub global_coherence: f64,
}

impl AttestationRegistry {
    pub fn new() -> Self {
        Self {
            chains: std::collections::HashMap::new(),
            total_attestations: 0,
            global_coherence: 0.0,
        }
    }
    
    /// Register a new token
    pub fn register_token(&mut self, token_id: &str, max_chain_length: usize) {
        let chain = AttestationChain::new(token_id, max_chain_length);
        self.chains.insert(token_id.to_string(), chain);
    }
    
    /// Attest a token
    pub fn attest(&mut self, token_id: &str, coherence: f64, energy: f64) -> Option<Attestation> {
        if let Some(chain) = self.chains.get_mut(token_id) {
            let attestation = chain.attest(coherence, energy);
            self.total_attestations += 1;
            self.update_global_coherence();
            Some(attestation)
        } else {
            None
        }
    }
    
    fn update_global_coherence(&mut self) {
        if self.chains.is_empty() {
            self.global_coherence = 0.0;
            return;
        }
        
        let total: f64 = self.chains.values()
            .map(|c| c.chain_coherence)
            .sum();
        
        self.global_coherence = total / self.chains.len() as f64;
    }
    
    /// Verify all chains
    pub fn verify_all(&self) -> bool {
        self.chains.values().all(|c| c.verify_integrity())
    }
    
    /// Get chain for a token
    pub fn get_chain(&self, token_id: &str) -> Option<&AttestationChain> {
        self.chains.get(token_id)
    }
}

impl Default for AttestationRegistry {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_attestation_creation() {
        let attest = Attestation::new("TOKEN-001", 1, "genesis", 0.8, 0.9);
        
        assert_eq!(attest.sequence, 1);
        assert!(!attest.state_hash.is_empty());
        assert!(!attest.signature.is_empty());
    }
    
    #[test]
    fn test_attestation_chain() {
        let mut chain = AttestationChain::new("TOKEN-001", 100);
        
        chain.attest(0.8, 0.9);
        chain.attest(0.85, 0.85);
        chain.attest(0.9, 0.8);
        
        assert_eq!(chain.len(), 3);
        assert!(chain.verify_integrity());
    }
    
    #[test]
    fn test_chain_coherence() {
        let mut chain = AttestationChain::new("TOKEN-001", 100);
        
        chain.attest(0.5, 0.9);
        chain.attest(0.7, 0.85);
        chain.attest(0.9, 0.8);
        
        // φ-weighted should favor recent (higher coherence)
        assert!(chain.chain_coherence > 0.7);
    }
    
    #[test]
    fn test_attestation_registry() {
        let mut registry = AttestationRegistry::new();
        
        registry.register_token("TOKEN-001", 100);
        registry.register_token("TOKEN-002", 100);
        
        registry.attest("TOKEN-001", 0.8, 0.9);
        registry.attest("TOKEN-002", 0.7, 0.8);
        
        assert_eq!(registry.total_attestations, 2);
        assert!(registry.verify_all());
    }
}
