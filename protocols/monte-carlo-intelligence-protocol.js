/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  PROTO-XXX: MONTE CARLO INTELLIGENCE PROTOCOL                                        ║
 * ║  "Alea Intelligens — Intelligent Randomness"                                          ║
 * ║                                                                                        ║
 * ║  "Ex caos, ordo nascitur. Ex multis, veritas emergit."                               ║
 * ║  (From chaos, order is born. From many, truth emerges.)                               ║
 * ║                                                                                        ║
 * ║  MONTE CARLO CAPABILITIES:                                                            ║
 * ║    • Token evolution simulation with φ-weighted distributions                         ║
 * ║    • Governance outcome prediction via ensemble sampling                              ║
 * ║    • Coherence trajectory forecasting                                                 ║
 * ║    • Risk assessment through scenario analysis                                        ║
 * ║    • Parameter sensitivity analysis                                                   ║
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
const PHI_SQUARED = 2.618033988749895;
const TWO_PI = 2 * Math.PI;

// ════════════════════════════════════════════════════════════════════════════════
// RANDOM NUMBER GENERATION
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Seeded pseudo-random number generator (Xoshiro128++)
 * Provides reproducible Monte Carlo simulations
 */
class SeededRNG {
  constructor(seed = Date.now()) {
    // Initialize state from seed
    this.state = new Uint32Array(4);
    this.state[0] = seed >>> 0;
    this.state[1] = (seed * PHI) >>> 0;
    this.state[2] = (seed * PHI_SQUARED) >>> 0;
    this.state[3] = (seed * PHI * PHI_SQUARED) >>> 0;
    
    // Warm up
    for (let i = 0; i < 20; i++) this.nextU32();
  }
  
  nextU32() {
    const result = (this.state[0] + this.state[3]) >>> 0;
    const t = (this.state[1] << 9) >>> 0;
    
    this.state[2] ^= this.state[0];
    this.state[3] ^= this.state[1];
    this.state[1] ^= this.state[2];
    this.state[0] ^= this.state[3];
    this.state[2] ^= t;
    this.state[3] = (this.state[3] << 11) | (this.state[3] >>> 21);
    
    return result;
  }
  
  /**
   * Random float in [0, 1)
   */
  random() {
    return this.nextU32() / 0x100000000;
  }
  
  /**
   * Random float in [min, max)
   */
  uniform(min, max) {
    return min + this.random() * (max - min);
  }
  
  /**
   * Random integer in [min, max]
   */
  randInt(min, max) {
    return Math.floor(this.uniform(min, max + 1));
  }
  
  /**
   * Random boolean with probability p
   */
  bernoulli(p = 0.5) {
    return this.random() < p;
  }
  
  /**
   * Box-Muller normal distribution
   */
  normal(mean = 0, stdDev = 1) {
    const u1 = Math.max(this.random(), 1e-10);
    const u2 = this.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(TWO_PI * u2);
    return mean + stdDev * z;
  }
  
  /**
   * Exponential distribution
   */
  exponential(lambda = 1) {
    return -Math.log(1 - this.random()) / lambda;
  }
  
  /**
   * φ-weighted random (biased toward golden ratio)
   */
  phiWeighted() {
    const x = this.random();
    // Transform to favor values near φ⁻¹
    return 1 / (1 + Math.pow(PHI, 3 * (PHI_INVERSE - x)));
  }
  
  /**
   * Sample from array with optional weights
   */
  choice(array, weights = null) {
    if (!array.length) return undefined;
    
    if (!weights) {
      return array[this.randInt(0, array.length - 1)];
    }
    
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let r = this.random() * totalWeight;
    
    for (let i = 0; i < array.length; i++) {
      r -= weights[i];
      if (r <= 0) return array[i];
    }
    
    return array[array.length - 1];
  }
  
