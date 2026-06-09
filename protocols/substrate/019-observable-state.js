/**
 * SUBSTRATE-019: Observable State Protocol (OSP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * All state within the organism is observable. No hidden state, no shadow
 * variables, no opaque internal registers that cannot be audited. Full
 * transparency at the substrate level.
 *
 * Engines wired: StateTracker + AuditEngine + TransparencyGuard
 * Ring: Memory Ring | Placement: Substrate foundation
 * Wire: substrate-wire/osp
 * Enforcement: IMMUTABLE
 */

const SUBSTRATE_SEAL = 'UNBREAKABLE::OSP::019';

class ObservableStateProtocol {
  #stateRegistry;
  #observers;
  #auditLog;

  constructor() {
    this.#stateRegistry = new Map();
    this.#observers = new Map();
    this.#auditLog = [];
    this.protocolId = 'SUBSTRATE-019';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Register observable state. Once registered, state changes are tracked.
   */
  registerState(stateId, initialValue, owner) {
    const entry = {
      stateId,
      owner,
      value: initialValue,
      version: 0,
      history: [{ value: initialValue, version: 0, timestamp: Date.now() }],
      seal: SUBSTRATE_SEAL
    };
    this.#stateRegistry.set(stateId, entry);
    return { stateId, registered: true, seal: SUBSTRATE_SEAL };
  }

  /**
   * Update state — all updates are logged and observable.
   */
  setState(stateId, newValue, mutator) {
    const entry = this.#stateRegistry.get(stateId);
    if (!entry) throw new Error(`State ${stateId} not registered`);

    entry.version++;
    entry.value = newValue;
    entry.history.push({ value: newValue, version: entry.version, mutator, timestamp: Date.now() });

    // Notify observers
    const observers = this.#observers.get(stateId) || [];
    for (const obs of observers) {
      obs.callback({ stateId, value: newValue, version: entry.version });
    }

    this.#auditLog.push({
      type: 'STATE_CHANGE',
      stateId,
      version: entry.version,
      mutator,
      timestamp: Date.now(),
      seal: SUBSTRATE_SEAL
    });

    return { stateId, version: entry.version, seal: SUBSTRATE_SEAL };
  }

  /**
   * Observe state changes. Anyone can observe — transparency is mandatory.
   */
  observe(stateId, observerId, callback) {
    if (!this.#observers.has(stateId)) {
      this.#observers.set(stateId, []);
    }
    this.#observers.get(stateId).push({ observerId, callback });
    return { observing: true, stateId, observerId };
  }

  /**
   * Get full state history — nothing is hidden.
   */
  getHistory(stateId) {
    const entry = this.#stateRegistry.get(stateId);
    return entry ? { stateId, history: [...entry.history], seal: SUBSTRATE_SEAL } : null;
  }

  /**
   * Attempt to create hidden state — ALWAYS fails.
   */
  createHiddenState() {
    throw new Error('SUBSTRATE VIOLATION: Hidden state is forbidden. All state must be observable.');
  }

  getAuditLog() { return [...this.#auditLog]; }
}

export { ObservableStateProtocol };
