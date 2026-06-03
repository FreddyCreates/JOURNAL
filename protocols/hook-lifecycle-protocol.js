/**
 * PROTO-014: Hook Lifecycle Protocol (HLP)
 * Lifecycle hook system for organism event interception with phi-weighted priority queues.
 * Supports hook registration across lifecycle phases, before/after interceptors,
 * priority-ordered triggering, and execution metrics.
 *
 * Engines wired: HookRegistry + PriorityQueue + InterceptorChain + PhaseManager
 * Ring: Lifecycle Ring | Organism placement: Event / interception layer
 * Wire: intelligence-wire/hlp
 */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 2.399963229728653;
const HEARTBEAT = 873;

/**
 * @typedef {'pre-init'|'init'|'ready'|'active'|'idle'|'pre-shutdown'|'shutdown'|'post-shutdown'} LifecyclePhase
 */

/**
 * @typedef {Object} HookDef
 * @property {string} id - Hook identifier
 * @property {string} name - Hook name
 * @property {LifecyclePhase} phase - Lifecycle phase this hook attaches to
 * @property {Function} handler - Hook handler function: (context) => result
 * @property {number} priority - Declared priority (higher = more important)
 * @property {number} effectivePriority - Computed phi-weighted priority
 * @property {number} createdAt - Creation timestamp
 * @property {number} executionCount - Total times this hook has been triggered
 * @property {number} totalLatencyMs - Cumulative execution latency
 * @property {boolean} enabled - Whether the hook is active
 */

/**
 * @typedef {Object} InterceptorDef
 * @property {string} id - Interceptor identifier
 * @property {LifecyclePhase} phase - Phase to intercept
 * @property {'before'|'after'} position - Before or after the phase hooks
 * @property {Function} handler - Interceptor handler
 * @property {number} createdAt - Creation timestamp
 */

