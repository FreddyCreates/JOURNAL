//! Phantom Bridge — Cross-Chain Awareness
//!
//! Read-only multi-chain sensing for the sovereign organism.

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::collections::HashMap;

use crate::phi::{PHI, PHI_INVERSE, PHI_COMPLEMENT};

/// Supported chain types for phantom sensing
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ChainType {
    /// Internet Computer Protocol (native)
    ICP,
    /// Ethereum mainnet
    Ethereum,
    /// Solana
    Solana,
    /// Bitcoin (read-only)
    Bitcoin,
    /// Polygon
    Polygon,
    /// Arbitrum
    Arbitrum,
    /// Base
    Base,
    /// Cosmos ecosystem
    Cosmos,
}

impl ChainType {
    /// Get φ-weighted priority for this chain
    pub fn phi_priority(&self) -> f64 {
        match self {
            ChainType::ICP => PHI,           // Native = highest
            ChainType::Ethereum => PHI_INVERSE,
            ChainType::Bitcoin => PHI_INVERSE,
            ChainType::Solana => PHI_COMPLEMENT,
            ChainType::Polygon => PHI_COMPLEMENT,
            ChainType::Arbitrum => PHI_COMPLEMENT,
            ChainType::Base => PHI_COMPLEMENT,
            ChainType::Cosmos => PHI_COMPLEMENT,
        }
    }
}

/// Signal strength for phantom chain sensing
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SignalStrength {
    /// Strong signal — recent, verified data
    Strong,
    /// Medium signal — slightly stale or unverified
    Medium,
    /// Weak signal — old data or low confidence
    Weak,
    /// No signal — chain unreachable
    None,
}

impl SignalStrength {
    pub fn to_f64(&self) -> f64 {
        match self {
            SignalStrength::Strong => 1.0,
            SignalStrength::Medium => PHI_INVERSE,
            SignalStrength::Weak => PHI_COMPLEMENT,
            SignalStrength::None => 0.0,
        }
    }
}

/// A signal from a phantom chain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChainSignal {
    pub chain: ChainType,
    pub signal_type: SignalType,
    pub strength: SignalStrength,
    pub value: f64,
    pub metadata: HashMap<String, String>,
    pub timestamp: DateTime<Utc>,
    pub block_number: Option<u64>,
}

/// Types of signals we can sense from chains
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SignalType {
    /// Token price signal
    Price,
    /// Trading volume
    Volume,
    /// Gas/fee metrics
    GasFee,
    /// Network activity
    Activity,
    /// Governance activity
    Governance,
    /// Liquidity depth
    Liquidity,
    /// Cross-chain bridge activity
    BridgeFlow,
    /// Smart contract events
    ContractEvent,
}

/// Phantom limb — connection to a single chain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhantomLimb {
    pub chain: ChainType,
    pub is_active: bool,
    pub last_signal: Option<DateTime<Utc>>,
    pub signal_count: u64,
    pub coherence: f64,  // How well synchronized with this chain
    pub latency_ms: u32,
    signal_buffer: Vec<ChainSignal>,
}

impl PhantomLimb {
    pub fn new(chain: ChainType) -> Self {
        Self {
            chain,
            is_active: false,
            last_signal: None,
            signal_count: 0,
            coherence: 0.0,
            latency_ms: 0,
            signal_buffer: Vec::with_capacity(100),
        }
    }
    
    /// Receive a signal from this chain
    pub fn receive_signal(&mut self, signal: ChainSignal) {
        self.is_active = true;
        self.last_signal = Some(signal.timestamp);
        self.signal_count += 1;
        
        // Update coherence based on signal strength
        let strength = signal.strength.to_f64();
        self.coherence = self.coherence * (1.0 - PHI_COMPLEMENT) + strength * PHI_COMPLEMENT;
        
        // Buffer signal (keep last 100)
        if self.signal_buffer.len() >= 100 {
            self.signal_buffer.remove(0);
        }
        self.signal_buffer.push(signal);
    }
    
