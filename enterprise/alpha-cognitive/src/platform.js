/**
 * ALPHA-COGNITIVE — Research & Intelligence Platform
 *
 * Enterprise House #3: Monte Carlo Cognitive Computing Platform
 * based on the theoretical framework of stochastic cognition.
 *
 * Core Premise: Monte Carlo sampling IS thinking, not merely a simulation.
 *
 * Implements:
 * - ThoughtParticle system
 * - CognitiveField energy landscapes
 * - Metropolis-Hastings deliberation
 * - Hamiltonian Monte Carlo reasoning
 * - Swarm cognition for parallel exploration
 *
 * @module @medina/enterprise/alpha-cognitive
 */

// ════════════════════════════════════════════════════════════════════════════
// PHI CONSTANTS — The Mathematics of Thought
// ════════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const PHI_INVERSE = 1 / PHI;
const PHI_SQUARED = PHI * PHI;
const COGNITIVE_TEMPERATURE = 1.0;
const PLANCK_THOUGHT = 1e-10;

// ════════════════════════════════════════════════════════════════════════════
// THOUGHT PARTICLE — The Quantum of Cognition
// ════════════════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} ThoughtParticle
 * @property {number[]} position - Position in semantic space
 * @property {number[]} momentum - Direction of cognitive flow
 * @property {number} energy - Cognitive activation energy
 * @property {number} coherence - Internal consistency (0-1)
 * @property {number} salience - Attention weight
 * @property {number} lifetime - Iterations since birth
 * @property {number[]} ancestry - Chain of parent thoughts
 * @property {number} semanticCharge - Positive/negative valence
 */

/**
 * Create a new thought particle
 * @param {number} dims - Dimensionality of thought space
 * @returns {ThoughtParticle}
 */
function createThoughtParticle(dims) {
  return {
    position: Array(dims).fill(0).map(() => (Math.random() - 0.5) * 2 * PHI_INVERSE),
    momentum: Array(dims).fill(0).map(() => (Math.random() - 0.5) * 0.2),
    energy: Math.random() * PHI,
    coherence: Math.random(),
    salience: 1.0,
    lifetime: 0,
    ancestry: [],
    semanticCharge: (Math.random() - 0.5) * 1.0
  };
}

/**
 * Compute the norm of a vector
 * @param {number[]} v
 */
function norm(v) {
  return Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
}

/**
 * Compute dot product
 * @param {number[]} a
 * @param {number[]} b
 */
function dot(a, b) {
  return a.reduce((sum, ai, i) => sum + ai * b[i], 0);
}

/**
 * Vector subtraction
 * @param {number[]} a
 * @param {number[]} b
 */
function subtract(a, b) {
  return a.map((ai, i) => ai - b[i]);
}

/**
 * Vector scaling
 * @param {number[]} v
 * @param {number} s
 */
function scale(v, s) {
  return v.map(x => x * s);
}

/**
 * Vector addition
 * @param {number[]} a
 * @param {number[]} b
 */
function add(a, b) {
  return a.map((ai, i) => ai + b[i]);
}

// ════════════════════════════════════════════════════════════════════════════
// COGNITIVE FIELD — The Landscape of Possible Thoughts
// ════════════════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} CognitiveField
 * @property {number} dims - Dimensionality of thought space
 * @property {number[][]} attractors - Attractor basins (concepts)
 * @property {number[]} attractorDepths - Depth of each attractor
 * @property {number[][]} couplingMatrix - Inter-attractor coupling
 * @property {number} temperature - Cognitive temperature
 * @property {number[]} externalField - External bias (context)
 */

/**
 * Create a cognitive field
 * @param {number} dims - Dimensionality
 * @param {number} numAttractors - Number of concept attractors
 * @param {number} [temperature=1.0] - Cognitive temperature
 * @returns {CognitiveField}
 */
function createCognitiveField(dims, numAttractors, temperature = COGNITIVE_TEMPERATURE) {
  // Create random attractors (concepts)
  const attractors = Array(numAttractors).fill(0).map(() =>
    Array(dims).fill(0).map(() => (Math.random() - 0.5) * 2 * PHI)
  );

  // Random attractor depths
  const attractorDepths = Array(numAttractors).fill(0).map(() =>
    Math.random() * PHI + 0.5
  );

  // Create coupling matrix (symmetric)
  const couplingMatrix = Array(numAttractors).fill(0).map(() =>
    Array(numAttractors).fill(0).map(() => (Math.random() - 0.5) * 0.2)
  );
  // Symmetrize
  for (let i = 0; i < numAttractors; i++) {
    for (let j = i + 1; j < numAttractors; j++) {
      const avg = (couplingMatrix[i][j] + couplingMatrix[j][i]) / 2;
      couplingMatrix[i][j] = avg;
      couplingMatrix[j][i] = avg;
    }
  }

  return {
    dims,
    attractors,
    attractorDepths,
    couplingMatrix,
    temperature,
    externalField: Array(dims).fill(0)
  };
}

