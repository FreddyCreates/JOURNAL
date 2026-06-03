/**
 * PROTO-233: SWARM INTELLIGENCE PROTOCOL — PRODUCTION GRADE
 * @module @medina/production-intelligence-sdk/protocols/swarm-intelligence
 * @copyright Medina Intelligence Systems — All Rights Reserved
 * @version 2.0.0
 */

import { PHI, PHI_INVERSE, SWARM_CONSTANTS } from '../core/phi-constants.js';

export const PROTOCOL_ID = 'PROTO-233';
export const PROTOCOL_NAME = 'Swarm Intelligence Protocol';
export const PROTOCOL_VERSION = '2.0.0';
export const PROTOCOL_TIER = 'ENTERPRISE';

export class SwarmAgent {
  constructor(id, dimensions, options = {}) {
    this.id = id;
    this.position = new Float64Array(dimensions);
    this.velocity = new Float64Array(dimensions);
    this.bestPosition = new Float64Array(dimensions);
    this.bestFitness = -Infinity;
    this.fitness = -Infinity;
    for (let i = 0; i < dimensions; i++) {
      this.position[i] = (Math.random() - 0.5) * 2;
      this.velocity[i] = (Math.random() - 0.5) * 0.1;
    }
    this.bestPosition.set(this.position);
  }

  updateVelocity(globalBest, w, c1, c2) {
    for (let i = 0; i < this.position.length; i++) {
      const r1 = Math.random(), r2 = Math.random();
      this.velocity[i] = w * this.velocity[i] +
        c1 * r1 * (this.bestPosition[i] - this.position[i]) +
        c2 * r2 * (globalBest[i] - this.position[i]);
    }
  }

  updatePosition(bounds) {
    for (let i = 0; i < this.position.length; i++) {
      this.position[i] += this.velocity[i];
      if (bounds) {
        this.position[i] = Math.max(bounds.min, Math.min(bounds.max, this.position[i]));
      }
    }
  }

  evaluate(fitnessFunction) {
    this.fitness = fitnessFunction(Array.from(this.position));
    if (this.fitness > this.bestFitness) {
      this.bestFitness = this.fitness;
      this.bestPosition.set(this.position);
      return true;
    }
    return false;
  }
}

export class SwarmIntelligenceProtocol {
  constructor(config = {}) {
    this.protocolId = PROTOCOL_ID;
    this.version = PROTOCOL_VERSION;
    this.config = {
      swarmSize: config.swarmSize || SWARM_CONSTANTS.DEFAULT_SWARM_SIZE,
      dimensions: config.dimensions || 10,
      inertiaWeight: config.inertiaWeight || SWARM_CONSTANTS.INERTIA_WEIGHT,
      cognitiveWeight: config.cognitiveWeight || SWARM_CONSTANTS.COGNITIVE_WEIGHT,
      socialWeight: config.socialWeight || SWARM_CONSTANTS.SOCIAL_WEIGHT,
      maxIterations: config.maxIterations || 1000,
      convergenceThreshold: config.convergenceThreshold || 1e-6,
      ...config
    };
    this.agents = [];
    this.globalBest = new Float64Array(this.config.dimensions);
    this.globalBestFitness = -Infinity;
    this.iteration = 0;
    this.telemetry = { iterations: 0, improvements: 0, convergences: 0 };
    this.startedAt = Date.now();
    this._initializeSwarm();
  }

  _initializeSwarm() {
    this.agents = [];
    for (let i = 0; i < this.config.swarmSize; i++) {
      this.agents.push(new SwarmAgent(`agent_${i}`, this.config.dimensions));
    }
  }

  optimize(fitnessFunction, options = {}) {
    const maxIter = options.maxIterations || this.config.maxIterations;
    const bounds = options.bounds || { min: -10, max: 10 };
    
    for (let iter = 0; iter < maxIter; iter++) {
      this.iteration = iter;
      let improved = false;
      
      for (const agent of this.agents) {
        agent.updateVelocity(this.globalBest, this.config.inertiaWeight, 
          this.config.cognitiveWeight, this.config.socialWeight);
        agent.updatePosition(bounds);
        
        if (agent.evaluate(fitnessFunction)) {
          if (agent.bestFitness > this.globalBestFitness) {
            this.globalBestFitness = agent.bestFitness;
            this.globalBest.set(agent.bestPosition);
            improved = true;
            this.telemetry.improvements++;
          }
        }
      }
      
      this.telemetry.iterations++;
      
      if (!improved && iter > 10) {
        const variance = this._computeVariance();
        if (variance < this.config.convergenceThreshold) {
          this.telemetry.convergences++;
          break;
        }
      }
    }
    
    return {
      bestPosition: Array.from(this.globalBest),
      bestFitness: this.globalBestFitness,
      iterations: this.iteration + 1
    };
  }

  _computeVariance() {
    let variance = 0;
    for (const agent of this.agents) {
      for (let i = 0; i < this.config.dimensions; i++) {
        variance += Math.pow(agent.position[i] - this.globalBest[i], 2);
      }
    }
    return variance / (this.agents.length * this.config.dimensions);
  }

  getStatus() {
    return {
      protocolId: this.protocolId,
      version: this.version,
      tier: PROTOCOL_TIER,
      uptime: Date.now() - this.startedAt,
      swarmSize: this.agents.length,
      globalBestFitness: this.globalBestFitness,
      iteration: this.iteration,
      telemetry: { ...this.telemetry },
      config: { ...this.config }
    };
  }

  reset() {
    this._initializeSwarm();
    this.globalBest = new Float64Array(this.config.dimensions);
    this.globalBestFitness = -Infinity;
    this.iteration = 0;
    this.telemetry = { iterations: 0, improvements: 0, convergences: 0 };
    this.startedAt = Date.now();
  }
}

export default { PROTOCOL_ID, PROTOCOL_NAME, PROTOCOL_VERSION, PROTOCOL_TIER, SwarmAgent, SwarmIntelligenceProtocol };
