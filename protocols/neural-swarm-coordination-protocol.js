/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  NEURAL SWARM COORDINATION PROTOCOL — COLLECTIVE INTELLIGENCE ORCHESTRATION           ║
 * ║  "Examen Neurale — Coordination Through Emergent Swarm Intelligence"                  ║
 * ║                                                                                        ║
 * ║  "Unum ex multis. Multitudo sapit. Examen regnat."                                    ║
 * ║  (One from many. The multitude is wise. The swarm rules.)                             ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// SWARM ROLES AND STATES
// ════════════════════════════════════════════════════════════════════════════════

const SwarmRole = {
  QUEEN: 'QUEEN',           // Central coordinator
  SCOUT: 'SCOUT',           // Exploration and discovery
  WORKER: 'WORKER',         // Task execution
  GUARDIAN: 'GUARDIAN',     // Defense and validation
  MESSENGER: 'MESSENGER',  // Inter-swarm communication
  HEALER: 'HEALER',        // Recovery and self-healing
};

const SwarmState = {
  FORMING: 'FORMING',
  EXPLORING: 'EXPLORING',
  CONVERGING: 'CONVERGING',
  EXECUTING: 'EXECUTING',
  DISPERSING: 'DISPERSING',
  REFORMING: 'REFORMING',
};

const SignalType = {
  PHEROMONE: 'PHEROMONE',           // Persistent trail signal
  WAGGLE_DANCE: 'WAGGLE_DANCE',     // Directional information
  ALARM: 'ALARM',                   // Threat detection
  RECRUITMENT: 'RECRUITMENT',       // Task recruitment
  COMPLETION: 'COMPLETION',         // Task completion
  HEARTBEAT: 'HEARTBEAT',           // Alive signal
};

// ════════════════════════════════════════════════════════════════════════════════
// SWARM AGENT
// ════════════════════════════════════════════════════════════════════════════════

