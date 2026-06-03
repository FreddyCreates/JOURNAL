/**
 * ScheduleTrigger — time-based trigger system with phi-harmonic scheduling.
 *
 * Registers interval-based triggers with optional jitter derived from the
 * golden angle (≈137.508°) for even temporal distribution. Supports
 * max fire limits, per-trigger start/stop, and batch control.
 */
export class ScheduleTrigger {
  /** @type {number} Golden ratio for harmonic calculations */
  static PHI = 1.618033988749895;

  /** @type {number} Golden angle in radians: 2π / PHI² ≈ 2.39996 rad ≈ 137.508° */
  static GOLDEN_ANGLE_RAD = (2 * Math.PI) / (ScheduleTrigger.PHI * ScheduleTrigger.PHI);

  /** @type {Map<string, ScheduleEntry>} */
  #triggers;

  /** @type {number} Internal counter for golden-angle jitter distribution */
  #jitterIndex;

  /**
   * @typedef {Object} ScheduleEntry
   * @property {string} triggerId
   * @property {number} intervalMs
   * @property {function} action
   * @property {number} maxFires - 0 means unlimited
   * @property {boolean} jitter - Whether to apply golden-angle jitter
   * @property {boolean} align - Whether to align to interval boundaries
   * @property {number|null} timerId
   * @property {number} fireCount
   * @property {number} lastFired
   * @property {number} nextFire
   * @property {number} totalMs
   * @property {boolean} running
   * @property {number} registeredAt
   */

  constructor() {
    this.#triggers = new Map();
    this.#jitterIndex = 0;
  }

  /**
   * Registers a scheduled trigger.
   * @param {string} triggerId - Unique trigger identifier
   * @param {number} intervalMs - Interval between fires in milliseconds
   * @param {function} action - Action to execute on each fire
   * @param {Object} [options={}]
   * @param {number} [options.maxFires=0] - Maximum number of fires (0 = unlimited)
   * @param {boolean} [options.jitter=false] - Apply golden-angle scheduling jitter
   * @param {boolean} [options.align=false] - Align to interval boundaries
   * @returns {{triggerId: string, intervalMs: number, maxFires: number, jitter: boolean}}
   */
  register(triggerId, intervalMs, action, options = {}) {
    if (typeof action !== 'function') {
      throw new TypeError('Action must be a function');
    }
    if (typeof intervalMs !== 'number' || intervalMs <= 0) {
      throw new TypeError('intervalMs must be a positive number');
    }
    if (this.#triggers.has(triggerId)) {
      throw new Error(`Trigger "${triggerId}" is already registered`);
    }

    const maxFires = options.maxFires ?? 0;
    const jitter = options.jitter ?? false;
    const align = options.align ?? false;

    /** @type {ScheduleEntry} */
    const entry = {
      triggerId,
      intervalMs,
      action,
      maxFires,
      jitter,
      align,
      timerId: null,
      fireCount: 0,
      lastFired: 0,
      nextFire: 0,
      totalMs: 0,
      running: false,
      registeredAt: Date.now(),
    };

    this.#triggers.set(triggerId, entry);

    return { triggerId, intervalMs, maxFires, jitter };
  }

  /**
   * Starts a specific trigger's schedule.
   * @param {string} triggerId - Trigger identifier
   * @returns {{triggerId: string, nextFire: number}}
   */
  start(triggerId) {
    const entry = this.#triggers.get(triggerId);
    if (!entry) {
      throw new Error(`Trigger "${triggerId}" not found`);
    }
    if (entry.running) {
      throw new Error(`Trigger "${triggerId}" is already running`);
    }

    const firstDelay = this.#computeDelay(entry);
    entry.nextFire = Date.now() + firstDelay;
    entry.running = true;

    this.#scheduleTick(entry);

    return { triggerId, nextFire: entry.nextFire };
  }

  /**
   * Stops a specific trigger's schedule.
   * @param {string} triggerId - Trigger identifier
   * @returns {boolean} True if the trigger was running and is now stopped
   */
  stop(triggerId) {
    const entry = this.#triggers.get(triggerId);
    if (!entry) {
      throw new Error(`Trigger "${triggerId}" not found`);
    }

    if (!entry.running) return false;

    if (entry.timerId !== null) {
      clearTimeout(entry.timerId);
      entry.timerId = null;
    }
    entry.running = false;
    entry.nextFire = 0;
    return true;
  }

  /**
   * Starts all registered triggers.
   * @returns {Array<{triggerId: string, nextFire: number}>}
   */
  startAll() {
    const results = [];
    for (const entry of this.#triggers.values()) {
      if (!entry.running) {
        results.push(this.start(entry.triggerId));
      }
    }
    return results;
  }

