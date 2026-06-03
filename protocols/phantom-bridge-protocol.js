/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  PHANTOM BRIDGE PROTOCOL — READ-ONLY MULTI-CHAIN AWARENESS                           ║
 * ║  "Membra Phantasma — Phantom Limbs of the Organism"                                   ║
 * ║                                                                                        ║
 * ║  "Sentit sine tactu. Videt sine oculis. Cognoscit sine vinculo."                     ║
 * ║  (It senses without touch. It sees without eyes. It knows without binding.)           ║
 * ║                                                                                        ║
 * ║  This protocol enables the sovereign organism to sense signals from other             ║
 * ║  blockchains without direct coupling or state modification.                           ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

// ════════════════════════════════════════════════════════════════════════════════
// PHI CONSTANTS
// ════════════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.6180339887498949;
const PHI_COMPLEMENT = 0.3819660112501051;

// ════════════════════════════════════════════════════════════════════════════════
// CHAIN DEFINITIONS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Supported blockchain types for phantom sensing
 */
const ChainType = {
  ICP: 'ICP',           // Internet Computer Protocol (native)
  ETHEREUM: 'ETHEREUM', // Ethereum mainnet
  SOLANA: 'SOLANA',     // Solana
  BITCOIN: 'BITCOIN',   // Bitcoin (read-only)
  POLYGON: 'POLYGON',   // Polygon
  ARBITRUM: 'ARBITRUM', // Arbitrum
  BASE: 'BASE',         // Base
  COSMOS: 'COSMOS',     // Cosmos ecosystem
};

/**
 * φ-weighted priorities for each chain
 * Higher priority = more influence on local coherence
 */
const CHAIN_PRIORITIES = {
  [ChainType.ICP]: PHI,           // Native = highest
  [ChainType.ETHEREUM]: PHI_INVERSE,
  [ChainType.BITCOIN]: PHI_INVERSE,
  [ChainType.SOLANA]: PHI_COMPLEMENT,
  [ChainType.POLYGON]: PHI_COMPLEMENT,
  [ChainType.ARBITRUM]: PHI_COMPLEMENT,
  [ChainType.BASE]: PHI_COMPLEMENT,
  [ChainType.COSMOS]: PHI_COMPLEMENT,
};

/**
 * Signal types that can be sensed from chains
 */
const SignalType = {
  PRICE: 'PRICE',
  VOLUME: 'VOLUME',
  GAS_FEE: 'GAS_FEE',
  ACTIVITY: 'ACTIVITY',
  GOVERNANCE: 'GOVERNANCE',
  LIQUIDITY: 'LIQUIDITY',
  BRIDGE_FLOW: 'BRIDGE_FLOW',
  CONTRACT_EVENT: 'CONTRACT_EVENT',
};

/**
 * Signal strength levels
 */
const SignalStrength = {
  STRONG: 1.0,
  MEDIUM: PHI_INVERSE,
  WEAK: PHI_COMPLEMENT,
  NONE: 0.0,
};

// ════════════════════════════════════════════════════════════════════════════════
// PHANTOM LIMB — SINGLE CHAIN CONNECTION
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Phantom Limb — Read-only connection to a single blockchain
 */
class PhantomLimb {
  constructor(chainType) {
    this.chain = chainType;
    this.isActive = false;
    this.lastSignal = null;
    this.signalCount = 0;
    this.coherence = 0;
    this.latencyMs = 0;
    this.signalBuffer = [];
    this.maxBufferSize = 100;
    this.priority = CHAIN_PRIORITIES[chainType] || PHI_COMPLEMENT;
  }
  
  /**
   * Receive a signal from this chain
   * @param {Object} signal - The signal data
   */
  receiveSignal(signal) {
    this.isActive = true;
    this.lastSignal = Date.now();
    this.signalCount++;
    
    // Update coherence based on signal strength
    const strength = signal.strength || SignalStrength.MEDIUM;
    this.coherence = this.coherence * (1 - PHI_COMPLEMENT) + strength * PHI_COMPLEMENT;
    
    // Buffer signal
    if (this.signalBuffer.length >= this.maxBufferSize) {
      this.signalBuffer.shift();
    }
    this.signalBuffer.push({
      ...signal,
      receivedAt: Date.now(),
    });
    
    return this;
  }
  