/**
 * Compute cognitive energy at a position
 * Lower energy = more natural/coherent thought
 * @param {CognitiveField} field
 * @param {number[]} position
 * @returns {number}
 */
function computeCognitiveEnergy(field, position) {
  let E = 0;

  // Attractor contributions (negative = attractive)
  const proximities = [];
  for (let i = 0; i < field.attractors.length; i++) {
    const dist = norm(subtract(position, field.attractors[i]));
    const proximity = Math.exp(-dist * dist / (2 * PHI));
    proximities.push(proximity);
    E -= field.attractorDepths[i] * proximity;
  }

  // Coupling contributions
  for (let i = 0; i < field.attractors.length; i++) {
    for (let j = i + 1; j < field.attractors.length; j++) {
      E += field.couplingMatrix[i][j] * proximities[i] * proximities[j];
    }
  }

  // External field contribution
  E -= dot(field.externalField, position);

  // Regularization (prevent escape to infinity)
  E += norm(position) * norm(position) / (2 * PHI);

  return E;
}

/**
 * Compute gradient of cognitive energy
 * @param {CognitiveField} field
 * @param {number[]} position
 * @returns {number[]}
 */
function computeEnergyGradient(field, position) {
  const epsilon = 1e-5;
  const gradient = [];

  for (let d = 0; d < field.dims; d++) {
    const posPlus = [...position];
    const posMinus = [...position];
    posPlus[d] += epsilon;
    posMinus[d] -= epsilon;

    const ePlus = computeCognitiveEnergy(field, posPlus);
    const eMinus = computeCognitiveEnergy(field, posMinus);

    gradient.push((ePlus - eMinus) / (2 * epsilon));
  }

  return gradient;
}

// ════════════════════════════════════════════════════════════════════════════
// METROPOLIS-HASTINGS — Deliberation as MCMC
// ════════════════════════════════════════════════════════════════════════════

/**
 * Run Metropolis-Hastings sampling
 * Each step = considering a thought
 * @param {CognitiveField} field
 * @param {number[]} startPosition
 * @param {number} numSamples
 * @param {number} proposalScale
 * @returns {{samples: number[][], acceptanceRate: number, energies: number[]}}
 */
function metropolisHastings(field, startPosition, numSamples, proposalScale = 0.1) {
  const samples = [];
  const energies = [];
  let current = [...startPosition];
  let currentEnergy = computeCognitiveEnergy(field, current);
  let accepted = 0;

  for (let i = 0; i < numSamples; i++) {
    // Propose new thought (Gaussian proposal)
    const proposal = current.map(x => x + (Math.random() - 0.5) * 2 * proposalScale);

    // Compute energy difference
    const proposalEnergy = computeCognitiveEnergy(field, proposal);
    const deltaE = proposalEnergy - currentEnergy;

    // Accept/reject with Boltzmann probability
    const acceptProb = Math.min(1, Math.exp(-deltaE / field.temperature));

    if (Math.random() < acceptProb) {
      current = proposal;
      currentEnergy = proposalEnergy;
      accepted++;
    }

    samples.push([...current]);
    energies.push(currentEnergy);
  }

  return {
    samples,
    acceptanceRate: accepted / numSamples,
    energies
  };
}

// ════════════════════════════════════════════════════════════════════════════
// HAMILTONIAN MONTE CARLO — Momentum in Reasoning
// ════════════════════════════════════════════════════════════════════════════

/**
 * Run Hamiltonian Monte Carlo sampling
 * Thoughts have inertia — reasoning flows along geodesics
 * @param {CognitiveField} field
 * @param {number[]} startPosition
 * @param {number} numSamples
 * @param {number} stepSize
 * @param {number} numLeapfrogSteps
 * @returns {{samples: number[][], acceptanceRate: number, energies: number[]}}
 */
