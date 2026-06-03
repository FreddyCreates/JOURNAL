//! Sovereign Token Implementation
//!
//! High-performance token operations with Monte Carlo simulation support.

use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use chrono::{DateTime, Utc};
use std::collections::HashMap;

use crate::phi::{PHI, PHI_INVERSE, PHI_COMPLEMENT};

/// Token lifecycle phases
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TokenPhase {
    Genesis,
    Sovereign,
    Merging,
    Splitting,
    Evolving,
    Attesting,
    Dormant,
    Ascended,
}

impl Default for TokenPhase {
    fn default() -> Self {
        TokenPhase::Genesis
    }
}

/// Token operation types
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TokenOperation {
    Mint,
    Transfer,
    Merge,
    Split,
    Evolve,
    Attest,
    Burn,
}

/// A self-governing sovereign token
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SovereignToken {
    pub id: String,
    pub name: String,
    pub generation: u32,
    pub lineage: Vec<String>,
    pub children: Vec<String>,
    
    // State
    pub phase: TokenPhase,
    pub coherence: f64,
    pub energy: f64,
    pub evolution_count: u64,
    pub maturity: f64,
    
    // Merge/Split tracking
    pub merged_from: Vec<String>,
    pub split_count: u32,
    pub merge_count: u32,
    
    // Attestation
    pub attestation_count: u64,
    pub state_hash: String,
    
    // Timestamps
    pub genesis_time: DateTime<Utc>,
    pub last_heartbeat: DateTime<Utc>,
    pub last_evolution: DateTime<Utc>,
}

impl SovereignToken {
    /// Create a new genesis token
    pub fn new(id: &str, name: &str) -> Self {
        let now = Utc::now();
        let hash = Self::compute_hash(&format!("{}|{}|{}", id, name, now.timestamp_nanos_opt().unwrap_or(0)));
        
        Self {
            id: id.to_string(),
            name: name.to_string(),
            generation: 0,
            lineage: vec![id.to_string()],
            children: Vec::new(),
            
            phase: TokenPhase::Genesis,
            coherence: PHI_INVERSE,  // Start at φ⁻¹
            energy: 1.0,
            evolution_count: 0,
            maturity: 0.0,
            
            merged_from: Vec::new(),
            split_count: 0,
            merge_count: 0,
            
            attestation_count: 0,
            state_hash: hash,
            
            genesis_time: now,
            last_heartbeat: now,
            last_evolution: now,
        }
    }
    
    /// Compute SHA-256 hash
    fn compute_hash(input: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(input.as_bytes());
        hex::encode(hasher.finalize())
    }
    
    /// Evolve the token by one cycle
    pub fn evolve(&mut self) -> bool {
        if self.phase == TokenPhase::Dormant || self.phase == TokenPhase::Ascended {
            return false;
        }
        
        const EVOLVE_COST: f64 = 0.05;
        
        if self.energy < EVOLVE_COST {
            self.coherence *= 1.0 - PHI_COMPLEMENT * 0.1;
            if self.coherence < PHI_COMPLEMENT {
                self.phase = TokenPhase::Dormant;
            }
            return false;
        }
        
        self.phase = TokenPhase::Evolving;
        self.energy -= EVOLVE_COST;
        
        // φ-weighted evolution toward equilibrium
        let target = PHI_INVERSE;
        let drift = (target - self.coherence) * PHI_COMPLEMENT;
        self.coherence = (self.coherence + drift).clamp(0.0, 1.0);
        
        // Energy regenerates slightly
        self.energy = (self.energy + PHI_COMPLEMENT * 0.02).min(1.0);
        
        // Maturity increases
        self.maturity = (self.maturity + PHI_INVERSE * 0.01).min(1.0);
        
        self.evolution_count += 1;
        self.last_evolution = Utc::now();
        
        // Check for ascension
        if self.coherence > PHI_INVERSE + 0.3 && self.maturity > PHI_INVERSE {
            self.phase = TokenPhase::Ascended;
        } else {
            self.phase = TokenPhase::Sovereign;
        }
        
        true
    }
    
