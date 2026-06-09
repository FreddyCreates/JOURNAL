/**
 * SUBSTRATE-018: Resource Sovereignty Protocol (RSP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * The organism owns and controls all its resources. No external system
 * can claim, deplete, or redirect organism resources without sovereign
 * consent. Resource sovereignty is non-negotiable.
 *
 * Engines wired: ResourceManager + SovereigntyGuard + AllocationEngine
 * Ring: Sovereign Ring | Placement: Substrate foundation
 * Wire: substrate-wire/rsp
 * Enforcement: IMMUTABLE
 */

const PHI = 1.618033988749895;
const SUBSTRATE_SEAL = 'UNBREAKABLE::RSP::018';

class ResourceSovereigntyProtocol {
  #resources;
  #allocations;
  #claimLog;

  constructor() {
    this.#resources = new Map();
    this.#allocations = new Map();
    this.#claimLog = [];
    this.protocolId = 'SUBSTRATE-018';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Register a sovereign resource.
   */
  registerResource(resourceId, config) {
    const resource = Object.freeze({
      resourceId,
      type: config.type,
      capacity: config.capacity,
      owner: 'ORGANISM',
      allocated: 0,
      registeredAt: Date.now(),
      seal: SUBSTRATE_SEAL
    });
    this.#resources.set(resourceId, { ...resource, allocated: 0 });
    return resource;
  }

  /**
   * Allocate resource to an agent. Cannot exceed capacity.
   */
  allocate(resourceId, agentId, amount) {
    const resource = this.#resources.get(resourceId);
    if (!resource) throw new Error(`Resource ${resourceId} not found`);
    if (resource.allocated + amount > resource.capacity) {
      throw new Error(`SOVEREIGNTY VIOLATION: Allocation exceeds capacity for ${resourceId}`);
    }

    resource.allocated += amount;
    const allocation = {
      resourceId,
      agentId,
      amount,
      timestamp: Date.now(),
      seal: SUBSTRATE_SEAL
    };
    this.#allocations.set(`${resourceId}:${agentId}`, allocation);
    return allocation;
  }

  /**
   * Release allocated resources back to the pool.
   */
  release(resourceId, agentId) {
    const key = `${resourceId}:${agentId}`;
    const allocation = this.#allocations.get(key);
    if (!allocation) return { released: false, reason: 'NO_ALLOCATION' };

    const resource = this.#resources.get(resourceId);
    resource.allocated -= allocation.amount;
    this.#allocations.delete(key);
    return { released: true, resourceId, agentId, amount: allocation.amount };
  }

  /**
   * External claim attempt — ALWAYS rejected. Resources are sovereign.
   */
  externalClaim(externalId, resourceId) {
    this.#claimLog.push({
      type: 'EXTERNAL_CLAIM_REJECTED',
      externalId,
      resourceId,
      timestamp: Date.now(),
      seal: SUBSTRATE_SEAL
    });
    throw new Error('SUBSTRATE VIOLATION: External resource claims are forbidden. Resources are sovereign.');
  }

  getResourceStatus(resourceId) {
    const r = this.#resources.get(resourceId);
    return r ? { ...r, seal: SUBSTRATE_SEAL } : null;
  }

  getClaimLog() { return [...this.#claimLog]; }
}

export { ResourceSovereigntyProtocol };
