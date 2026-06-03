/**
 * @medina/backend-intelligence-engines — SwarmIntelligenceProtocol
 *
 * PROTO-233: Swarm Intelligence Protocol
 * Models collective intelligence through particle swarm optimization,
 * ant colony optimization, and emergent consensus mechanisms.
 *
 * Brain analog: Distributed neural populations + social cognition networks
 *
 * @module @medina/backend-intelligence-engines/swarm-intelligence-protocol
 */

// ════════════════════════════════════════════════════════════════════════════
// PHI-ENCODED CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const PHI_INVERSE = 1 / PHI;
const PHI_SQUARED = PHI * PHI;
const TWO_PI = 2 * Math.PI;

// Swarm behavior constants
const SWARM_CONSTANTS = {
  COGNITIVE_WEIGHT: PHI,           // Personal best attraction
  SOCIAL_WEIGHT: PHI_INVERSE,      // Global best attraction
  INERTIA_WEIGHT: PHI_INVERSE,     // Velocity persistence
  PHEROMONE_DECAY: PHI_INVERSE,    // Pheromone evaporation rate
  EXPLORATION_RATE: 1 - PHI_INVERSE // Random exploration factor
};

// ════════════════════════════════════════════════════════════════════════════
// SWARM PARTICLE
// ════════════════════════════════════════════════════════════════════════════

/**
 * SwarmParticle represents an individual agent in the swarm
 */