    /// Get recent signals of a specific type
    pub fn get_signals(&self, signal_type: SignalType, limit: usize) -> Vec<&ChainSignal> {
        self.signal_buffer
            .iter()
            .filter(|s| s.signal_type == signal_type)
            .rev()
            .take(limit)
            .collect()
    }
    
    /// Calculate average signal value for a type
    pub fn average_signal(&self, signal_type: SignalType) -> Option<f64> {
        let signals: Vec<f64> = self.signal_buffer
            .iter()
            .filter(|s| s.signal_type == signal_type)
            .map(|s| s.value * s.strength.to_f64())  // Weighted by strength
            .collect();
        
        if signals.is_empty() {
            return None;
        }
        
        Some(signals.iter().sum::<f64>() / signals.len() as f64)
    }
}

/// Phantom Bridge — Multi-chain awareness system
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhantomBridge {
    pub id: String,
    pub limbs: HashMap<ChainType, PhantomLimb>,
    pub global_coherence: f64,
    pub total_signals: u64,
    pub cross_chain_resonance: f64,
    pub created_at: DateTime<Utc>,
    pub last_update: DateTime<Utc>,
}

impl PhantomBridge {
    /// Create a new phantom bridge
    pub fn new(id: &str) -> Self {
        let now = Utc::now();
        let mut limbs = HashMap::new();
        
        // Initialize limbs for all chain types
        for chain in [
            ChainType::ICP,
            ChainType::Ethereum,
            ChainType::Solana,
            ChainType::Bitcoin,
            ChainType::Polygon,
            ChainType::Arbitrum,
            ChainType::Base,
            ChainType::Cosmos,
        ] {
            limbs.insert(chain, PhantomLimb::new(chain));
        }
        
        Self {
            id: id.to_string(),
            limbs,
            global_coherence: 0.0,
            total_signals: 0,
            cross_chain_resonance: 0.0,
            created_at: now,
            last_update: now,
        }
    }
    
    /// Receive a signal from a chain
    pub fn receive_signal(&mut self, signal: ChainSignal) {
        let chain = signal.chain;
        
        if let Some(limb) = self.limbs.get_mut(&chain) {
            limb.receive_signal(signal);
        }
        
        self.total_signals += 1;
        self.last_update = Utc::now();
        self.update_global_coherence();
    }
    
    /// Update global coherence from all limbs
    fn update_global_coherence(&mut self) {
        let active_limbs: Vec<&PhantomLimb> = self.limbs
            .values()
            .filter(|l| l.is_active)
            .collect();
        
        if active_limbs.is_empty() {
            self.global_coherence = 0.0;
            self.cross_chain_resonance = 0.0;
            return;
        }
        
        // φ-weighted coherence based on chain priority
        let mut weighted_sum = 0.0;
        let mut weight_total = 0.0;
        
        for limb in &active_limbs {
            let weight = limb.chain.phi_priority();
            weighted_sum += limb.coherence * weight;
            weight_total += weight;
        }
        
        self.global_coherence = if weight_total > 0.0 {
            weighted_sum / weight_total
        } else {
            0.0
        };
        
        // Cross-chain resonance: correlation between chain signals
        self.cross_chain_resonance = self.calculate_resonance(&active_limbs);
    }
    
    /// Calculate cross-chain resonance
    fn calculate_resonance(&self, limbs: &[&PhantomLimb]) -> f64 {
        if limbs.len() < 2 {
            return 0.0;
        }
        
        // Get price signals from each chain
        let price_signals: Vec<f64> = limbs
            .iter()
            .filter_map(|l| l.average_signal(SignalType::Price))
            .collect();
        
        if price_signals.len() < 2 {
            return 0.0;
        }
        
        // Calculate coefficient of variation (inverse = resonance)
        let mean: f64 = price_signals.iter().sum::<f64>() / price_signals.len() as f64;
        if mean == 0.0 {
            return 0.0;
        }
        
        let variance: f64 = price_signals.iter()
            .map(|p| (p - mean).powi(2))
            .sum::<f64>() / price_signals.len() as f64;
        
        let cv = variance.sqrt() / mean;
        
        // Convert to resonance (low variation = high resonance)
        (1.0 / (1.0 + cv * PHI)).min(1.0)
    }
    