  /**
   * Stops all running triggers.
   * @returns {number} Number of triggers stopped
   */
  stopAll() {
    let count = 0;
    for (const entry of this.#triggers.values()) {
      if (entry.running) {
        this.stop(entry.triggerId);
        count++;
      }
    }
    return count;
  }

  /**
   * Returns the next scheduled fire time for a trigger.
   * @param {string} triggerId - Trigger identifier
   * @returns {{triggerId: string, nextFire: number, msUntilFire: number, running: boolean}}
   */
  getNextFire(triggerId) {
    const entry = this.#triggers.get(triggerId);
    if (!entry) {
      throw new Error(`Trigger "${triggerId}" not found`);
    }

    const msUntilFire = entry.running ? Math.max(0, entry.nextFire - Date.now()) : 0;
    return {
      triggerId,
      nextFire: entry.nextFire,
      msUntilFire,
      running: entry.running,
    };
  }

  /**
   * Returns a full schedule report with stats for all registered triggers.
   * @returns {{totalTriggers: number, runningCount: number, totalFires: number, triggers: Array<{triggerId: string, intervalMs: number, fireCount: number, maxFires: number, running: boolean, lastFired: number, nextFire: number, avgMs: number, jitter: boolean}>}}
   */
  getScheduleReport() {
    let totalFires = 0;
    let runningCount = 0;
    const triggers = [];

    for (const entry of this.#triggers.values()) {
      totalFires += entry.fireCount;
      if (entry.running) runningCount++;

      triggers.push({
        triggerId: entry.triggerId,
        intervalMs: entry.intervalMs,
        fireCount: entry.fireCount,
        maxFires: entry.maxFires,
        running: entry.running,
        lastFired: entry.lastFired,
        nextFire: entry.nextFire,
        avgMs: entry.fireCount > 0 ? entry.totalMs / entry.fireCount : 0,
        jitter: entry.jitter,
      });
    }

    return { totalTriggers: this.#triggers.size, runningCount, totalFires, triggers };
  }

  /**
   * Unregisters and stops a trigger.
   * @param {string} triggerId - Trigger identifier
   */
  unregister(triggerId) {
    const entry = this.#triggers.get(triggerId);
    if (!entry) {
      throw new Error(`Trigger "${triggerId}" not found`);
    }
    if (entry.running) {
      this.stop(triggerId);
    }
    this.#triggers.delete(triggerId);
  }

  /**
   * Schedules the next tick for a trigger using setTimeout.
   * @param {ScheduleEntry} entry
   */
  #scheduleTick(entry) {
    const delay = this.#computeDelay(entry);
    entry.nextFire = Date.now() + delay;

    entry.timerId = setTimeout(() => {
      if (!entry.running) return;

      const fireStart = Date.now();
      entry.fireCount++;
      entry.lastFired = fireStart;

      try {
        entry.action({
          triggerId: entry.triggerId,
          fireCount: entry.fireCount,
          timestamp: fireStart,
          intervalMs: entry.intervalMs,
        });
      } catch (err) {
        console.error(`[ScheduleTrigger] Error in trigger "${entry.triggerId}":`, err);
      }

      entry.totalMs += Date.now() - fireStart;

      if (entry.maxFires > 0 && entry.fireCount >= entry.maxFires) {
        entry.running = false;
        entry.timerId = null;
        entry.nextFire = 0;
        return;
      }

      this.#scheduleTick(entry);
    }, delay);
  }

  /**
   * Computes the delay for the next tick, applying golden-angle jitter if enabled.
   * Jitter offsets each successive fire by the golden angle fraction of the interval,
   * ensuring even temporal distribution across concurrent triggers.
   * @param {ScheduleEntry} entry
   * @returns {number} Delay in milliseconds
   */
  #computeDelay(entry) {
    let delay = entry.intervalMs;

    if (entry.align) {
      const now = Date.now();
      const remainder = now % entry.intervalMs;
      delay = entry.intervalMs - remainder;
    }

    if (entry.jitter) {
      this.#jitterIndex++;
      const jitterFraction = (this.#jitterIndex * ScheduleTrigger.GOLDEN_ANGLE_RAD) % 1;
      const maxJitter = entry.intervalMs * 0.1;
      const jitterOffset = (jitterFraction - 0.5) * maxJitter;
      delay = Math.max(1, delay + jitterOffset);
    }

    return Math.round(delay);
  }
}

export default ScheduleTrigger;
