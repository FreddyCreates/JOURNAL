/**
 * LifecycleHook — hooks into organism lifecycle phases for interception and augmentation.
 *
 * Registers handlers at specific lifecycle phases and fires them in
 * phi-weighted priority order, enabling deterministic orchestration
 * of boot, init, ready, run, pause, resume, and shutdown sequences.
 */
export class LifecycleHook {
  /** @type {number} Golden ratio constant for priority weighting */
  static PHI = 1.618033988749895;

  /** @type {string[]} Valid lifecycle phases */
  static PHASES = ['boot', 'init', 'ready', 'run', 'pause', 'resume', 'shutdown'];

  /** @type {Map<string, Array<{hookId: string, phase: string, handler: function, priority: number, bypassed: boolean, execCount: number, totalMs: number}>>} */
  #hooks;

  /** @type {Map<string, {hookId: string, phase: string, timestamp: number, durationMs: number, success: boolean}>} */
  #executionLog;

  /** @type {number} */
  #totalFires;

  constructor() {
    this.#hooks = new Map();
    this.#executionLog = new Map();
    this.#totalFires = 0;

    for (const phase of LifecycleHook.PHASES) {
      this.#hooks.set(phase, []);
    }
  }

  /**
   * Registers a hook handler for a specific lifecycle phase.
   * @param {string} hookId - Unique hook identifier
   * @param {string} phase - Lifecycle phase: 'boot'|'init'|'ready'|'run'|'pause'|'resume'|'shutdown'
   * @param {function} handler - Handler function receiving context object
   * @param {number} [priority=1] - Base priority (phi-weighted during ordering)
   * @returns {{hookId: string, phase: string, effectivePriority: number}}
   */
  register(hookId, phase, handler, priority = 1) {
    if (!LifecycleHook.PHASES.includes(phase)) {
      throw new Error(`Invalid phase "${phase}". Valid phases: ${LifecycleHook.PHASES.join(', ')}`);
    }
    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be a function');
    }

    const chain = this.#hooks.get(phase);
    const existing = chain.find(h => h.hookId === hookId);
    if (existing) {
      throw new Error(`Hook "${hookId}" is already registered for phase "${phase}"`);
    }

    const effectivePriority = priority * LifecycleHook.PHI;
    const entry = {
      hookId,
      phase,
      handler,
      priority: effectivePriority,
      bypassed: false,
      execCount: 0,
      totalMs: 0,
    };

    chain.push(entry);
    chain.sort((a, b) => b.priority - a.priority);

    return { hookId, phase, effectivePriority };
  }

  /**
   * Fires all hooks for a lifecycle phase in priority order.
   * Bypassed hooks are skipped. Each handler receives the context object.
   * @param {string} phase - Lifecycle phase to fire
   * @param {Object} [context={}] - Context data passed to each handler
   * @returns {{phase: string, fired: number, skipped: number, totalMs: number, results: Array<{hookId: string, durationMs: number, success: boolean}>}}
   */
  async fire(phase, context = {}) {
    if (!LifecycleHook.PHASES.includes(phase)) {
      throw new Error(`Invalid phase "${phase}". Valid phases: ${LifecycleHook.PHASES.join(', ')}`);
    }

    const chain = this.#hooks.get(phase);
    const results = [];
    let fired = 0;
    let skipped = 0;
    const fireStart = Date.now();
    this.#totalFires++;

    for (const entry of chain) {
      if (entry.bypassed) {
        skipped++;
        continue;
      }

      const hookStart = Date.now();
      let success = true;

      try {
        await entry.handler({ ...context, phase, hookId: entry.hookId });
      } catch (err) {
        success = false;
        console.error(`[LifecycleHook] Error in hook "${entry.hookId}" during "${phase}":`, err);
      }

      const durationMs = Date.now() - hookStart;
      entry.execCount++;
      entry.totalMs += durationMs;
      fired++;

      const logEntry = {
        hookId: entry.hookId,
        phase,
        timestamp: hookStart,
        durationMs,
        success,
      };
      this.#executionLog.set(`${entry.hookId}:${hookStart}`, logEntry);
      results.push({ hookId: entry.hookId, durationMs, success });
    }

    const totalMs = Date.now() - fireStart;
    return { phase, fired, skipped, totalMs, results };
  }

  /**
   * Returns the ordered hook chain for a given phase.
   * @param {string} phase - Lifecycle phase
   * @returns {Array<{hookId: string, priority: number, bypassed: boolean, execCount: number}>}
   */
  getChain(phase) {
    if (!LifecycleHook.PHASES.includes(phase)) {
      throw new Error(`Invalid phase "${phase}". Valid phases: ${LifecycleHook.PHASES.join(', ')}`);
    }

    return this.#hooks.get(phase).map(entry => ({
      hookId: entry.hookId,
      priority: entry.priority,
      bypassed: entry.bypassed,
      execCount: entry.execCount,
    }));
  }

  /**
   * Temporarily bypasses a hook so it is skipped during fire().
   * @param {string} hookId - Hook identifier to bypass
   * @returns {boolean} True if the hook was found and bypassed
   */
  bypass(hookId) {
    for (const chain of this.#hooks.values()) {
      const entry = chain.find(h => h.hookId === hookId);
      if (entry) {
        entry.bypassed = true;
        return true;
      }
    }
    return false;
  }

  /**
   * Restores a previously bypassed hook.
   * @param {string} hookId - Hook identifier to restore
   * @returns {boolean} True if the hook was found and restored
   */
  restore(hookId) {
    for (const chain of this.#hooks.values()) {
      const entry = chain.find(h => h.hookId === hookId);
      if (entry) {
        entry.bypassed = false;
        return true;
      }
    }
    return false;
  }

  /**
   * Returns hook execution statistics.
   * @returns {{totalFires: number, hookCount: number, avgExecMs: number, byPhase: Object<string, {count: number, avgMs: number}>}}
   */
  getMetrics() {
    let hookCount = 0;
    let totalExecMs = 0;
    let totalExecCount = 0;
    const byPhase = {};

    for (const [phase, chain] of this.#hooks.entries()) {
      let phaseMs = 0;
      let phaseCount = 0;

      for (const entry of chain) {
        hookCount++;
        totalExecMs += entry.totalMs;
        totalExecCount += entry.execCount;
        phaseMs += entry.totalMs;
        phaseCount += entry.execCount;
      }

      byPhase[phase] = {
        count: phaseCount,
        avgMs: phaseCount > 0 ? phaseMs / phaseCount : 0,
      };
    }

    return {
      totalFires: this.#totalFires,
      hookCount,
      avgExecMs: totalExecCount > 0 ? totalExecMs / totalExecCount : 0,
      byPhase,
    };
  }
}

export default LifecycleHook;
