/**
 * SUBSTRATE-004: Temporal Causality Chain Protocol (TCCP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * Maintains a strict causal ordering of all events within the organism.
 * No event can be retroactively inserted, reordered, or deleted.
 * Ensures temporal integrity of the entire intelligence stack.
 *
 * Engines wired: EventBus + CausalClock + TemporalGuard
 * Ring: Sovereign Ring | Placement: Substrate foundation
 * Wire: substrate-wire/tccp
 * Enforcement: IMMUTABLE
 */

import crypto from 'node:crypto';

const PHI = 1.618033988749895;
const SUBSTRATE_SEAL = 'UNBREAKABLE::TCCP::004';

class TemporalCausalityChainProtocol {
  #eventChain;
  #lamportClock;
  #vectorClocks;

  constructor() {
    this.#eventChain = [];
    this.#lamportClock = 0;
    this.#vectorClocks = new Map();
    this.protocolId = 'SUBSTRATE-004';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Record a causal event. Events are strictly ordered and immutable.
   * @param {string} agentId - The agent producing the event
   * @param {string} eventType - Type of event
   * @param {Object} payload - Event data
   * @param {string[]} causalDeps - Event IDs this event causally depends on
   * @returns {Object} Sealed event record
   */
  recordEvent(agentId, eventType, payload, causalDeps = []) {
    this.#lamportClock++;

    // Update vector clock for this agent
    if (!this.#vectorClocks.has(agentId)) {
      this.#vectorClocks.set(agentId, 0);
    }
    this.#vectorClocks.set(agentId, this.#vectorClocks.get(agentId) + 1);

    // Validate causal dependencies exist
    for (const dep of causalDeps) {
      const exists = this.#eventChain.some(e => e.eventId === dep);
      if (!exists) {
        throw new Error(`SUBSTRATE VIOLATION: Causal dependency ${dep} not found. Cannot create orphaned event.`);
      }
    }

    const prevHash = this.#eventChain.length > 0
      ? this.#eventChain[this.#eventChain.length - 1].hash
      : 'GENESIS';

    const event = {
      eventId: `evt-${this.#lamportClock}-${agentId}`,
      agentId,
      eventType,
      payload: Object.freeze({ ...payload }),
      causalDeps: Object.freeze([...causalDeps]),
      lamportTime: this.#lamportClock,
      vectorClock: Object.freeze(Object.fromEntries(this.#vectorClocks)),
      wallTime: Date.now(),
      previousHash: prevHash,
      hash: this._hash(`${this.#lamportClock}:${agentId}:${eventType}:${JSON.stringify(payload)}:${prevHash}`),
      seal: SUBSTRATE_SEAL
    };

    const frozen = Object.freeze(event);
    this.#eventChain.push(frozen);
    return frozen;
  }

  /**
   * Query causal history of an event.
   */
  getCausalHistory(eventId) {
    const target = this.#eventChain.find(e => e.eventId === eventId);
    if (!target) return null;

    const history = [];
    const visited = new Set();
    const queue = [target];

    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current.eventId)) continue;
      visited.add(current.eventId);
      history.push(current);
      for (const dep of current.causalDeps) {
        const depEvent = this.#eventChain.find(e => e.eventId === dep);
        if (depEvent) queue.push(depEvent);
      }
    }

    return history;
  }

  /**
   * Verify chain integrity.
   */
  verifyChain() {
    for (let i = 1; i < this.#eventChain.length; i++) {
      if (this.#eventChain[i].previousHash !== this.#eventChain[i - 1].hash) {
        return { valid: false, breakAt: i, seal: SUBSTRATE_SEAL };
      }
    }
    return { valid: true, length: this.#eventChain.length, seal: SUBSTRATE_SEAL };
  }

  _hash(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
  }
}

export { TemporalCausalityChainProtocol };
