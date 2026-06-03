/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  CROSS-CHAIN RESONANCE PROTOCOL — COHERENCE SIGNALS FROM OTHER SUBSTRATES           ║
 * ║  "Resonantia Transversa — Resonance Across Chains"                                    ║
 * ║                                                                                        ║
 * ║  "Omnia resonant. Cohaerentia propagatur. Organismus sentit."                        ║
 * ║  (All things resonate. Coherence propagates. The organism senses.)                    ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { 
  PHI, 
  PHI_INVERSE, 
  PHI_COMPLEMENT, 
  ChainType, 
  SignalType,
  PhantomBridge 
} from './phantom-bridge-protocol.js';

// ════════════════════════════════════════════════════════════════════════════════
// RESONANCE TYPES
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Types of cross-chain resonance patterns
 */
const ResonancePattern = {
  HARMONIC: 'HARMONIC',       // Chains moving in phase
  ANTI_HARMONIC: 'ANTI_HARMONIC', // Chains moving in opposition
  LEADING: 'LEADING',         // One chain leads others
  LAGGING: 'LAGGING',         // One chain follows others
  DECOUPLED: 'DECOUPLED',     // No correlation
};

/**
 * Resonance event types
 */
const ResonanceEvent = {
  SYNC_ACHIEVED: 'SYNC_ACHIEVED',
  SYNC_LOST: 'SYNC_LOST',
  DIVERGENCE_DETECTED: 'DIVERGENCE_DETECTED',
  CORRELATION_SHIFT: 'CORRELATION_SHIFT',
  DOMINANT_CHAIN_CHANGE: 'DOMINANT_CHAIN_CHANGE',
};

// ════════════════════════════════════════════════════════════════════════════════
// RESONANCE BOND — CROSS-CHAIN COUPLING
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Cross-chain resonance bond between two chains
 */
class CrossChainBond {
  constructor(chainA, chainB) {
    this.bondId = `XBOND::${chainA}::${chainB}`;
    this.chainA = chainA;
    this.chainB = chainB;
    this.correlation = 0;
    this.phaseOffset = 0;
    this.couplingStrength = PHI_COMPLEMENT; // Read-only = weak coupling
    this.pattern = ResonancePattern.DECOUPLED;
    this.sampleHistory = [];
    this.maxHistory = 100;
    this.createdAt = Date.now();
    this.lastUpdate = Date.now();
  }
  
  /**
   * Add a correlation sample
   */
  addSample(valueA, valueB) {
    this.sampleHistory.push({
      valueA,
      valueB,
      timestamp: Date.now(),
    });
    
    if (this.sampleHistory.length > this.maxHistory) {
      this.sampleHistory.shift();
    }
    
    this.updateCorrelation();
    this.detectPattern();
    this.lastUpdate = Date.now();
    
    return this;
  }
  
  /**
   * Calculate Pearson correlation coefficient
   */
  updateCorrelation() {
    if (this.sampleHistory.length < 5) {
      this.correlation = 0;
      return;
    }
    
    const n = this.sampleHistory.length;
    const samples = this.sampleHistory;
    
    // Calculate means
    const meanA = samples.reduce((s, x) => s + x.valueA, 0) / n;
    const meanB = samples.reduce((s, x) => s + x.valueB, 0) / n;
    
    // Calculate correlation
    let numerator = 0;
    let denomA = 0;
    let denomB = 0;
    
    samples.forEach(s => {
      const devA = s.valueA - meanA;
      const devB = s.valueB - meanB;
      numerator += devA * devB;
      denomA += devA * devA;
      denomB += devB * devB;
    });
    
    const denom = Math.sqrt(denomA * denomB);
    this.correlation = denom > 0 ? numerator / denom : 0;
  }
  
  /**
   * Detect the resonance pattern
   */
  detectPattern() {
    const r = this.correlation;
    
    if (r > 0.8) {
      this.pattern = ResonancePattern.HARMONIC;
    } else if (r < -0.8) {
      this.pattern = ResonancePattern.ANTI_HARMONIC;
    } else if (Math.abs(r) < 0.2) {
      this.pattern = ResonancePattern.DECOUPLED;
    } else if (r > 0.2) {
      // Check for lead/lag
      this.pattern = this.detectLeadLag();
    } else {
      this.pattern = ResonancePattern.DECOUPLED;
    }
  }
  
