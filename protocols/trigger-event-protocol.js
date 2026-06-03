/**
 * PROTO-015: Trigger Event Protocol (TEP)
 * Event-driven trigger system with condition evaluation, compound triggers,
 * phi-weighted cooldowns, debouncing, and fire history tracking.
 *
 * Engines wired: TriggerRegistry + ConditionEvaluator + CompoundLogic + CooldownManager
 * Ring: Event Ring | Organism placement: Event / reaction layer
 * Wire: intelligence-wire/tep
 */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 2.399963229728653;
const HEARTBEAT = 873;

/**
 * @typedef {'armed'|'disarmed'|'cooldown'|'exhausted'} TriggerState
 */

/**
 * @typedef {Object} TriggerDef
 * @property {string} id - Trigger identifier
 * @property {string} name - Trigger name
 * @property {Function} condition - Predicate function: (event) => boolean
 * @property {Function} action - Action function: (event) => result
 * @property {TriggerState} state - Current trigger state
 * @property {number} priority - Trigger priority
 * @property {number} debounceMs - Debounce window in ms
 * @property {number} maxFires - Maximum number of times this trigger can fire (0 = unlimited)
 * @property {number} cooldownMs - Base cooldown between fires
 * @property {number} fireCount - Total times this trigger has fired
 * @property {number} consecutiveFires - Consecutive fires without cooldown reset
 * @property {number} lastFiredAt - Timestamp of last fire
 * @property {number} lastEvaluatedAt - Timestamp of last evaluation
 * @property {number} createdAt - Creation timestamp
 * @property {Object[]} history - Fire history
 */

/**
 * @typedef {Object} CompoundTrigger
 * @property {string} id - Compound trigger identifier
 * @property {string[]} triggerIds - Component trigger IDs
 * @property {'AND'|'OR'|'NOT'} operator - Logical operator
 * @property {TriggerState} state - Current state
 * @property {number} fireCount - Total fires
 * @property {Object[]} history - Fire history
 */

class TriggerEventProtocol {
  /**
   * @param {Object} config - Configuration
   * @param {number} [config.defaultDebounceMs=0] - Default debounce window in ms
   * @param {number} [config.defaultCooldownMs=0] - Default cooldown between fires
   * @param {number} [config.defaultPriority=5] - Default trigger priority
   * @param {number} [config.maxHistoryPerTrigger=100] - Max history entries per trigger
   * @param {number} [config.maxTriggers=500] - Max registered triggers
   */
  constructor(config = {}) {
    /** @type {Map<string, TriggerDef>} */
    this.triggers = new Map();
    /** @type {Map<string, CompoundTrigger>} */
    this.compoundTriggers = new Map();
    this.defaultDebounceMs = config.defaultDebounceMs || 0;
    this.defaultCooldownMs = config.defaultCooldownMs || 0;
    this.defaultPriority = config.defaultPriority || 5;
    this.maxHistoryPerTrigger = config.maxHistoryPerTrigger || 100;
    this.maxTriggers = config.maxTriggers || 500;
    this.eventLog = [];
    this.metrics = {
      totalEvaluations: 0,
      totalFires: 0,
      totalErrors: 0,
      totalEventsProcessed: 0,
      totalEvalTimeMs: 0,
      activeCount: 0
    };
  }

  /* ─── Logging ─── */

  /**
   * Log an internal event.
   * @param {string} type - Event type
   * @param {string} detail - Event detail
   */
  _log(type, detail) {
    this.eventLog.push({ type, detail, timestamp: Date.now() });
    if (this.eventLog.length > 10000) {
      this.eventLog = this.eventLog.slice(-5000);
    }
  }

  /* ─── Trigger Registration ─── */

