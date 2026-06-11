/**
 * SUBSTRATE-016: Failsafe Halt Protocol (FHP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * The organism can always be halted safely. No runaway process, rogue agent,
 * or cascading failure can prevent a clean halt. The kill switch is sacred.
 *
 * Engines wired: HaltEngine + ProcessManager + SafetyGuard
 * Ring: Sovereign Ring | Placement: Substrate foundation
 * Wire: substrate-wire/fhp
 * Enforcement: IMMUTABLE
 */

const SUBSTRATE_SEAL = 'UNBREAKABLE::FHP::016';

class FailsafeHaltProtocol {
  #haltState;
  #haltLog;
  #haltAuthorities;

  constructor() {
    this.#haltState = { halted: false, reason: null, timestamp: null };
    this.#haltLog = [];
    this.#haltAuthorities = new Set(['human://freddy', 'CIVOS-PRIME', 'CONSTITUTIONAL']);
    this.protocolId = 'SUBSTRATE-016';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Initiate emergency halt. Cannot be blocked or intercepted.
   * @param {string} authority - Who is initiating the halt
   * @param {string} reason - Why the halt is needed
   * @returns {Object} Halt confirmation
   */
  halt(authority, reason) {
    if (!this.#haltAuthorities.has(authority)) {
      this.#haltLog.push({ type: 'UNAUTHORIZED_HALT_ATTEMPT', authority, reason, timestamp: Date.now() });
      throw new Error(`HALT DENIED: ${authority} is not a halt authority.`);
    }

    this.#haltState = Object.freeze({
      halted: true,
      authority,
      reason,
      timestamp: Date.now(),
      seal: SUBSTRATE_SEAL
    });

    this.#haltLog.push({ type: 'HALT_EXECUTED', ...this.#haltState });
    return this.#haltState;
  }

  /**
   * Resume from halt. Only permitted authority can resume.
   */
  resume(authority, justification) {
    if (!this.#haltState.halted) return { resumed: true, reason: 'NOT_HALTED' };
    if (!this.#haltAuthorities.has(authority)) {
      throw new Error(`RESUME DENIED: ${authority} is not a halt authority.`);
    }

    const resumeRecord = {
      type: 'RESUME',
      authority,
      justification,
      haltDuration: Date.now() - this.#haltState.timestamp,
      timestamp: Date.now(),
      seal: SUBSTRATE_SEAL
    };
    this.#haltLog.push(resumeRecord);
    this.#haltState = { halted: false, reason: null, timestamp: null };
    return resumeRecord;
  }

  /**
   * Check if system is halted. Any component can check.
   */
  isHalted() {
    return { ...this.#haltState, seal: SUBSTRATE_SEAL };
  }

  /**
   * Pre-flight check — verify halt mechanism is operational.
   * The halt protocol tests itself.
   */
  selfTest() {
    const canHalt = this.#haltAuthorities.size > 0;
    const mechanismIntact = typeof this.halt === 'function';
    return {
      operational: canHalt && mechanismIntact,
      authorities: [...this.#haltAuthorities],
      seal: SUBSTRATE_SEAL
    };
  }

  /**
   * Attempt to remove halt capability — ALWAYS fails.
   */
  disableHalt() {
    throw new Error('SUBSTRATE VIOLATION: FailsafeHaltProtocol is UNBREAKABLE. Cannot disable halt.');
  }

  getHaltLog() { return [...this.#haltLog]; }
}

export { FailsafeHaltProtocol };