    /// Self-attest current state
    pub fn attest(&mut self) -> Option<String> {
        const ATTEST_COST: f64 = 0.02;
        
        if self.energy < ATTEST_COST {
            return None;
        }
        
        self.phase = TokenPhase::Attesting;
        self.energy -= ATTEST_COST;
        
        let hash_input = format!(
            "{}|{}|{}|{}|{}",
            self.id,
            self.coherence,
            self.energy,
            self.evolution_count,
            Utc::now().timestamp_nanos_opt().unwrap_or(0)
        );
        
        self.state_hash = Self::compute_hash(&hash_input);
        self.attestation_count += 1;
        self.last_heartbeat = Utc::now();
        self.phase = TokenPhase::Sovereign;
        
        Some(self.state_hash.clone())
    }
}

// ════════════════════════════════════════════════════════════════════════════════
// MONTE CARLO TOKEN SIMULATION
// ════════════════════════════════════════════════════════════════════════════════

use std::f64::consts::PI;

/// Random number generator state (simple LCG for reproducibility)
#[derive(Debug, Clone)]
pub struct MonteCarloRng {
    state: u64,
}

impl MonteCarloRng {
    pub fn new(seed: u64) -> Self {
        Self { state: seed }
    }
    
    /// Generate random u64
    pub fn next_u64(&mut self) -> u64 {
        // LCG parameters (same as glibc)
        self.state = self.state.wrapping_mul(1103515245).wrapping_add(12345);
        self.state
    }
    
    /// Generate random f64 in [0, 1)
    pub fn next_f64(&mut self) -> f64 {
        (self.next_u64() as f64) / (u64::MAX as f64)
    }
    
    /// Generate random f64 in [min, max)
    pub fn next_range(&mut self, min: f64, max: f64) -> f64 {
        min + self.next_f64() * (max - min)
    }
    
    /// Generate random bool with probability p
    pub fn next_bool(&mut self, p: f64) -> bool {
        self.next_f64() < p
    }
    
    /// Generate normally distributed random number (Box-Muller)
    pub fn next_normal(&mut self, mean: f64, std_dev: f64) -> f64 {
        let u1 = self.next_f64().max(1e-10);
        let u2 = self.next_f64();
        let z = (-2.0 * u1.ln()).sqrt() * (2.0 * PI * u2).cos();
        mean + std_dev * z
    }
}

/// Monte Carlo simulation configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonteCarloConfig {
    pub n_simulations: u32,
    pub n_steps: u32,
    pub n_tokens: u32,
    pub merge_probability: f64,
    pub split_probability: f64,
    pub evolution_noise: f64,
    pub seed: u64,
}

impl Default for MonteCarloConfig {
    fn default() -> Self {
        Self {
            n_simulations: 1000,
            n_steps: 100,
            n_tokens: 10,
            merge_probability: 0.1 * PHI_INVERSE,
            split_probability: 0.05 * PHI_INVERSE,
            evolution_noise: 0.1,
            seed: 42,
        }
    }
}

/// Results from a single Monte Carlo run
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimulationRun {
    pub run_id: u32,
    pub final_token_count: u32,
    pub final_mean_coherence: f64,
    pub final_mean_energy: f64,
    pub ascended_count: u32,
    pub dormant_count: u32,
    pub total_merges: u32,
    pub total_splits: u32,
    pub max_generation: u32,
    pub coherence_history: Vec<f64>,
    pub energy_history: Vec<f64>,
}

/// Aggregate Monte Carlo results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonteCarloResults {
    pub config: MonteCarloConfig,
    pub mean_final_coherence: f64,
    pub std_final_coherence: f64,
    pub mean_final_energy: f64,
    pub std_final_energy: f64,
    pub mean_ascension_rate: f64,
    pub mean_dormancy_rate: f64,
    pub mean_survival_rate: f64,
    pub coherence_distribution: Vec<f64>,  // Histogram bins
    pub energy_distribution: Vec<f64>,
    pub generation_distribution: Vec<u32>,
    pub runs: Vec<SimulationRun>,
}