  /**
   * Register a trigger with a condition/action pair and options.
   * @param {string} id - Unique trigger identifier
   * @param {string} name - Human-readable name
   * @param {Function} condition - Predicate function: (event) => boolean
   * @param {Function} action - Action function: (event) => result
   * @param {Object} [options={}] - { debounceMs, maxFires, cooldownMs, priority }
   * @returns {Object} - { id, name, state, registered }
   */
  registerTrigger(id, name, condition, action, options = {}) {
    if (this.triggers.has(id)) {
      return { id, name, state: null, registered: false, error: 'Trigger already exists' };
    }
    if (typeof condition !== 'function') {
      return { id, name, state: null, registered: false, error: 'Condition must be a function' };
    }
    if (typeof action !== 'function') {
      return { id, name, state: null, registered: false, error: 'Action must be a function' };
    }
    if (this.triggers.size >= this.maxTriggers) {
      return { id, name, state: null, registered: false, error: `Max triggers reached (${this.maxTriggers})` };
    }

    /** @type {TriggerDef} */
    const trigger = {
      id,
      name,
      condition,
      action,
      state: 'armed',
      priority: options.priority !== undefined ? options.priority : this.defaultPriority,
      debounceMs: options.debounceMs !== undefined ? options.debounceMs : this.defaultDebounceMs,
      maxFires: options.maxFires || 0,
      cooldownMs: options.cooldownMs !== undefined ? options.cooldownMs : this.defaultCooldownMs,
      fireCount: 0,
      consecutiveFires: 0,
      lastFiredAt: 0,
      lastEvaluatedAt: 0,
      createdAt: Date.now(),
      history: []
    };

    this.triggers.set(id, trigger);
    this._updateActiveCount();
    this._log('register', `Trigger "${name}" (${id}) registered with priority ${trigger.priority}`);
    return { id, name, state: trigger.state, priority: trigger.priority, registered: true };
  }

  /* ─── Arm / Disarm ─── */

  /**
   * Arm (enable) a trigger.
   * @param {string} triggerId - Trigger identifier
   * @returns {Object} - { triggerId, state }
   */
  arm(triggerId) {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) return { triggerId, state: null, error: 'Trigger not found' };

    if (trigger.maxFires > 0 && trigger.fireCount >= trigger.maxFires) {
      trigger.state = 'exhausted';
      return { triggerId, state: 'exhausted', error: 'Trigger exhausted' };
    }