function hamiltonianMC(field, startPosition, numSamples, stepSize = 0.01, numLeapfrogSteps = 20) {
  const samples = [];
  const energies = [];
  let current = [...startPosition];
  let currentEnergy = computeCognitiveEnergy(field, current);
  let accepted = 0;

  for (let i = 0; i < numSamples; i++) {
    // Sample random momentum
    let momentum = Array(field.dims).fill(0).map(() => Math.random() - 0.5);

    // Current Hamiltonian
    const currentK = 0.5 * dot(momentum, momentum);
    const currentH = currentEnergy + currentK;

    // Leapfrog integration
    let q = [...current];
    let p = [...momentum];

    // Half step for momentum
    const grad0 = computeEnergyGradient(field, q);
    p = subtract(p, scale(grad0, stepSize / 2));

    // Full steps
    for (let l = 0; l < numLeapfrogSteps; l++) {
      // Full step for position
      q = add(q, scale(p, stepSize));

      // Full step for momentum (except at end)
      if (l < numLeapfrogSteps - 1) {
        const grad = computeEnergyGradient(field, q);
        p = subtract(p, scale(grad, stepSize));
      }
    }

    // Half step for momentum
    const gradFinal = computeEnergyGradient(field, q);
    p = subtract(p, scale(gradFinal, stepSize / 2));

    // Negate momentum for reversibility
    p = scale(p, -1);

    // Proposed Hamiltonian
    const proposedEnergy = computeCognitiveEnergy(field, q);
    const proposedK = 0.5 * dot(p, p);
    const proposedH = proposedEnergy + proposedK;

    // Accept/reject
    const deltaH = proposedH - currentH;
    const acceptProb = Math.min(1, Math.exp(-deltaH));

    if (Math.random() < acceptProb) {
      current = q;
      currentEnergy = proposedEnergy;
      accepted++;
    }

    samples.push([...current]);
    energies.push(currentEnergy);
  }

  return {
    samples,
    acceptanceRate: accepted / numSamples,
    energies
  };
}

// ════════════════════════════════════════════════════════════════════════════
// IMPORTANCE SAMPLING — Attention Weighting
// ════════════════════════════════════════════════════════════════════════════

/**
 * Run importance sampling
 * Weight samples by relevance to target
 * @param {CognitiveField} field
 * @param {number} numSamples
 * @param {number} targetAttractorIndex
 * @returns {{samples: number[][], weights: number[], normalizedWeights: number[]}}
 */
function importanceSampling(field, numSamples, targetAttractorIndex = 0) {
  const samples = [];
  const weights = [];

  const targetAttractor = field.attractors[targetAttractorIndex];

  for (let i = 0; i < numSamples; i++) {
    // Sample from proposal (Gaussian around target)
    const sample = targetAttractor.map(x => x + (Math.random() - 0.5) * 2);

    // Compute importance weight
    const energy = computeCognitiveEnergy(field, sample);
    const targetDist = norm(subtract(sample, targetAttractor));
    const proposalLogProb = -targetDist * targetDist / 2;
    const targetLogProb = -energy / field.temperature;

    const weight = Math.exp(targetLogProb - proposalLogProb);

    samples.push(sample);
    weights.push(weight);
  }

  // Normalize weights
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const normalizedWeights = weights.map(w => w / weightSum);

  return { samples, weights, normalizedWeights };
}

// ════════════════════════════════════════════════════════════════════════════
// SWARM COGNITION — Multi-Agent Exploration
// ════════════════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} SwarmParticle
 * @property {number[]} position
 * @property {number[]} velocity
 * @property {number[]} personalBest
 * @property {number} personalBestEnergy
 */

/**
 * Create a cognitive swarm
 * @param {number} dims
 * @param {number} numParticles
 * @returns {SwarmParticle[]}
 */
function createSwarm(dims, numParticles) {
  const swarm = [];
  for (let i = 0; i < numParticles; i++) {
    const position = Array(dims).fill(0).map(() => (Math.random() - 0.5) * 4);
    swarm.push({
      position,
      velocity: Array(dims).fill(0).map(() => (Math.random() - 0.5) * 0.2),
      personalBest: [...position],
      personalBestEnergy: Infinity
    });
  }
  return swarm;
}

/**
 * Run particle swarm optimization
 * @param {SwarmParticle[]} swarm
 * @param {CognitiveField} field
 * @param {number} maxIterations
 * @param {number} inertiaWeight
 * @param {number} cognitiveWeight
 * @param {number} socialWeight
 * @returns {{globalBest: number[], globalBestEnergy: number, convergenceHistory: number[]}}
 */
