/**
 * SUBSTRATE-021: Graceful Degradation Protocol (GDP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * When components fail, the organism degrades gracefully rather than
 * catastrophically. Critical functions are preserved while non-essential
 * services are shed. The core never dies.
 *
 * Engines wired: LoadShedder + PriorityEngine + CriticalPathGuard
 * Ring: Sovereign Ring | Placement: Substrate foundation
 * Wire: substrate-wire/gdp
 * Enforcement: IMMUTABLE
 */

const PHI = 1.618033988749895;
const SUBSTRATE_SEAL = 'UNBREAKABLE::GDP::021';

class GracefulDegradationProtocol {
  #componentPriorities;
  #degradationState;
  #shedLog;

  constructor() {
    this.#componentPriorities = new Map();
    this.#degradationState = { level: 0, shedComponents: [], timestamp: null };
    this.#shedLog = [];
    this.protocolId = 'SUBSTRATE-021';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Register a component with its criticality priority.
   * Priority 1 = most critical (never shed), higher = less critical.
   */
  registerComponent(componentId, priority, shutdownFn) {
    this.#componentPriorities.set(componentId, {
      componentId,
      priority,
      shutdownFn,
      active: true,
      registeredAt: Date.now()
    });
    return { componentId, priority, registered: true };
  }

  /**
   * Trigger degradation — shed non-critical components by priority.
   * @param {number} level - Degradation level (1=mild, 5=critical)
   * @returns {Object} Degradation result
   */
  async degrade(level, reason) {
    const threshold = 6 - level; // Level 5 → threshold 1 (shed everything above priority 1)
    const toShed = [];

    for (const [id, comp] of this.#componentPriorities) {
      if (comp.priority > threshold && comp.active) {
        toShed.push(comp);
      }
    }

    const shed = [];
    for (const comp of toShed.sort((a, b) => b.priority - a.priority)) {
      try {
        await comp.shutdownFn();
        comp.active = false;
        shed.push(comp.componentId);
      } catch (err) {
        // Force shed even if shutdown fails
        comp.active = false;
        shed.push(comp.componentId);
      }
    }

    this.#degradationState = {
      level,
      reason,
      shedComponents: shed,
      timestamp: Date.now(),
      seal: SUBSTRATE_SEAL
    };

    this.#shedLog.push({ ...this.#degradationState });
    return this.#degradationState;
  }

  /**
   * Recover from degradation — bring shed components back online.
   */
  async recover() {
    for (const [id, comp] of this.#componentPriorities) {
      comp.active = true;
    }
    this.#degradationState = { level: 0, shedComponents: [], timestamp: Date.now() };
    return { recovered: true, seal: SUBSTRATE_SEAL };
  }

  /**
   * Get current degradation status.
   */
  getStatus() {
    const active = [...this.#componentPriorities.values()].filter(c => c.active).length;
    const total = this.#componentPriorities.size;
    return {
      level: this.#degradationState.level,
      active,
      total,
      healthRatio: total > 0 ? active / total : 1,
      seal: SUBSTRATE_SEAL
    };
  }

  getShedLog() { return [...this.#shedLog]; }
}

export { GracefulDegradationProtocol };