    trigger.state = 'armed';
    trigger.consecutiveFires = 0;
    this._updateActiveCount();
    this._log('arm', `Trigger "${trigger.name}" armed`);
    return { triggerId, state: 'armed' };
  }

  /**
   * Disarm (disable) a trigger.
   * @param {string} triggerId - Trigger identifier
   * @returns {Object} - { triggerId, state }
   */
  disarm(triggerId) {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) return { triggerId, state: null, error: 'Trigger not found' };

    trigger.state = 'disarmed';
    this._updateActiveCount();
    this._log('disarm', `Trigger "${trigger.name}" disarmed`);
    return { triggerId, state: 'disarmed' };
  }

  /**
   * Arm all registered triggers.
   * @returns {Object} - { armedCount }
   */
  armAll() {
    let armedCount = 0;
    for (const [id, trigger] of this.triggers) {
      if (trigger.maxFires > 0 && trigger.fireCount >= trigger.maxFires) {
        trigger.state = 'exhausted';
      } else {
        trigger.state = 'armed';
        trigger.consecutiveFires = 0;
        armedCount++;
      }
    }
    this._updateActiveCount();
    this._log('arm-all', `${armedCount} triggers armed`);
    return { armedCount };
  }

  /**
   * Disarm all registered triggers.
   * @returns {Object} - { disarmedCount }
   */
  disarmAll() {
    let disarmedCount = 0;
    for (const trigger of this.triggers.values()) {
      trigger.state = 'disarmed';
      disarmedCount++;
    }
    this._updateActiveCount();
    this._log('disarm-all', `${disarmedCount} triggers disarmed`);
    return { disarmedCount };
  }

  /* ─── Cooldown Computation ─── */

  /**
   * Compute phi-weighted cooldown for a trigger.
   * Actual cooldown = baseCooldown × PHI^(consecutiveFires)
   * @param {TriggerDef} trigger
   * @returns {number} - Cooldown in ms
   */
  _computePhiCooldown(trigger) {
    if (trigger.cooldownMs <= 0) return 0;
    return trigger.cooldownMs * Math.pow(PHI, trigger.consecutiveFires);
  }

  /**
   * Check if a trigger is in cooldown period.
   * @param {TriggerDef} trigger
   * @returns {boolean}
   */
  _isInCooldown(trigger) {
    if (trigger.cooldownMs <= 0 || trigger.lastFiredAt === 0) return false;
    const phiCooldown = this._computePhiCooldown(trigger);
    return (Date.now() - trigger.lastFiredAt) < phiCooldown;
  }

  /**
   * Check if a trigger is within its debounce window.
   * @param {TriggerDef} trigger
   * @returns {boolean}
   */
  _isDebounced(trigger) {
    if (trigger.debounceMs <= 0 || trigger.lastFiredAt === 0) return false;
    return (Date.now() - trigger.lastFiredAt) < trigger.debounceMs;
  }

  /* ─── Event Evaluation ─── */

  /**
   * Evaluate all armed triggers against an event.
   * Triggers whose conditions match are fired in priority order.
   * @param {*} event - Event data to evaluate
   * @returns {Object} - { event, fired, skipped, errors, totalEvalTimeMs }
   */
  evaluate(event) {
    const evalStart = Date.now();
    this.metrics.totalEventsProcessed++;

    // Collect all armed triggers, sorted by priority descending
    const candidates = [];
    for (const [id, trigger] of this.triggers) {
      if (trigger.state !== 'armed') continue;
      candidates.push(trigger);
    }
    candidates.sort((a, b) => b.priority - a.priority);

    // Also check compound triggers
    const compoundCandidates = [];
    for (const [id, compound] of this.compoundTriggers) {
      if (compound.state !== 'armed') continue;
      compoundCandidates.push(compound);
    }

    const fired = [];
    const skipped = [];
    const errors = [];

    // Evaluate simple triggers
    for (const trigger of candidates) {
      this.metrics.totalEvaluations++;
      trigger.lastEvaluatedAt = Date.now();

      // Check debounce
      if (this._isDebounced(trigger)) {
        skipped.push({ id: trigger.id, reason: 'debounced' });
        continue;
      }

      // Check cooldown
      if (this._isInCooldown(trigger)) {
        skipped.push({ id: trigger.id, reason: 'cooldown', cooldownRemaining: this._computePhiCooldown(trigger) - (Date.now() - trigger.lastFiredAt) });
        continue;
      }

      // Check max fires
      if (trigger.maxFires > 0 && trigger.fireCount >= trigger.maxFires) {
        trigger.state = 'exhausted';
        skipped.push({ id: trigger.id, reason: 'exhausted' });
        continue;
      }

      // Evaluate condition
      let conditionMet = false;
      try {
        conditionMet = trigger.condition(event);
      } catch (err) {
        errors.push({ id: trigger.id, phase: 'condition', error: err.message });
        this.metrics.totalErrors++;
        continue;
      }

      if (!conditionMet) continue;

      // Fire action
      try {
        const result = trigger.action(event);
        trigger.fireCount++;
        trigger.consecutiveFires++;
        trigger.lastFiredAt = Date.now();
        this.metrics.totalFires++;

        const historyEntry = {
          event: typeof event === 'object' ? { ...event } : event,
          result,
          firedAt: trigger.lastFiredAt,
          consecutiveFire: trigger.consecutiveFires,
          phiCooldown: this._computePhiCooldown(trigger)
        };
        trigger.history.push(historyEntry);
        if (trigger.history.length > this.maxHistoryPerTrigger) {
          trigger.history = trigger.history.slice(-this.maxHistoryPerTrigger);
        }

        fired.push({
          id: trigger.id,
          name: trigger.name,
          result,
          priority: trigger.priority,
          fireCount: trigger.fireCount,
          nextCooldownMs: this._computePhiCooldown(trigger)
        });
      } catch (err) {
        errors.push({ id: trigger.id, phase: 'action', error: err.message });
        this.metrics.totalErrors++;
      }
    }

    // Evaluate compound triggers
    for (const compound of compoundCandidates) {
      const compoundResult = this._evaluateCompound(compound, event);
      if (compoundResult.fired) {
        compound.fireCount++;
        compound.history.push({
          event: typeof event === 'object' ? { ...event } : event,
          firedAt: Date.now(),
          operator: compound.operator
        });
        if (compound.history.length > this.maxHistoryPerTrigger) {
          compound.history = compound.history.slice(-this.maxHistoryPerTrigger);
        }
        fired.push({
          id: compound.id,
          name: `compound-${compound.operator}`,
          result: compoundResult,
          priority: 0,
          fireCount: compound.fireCount,
          isCompound: true
        });
      }
    }

    const totalEvalTimeMs = Date.now() - evalStart;
    this.metrics.totalEvalTimeMs += totalEvalTimeMs;
    this._updateActiveCount();

    this._log('evaluate', `Event evaluated: ${fired.length} fired, ${skipped.length} skipped, ${errors.length} errors (${totalEvalTimeMs}ms)`);

    return { event, fired, skipped, errors, totalEvalTimeMs };
  }

  /* ─── Compound Triggers ─── */

  /**
   * Create a compound trigger from multiple triggers with a logical operator.
   * AND: all component conditions must be true.
   * OR: at least one component condition must be true.
   * NOT: none of the component conditions must be true.
   * @param {string[]} triggerIds - Component trigger IDs
   * @param {'AND'|'OR'|'NOT'} operator - Logical operator
   * @returns {Object} - { id, triggerIds, operator, created }
   */
  createCompound(triggerIds, operator = 'AND') {
    const validOps = ['AND', 'OR', 'NOT'];
    if (!validOps.includes(operator)) {
      return { id: null, error: `Invalid operator: ${operator}. Use AND, OR, or NOT` };
    }

    for (const tid of triggerIds) {
      if (!this.triggers.has(tid)) {
        return { id: null, error: `Trigger ${tid} not found` };
      }
    }

    const compoundId = `compound-${operator.toLowerCase()}-${triggerIds.join('+')}`;

    /** @type {CompoundTrigger} */
    const compound = {
      id: compoundId,
      triggerIds: [...triggerIds],
      operator,
      state: 'armed',
      fireCount: 0,
      history: []
    };

    this.compoundTriggers.set(compoundId, compound);
    this._log('compound', `Compound trigger ${compoundId} created (${operator}: ${triggerIds.join(', ')})`);
    return { id: compoundId, triggerIds: compound.triggerIds, operator, created: true };
  }

  /**
   * Evaluate a compound trigger against an event.
   * @param {CompoundTrigger} compound
   * @param {*} event
   * @returns {Object} - { fired, results }
   */
  _evaluateCompound(compound, event) {
    const results = [];
    for (const tid of compound.triggerIds) {
      const trigger = this.triggers.get(tid);
      if (!trigger) {
        results.push({ id: tid, met: false, error: 'not-found' });
        continue;
      }
      try {
        const met = trigger.condition(event);
        results.push({ id: tid, met });
      } catch (err) {
        results.push({ id: tid, met: false, error: err.message });
      }
    }

    let fired = false;
    const metResults = results.filter(r => r.met);

    switch (compound.operator) {
      case 'AND':
        fired = metResults.length === compound.triggerIds.length;
        break;
      case 'OR':
        fired = metResults.length > 0;
        break;
      case 'NOT':
        fired = metResults.length === 0;
        break;
    }

    return { fired, results, operator: compound.operator };
  }

  /* ─── Fire History ─── */

  /**
   * Get fire history for a trigger.
   * @param {string} triggerId - Trigger identifier
   * @returns {Object} - { triggerId, history, fireCount }
   */
  getFireHistory(triggerId) {
    const trigger = this.triggers.get(triggerId);
    if (trigger) {
      return { triggerId, history: [...trigger.history], fireCount: trigger.fireCount };
    }

    const compound = this.compoundTriggers.get(triggerId);
    if (compound) {
      return { triggerId, history: [...compound.history], fireCount: compound.fireCount };
    }

    return { triggerId, history: [], fireCount: 0, error: 'Trigger not found' };
  }

  /* ─── Active Count ─── */

  /**
   * Update the active trigger count.
   */
  _updateActiveCount() {
    let count = 0;
    for (const trigger of this.triggers.values()) {
      if (trigger.state === 'armed') count++;
    }
    for (const compound of this.compoundTriggers.values()) {
      if (compound.state === 'armed') count++;
    }
    this.metrics.activeCount = count;
  }

  /* ─── Diagnostics ─── */

  /**
   * Get trigger system metrics.
   * @returns {Object} - { totalFires, avgEvalTime, activeCount, totalTriggers, ... }
   */
  getMetrics() {
    const totalEvals = this.metrics.totalEventsProcessed;
    return {
      totalTriggers: this.triggers.size,
      totalCompoundTriggers: this.compoundTriggers.size,
      activeCount: this.metrics.activeCount,
      totalFires: this.metrics.totalFires,
      totalEvaluations: this.metrics.totalEvaluations,
      totalEventsProcessed: totalEvals,
      totalErrors: this.metrics.totalErrors,
      avgEvalTime: totalEvals > 0 ? this.metrics.totalEvalTimeMs / totalEvals : 0,
      heartbeatInterval: HEARTBEAT,
      goldenAngle: GOLDEN_ANGLE,
      phiConstant: PHI
    };
  }

  /**
   * Get recent event log entries.
   * @param {number} [count=50] - Number of recent events
   * @returns {Object[]} - Recent events
   */
  getRecentEvents(count = 50) {
    return this.eventLog.slice(-count);
  }

  /**
   * List all registered triggers.
   * @returns {Object[]} - Array of trigger summaries
   */
  listTriggers() {
    const result = [];
    for (const [id, trigger] of this.triggers) {
      result.push({
        id,
        name: trigger.name,
        state: trigger.state,
        priority: trigger.priority,
        fireCount: trigger.fireCount,
        maxFires: trigger.maxFires,
        cooldownMs: trigger.cooldownMs,
        currentPhiCooldown: this._computePhiCooldown(trigger),
        debounceMs: trigger.debounceMs
      });
    }
    return result;
  }
}

export { TriggerEventProtocol };
export default TriggerEventProtocol;