class HookLifecycleProtocol {
  /**
   * @param {Object} config - Configuration
   * @param {number} [config.maxHooksPerPhase=100] - Max hooks per lifecycle phase
   * @param {number} [config.defaultPriority=5] - Default hook priority
   * @param {boolean} [config.continueOnError=true] - Continue triggering hooks if one fails
   */
  constructor(config = {}) {
    /** @type {Map<string, HookDef>} */
    this.hooks = new Map();
    /** @type {Map<LifecyclePhase, string[]>} */
    this.phaseHooks = new Map();
    /** @type {InterceptorDef[]} */
    this.beforeInterceptors = [];
    /** @type {InterceptorDef[]} */
    this.afterInterceptors = [];
    this.maxHooksPerPhase = config.maxHooksPerPhase || 100;
    this.defaultPriority = config.defaultPriority || 5;
    this.continueOnError = config.continueOnError !== undefined ? config.continueOnError : true;
    this.interceptorCounter = 0;
    this.eventLog = [];
    this.metrics = {
      totalTriggered: 0,
      totalHookExecutions: 0,
      totalErrors: 0,
      totalInterceptions: 0,
      totalLatencyMs: 0,
      phaseStats: {}
    };

    // Initialize phase hook lists
    const phases = ['pre-init', 'init', 'ready', 'active', 'idle', 'pre-shutdown', 'shutdown', 'post-shutdown'];
    for (const phase of phases) {
      this.phaseHooks.set(phase, []);
      this.metrics.phaseStats[phase] = { triggered: 0, errors: 0, totalLatencyMs: 0 };
    }
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

  /* ─── Priority Computation ─── */

  /**
   * Compute effective priority using phi-weighted decay.
   * Effective priority = declared × PHI^(-(orderIndex))
   * Hooks registered earlier at the same priority get a slight phi-boost.
   * @param {number} declared - Declared priority value
   * @param {number} orderIndex - Registration order index within the phase
   * @returns {number} - Effective priority
   */
  _computeEffectivePriority(declared, orderIndex) {
    return declared * Math.pow(PHI, -(orderIndex));
  }

  /**
   * Recompute effective priorities for all hooks in a phase and sort.
   * @param {LifecyclePhase} phase
   */
  _recomputePhaseOrder(phase) {
    const hookIds = this.phaseHooks.get(phase);
    if (!hookIds) return;

    // Compute effective priorities
    const withPriority = hookIds.map((hid, index) => {
      const hook = this.hooks.get(hid);
      if (hook) {
        hook.effectivePriority = this._computeEffectivePriority(hook.priority, index);
      }
      return { id: hid, effectivePriority: hook ? hook.effectivePriority : 0 };
    });

    // Sort by effective priority descending
    withPriority.sort((a, b) => b.effectivePriority - a.effectivePriority);
    this.phaseHooks.set(phase, withPriority.map(wp => wp.id));
  }

  /* ─── Hook Registration ─── */

  /**
   * Register a hook at a specific lifecycle phase.
   * @param {string} id - Unique hook identifier
   * @param {string} name - Human-readable name
   * @param {LifecyclePhase} phase - Lifecycle phase to attach to
   * @param {Function} handler - Handler function: (context) => result
   * @param {number} [priority] - Priority (higher = more important)
   * @returns {Object} - { id, name, phase, priority, effectivePriority, registered }
   */
  registerHook(id, name, phase, handler, priority) {
    if (this.hooks.has(id)) {
      return { id, name, phase, registered: false, error: 'Hook already exists' };
    }
    if (typeof handler !== 'function') {
      return { id, name, phase, registered: false, error: 'Handler must be a function' };
    }
    if (!this.phaseHooks.has(phase)) {
      return { id, name, phase, registered: false, error: `Invalid phase: ${phase}` };
    }

    const phaseList = this.phaseHooks.get(phase);
    if (phaseList.length >= this.maxHooksPerPhase) {
      return { id, name, phase, registered: false, error: `Max hooks reached for phase ${phase}` };
    }

    const declaredPriority = priority !== undefined ? priority : this.defaultPriority;
    const orderIndex = phaseList.length;
    const effectivePriority = this._computeEffectivePriority(declaredPriority, orderIndex);

    /** @type {HookDef} */
    const hook = {
      id,
      name,
      phase,
      handler,
      priority: declaredPriority,
      effectivePriority,
      createdAt: Date.now(),
      executionCount: 0,
      totalLatencyMs: 0,
      enabled: true
    };

    this.hooks.set(id, hook);
    phaseList.push(id);
    this._recomputePhaseOrder(phase);

    this._log('register', `Hook "${name}" (${id}) registered at phase ${phase} with priority ${declaredPriority}`);
    return { id, name, phase, priority: declaredPriority, effectivePriority, registered: true };
  }

  /* ─── Hook Removal ─── */

  /**
   * Remove a hook by ID.
   * @param {string} id - Hook identifier
   * @returns {Object} - { id, removed }
   */
  removeHook(id) {
    const hook = this.hooks.get(id);
    if (!hook) {
      return { id, removed: false, error: 'Hook not found' };
    }

    // Remove from phase list
    const phaseList = this.phaseHooks.get(hook.phase);
    if (phaseList) {
      const idx = phaseList.indexOf(id);
      if (idx !== -1) {
        phaseList.splice(idx, 1);
      }
      this._recomputePhaseOrder(hook.phase);
    }

    this.hooks.delete(id);
    this._log('remove', `Hook "${hook.name}" (${id}) removed from phase ${hook.phase}`);
    return { id, removed: true, phase: hook.phase };
  }

  /* ─── Interceptors ─── */

  /**
   * Add a before-interceptor for a lifecycle phase.
   * Before-interceptors run before any phase hooks.
   * @param {LifecyclePhase} phase - Phase to intercept
   * @param {Function} interceptor - Interceptor handler: (context) => context
   * @returns {Object} - { interceptorId, phase, position }
   */
  interceptBefore(phase, interceptor) {
    if (!this.phaseHooks.has(phase)) {
      return { interceptorId: null, error: `Invalid phase: ${phase}` };
    }
    if (typeof interceptor !== 'function') {
      return { interceptorId: null, error: 'Interceptor must be a function' };
    }

    this.interceptorCounter++;
    const interceptorId = `before-${phase}-${this.interceptorCounter}`;

    this.beforeInterceptors.push({
      id: interceptorId,
      phase,
      position: 'before',
      handler: interceptor,
      createdAt: Date.now()
    });

    this._log('interceptor', `Before-interceptor ${interceptorId} added for phase ${phase}`);
    return { interceptorId, phase, position: 'before' };
  }

  /**
   * Add an after-interceptor for a lifecycle phase.
   * After-interceptors run after all phase hooks.
   * @param {LifecyclePhase} phase - Phase to intercept
   * @param {Function} interceptor - Interceptor handler: (context, results) => void
   * @returns {Object} - { interceptorId, phase, position }
   */
  interceptAfter(phase, interceptor) {
    if (!this.phaseHooks.has(phase)) {
      return { interceptorId: null, error: `Invalid phase: ${phase}` };
    }
    if (typeof interceptor !== 'function') {
      return { interceptorId: null, error: 'Interceptor must be a function' };
    }

    this.interceptorCounter++;
    const interceptorId = `after-${phase}-${this.interceptorCounter}`;

    this.afterInterceptors.push({
      id: interceptorId,
      phase,
      position: 'after',
      handler: interceptor,
      createdAt: Date.now()
    });

    this._log('interceptor', `After-interceptor ${interceptorId} added for phase ${phase}`);
    return { interceptorId, phase, position: 'after' };
  }

  /* ─── Trigger Phase ─── */

  /**
   * Trigger all hooks for a lifecycle phase in priority order.
   * Runs before-interceptors, then hooks, then after-interceptors.
   * @param {LifecyclePhase} phase - Phase to trigger
   * @param {*} context - Context data passed to each hook
   * @returns {Object} - { phase, results, errors, totalLatencyMs }
   */
  trigger(phase, context) {
    if (!this.phaseHooks.has(phase)) {
      return { phase, results: [], errors: [], totalLatencyMs: 0, error: `Invalid phase: ${phase}` };
    }

    const triggerStart = Date.now();
    this.metrics.totalTriggered++;
    let currentContext = context;

    // Run before-interceptors
    const beforeInterceptorsForPhase = this.beforeInterceptors.filter(i => i.phase === phase);
    for (const interceptor of beforeInterceptorsForPhase) {
      try {
        const interceptResult = interceptor.handler(currentContext);
        if (interceptResult !== undefined) {
          currentContext = interceptResult;
        }
        this.metrics.totalInterceptions++;
      } catch (err) {
        this._log('interceptor-error', `Before-interceptor ${interceptor.id} error: ${err.message}`);
      }
    }

    // Run hooks in priority order
    const hookIds = this.phaseHooks.get(phase);
    const results = [];
    const errors = [];

    for (const hid of hookIds) {
      const hook = this.hooks.get(hid);
      if (!hook || !hook.enabled) continue;

      const hookStart = Date.now();
      try {
        const result = hook.handler(currentContext);
        const hookLatency = Date.now() - hookStart;

        hook.executionCount++;
        hook.totalLatencyMs += hookLatency;
        this.metrics.totalHookExecutions++;

        results.push({
          hookId: hid,
          name: hook.name,
          result,
          latencyMs: hookLatency,
          effectivePriority: hook.effectivePriority
        });
      } catch (err) {
        const hookLatency = Date.now() - hookStart;
        errors.push({
          hookId: hid,
          name: hook.name,
          error: err.message,
          latencyMs: hookLatency
        });
        this.metrics.totalErrors++;
        this._log('hook-error', `Hook "${hook.name}" (${hid}) error: ${err.message}`);

        if (!this.continueOnError) break;
      }
    }

    // Run after-interceptors
    const afterInterceptorsForPhase = this.afterInterceptors.filter(i => i.phase === phase);
    for (const interceptor of afterInterceptorsForPhase) {
      try {
        interceptor.handler(currentContext, results);
        this.metrics.totalInterceptions++;
      } catch (err) {
        this._log('interceptor-error', `After-interceptor ${interceptor.id} error: ${err.message}`);
      }
    }

    const totalLatencyMs = Date.now() - triggerStart;
    this.metrics.totalLatencyMs += totalLatencyMs;

    // Update phase stats
    const phaseStats = this.metrics.phaseStats[phase];
    if (phaseStats) {
      phaseStats.triggered++;
      phaseStats.errors += errors.length;
      phaseStats.totalLatencyMs += totalLatencyMs;
    }

    this._log('trigger', `Phase ${phase}: ${results.length} hooks executed, ${errors.length} errors (${totalLatencyMs}ms)`);

    return { phase, results, errors, totalLatencyMs, context: currentContext };
  }

  /* ─── Hook Chain Inspection ─── */

  /**
   * Get the ordered chain of hooks for a phase.
   * @param {LifecyclePhase} phase - Phase to inspect
   * @returns {Object} - { phase, chain }
   */
  getHookChain(phase) {
    if (!this.phaseHooks.has(phase)) {
      return { phase, chain: [], error: `Invalid phase: ${phase}` };
    }

    const hookIds = this.phaseHooks.get(phase);
    const chain = hookIds.map((hid, index) => {
      const hook = this.hooks.get(hid);
      if (!hook) return null;
      return {
        position: index,
        id: hook.id,
        name: hook.name,
        priority: hook.priority,
        effectivePriority: hook.effectivePriority,
        enabled: hook.enabled,
        executionCount: hook.executionCount,
        avgLatencyMs: hook.executionCount > 0 ? hook.totalLatencyMs / hook.executionCount : 0
      };
    }).filter(Boolean);

    return { phase, chain, hookCount: chain.length };
  }

  /* ─── Diagnostics ─── */

  /**
   * Get hook execution metrics.
   * @returns {Object} - Metrics snapshot
   */
  getMetrics() {
    const totalHooks = this.hooks.size;
    const enabledHooks = [...this.hooks.values()].filter(h => h.enabled).length;

    return {
      totalHooks,
      enabledHooks,
      totalTriggered: this.metrics.totalTriggered,
      totalHookExecutions: this.metrics.totalHookExecutions,
      totalErrors: this.metrics.totalErrors,
      totalInterceptions: this.metrics.totalInterceptions,
      avgLatencyMs: this.metrics.totalTriggered > 0 ? this.metrics.totalLatencyMs / this.metrics.totalTriggered : 0,
      phaseStats: { ...this.metrics.phaseStats },
      beforeInterceptorCount: this.beforeInterceptors.length,
      afterInterceptorCount: this.afterInterceptors.length,
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
}

export { HookLifecycleProtocol };
export default HookLifecycleProtocol;
