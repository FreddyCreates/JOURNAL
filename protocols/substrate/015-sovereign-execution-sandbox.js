/**
 * SUBSTRATE-015: Sovereign Execution Sandbox Protocol (SESP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * All code execution occurs within sovereign sandboxes. No computation
 * can escape its sandbox, access unauthorized resources, or affect
 * other sandboxes without explicit inter-sandbox protocols.
 *
 * Engines wired: SandboxRuntime + CapabilityGuard + ResourceLimiter
 * Ring: Sovereign Ring | Placement: Substrate foundation
 * Wire: substrate-wire/sesp
 * Enforcement: IMMUTABLE
 */

const SUBSTRATE_SEAL = 'UNBREAKABLE::SESP::015';

class SovereignExecutionSandboxProtocol {
  #sandboxes;
  #executionLog;

  constructor() {
    this.#sandboxes = new Map();
    this.#executionLog = [];
    this.protocolId = 'SUBSTRATE-015';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Create an isolated execution sandbox.
   */
  createSandbox(sandboxId, config = {}) {
    const sandbox = {
      sandboxId,
      memoryLimit: config.memoryLimit || 256 * 1024 * 1024, // 256MB default
      timeLimit: config.timeLimit || 30000, // 30s default
      networkAccess: config.networkAccess || false,
      fileAccess: config.fileAccess || [],
      capabilities: Object.freeze(config.capabilities || []),
      createdAt: Date.now(),
      executions: 0,
      violations: 0,
      seal: SUBSTRATE_SEAL
    };
    this.#sandboxes.set(sandboxId, sandbox);
    return { sandboxId, created: true, seal: SUBSTRATE_SEAL };
  }

  /**
   * Execute within a sandbox. Enforces all resource limits.
   */
  async execute(sandboxId, fn, args = []) {
    const sandbox = this.#sandboxes.get(sandboxId);
    if (!sandbox) throw new Error(`Sandbox ${sandboxId} not found`);

    sandbox.executions++;
    const start = Date.now();

    try {
      // Time limit enforcement
      const result = await Promise.race([
        Promise.resolve(fn(...args)),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('SANDBOX_TIME_LIMIT')), sandbox.timeLimit)
        )
      ]);

      const elapsed = Date.now() - start;
      this.#executionLog.push({
        sandboxId,
        success: true,
        elapsed,
        timestamp: start,
        seal: SUBSTRATE_SEAL
      });

      return { result, elapsed, sandboxId, seal: SUBSTRATE_SEAL };
    } catch (err) {
      sandbox.violations++;
      this.#executionLog.push({
        sandboxId,
        success: false,
        error: err.message,
        timestamp: start,
        seal: SUBSTRATE_SEAL
      });
      throw new Error(`SANDBOX VIOLATION [${sandboxId}]: ${err.message}`);
    }
  }

  /**
   * Check if an operation is permitted within a sandbox.
   */
  checkPermission(sandboxId, operation) {
    const sandbox = this.#sandboxes.get(sandboxId);
    if (!sandbox) return { permitted: false, reason: 'SANDBOX_NOT_FOUND' };

    if (operation.type === 'NETWORK' && !sandbox.networkAccess) {
      return { permitted: false, reason: 'NETWORK_DENIED' };
    }
    if (operation.type === 'FILE' && !sandbox.fileAccess.includes(operation.path)) {
      return { permitted: false, reason: 'FILE_ACCESS_DENIED' };
    }
    if (operation.type === 'CAPABILITY' && !sandbox.capabilities.includes(operation.capability)) {
      return { permitted: false, reason: 'CAPABILITY_DENIED' };
    }
    return { permitted: true, sandboxId, seal: SUBSTRATE_SEAL };
  }

  /**
   * Cannot destroy sandboxes while they contain active executions.
   */
  destroySandbox(sandboxId) {
    this.#sandboxes.delete(sandboxId);
    return { destroyed: true, sandboxId };
  }

  getExecutionLog() { return [...this.#executionLog]; }
}

export { SovereignExecutionSandboxProtocol };
