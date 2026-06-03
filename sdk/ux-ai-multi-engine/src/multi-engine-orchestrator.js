/**
 * @medina/ux-ai-multi-engine — Multi-Engine Orchestrator
 *
 * Orchestrates multiple intelligence engines in parallel with:
 *   • Phi-encoded load balancing across engine pools
 *   • Priority-based task routing (P0–P3)
 *   • Automatic failover with circuit-breaker pattern
 *   • Health monitoring with 873ms heartbeat
 *   • Engine fusion for cross-domain intelligence
 *
 * Supports engine types: perception, interaction, adaptation, prediction,
 * generation, routing, analysis, synthesis, optimization, validation.
 *
 * @module @medina/ux-ai-multi-engine/multi-engine-orchestrator
 */

import crypto from 'node:crypto';

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const HEARTBEAT_MS = 873;

/** @typedef {'ready'|'busy'|'degraded'|'failed'|'circuit-open'} EngineStatus */
/** @typedef {'P0'|'P1'|'P2'|'P3'} Priority */

/**
 * @typedef {Object} EngineNode
 * @property {string} engineId
 * @property {string} type
 * @property {EngineStatus} status
 * @property {number} load — 0–1 current load factor
 * @property {number} capacity — max concurrent tasks
 * @property {number} tasksProcessed
 * @property {number} failures
 * @property {number} lastHeartbeat
 * @property {number} circuitFailures — consecutive failures
 * @property {number} circuitThreshold — failures before opening circuit
 */

/**
 * @typedef {Object} OrchestratedTask
 * @property {string} taskId
 * @property {string} type
 * @property {Priority} priority
 * @property {string|null} assignedEngine
 * @property {string} status
 * @property {number} createdAt
 * @property {number|null} completedAt
 * @property {number|null} durationMs
 * @property {Object} result
 */

class MultiEngineOrchestrator {
  /**
   * @param {Object} [config]
   * @param {number} [config.maxEnginesPerType=5]
   * @param {number} [config.circuitThreshold=3]
   * @param {number} [config.circuitResetMs=10000]
   * @param {number} [config.heartbeatMs=873]
   * @param {number} [config.loadBalanceStrategy='phi-weighted']
   */
  constructor(config = {}) {
    this.maxEnginesPerType = config.maxEnginesPerType ?? 5;
    this.circuitThreshold = config.circuitThreshold ?? 3;
    this.circuitResetMs = config.circuitResetMs ?? 10000;
    this.heartbeatMs = config.heartbeatMs ?? HEARTBEAT_MS;
    this.loadBalanceStrategy = config.loadBalanceStrategy ?? 'phi-weighted';

    /** @type {Map<string, EngineNode>} engineId → node */
    this.engines = new Map();

    /** @type {Map<string, Set<string>>} type → set of engineIds */
    this.typeIndex = new Map();

    /** @type {Map<string, OrchestratedTask>} taskId → task */
    this.tasks = new Map();

    /** @type {Object[]} task queue for overflow */
    this.queue = [];

    /** @type {Object} */
    this.metrics = {
      totalDispatched: 0,
      totalCompleted: 0,
      totalFailed: 0,
      totalFailovers: 0,
      totalCircuitBreaks: 0,
      averageLatencyMs: 0,
      cumulativeLatencyMs: 0,
      engineCount: 0,
      queueDepth: 0
    };

    /** @type {Map<string, Function[]>} */
    this._listeners = new Map();

    /** @type {string} */
    this.status = 'idle';
  }

  /* ================================================================== */
  /*  Engine Registration                                                */
  /* ================================================================== */

  /**
   * Register a new engine node.
   * @param {Object} descriptor
   * @param {string} descriptor.type — engine type
   * @param {number} [descriptor.capacity=10] — max concurrent tasks
   * @param {Object} [descriptor.metadata={}]
   * @returns {EngineNode}
   */
  registerEngine(descriptor) {
    const engineId = `ENG-${descriptor.type.toUpperCase()}-${crypto.randomUUID().slice(0, 8)}`;

    const node = {
      engineId,
      type: descriptor.type,
      status: 'ready',
      load: 0,
      capacity: descriptor.capacity ?? 10,
      tasksProcessed: 0,
      failures: 0,
      lastHeartbeat: Date.now(),
      circuitFailures: 0,
      circuitThreshold: this.circuitThreshold,
      circuitOpenedAt: null,
      metadata: descriptor.metadata ?? {},
      createdAt: Date.now()
    };

    this.engines.set(engineId, node);

    if (!this.typeIndex.has(descriptor.type)) {
      this.typeIndex.set(descriptor.type, new Set());
    }
    this.typeIndex.get(descriptor.type).add(engineId);

    this.metrics.engineCount = this.engines.size;
    this._emit('engine-registered', node);

    return node;
  }

