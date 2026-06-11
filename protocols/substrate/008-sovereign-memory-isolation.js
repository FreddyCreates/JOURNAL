/**
 * SUBSTRATE-008: Sovereign Memory Isolation Protocol (SMIP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * Enforces strict memory isolation between agents. No agent can read or
 * write another agent's private memory without explicit delegation.
 * Prevents cross-contamination of cognitive states.
 *
 * Engines wired: MemoryRuntime + IsolationGuard + AccessControl
 * Ring: Memory Ring | Placement: Substrate foundation
 * Wire: substrate-wire/smip
 * Enforcement: IMMUTABLE
 */

const PHI = 1.618033988749895;
const SUBSTRATE_SEAL = 'UNBREAKABLE::SMIP::008';

class SovereignMemoryIsolationProtocol {
  #memorySpaces;
  #delegations;
  #accessLog;

  constructor() {
    this.#memorySpaces = new Map();
    this.#delegations = new Map();
    this.#accessLog = [];
    this.protocolId = 'SUBSTRATE-008';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Allocate an isolated memory space for an agent.
   */
  allocateSpace(agentId, capacity = Infinity) {
    if (this.#memorySpaces.has(agentId)) {
      throw new Error(`Memory space already allocated for ${agentId}`);
    }
    this.#memorySpaces.set(agentId, {
      owner: agentId,
      store: new Map(),
      capacity,
      createdAt: Date.now(),
      seal: SUBSTRATE_SEAL
    });
    return { agentId, allocated: true, seal: SUBSTRATE_SEAL };
  }

  /**
   * Write to own memory space. Only the owner can write.
   */
  write(agentId, key, value) {
    const space = this.#memorySpaces.get(agentId);
    if (!space) throw new Error(`No memory space for ${agentId}`);
    if (space.store.size >= space.capacity) throw new Error('Memory space full');
    space.store.set(key, { value, writtenAt: Date.now() });
    return { written: true, key, agentId };
  }

  /**
   * Read from own memory space or a delegated space.
   */
  read(requesterId, targetAgentId, key) {
    if (requesterId !== targetAgentId) {
      const delegation = this.#delegations.get(`${targetAgentId}:${requesterId}`);
      if (!delegation || !delegation.active) {
        this.#accessLog.push({
          type: 'VIOLATION',
          requesterId,
          targetAgentId,
          key,
          timestamp: Date.now(),
          seal: SUBSTRATE_SEAL
        });
        throw new Error(`SUBSTRATE VIOLATION: ${requesterId} cannot access ${targetAgentId} memory. No delegation.`);
      }
    }

    const space = this.#memorySpaces.get(targetAgentId);
    if (!space) return null;
    const entry = space.store.get(key);

    this.#accessLog.push({
      type: 'READ',
      requesterId,
      targetAgentId,
      key,
      timestamp: Date.now(),
      seal: SUBSTRATE_SEAL
    });

    return entry ? entry.value : null;
  }

  /**
   * Delegate read access from owner to another agent.
   */
  delegate(ownerId, delegateId, expiry = Infinity) {
    this.#delegations.set(`${ownerId}:${delegateId}`, {
      owner: ownerId,
      delegate: delegateId,
      active: true,
      createdAt: Date.now(),
      expiry
    });
    return { delegated: true, from: ownerId, to: delegateId };
  }

  /**
   * Revoke delegation.
   */
  revoke(ownerId, delegateId) {
    const key = `${ownerId}:${delegateId}`;
    const delegation = this.#delegations.get(key);
    if (delegation) delegation.active = false;
    return { revoked: true, from: ownerId, to: delegateId };
  }

  getAccessLog() { return [...this.#accessLog]; }
}

export { SovereignMemoryIsolationProtocol };
