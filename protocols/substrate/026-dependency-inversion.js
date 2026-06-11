/**
 * SUBSTRATE-026: Dependency Inversion Protocol (DIP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * The organism never depends downward on implementation details.
 * All dependencies point toward abstractions. External dependencies
 * are wrapped in sovereign interfaces. No vendor lock-in at substrate.
 *
 * Engines wired: InterfaceRegistry + DependencyScanner + InversionGuard
 * Ring: Interface Ring | Placement: Substrate foundation
 * Wire: substrate-wire/dip
 * Enforcement: IMMUTABLE
 */

const SUBSTRATE_SEAL = 'UNBREAKABLE::DIP::026';

class DependencyInversionProtocol {
  #interfaces;
  #implementations;
  #violations;

  constructor() {
    this.#interfaces = new Map();
    this.#implementations = new Map();
    this.#violations = [];
    this.protocolId = 'SUBSTRATE-026';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Register a sovereign interface — the abstraction boundary.
   */
  registerInterface(interfaceId, contract) {
    const iface = Object.freeze({
      interfaceId,
      methods: Object.freeze(contract.methods || []),
      invariants: Object.freeze(contract.invariants || []),
      sovereign: true,
      registeredAt: Date.now(),
      seal: SUBSTRATE_SEAL
    });
    this.#interfaces.set(interfaceId, iface);
    return iface;
  }

  /**
   * Bind an implementation to an interface. Implementation must satisfy contract.
   */
  bindImplementation(interfaceId, implementationId, impl) {
    const iface = this.#interfaces.get(interfaceId);
    if (!iface) throw new Error(`Interface ${interfaceId} not registered`);

    // Verify implementation satisfies interface contract
    const missing = [];
    for (const method of iface.methods) {
      if (typeof impl[method] !== 'function') {
        missing.push(method);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Implementation ${implementationId} missing methods: ${missing.join(', ')}`);
    }

    this.#implementations.set(interfaceId, {
      implementationId,
      interfaceId,
      boundAt: Date.now(),
      seal: SUBSTRATE_SEAL
    });

    return { interfaceId, implementationId, bound: true, seal: SUBSTRATE_SEAL };
  }

  /**
   * Check a dependency for inversion violations.
   * A violation occurs when high-level modules depend on low-level details.
   */
  checkDependency(fromModule, toModule, dependencyType) {
    if (dependencyType === 'CONCRETE' && fromModule.level < toModule.level) {
      // High-level depending on low-level concrete — VIOLATION
      const violation = {
        from: fromModule.id,
        to: toModule.id,
        type: 'INVERSION_VIOLATION',
        timestamp: Date.now(),
        seal: SUBSTRATE_SEAL
      };
      this.#violations.push(violation);
      return { valid: false, violation };
    }
    return { valid: true, seal: SUBSTRATE_SEAL };
  }

  /**
   * Wrap an external dependency in a sovereign interface.
   */
  wrapExternal(externalName, interfaceId, adapter) {
    this.registerInterface(interfaceId, { methods: Object.keys(adapter).filter(k => typeof adapter[k] === 'function') });
    this.bindImplementation(interfaceId, `external:${externalName}`, adapter);
    return { wrapped: true, externalName, interfaceId, seal: SUBSTRATE_SEAL };
  }

  getViolations() { return [...this.#violations]; }
  getInterface(interfaceId) { return this.#interfaces.get(interfaceId); }
}

export { DependencyInversionProtocol };
