/**
 * StateTrigger — triggers actions based on organism state transitions.
 *
 * Maintains a registry of state transition triggers with optional guard
 * conditions. Evaluates current vs. previous state and fires matching
 * actions. Supports wildcard transitions and full matrix introspection.
 */
export class StateTrigger {
  /** @type {number} Golden ratio for transition weight calculations */
  static PHI = 1.618033988749895;

  /** @type {Map<string, {triggerId: string, fromState: string, toState: string, action: function, guard: function|null, fireCount: number, lastFired: number, totalMs: number, enabled: boolean}>} */
  #triggers;

  /** @type {Array<{triggerId: string, fromState: string, toState: string, timestamp: number, durationMs: number, guardPassed: boolean}>} */
  #transitionLog;

  /** @type {Set<string>} All known states */
  #knownStates;

  /** @type {string|null} */
  #currentState;

  constructor() {
    this.#triggers = new Map();
    this.#transitionLog = [];
    this.#knownStates = new Set();
    this.#currentState = null;
  }

  /**
   * Registers a state transition trigger.
   * @param {string} triggerId - Unique trigger identifier
   * @param {string} fromState - Source state (use '*' for any state)
   * @param {string} toState - Target state (use '*' for any state)
   * @param {function} action - Action to execute: ({fromState, toState, triggerId}) => result
   * @returns {{triggerId: string, fromState: string, toState: string, weight: number}}
   */
  register(triggerId, fromState, toState, action) {
    if (typeof action !== 'function') {
      throw new TypeError('Action must be a function');
    }
    if (this.#triggers.has(triggerId)) {
      throw new Error(`Trigger "${triggerId}" is already registered`);
    }

    const specificity = (fromState === '*' ? 0 : 1) + (toState === '*' ? 0 : 1);
    const weight = specificity * StateTrigger.PHI;

    this.#triggers.set(triggerId, {
      triggerId,
      fromState,
      toState,
      action,
      guard: null,
      fireCount: 0,
      lastFired: 0,
      totalMs: 0,
      enabled: true,
    });

    if (fromState !== '*') this.#knownStates.add(fromState);
    if (toState !== '*') this.#knownStates.add(toState);

    return { triggerId, fromState, toState, weight };
  }

  /**
   * Evaluates all triggers against a state transition and fires matching actions.
   * Triggers are evaluated in specificity order (most specific first, phi-weighted).
   * @param {string} currentState - Current organism state
   * @param {string} previousState - Previous organism state
   * @returns {Promise<{transitionFrom: string, transitionTo: string, triggered: number, skipped: number, results: Array<{triggerId: string, durationMs: number, success: boolean}>}>}
   */
  async evaluate(currentState, previousState) {
    this.#currentState = currentState;
    this.#knownStates.add(currentState);
    this.#knownStates.add(previousState);

    const matching = [];
    for (const trigger of this.#triggers.values()) {
      if (!trigger.enabled) continue;

      const fromMatch = trigger.fromState === '*' || trigger.fromState === previousState;
      const toMatch = trigger.toState === '*' || trigger.toState === currentState;
      if (fromMatch && toMatch) {
        matching.push(trigger);
      }
    }

    // Sort by specificity: more specific patterns first (phi-weighted)
    matching.sort((a, b) => {
      const specA = (a.fromState === '*' ? 0 : StateTrigger.PHI) + (a.toState === '*' ? 0 : 1);
      const specB = (b.fromState === '*' ? 0 : StateTrigger.PHI) + (b.toState === '*' ? 0 : 1);
      return specB - specA;
    });

    const results = [];
    let triggered = 0;
    let skipped = 0;

    for (const trigger of matching) {
      let guardPassed = true;
      if (trigger.guard) {
        try {
          guardPassed = await trigger.guard({ fromState: previousState, toState: currentState, triggerId: trigger.triggerId });
        } catch (_err) {
          guardPassed = false;
        }
      }

      this.#transitionLog.push({
        triggerId: trigger.triggerId,
        fromState: previousState,
        toState: currentState,
        timestamp: Date.now(),
        durationMs: 0,
        guardPassed,
      });

      if (!guardPassed) {
        skipped++;
        continue;
      }

      const start = Date.now();
      let success = true;

      try {
        await trigger.action({ fromState: previousState, toState: currentState, triggerId: trigger.triggerId });
      } catch (err) {
        success = false;
        console.error(`[StateTrigger] Error in trigger "${trigger.triggerId}":`, err);
      }

      const durationMs = Date.now() - start;
      trigger.fireCount++;
      trigger.lastFired = Date.now();
      trigger.totalMs += durationMs;
      triggered++;

      const lastLog = this.#transitionLog[this.#transitionLog.length - 1];
      lastLog.durationMs = durationMs;

      results.push({ triggerId: trigger.triggerId, durationMs, success });
    }

    return { transitionFrom: previousState, transitionTo: currentState, triggered, skipped, results };
  }

  /**
   * Returns currently active transitions (triggers that have fired at least once).
   * @returns {Array<{triggerId: string, fromState: string, toState: string, fireCount: number, lastFired: number, avgMs: number}>}
   */
  getActiveTransitions() {
    const active = [];
    for (const trigger of this.#triggers.values()) {
      if (trigger.fireCount > 0) {
        active.push({
          triggerId: trigger.triggerId,
          fromState: trigger.fromState,
          toState: trigger.toState,
          fireCount: trigger.fireCount,
          lastFired: trigger.lastFired,
          avgMs: trigger.totalMs / trigger.fireCount,
        });
      }
    }
    return active;
  }

  /**
   * Adds a guard condition to an existing trigger.
   * Guards must return true for the trigger action to fire.
   * @param {string} triggerId - Trigger identifier
   * @param {function} guardFn - Guard function: ({fromState, toState}) => boolean
   */
  createGuard(triggerId, guardFn) {
    const trigger = this.#triggers.get(triggerId);
    if (!trigger) {
      throw new Error(`Trigger "${triggerId}" not found`);
    }
    if (typeof guardFn !== 'function') {
      throw new TypeError('guardFn must be a function');
    }

    trigger.guard = guardFn;
  }

  /**
   * Returns the full state transition matrix showing which transitions are registered.
   * Rows are fromStates, columns are toStates, cells list matching trigger IDs.
   * @returns {{states: string[], matrix: Object<string, Object<string, string[]>>, wildcardTriggers: string[]}}
   */
  getTransitionMatrix() {
    const states = [...this.#knownStates].sort();
    const matrix = {};
    const wildcardTriggers = [];

    for (const from of states) {
      matrix[from] = {};
      for (const to of states) {
        matrix[from][to] = [];
      }
    }

    for (const trigger of this.#triggers.values()) {
      if (trigger.fromState === '*' || trigger.toState === '*') {
        wildcardTriggers.push(trigger.triggerId);
        continue;
      }
      if (matrix[trigger.fromState] && matrix[trigger.fromState][trigger.toState]) {
        matrix[trigger.fromState][trigger.toState].push(trigger.triggerId);
      }
    }

    return { states, matrix, wildcardTriggers };
  }

  /**
   * Enables or disables a trigger.
   * @param {string} triggerId - Trigger identifier
   * @param {boolean} enabled - Whether the trigger should be enabled
   */
  setEnabled(triggerId, enabled) {
    const trigger = this.#triggers.get(triggerId);
    if (!trigger) {
      throw new Error(`Trigger "${triggerId}" not found`);
    }
    trigger.enabled = enabled;
  }
}

export default StateTrigger;