/// Monte Carlo Token Simulator
pub struct MonteCarloSimulator {
    config: MonteCarloConfig,
    rng: MonteCarloRng,
}

impl MonteCarloSimulator {
    pub fn new(config: MonteCarloConfig) -> Self {
        let rng = MonteCarloRng::new(config.seed);
        Self { config, rng }
    }
    
    /// Run a single simulation
    pub fn run_single(&mut self, run_id: u32) -> SimulationRun {
        let mut tokens: HashMap<String, SovereignToken> = HashMap::new();
        let mut coherence_history = Vec::with_capacity(self.config.n_steps as usize);
        let mut energy_history = Vec::with_capacity(self.config.n_steps as usize);
        let mut total_merges = 0u32;
        let mut total_splits = 0u32;
        
        // Create initial tokens
        for i in 0..self.config.n_tokens {
            let token = SovereignToken::new(
                &format!("TOKEN-{}-{}", run_id, i),
                &format!("Token {}", i),
            );
            tokens.insert(token.id.clone(), token);
        }
        
        // Simulate
        for step in 0..self.config.n_steps {
            // Evolve all tokens with noise
            for token in tokens.values_mut() {
                if token.phase != TokenPhase::Dormant && token.phase != TokenPhase::Ascended {
                    token.evolve();
                    
                    // Add noise
                    let noise = self.rng.next_normal(0.0, self.config.evolution_noise);
                    token.coherence = (token.coherence + noise * PHI_COMPLEMENT).clamp(0.0, 1.0);
                }
            }
            
            // Random merges
            if self.rng.next_bool(self.config.merge_probability) {
                let active_ids: Vec<String> = tokens.iter()
                    .filter(|(_, t)| t.phase == TokenPhase::Sovereign && t.energy > 0.2)
                    .map(|(id, _)| id.clone())
                    .collect();
                
                if active_ids.len() >= 2 {
                    let idx1 = (self.rng.next_u64() as usize) % active_ids.len();
                    let mut idx2 = (self.rng.next_u64() as usize) % active_ids.len();
                    while idx2 == idx1 {
                        idx2 = (self.rng.next_u64() as usize) % active_ids.len();
                    }
                    
                    let id1 = &active_ids[idx1];
                    let id2 = &active_ids[idx2];
                    
                    if let (Some(t1), Some(t2)) = (tokens.get(id1), tokens.get(id2)) {
                        // Create merged token
                        let merged_id = format!("MERGED-{}-{}", run_id, step);
                        let mut merged = SovereignToken::new(&merged_id, "Merged");
                        merged.generation = t1.generation.max(t2.generation) + 1;
                        merged.coherence = (t1.coherence * t2.coherence).sqrt() * PHI / 2.0;
                        merged.energy = (t1.energy + t2.energy) * PHI_INVERSE - 0.2;
                        merged.merged_from = vec![id1.clone(), id2.clone()];
                        merged.merge_count = t1.merge_count + t2.merge_count + 1;
                        merged.phase = TokenPhase::Sovereign;
                        
                        // Remove source tokens, add merged
                        tokens.remove(id1);
                        tokens.remove(id2);
                        tokens.insert(merged_id, merged);
                        total_merges += 1;
                    }
                }
            }
            
            // Random splits
            if self.rng.next_bool(self.config.split_probability) {
                let splittable_ids: Vec<String> = tokens.iter()
                    .filter(|(_, t)| t.phase == TokenPhase::Sovereign && t.energy > 0.3)
                    .map(|(id, _)| id.clone())
                    .collect();
                
                if !splittable_ids.is_empty() {
                    let idx = (self.rng.next_u64() as usize) % splittable_ids.len();
                    let parent_id = &splittable_ids[idx];
                    
                    if let Some(parent) = tokens.get_mut(parent_id) {
                        let n_children = 2 + (self.rng.next_u64() % 2) as u32;  // 2-3 children
                        let energy_per_child = (parent.energy - 0.15 * n_children as f64) / n_children as f64;
                        
                        // Validate sufficient energy before split
                        if energy_per_child <= 0.0 {
                            continue;
                        }
                        
                        if energy_per_child > 0.0 {
                            let mut children = Vec::new();
                            
                            for c in 0..n_children {
                                let child_id = format!("{}-CHILD-{}", parent_id, c);
                                let mut child = SovereignToken::new(&child_id, &format!("Child {}", c));
                                child.generation = parent.generation + 1;
                                child.coherence = parent.coherence * PHI_INVERSE + self.rng.next_range(-0.05, 0.05);
                                child.coherence = child.coherence.clamp(0.0, 1.0);
                                child.energy = energy_per_child;
                                child.lineage = parent.lineage.clone();
                                child.lineage.push(child_id.clone());
                                child.phase = TokenPhase::Sovereign;
                                children.push((child_id, child));
                            }
                            
                            parent.phase = TokenPhase::Dormant;
                            parent.energy = 0.0;
                            parent.split_count += 1;
                            
                            for (id, child) in children {
                                tokens.insert(id, child);
                            }
                            total_splits += 1;
                        }
                    }
                }
            }
            
            // Record metrics
            let active_tokens: Vec<&SovereignToken> = tokens.values()
                .filter(|t| t.phase != TokenPhase::Dormant)
                .collect();
            
            if !active_tokens.is_empty() {
                let mean_coh: f64 = active_tokens.iter().map(|t| t.coherence).sum::<f64>() / active_tokens.len() as f64;
                let mean_en: f64 = active_tokens.iter().map(|t| t.energy).sum::<f64>() / active_tokens.len() as f64;
                coherence_history.push(mean_coh);
                energy_history.push(mean_en);
            } else {
                coherence_history.push(0.0);
                energy_history.push(0.0);
            }
        }
        
        // Compute final statistics
        let all_tokens: Vec<&SovereignToken> = tokens.values().collect();
        let n = all_tokens.len() as f64;
        
        let final_mean_coherence = if n > 0.0 {
            all_tokens.iter().map(|t| t.coherence).sum::<f64>() / n
        } else { 0.0 };
        
        let final_mean_energy = if n > 0.0 {
            all_tokens.iter().map(|t| t.energy).sum::<f64>() / n
        } else { 0.0 };
        
        let ascended_count = all_tokens.iter().filter(|t| t.phase == TokenPhase::Ascended).count() as u32;
        let dormant_count = all_tokens.iter().filter(|t| t.phase == TokenPhase::Dormant).count() as u32;
        let max_generation = all_tokens.iter().map(|t| t.generation).max().unwrap_or(0);
        
        SimulationRun {
            run_id,
            final_token_count: tokens.len() as u32,
            final_mean_coherence,
            final_mean_energy,
            ascended_count,
            dormant_count,
            total_merges,
            total_splits,
            max_generation,
            coherence_history,
            energy_history,
        }
    }
    