class SwarmAgent {
  constructor(agentId, role = SwarmRole.WORKER) {
    this.agentId = agentId;
    this.role = role;
    this.energy = PHI_INVERSE; // Starting energy at φ⁻¹
    this.position = { x: 0, y: 0, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.taskQueue = [];
    this.completedTasks = 0;
    this.signalBuffer = [];
    this.neighbors = new Set();
    this.fitness = 0.5;
    this.lastHeartbeat = Date.now();
    this.born = Date.now();
  }

  move(attractors, repulsors) {
    // Boid-style movement with φ-weighted forces
    let fx = 0, fy = 0, fz = 0;

    // Attraction toward high-value targets
    attractors.forEach(a => {
      const dx = a.x - this.position.x;
      const dy = a.y - this.position.y;
      const dz = a.z - this.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      const force = (a.strength || 1) * PHI_INVERSE / (dist * dist);
      fx += dx * force;
      fy += dy * force;
      fz += dz * force;
    });

    // Repulsion from threats
    repulsors.forEach(r => {
      const dx = this.position.x - r.x;
      const dy = this.position.y - r.y;
      const dz = this.position.z - r.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      const force = (r.strength || 1) * PHI / (dist * dist);
      fx += dx * force;
      fy += dy * force;
      fz += dz * force;
    });

    // Apply velocity with damping
    const damping = PHI_COMPLEMENT;
    this.velocity.x = this.velocity.x * damping + fx;
    this.velocity.y = this.velocity.y * damping + fy;
    this.velocity.z = this.velocity.z * damping + fz;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.position.z += this.velocity.z;

    // Energy cost of movement
    const speed = Math.sqrt(
      this.velocity.x ** 2 + this.velocity.y ** 2 + this.velocity.z ** 2
    );
    this.energy -= speed * 0.001 * PHI_COMPLEMENT;
    this.energy = Math.max(0, Math.min(1, this.energy));

    return this;
  }

  emitSignal(type, payload) {
    return {
      type,
      emitterId: this.agentId,
      position: { ...this.position },
      payload,
      strength: this.fitness * PHI_INVERSE,
      timestamp: Date.now(),
      decay: PHI_COMPLEMENT,
    };
  }

  receiveSignal(signal) {
    this.signalBuffer.push(signal);
    if (this.signalBuffer.length > 50) {
      this.signalBuffer.shift();
    }

    // Process alarm immediately
    if (signal.type === SignalType.ALARM) {
      this.energy = Math.min(1, this.energy + 0.1); // Adrenaline boost
    }
  }

  executeTask(task) {
    if (this.energy < PHI_COMPLEMENT) return { success: false, reason: 'LOW_ENERGY' };

    const effort = task.complexity * PHI_COMPLEMENT;
    this.energy -= effort;
    this.completedTasks++;
    this.fitness = Math.min(1, this.fitness + 0.01 * PHI_INVERSE);

    return {
      success: true,
      taskId: task.id,
      result: task.execute ? task.execute() : null,
      energyRemaining: this.energy,
    };
  }

  heartbeat() {
    this.lastHeartbeat = Date.now();
    return this.emitSignal(SignalType.HEARTBEAT, {
      energy: this.energy,
      fitness: this.fitness,
      role: this.role,
      taskLoad: this.taskQueue.length,
    });
  }

  getStatus() {
    return {
      agentId: this.agentId,
      role: this.role,
      energy: this.energy,
      fitness: this.fitness,
      position: this.position,
      completedTasks: this.completedTasks,
      queuedTasks: this.taskQueue.length,
      neighborCount: this.neighbors.size,
      alive: this.energy > 0,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// SWARM COORDINATOR
// ════════════════════════════════════════════════════════════════════════════════

class SwarmCoordinator {
  constructor(swarmId) {
    this.swarmId = swarmId;
    this.agents = new Map();
    this.state = SwarmState.FORMING;
    this.signals = [];
    this.taskPool = [];
    this.completedTasks = [];
    this.coherence = 0;
    this.generation = 0;
    this.maxSignals = 1000;
    this.createdAt = Date.now();
  }

  addAgent(agent) {
    this.agents.set(agent.agentId, agent);
    this.updateNeighborhoods();
    return this;
  }

  removeAgent(agentId) {
    this.agents.delete(agentId);
    this.updateNeighborhoods();
    return this;
  }

  updateNeighborhoods() {
    const agents = Array.from(this.agents.values());
    const neighborRadius = 10 * PHI;

    agents.forEach(agent => {
      agent.neighbors.clear();
      agents.forEach(other => {
        if (other.agentId === agent.agentId) return;
        const dx = agent.position.x - other.position.x;
        const dy = agent.position.y - other.position.y;
        const dz = agent.position.z - other.position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist <= neighborRadius) {
          agent.neighbors.add(other.agentId);
        }
      });
    });
  }

  broadcastSignal(signal) {
    this.signals.push(signal);
    if (this.signals.length > this.maxSignals) this.signals.shift();

    // Deliver to nearby agents
    this.agents.forEach(agent => {
      if (agent.agentId === signal.emitterId) return;
      const dx = agent.position.x - signal.position.x;
      const dy = agent.position.y - signal.position.y;
      const dz = agent.position.z - signal.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist <= signal.strength * 20) {
        agent.receiveSignal(signal);
      }
    });
  }

  submitTask(task) {
    this.taskPool.push({ ...task, submittedAt: Date.now() });
    this.assignTasks();
  }

  assignTasks() {
    if (this.taskPool.length === 0) return;

    // Find available workers
    const workers = Array.from(this.agents.values())
      .filter(a => a.role === SwarmRole.WORKER && a.energy > PHI_COMPLEMENT && a.taskQueue.length < 3)
      .sort((a, b) => b.fitness - a.fitness);

    while (this.taskPool.length > 0 && workers.length > 0) {
      const task = this.taskPool.shift();
      const worker = workers.shift();
      worker.taskQueue.push(task);
    }
  }

  tick() {
    this.generation++;

    // Collect heartbeats and detect dead agents
    const deadAgents = [];
    this.agents.forEach(agent => {
      const signal = agent.heartbeat();
      this.broadcastSignal(signal);

      if (agent.energy <= 0) {
        deadAgents.push(agent.agentId);
      }

      // Execute queued tasks
      while (agent.taskQueue.length > 0 && agent.energy > PHI_COMPLEMENT) {
        const task = agent.taskQueue.shift();
        const result = agent.executeTask(task);
        if (result.success) {
          this.completedTasks.push({ ...result, generation: this.generation });
        } else {
          // Re-queue failed task
          this.taskPool.push(task);
        }
      }
    });

    // Remove dead agents
    deadAgents.forEach(id => this.removeAgent(id));

    // Update swarm coherence
    this.updateCoherence();
    this.updateState();

    return this.getStatus();
  }

  updateCoherence() {
    const agents = Array.from(this.agents.values());
    if (agents.length < 2) { this.coherence = 1; return; }

    // Calculate average neighbor connectivity
    const avgNeighbors = agents.reduce((sum, a) => sum + a.neighbors.size, 0) / agents.length;
    const maxPossible = agents.length - 1;

    // Calculate average fitness
    const avgFitness = agents.reduce((sum, a) => sum + a.fitness, 0) / agents.length;

    // φ-weighted coherence
    this.coherence = (avgNeighbors / maxPossible) * PHI_INVERSE + avgFitness * PHI_COMPLEMENT;
    this.coherence = Math.min(1, this.coherence);
  }

  updateState() {
    const agentCount = this.agents.size;

    if (agentCount < 3) {
      this.state = SwarmState.FORMING;
    } else if (this.coherence < PHI_COMPLEMENT) {
      this.state = SwarmState.REFORMING;
    } else if (this.taskPool.length > agentCount * 2) {
      this.state = SwarmState.CONVERGING;
    } else if (this.taskPool.length > 0) {
      this.state = SwarmState.EXECUTING;
    } else {
      this.state = SwarmState.EXPLORING;
    }
  }

  getStatus() {
    return {
      swarmId: this.swarmId,
      state: this.state,
      agentCount: this.agents.size,
      coherence: this.coherence,
      generation: this.generation,
      pendingTasks: this.taskPool.length,
      completedTasks: this.completedTasks.length,
      roleDistribution: this.getRoleDistribution(),
    };
  }

  getRoleDistribution() {
    const dist = {};
    Object.values(SwarmRole).forEach(r => { dist[r] = 0; });
    this.agents.forEach(a => { dist[a.role]++; });
    return dist;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  SwarmRole,
  SwarmState,
  SignalType,
  SwarmAgent,
  SwarmCoordinator,
};

export default {
  PROTOCOL_ID: 'PROTO-NSC-001',
  PROTOCOL_NAME: 'Neural Swarm Coordination Protocol',
  DOCTRINE: 'Unum ex multis. Multitudo sapit. Examen regnat.',
  DOCTRINE_EN: 'One from many. The multitude is wise. The swarm rules.',

  SwarmRole,
  SwarmState,
  SignalType,
  SwarmAgent,
  SwarmCoordinator,
};