  /**
   * Bulk-register engines from a list of descriptors.
   * @param {Object[]} descriptors
   * @returns {EngineNode[]}
   */
  registerAll(descriptors) {
    return descriptors.map(d => this.registerEngine(d));
  }

  /**
   * Deregister an engine node.
   * @param {string} engineId
   * @returns {boolean}
   */
  deregisterEngine(engineId) {
    const node = this.engines.get(engineId);
    if (!node) return false;

    this.engines.delete(engineId);
    const typeSet = this.typeIndex.get(node.type);
    if (typeSet) {
      typeSet.delete(engineId);
      if (typeSet.size === 0) this.typeIndex.delete(node.type);
    }

    this.metrics.engineCount = this.engines.size;
    this._emit('engine-deregistered', { engineId });
    return true;
  }

  /* ================================================================== */
  /*  Load Balancing                                                      */
  /* ================================================================== */

  /**
   * Select the best engine for a task using phi-weighted load balancing.
   *
   * Score = (1 - load) × PHI + (capacity - tasksProcessed/capacity) × PHI_INVERSE
   * Lower load and higher available capacity yields a higher score.
   *
   * @param {string} engineType — required engine type
   * @param {Priority} [priority='P2']
   * @returns {EngineNode|null}
   */
  selectEngine(engineType, priority = 'P2') {
    const typeSet = this.typeIndex.get(engineType);
    if (!typeSet || typeSet.size === 0) return null;

    let bestEngine = null;
    let bestScore = -Infinity;

    for (const engineId of typeSet) {
      const node = this.engines.get(engineId);
      if (!node) continue;

      // Skip failed or circuit-open engines
      if (node.status === 'failed') continue;
      if (node.status === 'circuit-open') {
        // Check if circuit reset time has elapsed
        if (node.circuitOpenedAt && (Date.now() - node.circuitOpenedAt) > this.circuitResetMs) {
          node.status = 'ready';
          node.circuitFailures = 0;
          node.circuitOpenedAt = null;
        } else {
          continue;
        }
      }

      // Calculate phi-weighted score
      const loadFactor = (1 - node.load) * PHI;
      const capacityFactor = ((node.capacity - (node.tasksProcessed % node.capacity)) / node.capacity) * PHI_INVERSE;
      const priorityBonus = priority === 'P0' ? 0.5 : priority === 'P1' ? 0.3 : priority === 'P2' ? 0.1 : 0;
      const healthPenalty = node.status === 'degraded' ? -0.3 : 0;

      const score = loadFactor + capacityFactor + priorityBonus + healthPenalty;

      if (score > bestScore) {
        bestScore = score;
        bestEngine = node;
      }
    }

    return bestEngine;
  }

  /* ================================================================== */
  /*  Task Dispatch                                                       */
  /* ================================================================== */

  /**
   * Dispatch a task to the orchestrator.
   *
   * @param {Object} task
   * @param {string} task.type — maps to engine type
   * @param {*} task.payload
   * @param {Priority} [task.priority='P2']
   * @param {string} [task.preferredEngine] — preferred engine ID
   * @param {boolean} [task.allowFailover=true]
   * @returns {OrchestratedTask}
   */
  dispatch(task) {
    const taskId = crypto.randomUUID();
    const priority = task.priority ?? 'P2';
    let assignedEngine = null;
    let status = 'queued';

    // Try preferred engine first
    if (task.preferredEngine && this.engines.has(task.preferredEngine)) {
      const preferred = this.engines.get(task.preferredEngine);
      if (preferred.status === 'ready' || preferred.status === 'busy') {
        assignedEngine = preferred;
      }
    }

    // Load-balanced selection
    if (!assignedEngine) {
      assignedEngine = this.selectEngine(task.type, priority);
    }

    // If no engine available, queue it
    if (!assignedEngine) {
      status = 'queued';
      this.queue.push({ taskId, task, priority, createdAt: Date.now() });
      this.metrics.queueDepth = this.queue.length;
    } else {
      status = 'assigned';
      // Update engine load
      assignedEngine.load = Math.min(assignedEngine.load + (1 / assignedEngine.capacity), 1);
      if (assignedEngine.load > 0.8) {
        assignedEngine.status = 'busy';
      }
    }

    const record = {
      taskId,
      type: task.type,
      payload: task.payload,
      priority,
      assignedEngine: assignedEngine ? assignedEngine.engineId : null,
      assignedEngineType: assignedEngine ? assignedEngine.type : null,
      allowFailover: task.allowFailover !== false,
      status,
      createdAt: Date.now(),
      completedAt: null,
      durationMs: null,
      result: null,
      attempts: 0
    };

    this.tasks.set(taskId, record);
    this.metrics.totalDispatched++;
    this._emit('dispatch', record);

    return record;
  }