    /// Run full Monte Carlo simulation
    pub fn run_monte_carlo(&mut self) -> MonteCarloResults {
        let mut runs = Vec::with_capacity(self.config.n_simulations as usize);
        
        for i in 0..self.config.n_simulations {
            let run = self.run_single(i);
            runs.push(run);
        }
        
        // Compute aggregate statistics
        let n = runs.len() as f64;
        
        let coherences: Vec<f64> = runs.iter().map(|r| r.final_mean_coherence).collect();
        let energies: Vec<f64> = runs.iter().map(|r| r.final_mean_energy).collect();
        
        let mean_coh: f64 = coherences.iter().sum::<f64>() / n;
        let mean_en: f64 = energies.iter().sum::<f64>() / n;
        
        let var_coh: f64 = coherences.iter().map(|c| (c - mean_coh).powi(2)).sum::<f64>() / n;
        let var_en: f64 = energies.iter().map(|e| (e - mean_en).powi(2)).sum::<f64>() / n;
        
        let mean_ascension = runs.iter().map(|r| r.ascended_count as f64).sum::<f64>() / n;
        let mean_dormancy = runs.iter().map(|r| r.dormant_count as f64).sum::<f64>() / n;
        
        let total_tokens: f64 = runs.iter().map(|r| r.final_token_count as f64).sum::<f64>() / n;
        let active_tokens = total_tokens - mean_dormancy;
        let mean_survival = if total_tokens > 0.0 { active_tokens / total_tokens } else { 0.0 };
        
        // Build distributions (10 bins)
        let mut coherence_distribution = vec![0.0; 10];
        let mut energy_distribution = vec![0.0; 10];
        
        for c in &coherences {
            let bin = ((c * 10.0).floor() as usize).min(9);
            coherence_distribution[bin] += 1.0 / n;
        }
        
        for e in &energies {
            let bin = ((e * 10.0).floor() as usize).min(9);
            energy_distribution[bin] += 1.0 / n;
        }
        
        // Generation distribution
        let max_gen = runs.iter().map(|r| r.max_generation).max().unwrap_or(0) as usize;
        let mut generation_distribution = vec![0u32; max_gen + 1];
        for run in &runs {
            if (run.max_generation as usize) < generation_distribution.len() {
                generation_distribution[run.max_generation as usize] += 1;
            }
        }
        
        MonteCarloResults {
            config: self.config.clone(),
            mean_final_coherence: mean_coh,
            std_final_coherence: var_coh.sqrt(),
            mean_final_energy: mean_en,
            std_final_energy: var_en.sqrt(),
            mean_ascension_rate: mean_ascension / self.config.n_tokens as f64,
            mean_dormancy_rate: mean_dormancy / self.config.n_tokens as f64,
            mean_survival_rate: mean_survival,
            coherence_distribution,
            energy_distribution,
            generation_distribution,
            runs,
        }
    }
    