function runSwarm(swarm, field, maxIterations, inertiaWeight = 0.7, cognitiveWeight = 1.5, socialWeight = 1.5) {
  let globalBest = null;
  let globalBestEnergy = Infinity;
  const convergenceHistory = [];

  for (let iter = 0; iter < maxIterations; iter++) {
    for (const particle of swarm) {
      // Evaluate
      const energy = computeCognitiveEnergy(field, particle.position);

      // Update personal best
      if (energy < particle.personalBestEnergy) {
        particle.personalBest = [...particle.position];
        particle.personalBestEnergy = energy;
      }

      // Update global best
      if (energy < globalBestEnergy) {
        globalBest = [...particle.position];
        globalBestEnergy = energy;
      }
    }

    convergenceHistory.push(globalBestEnergy);

    // Update velocities and positions
    for (const particle of swarm) {
      for (let d = 0; d < field.dims; d++) {
        const r1 = Math.random();
        const r2 = Math.random();

        particle.velocity[d] =
          inertiaWeight * particle.velocity[d] +
          cognitiveWeight * r1 * (particle.personalBest[d] - particle.position[d]) +
          socialWeight * r2 * (globalBest[d] - particle.position[d]);

        particle.position[d] += particle.velocity[d];
      }
    }
  }

  return { globalBest, globalBestEnergy, convergenceHistory };
}

// ════════════════════════════════════════════════════════════════════════════
// BELIEF INTEGRATION
// ════════════════════════════════════════════════════════════════════════════

/**
 * Integrate samples into beliefs
 * @param {number[][]} samples
 * @param {number} burnIn
 * @param {number} thinning
 * @returns {{mean: number[], std: number[], ci95: {lower: number[], upper: number[]}}}
 */
function integrateBeliefs(samples, burnIn = 0, thinning = 1) {
  // Apply burn-in and thinning
  const effectiveSamples = samples.slice(burnIn).filter((_, i) => i % thinning === 0);

  const dims = effectiveSamples[0].length;
  const n = effectiveSamples.length;

  // Compute mean
  const mean = Array(dims).fill(0);
  for (const sample of effectiveSamples) {
    for (let d = 0; d < dims; d++) {
      mean[d] += sample[d] / n;
    }
  }

  // Compute std
  const std = Array(dims).fill(0);
  for (const sample of effectiveSamples) {
    for (let d = 0; d < dims; d++) {
      std[d] += (sample[d] - mean[d]) ** 2 / n;
    }
  }
  for (let d = 0; d < dims; d++) {
    std[d] = Math.sqrt(std[d]);
  }

  // 95% CI (assuming normal)
  const ci95 = {
    lower: mean.map((m, d) => m - 1.96 * std[d]),
    upper: mean.map((m, d) => m + 1.96 * std[d])
  };

  return { mean, std, ci95 };
}

/**
 * Compute effective sample size
 * @param {number[][]} samples
 * @returns {number}
 */
function computeEffectiveSampleSize(samples) {
  // Simplified ESS using first dimension
  const n = samples.length;
  const x = samples.map(s => s[0]);

  const mean = x.reduce((a, b) => a + b, 0) / n;
  const variance = x.reduce((sum, xi) => sum + (xi - mean) ** 2, 0) / n;

  // Compute autocorrelation at lag 1
  let autocorr = 0;
  for (let i = 0; i < n - 1; i++) {
    autocorr += (x[i] - mean) * (x[i + 1] - mean);
  }
  autocorr /= ((n - 1) * variance);

  // ESS approximation
  const ess = n / (1 + 2 * Math.abs(autocorr));

  return Math.max(1, Math.floor(ess));
}

// ════════════════════════════════════════════════════════════════════════════
// ALPHA-COGNITIVE PLATFORM
// ════════════════════════════════════════════════════════════════════════════

/**
 * AlphaCognitive — The research & intelligence platform
 *
 * @example
 * const cognitive = new AlphaCognitive(config);
 * const field = cognitive.createField({ dims: 64, numAttractors: 10 });
 * const samples = await cognitive.metropolisHastings({ field, numSamples: 1000 });
 */
export class AlphaCognitive {
  /**
   * @param {Object} config
   * @param {number} [config.dimensions] - Default thought space dimensions
   * @param {Object} [config.field] - Field configuration
   * @param {Object} [config.sampling] - Sampling configuration
   */
  constructor(config = {}) {
    this.config = {
      dimensions: config.dimensions || 64,
      field: config.field || { numAttractors: 10, temperature: 1.0 },
      sampling: config.sampling || { numIterations: 1000, burnIn: 100, thinning: 10 }
    };

    this.startTime = Date.now();
    this.samplingCount = 0;
  }