  /**
   * Shuffle array in place (Fisher-Yates)
   */
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.randInt(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// MONTE CARLO TOKEN SIMULATION
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Simulated token for Monte Carlo experiments
 */
class SimulatedToken {
  constructor(id, rng) {
    this.id = id;
    this.rng = rng;
    this.coherence = PHI_INVERSE;
    this.energy = 1.0;
    this.phase = 'Sovereign';
    this.generation = 0;
    this.evolutionCount = 0;
    this.maturity = 0;
  }
  
  evolve() {
    if (this.phase === 'Dormant' || this.phase === 'Ascended') return false;
    
    const EVOLVE_COST = 0.05;
    if (this.energy < EVOLVE_COST) {
      this.coherence *= (1 - PHI_COMPLEMENT * 0.1);
      if (this.coherence < PHI_COMPLEMENT) {
        this.phase = 'Dormant';
      }
      return false;
    }
    
    this.energy -= EVOLVE_COST;
    
    // φ-weighted evolution toward equilibrium with noise
    const target = PHI_INVERSE;
    const drift = (target - this.coherence) * PHI_COMPLEMENT;
    const noise = this.rng.normal(0, 0.05);
    
    this.coherence = Math.max(0, Math.min(1, this.coherence + drift + noise));
    this.energy = Math.min(1, this.energy + PHI_COMPLEMENT * 0.02);
    this.maturity = Math.min(1, this.maturity + PHI_INVERSE * 0.01);
    this.evolutionCount++;
    
    // Check for ascension
    if (this.coherence > PHI_INVERSE + 0.3 && this.maturity > PHI_INVERSE) {
      this.phase = 'Ascended';
    }
    
    return true;
  }
  
  clone() {
    const token = new SimulatedToken(this.id + '-clone', this.rng);
    token.coherence = this.coherence;
    token.energy = this.energy;
    token.phase = this.phase;
    token.generation = this.generation;
    token.evolutionCount = this.evolutionCount;
    token.maturity = this.maturity;
    return token;
  }
}

/**
 * Monte Carlo Token Universe Simulator
 */
class MonteCarloTokenSimulator {
  constructor(config = {}) {
    this.config = {
      nSimulations: config.nSimulations || 1000,
      nSteps: config.nSteps || 100,
      nTokens: config.nTokens || 10,
      mergeProbability: config.mergeProbability || 0.1 * PHI_INVERSE,
      splitProbability: config.splitProbability || 0.05 * PHI_INVERSE,
      evolutionNoise: config.evolutionNoise || 0.1,
      seed: config.seed || 42,
    };
    
    this.rng = new SeededRNG(this.config.seed);
    this.results = [];
  }
  
  /**
   * Run a single simulation
   */
  runSingle(runId) {
    const tokens = new Map();
    const history = {
      coherence: [],
      energy: [],
      tokenCount: [],
    };
    
    let totalMerges = 0;
    let totalSplits = 0;
    
    // Initialize tokens
    for (let i = 0; i < this.config.nTokens; i++) {
      const token = new SimulatedToken(`TOKEN-${runId}-${i}`, this.rng);
      tokens.set(token.id, token);
    }
    
    // Simulate
    for (let step = 0; step < this.config.nSteps; step++) {
      // Evolve all tokens
      for (const token of tokens.values()) {
        token.evolve();
      }
      
      // Random merges
      if (this.rng.bernoulli(this.config.mergeProbability)) {
        const active = Array.from(tokens.values())
          .filter(t => t.phase === 'Sovereign' && t.energy > 0.2);
        
        if (active.length >= 2) {
          this.rng.shuffle(active);
          const [a, b] = active.slice(0, 2);
          
          // Create merged token
          const merged = new SimulatedToken(`MERGED-${runId}-${step}`, this.rng);
          merged.coherence = Math.sqrt(a.coherence * b.coherence) * PHI / 2;
          merged.energy = (a.energy + b.energy) * PHI_INVERSE - 0.2;
          merged.generation = Math.max(a.generation, b.generation) + 1;
          
          tokens.delete(a.id);
          tokens.delete(b.id);
          tokens.set(merged.id, merged);
          totalMerges++;
        }
      }
      
      // Random splits
      if (this.rng.bernoulli(this.config.splitProbability)) {
        const splittable = Array.from(tokens.values())
          .filter(t => t.phase === 'Sovereign' && t.energy > 0.3);
        
        if (splittable.length > 0) {
          const parent = this.rng.choice(splittable);
          const nChildren = this.rng.randInt(2, 3);
          const energyPerChild = (parent.energy - 0.15 * nChildren) / nChildren;
          
          if (energyPerChild > 0) {
            for (let c = 0; c < nChildren; c++) {
              const child = new SimulatedToken(`${parent.id}-CHILD-${c}`, this.rng);
              child.coherence = parent.coherence * PHI_INVERSE + this.rng.uniform(-0.05, 0.05);
              child.coherence = Math.max(0, Math.min(1, child.coherence));
              child.energy = energyPerChild;
              child.generation = parent.generation + 1;
              tokens.set(child.id, child);
            }
            
            parent.phase = 'Dormant';
            parent.energy = 0;
            totalSplits++;
          }
        }
      }
      
      // Record history
      const activeTokens = Array.from(tokens.values())
        .filter(t => t.phase !== 'Dormant');
      
      if (activeTokens.length > 0) {
        const meanCoherence = activeTokens.reduce((s, t) => s + t.coherence, 0) / activeTokens.length;
        const meanEnergy = activeTokens.reduce((s, t) => s + t.energy, 0) / activeTokens.length;
        history.coherence.push(meanCoherence);
        history.energy.push(meanEnergy);
      } else {
        history.coherence.push(0);
        history.energy.push(0);
      }
      history.tokenCount.push(tokens.size);
    }
    
    // Final statistics
    const allTokens = Array.from(tokens.values());
    const n = allTokens.length || 1;
    
    return {
      runId,
      finalTokenCount: tokens.size,
      finalMeanCoherence: allTokens.reduce((s, t) => s + t.coherence, 0) / n,
      finalMeanEnergy: allTokens.reduce((s, t) => s + t.energy, 0) / n,
      ascendedCount: allTokens.filter(t => t.phase === 'Ascended').length,
      dormantCount: allTokens.filter(t => t.phase === 'Dormant').length,
      totalMerges,
      totalSplits,
      maxGeneration: Math.max(...allTokens.map(t => t.generation), 0),
      history,
    };
  }
  
  /**
   * Run full Monte Carlo simulation
   */
  run() {
    this.results = [];
    
    for (let i = 0; i < this.config.nSimulations; i++) {
      const result = this.runSingle(i);
      this.results.push(result);
    }
    
    return this.getAggregateResults();
  }
  
  /**
   * Get aggregate statistics
   */
  getAggregateResults() {
    const n = this.results.length;
    if (n === 0) return null;
    
    const coherences = this.results.map(r => r.finalMeanCoherence);
    const energies = this.results.map(r => r.finalMeanEnergy);
    
    const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const std = arr => {
      const m = mean(arr);
      const variance = arr.reduce((s, x) => s + (x - m) ** 2, 0) / arr.length;
      return Math.sqrt(variance);
    };
    
    const totalTokens = mean(this.results.map(r => r.finalTokenCount));
    const dormantTokens = mean(this.results.map(r => r.dormantCount));
    
    return {
      config: this.config,
      nSimulations: n,
      meanFinalCoherence: mean(coherences),
      stdFinalCoherence: std(coherences),
      meanFinalEnergy: mean(energies),
      stdFinalEnergy: std(energies),
      meanAscensionRate: mean(this.results.map(r => r.ascendedCount)) / this.config.nTokens,
      meanDormancyRate: dormantTokens / totalTokens,
      meanSurvivalRate: (totalTokens - dormantTokens) / totalTokens,
      meanMerges: mean(this.results.map(r => r.totalMerges)),
      meanSplits: mean(this.results.map(r => r.totalSplits)),
      coherenceDistribution: this.buildDistribution(coherences, 10),
      energyDistribution: this.buildDistribution(energies, 10),
    };
  }
  
  /**
   * Build histogram distribution
   */
  buildDistribution(values, bins) {
    const dist = new Array(bins).fill(0);
    for (const v of values) {
      const bin = Math.min(Math.floor(v * bins), bins - 1);
      dist[bin]++;
    }
    return dist.map(c => c / values.length);
  }
  
  /**
   * Parameter sensitivity sweep
   */
  parameterSweep(paramName, values, simsPerValue = 100) {
    const originalConfig = { ...this.config };
    const sweepResults = [];
    
    for (const value of values) {
      this.config[paramName] = value;
      this.config.nSimulations = simsPerValue;
      
      const results = this.run();
      sweepResults.push({
        paramValue: value,
        meanCoherence: results.meanFinalCoherence,
        stdCoherence: results.stdFinalCoherence,
        survivalRate: results.meanSurvivalRate,
        ascensionRate: results.meanAscensionRate,
      });
    }
    
    this.config = originalConfig;
    return sweepResults;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// GOVERNANCE MONTE CARLO
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Monte Carlo Governance Simulator
 * Predicts governance outcomes through ensemble sampling
 */
class MonteCarloGovernanceSimulator {
  constructor(config = {}) {
    this.config = {
      nSimulations: config.nSimulations || 10000,
      nVoters: config.nVoters || 100,
      quorum: config.quorum || 0.5,
      approvalThreshold: config.approvalThreshold || 0.66,
      voterCoherenceWeight: config.voterCoherenceWeight || PHI_INVERSE,
      seed: config.seed || 42,
    };
    
    this.rng = new SeededRNG(this.config.seed);
  }
  
  /**
   * Simulate a single governance vote
   */
  simulateVote(proposalStrength, voterBias = 0) {
    let yesVotes = 0;
    let totalVotes = 0;
    let totalCoherence = 0;
    
    for (let i = 0; i < this.config.nVoters; i++) {
      // Voter participation (higher coherence = more likely to vote)
      const voterCoherence = this.rng.phiWeighted();
      totalCoherence += voterCoherence;
      
      const participationProb = voterCoherence * PHI_INVERSE + PHI_COMPLEMENT;
      if (!this.rng.bernoulli(participationProb)) continue;
      
      totalVotes++;
      
      // Vote decision based on proposal strength, coherence, and bias
      const voteProb = proposalStrength * (1 + voterCoherence * this.config.voterCoherenceWeight) / 2 + voterBias;
      if (this.rng.bernoulli(Math.max(0, Math.min(1, voteProb)))) {
        yesVotes++;
      }
    }
    
    const participation = totalVotes / this.config.nVoters;
    const approval = totalVotes > 0 ? yesVotes / totalVotes : 0;
    const quorumMet = participation >= this.config.quorum;
    const passed = quorumMet && approval >= this.config.approvalThreshold;
    
    return {
      yesVotes,
      totalVotes,
      participation,
      approval,
      quorumMet,
      passed,
      averageCoherence: totalCoherence / this.config.nVoters,
    };
  }
  
  /**
   * Run Monte Carlo simulation for a proposal
   */
  simulateProposal(proposalStrength, voterBias = 0) {
    const results = [];
    
    for (let i = 0; i < this.config.nSimulations; i++) {
      results.push(this.simulateVote(proposalStrength, voterBias));
    }
    
    const passCount = results.filter(r => r.passed).length;
    const approvals = results.map(r => r.approval);
    const participations = results.map(r => r.participation);
    
    const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const std = arr => {
      const m = mean(arr);
      return Math.sqrt(arr.reduce((s, x) => s + (x - m) ** 2, 0) / arr.length);
    };
    
    return {
      proposalStrength,
      voterBias,
      nSimulations: this.config.nSimulations,
      passProbability: passCount / this.config.nSimulations,
      meanApproval: mean(approvals),
      stdApproval: std(approvals),
      meanParticipation: mean(participations),
      stdParticipation: std(participations),
      confidenceInterval95: this.confidenceInterval(approvals, 0.95),
    };
  }
  
  /**
   * Calculate confidence interval
   */
  confidenceInterval(values, confidence) {
    const sorted = [...values].sort((a, b) => a - b);
    const alpha = (1 - confidence) / 2;
    const lowerIdx = Math.floor(alpha * sorted.length);
    const upperIdx = Math.ceil((1 - alpha) * sorted.length) - 1;
    return [sorted[lowerIdx], sorted[upperIdx]];
  }
  
  /**
   * Predict outcome with uncertainty
   */
  predictOutcome(proposalStrength) {
    const result = this.simulateProposal(proposalStrength);
    
    let prediction;
    if (result.passProbability > 0.9) {
      prediction = 'HIGHLY_LIKELY_PASS';
    } else if (result.passProbability > 0.7) {
      prediction = 'LIKELY_PASS';
    } else if (result.passProbability > 0.5) {
      prediction = 'UNCERTAIN_LEAN_PASS';
    } else if (result.passProbability > 0.3) {
      prediction = 'UNCERTAIN_LEAN_FAIL';
    } else if (result.passProbability > 0.1) {
      prediction = 'LIKELY_FAIL';
    } else {
      prediction = 'HIGHLY_LIKELY_FAIL';
    }
    
    return {
      ...result,
      prediction,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// COHERENCE TRAJECTORY FORECASTING
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Monte Carlo Coherence Forecaster
 * Predicts future coherence trajectories with uncertainty bands
 */
class CoherenceForecaster {
  constructor(config = {}) {
    this.config = {
      nSimulations: config.nSimulations || 1000,
      horizon: config.horizon || 50,
      volatility: config.volatility || 0.05,
      meanReversion: config.meanReversion || PHI_COMPLEMENT,
      equilibrium: config.equilibrium || PHI_INVERSE,
      seed: config.seed || 42,
    };
    
    this.rng = new SeededRNG(this.config.seed);
  }
  
  /**
   * Forecast coherence trajectory using Ornstein-Uhlenbeck process
   * dC = θ(μ - C)dt + σdW
   */
  forecast(currentCoherence) {
    const paths = [];
    
    for (let sim = 0; sim < this.config.nSimulations; sim++) {
      const path = [currentCoherence];
      let c = currentCoherence;
      
      for (let t = 0; t < this.config.horizon; t++) {
        const drift = this.config.meanReversion * (this.config.equilibrium - c);
        const diffusion = this.config.volatility * this.rng.normal(0, 1);
        
        c = Math.max(0, Math.min(1, c + drift + diffusion));
        path.push(c);
      }
      
      paths.push(path);
    }
    
    // Calculate statistics at each time step
    const forecast = [];
    for (let t = 0; t <= this.config.horizon; t++) {
      const values = paths.map(p => p[t]);
      values.sort((a, b) => a - b);
      
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const p5 = values[Math.floor(0.05 * values.length)];
      const p25 = values[Math.floor(0.25 * values.length)];
      const p50 = values[Math.floor(0.50 * values.length)];
      const p75 = values[Math.floor(0.75 * values.length)];
      const p95 = values[Math.floor(0.95 * values.length)];
      
      forecast.push({
        t,
        mean,
        median: p50,
        p5, p25, p75, p95,
        uncertainty: p95 - p5,
      });
    }
    
    return {
      currentCoherence,
      horizon: this.config.horizon,
      nSimulations: this.config.nSimulations,
      forecast,
      finalDistribution: paths.map(p => p[p.length - 1]),
      collapseRisk: paths.filter(p => p.some(c => c < PHI_COMPLEMENT)).length / paths.length,
      ascensionProbability: paths.filter(p => p[p.length - 1] > PHI_INVERSE + 0.3).length / paths.length,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  PHI,
  PHI_INVERSE,
  PHI_COMPLEMENT,
  SeededRNG,
  SimulatedToken,
  MonteCarloTokenSimulator,
  MonteCarloGovernanceSimulator,
  CoherenceForecaster,
};

export default {
  PROTOCOL_ID: 'PROTO-MC-001',
  PROTOCOL_NAME: 'Monte Carlo Intelligence Protocol',
  DOCTRINE: 'Ex caos, ordo nascitur. Ex multis, veritas emergit.',
  DOCTRINE_EN: 'From chaos, order is born. From many, truth emerges.',
  
  SeededRNG,
  SimulatedToken,
  MonteCarloTokenSimulator,
  MonteCarloGovernanceSimulator,
  CoherenceForecaster,
};