  /**
   * Detect lead/lag relationship
   */
  detectLeadLag() {
    if (this.sampleHistory.length < 10) {
      return ResonancePattern.HARMONIC;
    }
    
    // Simple lag detection via cross-correlation
    // Positive lag = A leads B
    const samples = this.sampleHistory.slice(-20);
    const n = samples.length;
    
    let maxCorr = -Infinity;
    let bestLag = 0;
    
    for (let lag = -5; lag <= 5; lag++) {
      let corr = 0;
      let count = 0;
      
      for (let i = Math.max(0, -lag); i < Math.min(n, n - lag); i++) {
        if (i + lag >= 0 && i + lag < n) {
          corr += samples[i].valueA * samples[i + lag].valueB;
          count++;
        }
      }
      
      if (count > 0 && corr / count > maxCorr) {
        maxCorr = corr / count;
        bestLag = lag;
      }
    }
    
    if (bestLag > 1) {
      return ResonancePattern.LEADING; // A leads B
    } else if (bestLag < -1) {
      return ResonancePattern.LAGGING; // A lags B
    }
    
    return ResonancePattern.HARMONIC;
  }
  
  /**
   * Get bond status
   */
  getStatus() {
    return {
      bondId: this.bondId,
      chainA: this.chainA,
      chainB: this.chainB,
      correlation: this.correlation,
      pattern: this.pattern,
      couplingStrength: this.couplingStrength,
      sampleCount: this.sampleHistory.length,
      lastUpdate: this.lastUpdate,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// CROSS-CHAIN RESONANCE NETWORK
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Network of cross-chain resonance bonds
 */
class CrossChainResonanceNetwork {
  constructor(phantomBridge) {
    this.bridge = phantomBridge;
    this.bonds = new Map();
    this.dominantChain = null;
    this.networkCoherence = 0;
    this.eventHistory = [];
    this.maxEvents = 100;
    
    // Initialize bonds between all chain pairs
    this.initializeBonds();
  }
  
  /**
   * Initialize resonance bonds between all chain pairs
   */
  initializeBonds() {
    const chains = Object.values(ChainType);
    
    for (let i = 0; i < chains.length; i++) {
      for (let j = i + 1; j < chains.length; j++) {
        const bond = new CrossChainBond(chains[i], chains[j]);
        this.bonds.set(bond.bondId, bond);
      }
    }
  }
  
  /**
   * Update bonds with new price data
   */
  updateFromPrices(priceData) {
    // priceData is { [ChainType]: price }
    const chains = Object.keys(priceData);
    
    for (let i = 0; i < chains.length; i++) {
      for (let j = i + 1; j < chains.length; j++) {
        const bondId = `XBOND::${chains[i]}::${chains[j]}`;
        const bond = this.bonds.get(bondId);
        
        if (bond) {
          const oldPattern = bond.pattern;
          bond.addSample(priceData[chains[i]], priceData[chains[j]]);
          
          // Emit event if pattern changed
          if (oldPattern !== bond.pattern) {
            this.emitEvent(ResonanceEvent.CORRELATION_SHIFT, {
              bond: bondId,
              oldPattern,
              newPattern: bond.pattern,
            });
          }
        }
      }
    }
    
    this.updateNetworkMetrics();
  }
  
  /**
   * Update network-wide metrics
   */
  updateNetworkMetrics() {
    // Calculate network coherence (average correlation strength)
    const bonds = Array.from(this.bonds.values());
    const correlations = bonds.map(b => Math.abs(b.correlation));
    
    this.networkCoherence = correlations.length > 0
      ? correlations.reduce((a, b) => a + b, 0) / correlations.length
      : 0;
    
    // Find dominant chain (highest average correlation)
    const chainScores = {};
    Object.values(ChainType).forEach(chain => {
      chainScores[chain] = 0;
    });
    
    bonds.forEach(bond => {
      const absCorr = Math.abs(bond.correlation);
      chainScores[bond.chainA] += absCorr;
      chainScores[bond.chainB] += absCorr;
    });
    
    const oldDominant = this.dominantChain;
    this.dominantChain = Object.entries(chainScores)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    if (oldDominant && oldDominant !== this.dominantChain) {
      this.emitEvent(ResonanceEvent.DOMINANT_CHAIN_CHANGE, {
        oldDominant,
        newDominant: this.dominantChain,
      });
    }
  }
  
  /**
   * Emit a resonance event
   */
  emitEvent(eventType, data) {
    const event = {
      type: eventType,
      data,
      timestamp: Date.now(),
    };
    
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxEvents) {
      this.eventHistory.shift();
    }
    
    // Could emit to external listeners here
    console.log(`[CrossChainResonance] ${eventType}:`, data);
  }
  
  /**
   * Get resonance matrix (all pairwise correlations)
   */
  getResonanceMatrix() {
    const chains = Object.values(ChainType);
    const matrix = {};
    
    chains.forEach(chainA => {
      matrix[chainA] = {};
      chains.forEach(chainB => {
        if (chainA === chainB) {
          matrix[chainA][chainB] = 1.0;
        } else {
          const bondId = chainA < chainB 
            ? `XBOND::${chainA}::${chainB}`
            : `XBOND::${chainB}::${chainA}`;
          const bond = this.bonds.get(bondId);
          matrix[chainA][chainB] = bond ? bond.correlation : 0;
        }
      });
    });
    
    return matrix;
  }
  
  /**
   * Find chains with harmonic resonance
   */
  getHarmonicClusters() {
    const harmonicBonds = Array.from(this.bonds.values())
      .filter(b => b.pattern === ResonancePattern.HARMONIC);
    
    // Simple clustering: group chains that are harmonically related
    const clusters = [];
    const assigned = new Set();
    
    harmonicBonds.forEach(bond => {
      if (assigned.has(bond.chainA) && assigned.has(bond.chainB)) {
        // Both already in clusters, merge if different
        return;
      }
      
      let cluster = clusters.find(c => 
        c.has(bond.chainA) || c.has(bond.chainB)
      );
      
      if (!cluster) {
        cluster = new Set();
        clusters.push(cluster);
      }
      
      cluster.add(bond.chainA);
      cluster.add(bond.chainB);
      assigned.add(bond.chainA);
      assigned.add(bond.chainB);
    });
    
    return clusters.map(c => Array.from(c));
  }
  
  /**
   * Calculate local coherence adjustment from cross-chain signals
   */
  calculateCoherenceAdjustment() {
    if (!this.bridge) return 0;
    
    // Get active chains and their coherences
    const activeChains = this.bridge.getActiveChains();
    if (activeChains.length < 2) return 0;
    
    // φ-weighted adjustment based on network coherence
    const adjustment = this.networkCoherence * PHI_COMPLEMENT * 0.1;
    
    // Boost if dominant chain is ICP (native)
    const dominantBoost = this.dominantChain === ChainType.ICP ? PHI_INVERSE : 1.0;
    
    return adjustment * dominantBoost;
  }
  
  /**
   * Get network status
   */
  getStatus() {
    return {
      networkCoherence: this.networkCoherence,
      dominantChain: this.dominantChain,
      bondCount: this.bonds.size,
      bonds: Array.from(this.bonds.values()).map(b => b.getStatus()),
      harmonicClusters: this.getHarmonicClusters(),
      recentEvents: this.eventHistory.slice(-10),
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// RESONANCE MONITOR
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Monitors cross-chain resonance and triggers alerts
 */
class ResonanceMonitor {
  constructor(network) {
    this.network = network;
    this.thresholds = {
      highCorrelation: 0.9,
      lowCorrelation: 0.3,
      coherenceAlert: PHI_COMPLEMENT,
    };
    this.alerts = [];
  }
  
  /**
   * Check for alert conditions
   */
  check() {
    const alerts = [];
    
    // Check network coherence
    if (this.network.networkCoherence > this.thresholds.highCorrelation) {
      alerts.push({
        type: 'HIGH_NETWORK_COHERENCE',
        message: `Network coherence (${this.network.networkCoherence.toFixed(3)}) exceeds threshold`,
        severity: 'INFO',
      });
    }
    
    if (this.network.networkCoherence < this.thresholds.coherenceAlert) {
      alerts.push({
        type: 'LOW_NETWORK_COHERENCE',
        message: `Network coherence (${this.network.networkCoherence.toFixed(3)}) below alert threshold`,
        severity: 'WARNING',
      });
    }
    
    // Check for unusual patterns
    const antiHarmonic = Array.from(this.network.bonds.values())
      .filter(b => b.pattern === ResonancePattern.ANTI_HARMONIC);
    
    if (antiHarmonic.length > 0) {
      alerts.push({
        type: 'ANTI_HARMONIC_DETECTED',
        message: `${antiHarmonic.length} anti-harmonic bond(s) detected`,
        severity: 'INFO',
        bonds: antiHarmonic.map(b => b.bondId),
      });
    }
    
    this.alerts = alerts;
    return alerts;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  ResonancePattern,
  ResonanceEvent,
  CrossChainBond,
  CrossChainResonanceNetwork,
  ResonanceMonitor,
};

export default {
  PROTOCOL_ID: 'PROTO-XRESONANCE-001',
  PROTOCOL_NAME: 'Cross-Chain Resonance Protocol',
  DOCTRINE: 'Omnia resonant. Cohaerentia propagatur. Organismus sentit.',
  DOCTRINE_EN: 'All things resonate. Coherence propagates. The organism senses.',
  
  ResonancePattern,
  ResonanceEvent,
  CrossChainBond,
  CrossChainResonanceNetwork,
  ResonanceMonitor,
};