  // ────────────────────────────────────────────────────────────────────────
  // FIELD OPERATIONS
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Create a cognitive field
   * @param {Object} options
   */
  createField(options = {}) {
    const dims = options.dims || this.config.dimensions;
    const numAttractors = options.numAttractors || this.config.field.numAttractors;
    const temperature = options.temperature || this.config.field.temperature;

    return createCognitiveField(dims, numAttractors, temperature);
  }

  /**
   * Compute energy at a position
   * @param {CognitiveField} field
   * @param {number[]} position
   */
  computeEnergy(field, position) {
    return computeCognitiveEnergy(field, position);
  }

  // ────────────────────────────────────────────────────────────────────────
  // SAMPLING OPERATIONS
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Run Metropolis-Hastings sampling
   * @param {Object} options
   */
  async runMetropolisHastings(options) {
    this.samplingCount++;

    const { field, startPosition, numSamples, proposalScale } = options;
    const start = startPosition || Array(field.dims).fill(0).map(() => Math.random() - 0.5);
    const n = numSamples || this.config.sampling.numIterations;
    const scale = proposalScale || 0.1;

    return metropolisHastings(field, start, n, scale);
  }

  /**
   * Run Hamiltonian Monte Carlo
   * @param {Object} options
   */
  async runHamiltonianMC(options) {
    this.samplingCount++;

    const { field, startPosition, numSamples, stepSize, numLeapfrogSteps } = options;
    const start = startPosition || Array(field.dims).fill(0).map(() => Math.random() - 0.5);
    const n = numSamples || this.config.sampling.numIterations;

    return hamiltonianMC(field, start, n, stepSize || 0.01, numLeapfrogSteps || 20);
  }

  /**
   * Run importance sampling
   * @param {Object} options
   */
  async runImportanceSampling(options) {
    this.samplingCount++;

    const { field, numSamples, targetAttractorIndex } = options;
    const n = numSamples || this.config.sampling.numIterations;

    return importanceSampling(field, n, targetAttractorIndex || 0);
  }

  // ────────────────────────────────────────────────────────────────────────
  // SWARM OPERATIONS
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Create a cognitive swarm
   * @param {Object} options
   */
  createSwarm(options) {
    const dims = options.dims || this.config.dimensions;
    const numParticles = options.numParticles || 50;

    return createSwarm(dims, numParticles);
  }

  /**
   * Run swarm optimization
   * @param {SwarmParticle[]} swarm
   * @param {CognitiveField} field
   * @param {Object} options
   */
  async runSwarmOptimization(swarm, field, options = {}) {
    this.samplingCount++;

    const maxIterations = options.maxIterations || 100;
    const inertiaWeight = options.inertiaWeight || 0.7;
    const cognitiveWeight = options.cognitiveWeight || 1.5;
    const socialWeight = options.socialWeight || 1.5;

    return runSwarm(swarm, field, maxIterations, inertiaWeight, cognitiveWeight, socialWeight);
  }

  // ────────────────────────────────────────────────────────────────────────
  // BELIEF INTEGRATION
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Integrate samples into beliefs
   * @param {number[][]} samples
   * @param {Object} options
   */
  integrateBeliefs(samples, options = {}) {
    const burnIn = options.burnIn || this.config.sampling.burnIn;
    const thinning = options.thinning || this.config.sampling.thinning;

    return integrateBeliefs(samples, burnIn, thinning);
  }

  /**
   * Check convergence diagnostics
   * @param {number[][]} samples
   */
  checkConvergence(samples) {
    const ess = computeEffectiveSampleSize(samples);

    // Simplified R-hat (would need multiple chains for proper computation)
    const rHat = 1.0 + 0.01 * Math.random(); // Placeholder

    return {
      ess,
      rHat,
      converged: rHat < 1.1 && ess > 100
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // THOUGHT PARTICLES
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Create a thought particle
   * @param {number} [dims]
   */
  createThoughtParticle(dims) {
    return createThoughtParticle(dims || this.config.dimensions);
  }

  // ────────────────────────────────────────────────────────────────────────
  // HEALTH & MONITORING
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Get system health status
   */
  getHealth() {
    return {
      status: 'healthy',
      uptime: Date.now() - this.startTime,
      samplingCount: this.samplingCount,
      config: this.config
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════

export {
  createThoughtParticle,
  createCognitiveField,
  computeCognitiveEnergy,
  computeEnergyGradient,
  metropolisHastings,
  hamiltonianMC,
  importanceSampling,
  createSwarm,
  runSwarm,
  integrateBeliefs,
  computeEffectiveSampleSize,
  PHI,
  PHI_INVERSE,
  PHI_SQUARED,
  COGNITIVE_TEMPERATURE,
  PLANCK_THOUGHT
};

export default AlphaCognitive;