  /**
   * Get recent signals of a specific type
   */
  getSignals(signalType, limit = 10) {
    return this.signalBuffer
      .filter(s => s.type === signalType)
      .slice(-limit);
  }
  
  /**
   * Get weighted average of recent signal values
   */
  getWeightedAverage(signalType) {
    const signals = this.getSignals(signalType);
    if (signals.length === 0) return null;
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    signals.forEach((signal, i) => {
      const recency = Math.pow(PHI_INVERSE, signals.length - 1 - i);
      const weight = recency * (signal.strength || SignalStrength.MEDIUM);
      weightedSum += signal.value * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? weightedSum / totalWeight : null;
  }
  
  /**
   * Get limb health status
   */
  getHealth() {
    const now = Date.now();
    const staleness = this.lastSignal ? (now - this.lastSignal) / 1000 : Infinity;
    
    return {
      chain: this.chain,
      isActive: this.isActive,
      coherence: this.coherence,
      signalCount: this.signalCount,
      staleness,
      priority: this.priority,
      bufferSize: this.signalBuffer.length,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// PHANTOM BRIDGE — MULTI-CHAIN AWARENESS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Phantom Bridge — Multi-chain awareness system
 */
class PhantomBridge {
  constructor(config = {}) {
    this.id = config.id || `PHANTOM-BRIDGE-${Date.now()}`;
    this.limbs = new Map();
    this.globalCoherence = 0;
    this.totalSignals = 0;
    this.crossChainResonance = 0;
    this.createdAt = Date.now();
    this.lastUpdate = Date.now();
    
    // Initialize limbs for all chain types
    Object.values(ChainType).forEach(chain => {
      this.limbs.set(chain, new PhantomLimb(chain));
    });
  }
  
  /**
   * Receive a signal from any chain
   */
  receiveSignal(chainType, signal) {
    const limb = this.limbs.get(chainType);
    if (!limb) return this;
    
    limb.receiveSignal(signal);
    this.totalSignals++;
    this.lastUpdate = Date.now();
    this.updateGlobalCoherence();
    
    return this;
  }
  
  /**
   * Update global coherence from all limbs
   */
  updateGlobalCoherence() {
    const activeLimbs = Array.from(this.limbs.values()).filter(l => l.isActive);
    
    if (activeLimbs.length === 0) {
      this.globalCoherence = 0;
      this.crossChainResonance = 0;
      return;
    }
    
    // φ-weighted coherence based on chain priority
    let weightedSum = 0;
    let totalWeight = 0;
    
    activeLimbs.forEach(limb => {
      const weight = limb.priority;
      weightedSum += limb.coherence * weight;
      totalWeight += weight;
    });
    
    this.globalCoherence = totalWeight > 0 ? weightedSum / totalWeight : 0;
    this.crossChainResonance = this.calculateResonance(activeLimbs);
  }
  
  /**
   * Calculate cross-chain resonance (correlation between chains)
   */
  calculateResonance(limbs) {
    if (limbs.length < 2) return 0;
    
    // Get price signals from each chain
    const priceSignals = limbs
      .map(l => l.getWeightedAverage(SignalType.PRICE))
      .filter(p => p !== null);
    
    if (priceSignals.length < 2) return 0;
    
    // Calculate coefficient of variation
    const mean = priceSignals.reduce((a, b) => a + b, 0) / priceSignals.length;
    if (mean === 0) return 0;
    
    const variance = priceSignals.reduce((s, p) => s + Math.pow(p - mean, 2), 0) / priceSignals.length;
    const cv = Math.sqrt(variance) / mean;
    
    // Convert to resonance (low variation = high resonance)
    return Math.min(1, 1 / (1 + cv * PHI));
  }
  
  /**
   * Sense all chains for a specific signal type
   */
  sense(signalType) {
    const result = {};
    this.limbs.forEach((limb, chain) => {
      result[chain] = limb.getWeightedAverage(signalType);
    });
    return result;
  }
  
  /**
   * Get consensus value across chains (φ-weighted)
   */
  getConsensusValue(signalType) {
    const values = [];
    const weights = [];
    
    this.limbs.forEach(limb => {
      if (!limb.isActive) return;
      
      const value = limb.getWeightedAverage(signalType);
      if (value !== null) {
        values.push(value);
        weights.push(limb.priority * limb.coherence);
      }
    });
    
    if (values.length === 0) return null;
    
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const weightedSum = values.reduce((sum, v, i) => sum + v * weights[i], 0);
    
    return {
      value: weightedSum / totalWeight,
      confidence: totalWeight / (values.length * PHI),
      sources: values.length,
    };
  }
  
  /**
   * Get all active chains
   */
  getActiveChains() {
    return Array.from(this.limbs.entries())
      .filter(([_, limb]) => limb.isActive)
      .map(([chain, _]) => chain);
  }
  
  /**
   * Get bridge status
   */
  getStatus() {
    const limbStatuses = {};
    this.limbs.forEach((limb, chain) => {
      limbStatuses[chain] = limb.getHealth();
    });
    
    return {
      id: this.id,
      globalCoherence: this.globalCoherence,
      crossChainResonance: this.crossChainResonance,
      totalSignals: this.totalSignals,
      activeChains: this.getActiveChains(),
      limbs: limbStatuses,
      lastUpdate: this.lastUpdate,
      uptime: Date.now() - this.createdAt,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// SIGNAL AGGREGATOR
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Aggregates and processes signals across multiple phantom bridges
 */
class SignalAggregator {
  constructor() {
    this.bridges = new Map();
    this.aggregatedSignals = new Map();
  }
  
  /**
   * Add a phantom bridge
   */
  addBridge(bridge) {
    this.bridges.set(bridge.id, bridge);
    return this;
  }
  
  /**
   * Aggregate signals across all bridges
   */
  aggregate(signalType) {
    const allValues = [];
    const allWeights = [];
    
    this.bridges.forEach(bridge => {
      const consensus = bridge.getConsensusValue(signalType);
      if (consensus) {
        allValues.push(consensus.value);
        allWeights.push(consensus.confidence * bridge.globalCoherence);
      }
    });
    
    if (allValues.length === 0) return null;
    
    const totalWeight = allWeights.reduce((a, b) => a + b, 0);
    const weightedSum = allValues.reduce((sum, v, i) => sum + v * allWeights[i], 0);
    
    return {
      signalType,
      aggregatedValue: weightedSum / totalWeight,
      confidence: totalWeight / (allValues.length * PHI),
      bridgeCount: allValues.length,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Get multi-chain health overview
   */
  getOverview() {
    const bridgeStatuses = {};
    this.bridges.forEach((bridge, id) => {
      bridgeStatuses[id] = bridge.getStatus();
    });
    
    return {
      bridgeCount: this.bridges.size,
      bridges: bridgeStatuses,
      aggregatedCoherence: this.calculateAggregatedCoherence(),
    };
  }
  
  calculateAggregatedCoherence() {
    const coherences = Array.from(this.bridges.values())
      .map(b => b.globalCoherence);
    
    if (coherences.length === 0) return 0;
    return coherences.reduce((a, b) => a + b, 0) / coherences.length;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  PHI,
  PHI_INVERSE,
  PHI_COMPLEMENT,
  ChainType,
  SignalType,
  SignalStrength,
  CHAIN_PRIORITIES,
  PhantomLimb,
  PhantomBridge,
  SignalAggregator,
};

export default {
  PROTOCOL_ID: 'PROTO-PHANTOM-001',
  PROTOCOL_NAME: 'Phantom Bridge Protocol',
  DOCTRINE: 'Sentit sine tactu. Videt sine oculis. Cognoscit sine vinculo.',
  DOCTRINE_EN: 'It senses without touch. It sees without eyes. It knows without binding.',
  
  ChainType,
  SignalType,
  SignalStrength,
  PhantomLimb,
  PhantomBridge,
  SignalAggregator,
};