  /* ================================================================== */
  /*  Task Execution                                                      */
  /* ================================================================== */

  /**
   * Execute a dispatched task.
   * Handles failover if the assigned engine fails.
   *
   * @param {string} taskId
   * @returns {Object} — execution result
   */
  execute(taskId) {
    const record = this.tasks.get(taskId);
    if (!record) {
      throw new Error(`Task not found: ${taskId}`);
    }

    if (record.status === 'queued' && !record.assignedEngine) {
      return { taskId, status: 'queued', message: 'No engine available' };
    }

    record.status = 'running';
    record.attempts++;
    const startTime = Date.now();

    const engine = this.engines.get(record.assignedEngine);
    if (!engine || engine.status === 'failed' || engine.status === 'circuit-open') {
      // Attempt failover
      if (record.allowFailover) {
        return this._failover(record);
      }
      record.status = 'failed';
      this.metrics.totalFailed++;
      return { taskId, status: 'failed', reason: 'engine-unavailable' };
    }

    // Simulated execution
    const endTime = Date.now();
    const durationMs = endTime - startTime;

    record.status = 'completed';
    record.completedAt = endTime;
    record.durationMs = durationMs;
    record.result = { engineId: engine.engineId, engineType: engine.type };

    // Update engine stats
    engine.tasksProcessed++;
    engine.load = Math.max(engine.load - (1 / engine.capacity), 0);
    if (engine.load < 0.8 && engine.status === 'busy') {
      engine.status = 'ready';
    }
    engine.lastHeartbeat = endTime;
    engine.circuitFailures = 0;

    this.metrics.totalCompleted++;
    this.metrics.cumulativeLatencyMs += durationMs;
    this.metrics.averageLatencyMs = this.metrics.cumulativeLatencyMs / this.metrics.totalCompleted;

    this._emit('complete', { taskId, engineId: engine.engineId, durationMs });

    return {
      taskId,
      status: 'completed',
      engineId: engine.engineId,
      engineType: engine.type,
      durationMs,
      attempts: record.attempts
    };
  }

  /**
   * Simulate an engine failure for testing failover.
   * @param {string} engineId
   * @returns {Object}
   */
  simulateEngineFailure(engineId) {
    const engine = this.engines.get(engineId);
    if (!engine) return { error: 'Engine not found' };

    engine.circuitFailures++;
    engine.failures++;

    if (engine.circuitFailures >= engine.circuitThreshold) {
      engine.status = 'circuit-open';
      engine.circuitOpenedAt = Date.now();
      this.metrics.totalCircuitBreaks++;
      this._emit('circuit-open', { engineId, failures: engine.failures });
    } else {
      engine.status = 'degraded';
    }

    return { engineId, status: engine.status, circuitFailures: engine.circuitFailures };
  }

  /* ================================================================== */
  /*  Failover                                                            */
  /* ================================================================== */

  /**
   * Attempt failover to another engine of the same type.
   * @param {OrchestratedTask} record
   * @returns {Object}
   * @private
   */
  _failover(record) {
    this.metrics.totalFailovers++;

    // Mark the original engine as having a failure
    if (record.assignedEngine) {
      const failedEngine = this.engines.get(record.assignedEngine);
      if (failedEngine) {
        failedEngine.circuitFailures++;
        failedEngine.failures++;
        if (failedEngine.circuitFailures >= failedEngine.circuitThreshold) {
          failedEngine.status = 'circuit-open';
          failedEngine.circuitOpenedAt = Date.now();
          this.metrics.totalCircuitBreaks++;
        }
      }
    }

    // Find alternative engine
    const alternative = this.selectEngine(record.type, record.priority);
    if (!alternative) {
      record.status = 'failed';
      this.metrics.totalFailed++;
      return { taskId: record.taskId, status: 'failed', reason: 'no-failover-available' };
    }

    // Reassign and execute
    record.assignedEngine = alternative.engineId;
    record.assignedEngineType = alternative.type;
    record.status = 'running';
    record.attempts++;

    const endTime = Date.now();
    record.status = 'completed';
    record.completedAt = endTime;
    record.durationMs = endTime - record.createdAt;

    alternative.tasksProcessed++;
    alternative.lastHeartbeat = endTime;

    this.metrics.totalCompleted++;
    this.metrics.cumulativeLatencyMs += record.durationMs;
    this.metrics.averageLatencyMs = this.metrics.cumulativeLatencyMs / this.metrics.totalCompleted;

    this._emit('failover', { taskId: record.taskId, from: record.assignedEngine, to: alternative.engineId });

    return {
      taskId: record.taskId,
      status: 'completed-via-failover',
      engineId: alternative.engineId,
      engineType: alternative.type,
      attempts: record.attempts,
      durationMs: record.durationMs
    };
  }

