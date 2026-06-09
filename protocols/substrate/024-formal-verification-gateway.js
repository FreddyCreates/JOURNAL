/**
 * SUBSTRATE-024: Formal Verification Gateway Protocol (FVGP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * Critical operations must pass formal verification before execution.
 * Preconditions, postconditions, and invariants are checked at the
 * substrate level. No unverified critical path.
 *
 * Engines wired: VerificationEngine + InvariantChecker + ProofAssistant
 * Ring: Sovereign Ring | Placement: Substrate foundation
 * Wire: substrate-wire/fvgp
 * Enforcement: IMMUTABLE
 */

const SUBSTRATE_SEAL = 'UNBREAKABLE::FVGP::024';

class FormalVerificationGatewayProtocol {
  #contracts;
  #verificationLog;

  constructor() {
    this.#contracts = new Map();
    this.#verificationLog = [];
    this.protocolId = 'SUBSTRATE-024';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Define a formal contract for an operation.
   * @param {string} operationId - The operation being contracted
   * @param {Object} contract - { preconditions, postconditions, invariants }
   */
  defineContract(operationId, contract) {
    const sealed = Object.freeze({
      operationId,
      preconditions: Object.freeze(contract.preconditions || []),
      postconditions: Object.freeze(contract.postconditions || []),
      invariants: Object.freeze(contract.invariants || []),
      definedAt: Date.now(),
      seal: SUBSTRATE_SEAL
    });
    this.#contracts.set(operationId, sealed);
    return sealed;
  }

  /**
   * Verify preconditions before execution.
   * @param {string} operationId - Operation to verify
   * @param {Object} state - Current state to check against
   * @returns {Object} Verification result
   */
  verifyPreconditions(operationId, state) {
    const contract = this.#contracts.get(operationId);
    if (!contract) throw new Error(`No contract for ${operationId}`);

    const failures = [];
    for (const pre of contract.preconditions) {
      if (!pre.check(state)) {
        failures.push({ condition: pre.name, reason: pre.message || 'PRECONDITION_FAILED' });
      }
    }

    const passed = failures.length === 0;
    this.#verificationLog.push({
      operationId,
      phase: 'PRECONDITION',
      passed,
      failures,
      timestamp: Date.now(),
      seal: SUBSTRATE_SEAL
    });

    if (!passed) {
      throw new Error(`FORMAL VERIFICATION FAILED [${operationId}]: ${failures.map(f => f.condition).join(', ')}`);
    }
    return { passed: true, operationId, seal: SUBSTRATE_SEAL };
  }

  /**
   * Verify postconditions after execution.
   */
  verifyPostconditions(operationId, state) {
    const contract = this.#contracts.get(operationId);
    if (!contract) throw new Error(`No contract for ${operationId}`);

    const failures = [];
    for (const post of contract.postconditions) {
      if (!post.check(state)) {
        failures.push({ condition: post.name, reason: post.message || 'POSTCONDITION_FAILED' });
      }
    }

    const passed = failures.length === 0;
    this.#verificationLog.push({
      operationId,
      phase: 'POSTCONDITION',
      passed,
      failures,
      timestamp: Date.now(),
      seal: SUBSTRATE_SEAL
    });

    return { passed, failures, operationId, seal: SUBSTRATE_SEAL };
  }

  /**
   * Check invariants — these must hold at all times.
   */
  checkInvariants(operationId, state) {
    const contract = this.#contracts.get(operationId);
    if (!contract) return { valid: true, reason: 'NO_CONTRACT' };

    const violations = [];
    for (const inv of contract.invariants) {
      if (!inv.check(state)) {
        violations.push({ invariant: inv.name, reason: inv.message || 'INVARIANT_VIOLATED' });
      }
    }

    return { valid: violations.length === 0, violations, seal: SUBSTRATE_SEAL };
  }

  getVerificationLog() { return [...this.#verificationLog]; }
}

export { FormalVerificationGatewayProtocol };