    /// Run parameter sweep Monte Carlo
    pub fn parameter_sweep(
        &mut self,
        merge_probs: &[f64],
        split_probs: &[f64],
        sims_per_config: u32,
    ) -> Vec<(f64, f64, MonteCarloResults)> {
        let mut results = Vec::new();
        
        for &mp in merge_probs {
            for &sp in split_probs {
                self.config.merge_probability = mp;
                self.config.split_probability = sp;
                self.config.n_simulations = sims_per_config;
                
                let mc_results = self.run_monte_carlo();
                results.push((mp, sp, mc_results));
            }
        }
        
        results
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_token_creation() {
        let token = SovereignToken::new("TEST-001", "Test Token");
        assert_eq!(token.phase, TokenPhase::Genesis);
        assert!((token.coherence - PHI_INVERSE).abs() < 0.01);
    }
    
    #[test]
    fn test_token_evolution() {
        let mut token = SovereignToken::new("EVOLVE-001", "Evolving");
        let initial_count = token.evolution_count;
        
        token.evolve();
        
        assert_eq!(token.evolution_count, initial_count + 1);
        assert!(token.energy < 1.0);
    }
    
    #[test]
    fn test_monte_carlo_rng() {
        let mut rng = MonteCarloRng::new(42);
        
        let mut sum = 0.0;
        for _ in 0..1000 {
            sum += rng.next_f64();
        }
        
        // Mean should be ~0.5
        let mean = sum / 1000.0;
        assert!(mean > 0.4 && mean < 0.6);
    }
    
    #[test]
    fn test_monte_carlo_simulation() {
        let config = MonteCarloConfig {
            n_simulations: 10,
            n_steps: 20,
            n_tokens: 5,
            ..Default::default()
        };
        
        let mut sim = MonteCarloSimulator::new(config);
        let results = sim.run_monte_carlo();
        
        assert_eq!(results.runs.len(), 10);
        assert!(results.mean_final_coherence >= 0.0);
        assert!(results.mean_final_coherence <= 1.0);
    }
}