class SwarmParticle {
  constructor(dimensions, bounds) {
    this.id = `particle_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    this.dimensions = dimensions;
    this.bounds = bounds;
    
    // Initialize position randomly within bounds
    this.position = Array.from({ length: dimensions }, (_, i) => 
      bounds[i].min + Math.random() * (bounds[i].max - bounds[i].min)
    );
    
    // Initialize velocity
    this.velocity = Array.from({ length: dimensions }, (_, i) => 
      (Math.random() - 0.5) * (bounds[i].max - bounds[i].min) * 0.1
    );
    
    // Personal best
    this.personalBest = [...this.position];
    this.personalBestFitness = -Infinity;
    
    // Current fitness
    this.fitness = -Infinity;
    
    // Particle state
    this.age = 0;
    this.stagnationCount = 0;
  }

  /**
   * Update particle velocity and position
   * @param {number[]} globalBest - Global best position
   * @param {Object} weights - PSO weights
   */
  update(globalBest, weights = SWARM_CONSTANTS) {
    const r1 = Math.random();
    const r2 = Math.random();

    for (let i = 0; i < this.dimensions; i++) {
      // Velocity update with cognitive and social components
      const cognitive = weights.COGNITIVE_WEIGHT * r1 * (this.personalBest[i] - this.position[i]);
      const social = weights.SOCIAL_WEIGHT * r2 * (globalBest[i] - this.position[i]);
      
      this.velocity[i] = weights.INERTIA_WEIGHT * this.velocity[i] + cognitive + social;
      
      // Velocity clamping
      const maxVel = (this.bounds[i].max - this.bounds[i].min) * 0.2;
      this.velocity[i] = Math.max(-maxVel, Math.min(maxVel, this.velocity[i]));
      
      // Position update
      this.position[i] += this.velocity[i];
      
      // Boundary handling (reflection)
      if (this.position[i] < this.bounds[i].min) {
        this.position[i] = this.bounds[i].min;
        this.velocity[i] *= -0.5;
      } else if (this.position[i] > this.bounds[i].max) {
        this.position[i] = this.bounds[i].max;
        this.velocity[i] *= -0.5;
      }
    }

    this.age++;
  }

  /**
   * Evaluate fitness and update personal best
   * @param {Function} fitnessFunction - Fitness evaluation function
   */
  evaluate(fitnessFunction) {
    this.fitness = fitnessFunction(this.position);
    
    if (this.fitness > this.personalBestFitness) {
      this.personalBest = [...this.position];
      this.personalBestFitness = this.fitness;
      this.stagnationCount = 0;
    } else {
      this.stagnationCount++;
    }
  }

  /**
   * Apply random perturbation for exploration
   * @param {number} magnitude - Perturbation magnitude
   */
  perturb(magnitude = 0.1) {
    for (let i = 0; i < this.dimensions; i++) {
      const range = this.bounds[i].max - this.bounds[i].min;
      this.position[i] += (Math.random() - 0.5) * range * magnitude;
      this.position[i] = Math.max(this.bounds[i].min, Math.min(this.bounds[i].max, this.position[i]));
    }
  }

  /**
   * Get particle state
   * @returns {Object} Particle state
   */
  getState() {
    return {
      id: this.id,
      position: [...this.position],
      velocity: [...this.velocity],
      fitness: this.fitness,
      personalBestFitness: this.personalBestFitness,
      age: this.age,
      stagnationCount: this.stagnationCount
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PHEROMONE TRAIL SYSTEM (ACO)
// ════════════════════════════════════════════════════════════════════════════

/**
 * PheromoneTrailSystem manages pheromone-based communication
 */
class PheromoneTrailSystem {
  constructor(gridSize, decayRate = SWARM_CONSTANTS.PHEROMONE_DECAY) {
    this.gridSize = gridSize;
    this.decayRate = decayRate;
    this.trails = new Map();
    this.minPheromone = 0.01;
    this.maxPheromone = 10;
  }

  /**
   * Deposit pheromone at a location
   * @param {string} location - Location key
   * @param {number} amount - Pheromone amount
   */
  deposit(location, amount) {
    const current = this.trails.get(location) || 0;
    this.trails.set(location, Math.min(this.maxPheromone, current + amount));
  }

  /**
   * Get pheromone level at a location
   * @param {string} location - Location key
   * @returns {number} Pheromone level
   */
  getLevel(location) {
    return this.trails.get(location) || this.minPheromone;
  }

  /**
   * Apply pheromone evaporation
   */
  evaporate() {
    for (const [location, level] of this.trails) {
      const newLevel = level * (1 - this.decayRate);
      if (newLevel < this.minPheromone) {
        this.trails.delete(location);
      } else {
        this.trails.set(location, newLevel);
      }
    }
  }

  /**
   * Get strongest trails
   * @param {number} count - Number of trails to return
   * @returns {Object[]} Strongest trails
   */
  getStrongestTrails(count = 10) {
    return Array.from(this.trails.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([location, level]) => ({ location, level }));
  }

  /**
   * Calculate probability distribution for next move
   * @param {string[]} neighbors - Neighboring locations
   * @param {number} alpha - Pheromone influence
   * @param {number} beta - Heuristic influence
   * @param {Function} heuristic - Heuristic function
   * @returns {Object[]} Probability distribution
   */
  getMoveProbabilities(neighbors, alpha = PHI, beta = PHI_INVERSE, heuristic = () => 1) {
    const values = neighbors.map(loc => ({
      location: loc,
      pheromone: this.getLevel(loc),
      heuristic: heuristic(loc)
    }));

    const total = values.reduce((sum, v) => 
      sum + Math.pow(v.pheromone, alpha) * Math.pow(v.heuristic, beta), 0
    );

    return values.map(v => ({
      location: v.location,
      probability: total > 0 
        ? (Math.pow(v.pheromone, alpha) * Math.pow(v.heuristic, beta)) / total 
        : 1 / neighbors.length
    }));
  }

  /**
   * Get trail statistics
   * @returns {Object} Trail stats
   */
  getStats() {
    const levels = Array.from(this.trails.values());
    return {
      trailCount: this.trails.size,
      totalPheromone: levels.reduce((a, b) => a + b, 0),
      averageLevel: levels.length > 0 ? levels.reduce((a, b) => a + b, 0) / levels.length : 0,
      maxLevel: levels.length > 0 ? Math.max(...levels) : 0
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CONSENSUS MECHANISM
// ════════════════════════════════════════════════════════════════════════════

/**
 * SwarmConsensus manages emergent consensus among agents
 */
class SwarmConsensus {
  constructor(config = {}) {
    this.threshold = config.threshold || PHI_INVERSE;
    this.votingPower = config.votingPower || 'equal'; // 'equal', 'fitness', 'age'
    this.votes = new Map();
    this.history = [];
  }

  /**
   * Submit a vote from an agent
   * @param {string} agentId - Agent identifier
   * @param {*} proposal - Proposal being voted on
   * @param {number} weight - Vote weight
   */
  vote(agentId, proposal, weight = 1) {
    const proposalKey = JSON.stringify(proposal);
    
    if (!this.votes.has(proposalKey)) {
      this.votes.set(proposalKey, {
        proposal,
        supporters: new Map(),
        totalWeight: 0
      });
    }

    const record = this.votes.get(proposalKey);
    record.supporters.set(agentId, weight);
    record.totalWeight = Array.from(record.supporters.values()).reduce((a, b) => a + b, 0);
  }

  /**
   * Check if consensus has been reached
   * @param {number} totalAgents - Total number of agents
   * @returns {Object|null} Consensus result or null
   */
  checkConsensus(totalAgents) {
    for (const [key, record] of this.votes) {
      const supportRatio = record.supporters.size / totalAgents;
      const weightRatio = record.totalWeight / totalAgents;
      
      // Phi-weighted consensus check
      const consensusScore = (supportRatio * PHI + weightRatio) / (1 + PHI);
      
      if (consensusScore >= this.threshold) {
        const result = {
          proposal: record.proposal,
          supportRatio,
          weightRatio,
          consensusScore,
          supporters: Array.from(record.supporters.keys()),
          timestamp: Date.now()
        };
        
        this.history.push(result);
        this.votes.clear();
        
        return result;
      }
    }
    
    return null;
  }

  /**
   * Get current voting status
   * @returns {Object[]} Current proposals and support
   */
  getStatus() {
    return Array.from(this.votes.values()).map(record => ({
      proposal: record.proposal,
      supporterCount: record.supporters.size,
      totalWeight: record.totalWeight
    }));
  }

  /**
   * Clear all votes
   */
  clear() {
    this.votes.clear();
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SWARM INTELLIGENCE PROTOCOL
// ════════════════════════════════════════════════════════════════════════════

/**
 * SwarmIntelligenceProtocol manages collective intelligence processing
 * Implements PROTO-233 for the organism substrate
 */
class SwarmIntelligenceProtocol {
  constructor(config = {}) {
    this.protocolId = 'PROTO-233';
    this.name = 'Swarm Intelligence Protocol';
    this.version = '1.0.0';

    this.config = {
      swarmSize: config.swarmSize || 50,
      dimensions: config.dimensions || 10,
      bounds: config.bounds || Array.from({ length: 10 }, () => ({ min: -10, max: 10 })),
      maxIterations: config.maxIterations || 1000,
      convergenceThreshold: config.convergenceThreshold || 0.001,
      ...config
    };

    this.particles = [];
    this.globalBest = null;
    this.globalBestFitness = -Infinity;
    
    this.pheromoneSystem = new PheromoneTrailSystem(100);
    this.consensus = new SwarmConsensus();
    
    this.metrics = {
      iterations: 0,
      evaluations: 0,
      convergenceHistory: [],
      diversityHistory: []
    };

    this._initializeSwarm();
  }

  _initializeSwarm() {
    this.particles = Array.from({ length: this.config.swarmSize }, () => 
      new SwarmParticle(this.config.dimensions, this.config.bounds)
    );
    this.globalBest = [...this.particles[0].position];
  }

  /**
   * Run particle swarm optimization
   * @param {Function} fitnessFunction - Fitness evaluation function
   * @param {number} iterations - Number of iterations
   * @returns {Object} Optimization result
   */
  optimize(fitnessFunction, iterations = this.config.maxIterations) {
    for (let i = 0; i < iterations; i++) {
      // Evaluate all particles
      for (const particle of this.particles) {
        particle.evaluate(fitnessFunction);
        this.metrics.evaluations++;
        
        // Update global best
        if (particle.fitness > this.globalBestFitness) {
          this.globalBest = [...particle.position];
          this.globalBestFitness = particle.fitness;
        }
      }

      // Update particle velocities and positions
      for (const particle of this.particles) {
        particle.update(this.globalBest);
        
        // Apply exploration for stagnant particles
        if (particle.stagnationCount > 10) {
          particle.perturb(SWARM_CONSTANTS.EXPLORATION_RATE);
        }
      }

      // Record metrics
      this.metrics.iterations++;
      this.metrics.convergenceHistory.push(this.globalBestFitness);
      this.metrics.diversityHistory.push(this._calculateDiversity());

      // Check convergence
      if (this._checkConvergence()) {
        break;
      }
    }

    return {
      bestPosition: this.globalBest,
      bestFitness: this.globalBestFitness,
      iterations: this.metrics.iterations,
      evaluations: this.metrics.evaluations,
      converged: this._checkConvergence()
    };
  }

  /**
   * Run ant colony optimization for path finding
   * @param {Object} graph - Graph with nodes and edges
   * @param {string} start - Start node
   * @param {string} end - End node
   * @param {number} iterations - Number of iterations
   * @returns {Object} Best path found
   */
  findPath(graph, start, end, iterations = 100) {
    let bestPath = null;
    let bestLength = Infinity;

    for (let iter = 0; iter < iterations; iter++) {
      // Each ant constructs a path
      for (let ant = 0; ant < this.config.swarmSize; ant++) {
        const path = this._constructPath(graph, start, end);
        
        if (path && path.length < bestLength) {
          bestPath = path;
          bestLength = path.length;
        }

        // Deposit pheromone on path
        if (path) {
          const deposit = 1 / path.length;
          for (const node of path) {
            this.pheromoneSystem.deposit(node, deposit * PHI);
          }
        }
      }

      // Evaporate pheromones
      this.pheromoneSystem.evaporate();
    }

    return {
      path: bestPath,
      length: bestLength,
      pheromoneStats: this.pheromoneSystem.getStats()
    };
  }

  _constructPath(graph, start, end) {
    const path = [start];
    const visited = new Set([start]);
    let current = start;

    while (current !== end) {
      const neighbors = graph.getNeighbors(current).filter(n => !visited.has(n));
      
      if (neighbors.length === 0) {
        return null; // Dead end
      }

      // Select next node based on pheromone probabilities
      const probs = this.pheromoneSystem.getMoveProbabilities(
        neighbors,
        PHI,
        PHI_INVERSE,
        (loc) => 1 / (graph.getDistance(current, loc) || 1)
      );

      const random = Math.random();
      let cumulative = 0;
      let next = neighbors[0];

      for (const p of probs) {
        cumulative += p.probability;
        if (random < cumulative) {
          next = p.location;
          break;
        }
      }

      path.push(next);
      visited.add(next);
      current = next;

      // Prevent infinite loops
      if (path.length > graph.nodeCount * 2) {
        return null;
      }
    }

    return path;
  }

  /**
   * Reach collective decision through swarm consensus
   * @param {Object[]} options - Decision options
   * @param {Function} evaluator - Option evaluation function
   * @returns {Object} Consensus decision
   */
  collectiveDecision(options, evaluator) {
    this.consensus.clear();

    // Each particle votes based on evaluation
    for (const particle of this.particles) {
      const evaluations = options.map((opt, i) => ({
        index: i,
        option: opt,
        score: evaluator(opt, particle.position)
      }));

      // Vote for best option
      const best = evaluations.sort((a, b) => b.score - a.score)[0];
      const weight = this.config.votingPower === 'fitness' 
        ? particle.fitness 
        : this.config.votingPower === 'age' 
          ? particle.age 
          : 1;

      this.consensus.vote(particle.id, best.option, weight);
    }

    // Check for consensus
    const result = this.consensus.checkConsensus(this.particles.length);
    
    if (result) {
      return {
        decision: result.proposal,
        consensusReached: true,
        ...result
      };
    }

    // Return plurality if no consensus
    const status = this.consensus.getStatus();
    const plurality = status.sort((a, b) => b.supporterCount - a.supporterCount)[0];
    
    return {
      decision: plurality?.proposal,
      consensusReached: false,
      supportRatio: plurality ? plurality.supporterCount / this.particles.length : 0
    };
  }

  /**
   * Get swarm state
   * @returns {Object} Swarm state
   */
  getSwarmState() {
    return {
      particles: this.particles.map(p => p.getState()),
      globalBest: this.globalBest,
      globalBestFitness: this.globalBestFitness,
      diversity: this._calculateDiversity(),
      pheromoneStats: this.pheromoneSystem.getStats()
    };
  }

  _calculateDiversity() {
    if (this.particles.length < 2) return 0;

    let totalDistance = 0;
    let count = 0;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dist = this._euclideanDistance(
          this.particles[i].position,
          this.particles[j].position
        );
        totalDistance += dist;
        count++;
      }
    }

    return count > 0 ? totalDistance / count : 0;
  }

  _euclideanDistance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
  }

  _checkConvergence() {
    const history = this.metrics.convergenceHistory;
    if (history.length < 10) return false;

    const recent = history.slice(-10);
    const improvement = Math.abs(recent[recent.length - 1] - recent[0]);
    
    return improvement < this.config.convergenceThreshold;
  }

  /**
   * Get protocol metrics
   * @returns {Object} Protocol metrics
   */
  getMetrics() {
    return {
      protocolId: this.protocolId,
      name: this.name,
      version: this.version,
      swarmSize: this.particles.length,
      ...this.metrics,
      currentDiversity: this._calculateDiversity(),
      globalBestFitness: this.globalBestFitness
    };
  }

  /**
   * Reset the protocol
   */
  reset() {
    this._initializeSwarm();
    this.globalBest = null;
    this.globalBestFitness = -Infinity;
    this.pheromoneSystem = new PheromoneTrailSystem(100);
    this.consensus = new SwarmConsensus();
    this.metrics = {
      iterations: 0,
      evaluations: 0,
      convergenceHistory: [],
      diversityHistory: []
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════

export {
  SwarmParticle,
  PheromoneTrailSystem,
  SwarmConsensus,
  SwarmIntelligenceProtocol,
  SWARM_CONSTANTS,
  PHI,
  PHI_INVERSE,
  PHI_SQUARED,
  TWO_PI
};