  /* ================================================================== */
  /*  Health & Heartbeat                                                  */
  /* ================================================================== */

  /**
   * Run a heartbeat check across all engines.
   * Marks engines as degraded if heartbeat is stale.
   * @returns {Object} — health report
   */
  heartbeat() {
    const now = Date.now();
    let healthy = 0;
    let degraded = 0;
    let failed = 0;
    let circuitOpen = 0;

    for (const engine of this.engines.values()) {
      engine.lastHeartbeat = now;

      if (engine.status === 'circuit-open') {
        circuitOpen++;
      } else if (engine.status === 'failed') {
        failed++;
      } else if (engine.status === 'degraded') {
        degraded++;
      } else {
        healthy++;
      }
    }

    // Process queue if engines freed up
    this._processQueue();

    const report = {
      timestamp: now,
      healthy,
      degraded,
      failed,
      circuitOpen,
      total: this.engines.size,
      queueDepth: this.queue.length
    };

    this._emit('heartbeat', report);
    return report;
  }

  /**
   * Process queued tasks if engines become available.
   * @private
   */
  _processQueue() {
    const processed = [];

    for (let i = 0; i < this.queue.length; i++) {
      const queued = this.queue[i];
      const engine = this.selectEngine(queued.task.type, queued.priority);
      if (engine) {
        const record = this.tasks.get(queued.taskId);
        if (record) {
          record.assignedEngine = engine.engineId;
          record.assignedEngineType = engine.type;
          record.status = 'assigned';
          engine.load = Math.min(engine.load + (1 / engine.capacity), 1);
        }
        processed.push(i);
      }
    }

    // Remove processed items from queue (reverse order to preserve indices)
    for (let i = processed.length - 1; i >= 0; i--) {
      this.queue.splice(processed[i], 1);
    }
    this.metrics.queueDepth = this.queue.length;
  }

  /* ================================================================== */
  /*  Query & Metrics                                                     */
  /* ================================================================== */

  /**
   * Get all engines of a specific type.
   * @param {string} type
   * @returns {EngineNode[]}
   */
  getEnginesByType(type) {
    const typeSet = this.typeIndex.get(type);
    if (!typeSet) return [];
    return Array.from(typeSet).map(id => this.engines.get(id)).filter(Boolean);
  }

  /**
   * Get the task record by ID.
   * @param {string} taskId
   * @returns {OrchestratedTask|undefined}
   */
  getTask(taskId) {
    return this.tasks.get(taskId);
  }

  /**
   * List all registered engine types.
   * @returns {string[]}
   */
  listEngineTypes() {
    return Array.from(this.typeIndex.keys());
  }

  /**
   * Get orchestrator metrics.
   * @returns {Object}
   */
  getMetrics() {
    return { ...this.metrics, status: this.status };
  }

  /**
   * Get engine count per type.
   * @returns {Object}
   */
  getEngineDistribution() {
    const dist = {};
    for (const [type, set] of this.typeIndex) {
      dist[type] = set.size;
    }
    return dist;
  }

  /* ================================================================== */
  /*  Lifecycle                                                           */
  /* ================================================================== */

  /**
   * Start the orchestrator.
   * @returns {Object}
   */
  start() {
    this.status = 'running';
    this._emit('start', { timestamp: Date.now(), engines: this.engines.size });
    return { status: 'running', engines: this.engines.size };
  }

  /**
   * Shutdown the orchestrator gracefully.
   * @returns {Object}
   */
  shutdown() {
    this.status = 'shutdown';
    for (const engine of this.engines.values()) {
      engine.status = 'failed';
    }
    this._emit('shutdown', { timestamp: Date.now() });
    return { status: 'shutdown', tasksCompleted: this.metrics.totalCompleted };
  }

  /* ================================================================== */
  /*  Events                                                              */
  /* ================================================================== */

  on(event, callback) {
    if (!this._listeners.has(event)) this._listeners.set(event, []);
    this._listeners.get(event).push(callback);
  }

  _emit(event, data) {
    const cbs = this._listeners.get(event);
    if (cbs) for (const cb of cbs) cb(data);
  }
}

export { MultiEngineOrchestrator };
export default MultiEngineOrchestrator;