    /// Get active chains
    pub fn active_chains(&self) -> Vec<ChainType> {
        self.limbs
            .iter()
            .filter(|(_, l)| l.is_active)
            .map(|(c, _)| *c)
            .collect()
    }
    
    /// Get limb for a chain
    pub fn get_limb(&self, chain: ChainType) -> Option<&PhantomLimb> {
        self.limbs.get(&chain)
    }
    
    /// Sense all chains for a specific signal type
    pub fn sense(&self, signal_type: SignalType) -> HashMap<ChainType, Option<f64>> {
        self.limbs
            .iter()
            .map(|(chain, limb)| (*chain, limb.average_signal(signal_type)))
            .collect()
    }
}

/// Cross-chain resonance protocol
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrossChainResonance {
    pub bridge: PhantomBridge,
    pub resonance_matrix: HashMap<(ChainType, ChainType), f64>,
    pub dominant_chain: Option<ChainType>,
    pub resonance_score: f64,
}

impl CrossChainResonance {
    pub fn new(bridge: PhantomBridge) -> Self {
        Self {
            bridge,
            resonance_matrix: HashMap::new(),
            dominant_chain: None,
            resonance_score: 0.0,
        }
    }
    
    /// Calculate pairwise resonance between all active chains
    pub fn calculate_matrix(&mut self) {
        let active = self.bridge.active_chains();
        
        for i in 0..active.len() {
            for j in (i+1)..active.len() {
                let chain_a = active[i];
                let chain_b = active[j];
                
                let resonance = self.calculate_pair_resonance(chain_a, chain_b);
                self.resonance_matrix.insert((chain_a, chain_b), resonance);
                self.resonance_matrix.insert((chain_b, chain_a), resonance);
            }
        }
        
        // Calculate overall resonance score
        if !self.resonance_matrix.is_empty() {
            self.resonance_score = self.resonance_matrix.values().sum::<f64>() 
                / self.resonance_matrix.len() as f64;
        }
        
        // Find dominant chain
        self.dominant_chain = self.bridge.limbs
            .iter()
            .filter(|(_, l)| l.is_active)
            .max_by(|(_, a), (_, b)| {
                a.coherence.partial_cmp(&b.coherence).unwrap()
            })
            .map(|(c, _)| *c);
    }
    
    fn calculate_pair_resonance(&self, chain_a: ChainType, chain_b: ChainType) -> f64 {
        let limb_a = self.bridge.get_limb(chain_a);
        let limb_b = self.bridge.get_limb(chain_b);
        
        match (limb_a, limb_b) {
            (Some(a), Some(b)) => {
                // Combine coherences with priority weighting
                let priority_a = chain_a.phi_priority();
                let priority_b = chain_b.phi_priority();
                
                (a.coherence * priority_a + b.coherence * priority_b) 
                    / (priority_a + priority_b)
            }
            _ => 0.0,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_phantom_bridge_creation() {
        let bridge = PhantomBridge::new("TEST-BRIDGE");
        assert_eq!(bridge.limbs.len(), 8);
        assert_eq!(bridge.global_coherence, 0.0);
    }
    
    #[test]
    fn test_receive_signal() {
        let mut bridge = PhantomBridge::new("TEST-BRIDGE");
        
        let signal = ChainSignal {
            chain: ChainType::Ethereum,
            signal_type: SignalType::Price,
            strength: SignalStrength::Strong,
            value: 3500.0,
            metadata: HashMap::new(),
            timestamp: Utc::now(),
            block_number: Some(18000000),
        };
        
        bridge.receive_signal(signal);
        
        assert_eq!(bridge.total_signals, 1);
        assert!(bridge.limbs.get(&ChainType::Ethereum).unwrap().is_active);
    }
    
    #[test]
    fn test_chain_priority() {
        assert!(ChainType::ICP.phi_priority() > ChainType::Ethereum.phi_priority());
        assert!(ChainType::Ethereum.phi_priority() > ChainType::Polygon.phi_priority());
    }
}
