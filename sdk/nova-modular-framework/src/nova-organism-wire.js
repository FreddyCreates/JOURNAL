import crypto from 'node:crypto';
import { PHI, PHI_INVERSE, NOVA_ID, NOVA_SOVEREIGN_ID, HEARTBEAT_MS, phiBlend } from './nova-core.js';

/**
 * @typedef {Object} NovaKernel
 * @property {string} kernelId
 * @property {string} label
 * @property {function} fn
 * @property {number} priority
 * @property {'loaded' | 'running' | 'completed' | 'failed'} status
 * @property {unknown} lastResult
 * @property {number} executionCount
 */

/**
 * @typedef {Object} OrganismRegisterUpdate
 * @property {'cognitive' | 'affective' | 'somatic' | 'sovereign'} register
 * @property {string} key
 * @property {unknown} value
 */

/**
 * NovaOrganismWire — organism runtime integration for the Nova framework.
 *
 * Wires the Nova protocol, SNS bridge, and CARS research engine into the
 * organism runtime by:
 *   1. Exposing Nova-native kernels that can be loaded into KernelExecutor
 *   2. Translating Nova governance signals into organism register updates
 *   3. Publishing CARS research findings into the organism's cognitive register
 *   4. Maintaining a phi-weighted organism resonance score
 *
 * The wire operates independently of the concrete organism-runtime-sdk
 * so it can be used in any environment (browser, Node, ICP) without imports.
 */
export class NovaOrganismWire {
  /** @type {string} */
  #wireId;

  /** @type {Map<string, NovaKernel>} */
  #kernels;

  /** @type {Array<OrganismRegisterUpdate>} */
  #pendingUpdates;

  /** @type {number} */
  #phiResonance;

  /** @type {Array<function>} */
  #updateListeners;

  /** @type {Array<function>} */
  #beatListeners;

  /** @type {number|null} */
  #intervalId;

  /** @type {number} */
  #beatCount;

  constructor() {
    this.#wireId = crypto.randomUUID();
    this.#kernels = new Map();
    this.#pendingUpdates = [];
    this.#phiResonance = PHI_INVERSE;
    this.#updateListeners = [];
    this.#beatListeners = [];
    this.#intervalId = null;
    this.#beatCount = 0;

    this.#registerBuiltinKernels();
  }

  /**
   * Wire identifier.
   * @returns {string}
   */
  get wireId() {
    return this.#wireId;
  }

  /**
   * Current organism phi-resonance score [0, 1].
   * @returns {number}
   */
  get phiResonance() {
    return this.#phiResonance;
  }

  // ------------------------------------------------------------------ //
  // Organism heartbeat (standalone mode)                                //
  // ------------------------------------------------------------------ //

  /**
   * Start the Nova organism heartbeat at HEARTBEAT_MS (873ms).
   * Use this when not integrating with an external heartbeat clock.
   * @throws {Error} if already running
   */
  startHeartbeat() {
    if (this.#intervalId !== null) throw new Error('Heartbeat is already running');
    this.#beatCount = 0;
    this.#intervalId = setInterval(() => {
      this.#beatCount++;
      const payload = { beatNumber: this.#beatCount, timestamp: Date.now(), phiResonance: this.#phiResonance };
      this.#phiResonance = phiBlend(this.#phiResonance, PHI_INVERSE);
      this.#drainPending();
      for (const fn of this.#beatListeners) {
        try { fn(payload); } catch { /* non-fatal */ }
      }
    }, HEARTBEAT_MS);
  }

  /**
   * Stop the Nova organism heartbeat.
   * @throws {Error} if not running
   */
  stopHeartbeat() {
    if (this.#intervalId === null) throw new Error('Heartbeat is not running');
    clearInterval(this.#intervalId);
    this.#intervalId = null;
  }

  /**
   * Returns true if the heartbeat is currently running.
   * @returns {boolean}
   */
  get isRunning() {
    return this.#intervalId !== null;
  }

  /**
   * Register a listener for each heartbeat beat.
   * @param {function} fn  Receives { beatNumber, timestamp, phiResonance }
   * @returns {function}  Unsubscribe
   */
  onBeat(fn) {
    if (typeof fn !== 'function') throw new TypeError('Listener must be a function');
    this.#beatListeners.push(fn);
    return () => { this.#beatListeners = this.#beatListeners.filter(l => l !== fn); };
  }

  // ------------------------------------------------------------------ //
  // Kernel management                                                    //
  // ------------------------------------------------------------------ //

  /**
   * Load a custom Nova kernel into the wire.
   * @param {string} label  Human-readable kernel label
   * @param {function} fn   Kernel function receiving (input) returning output
   * @param {{ priority?: number }} [opts]
   * @returns {string}  kernelId
   */
  loadKernel(label, fn, opts = {}) {
    if (typeof fn !== 'function') throw new TypeError('Kernel fn must be a function');
    const kernelId = `NOVA-KERNEL-${crypto.randomUUID()}`;
    this.#kernels.set(kernelId, {
      kernelId,
      label,
      fn,
      priority: opts.priority ?? 0,
      status: 'loaded',
      lastResult: null,
      executionCount: 0,
    });
    return kernelId;
  }

  /**
   * Execute a kernel immediately.
   * @param {string} kernelId
   * @param {unknown} [input]
   * @returns {unknown}  Kernel output
   */
  executeKernel(kernelId, input) {
    const kernel = this.#kernels.get(kernelId);
    if (!kernel) throw new Error(`Kernel "${kernelId}" not found`);
    kernel.status = 'running';
    try {
      const result = kernel.fn(input);
      kernel.status = 'completed';
      kernel.lastResult = result;
      kernel.executionCount++;
      this.#phiResonance = phiBlend(this.#phiResonance, Math.min(1, kernel.executionCount * PHI_INVERSE));
      return result;
    } catch (err) {
      kernel.status = 'failed';
      throw err;
    }
  }

  /**
   * List all loaded kernels (read-only copies).
   * @returns {Array<Omit<NovaKernel, 'fn'>>}
   */
  listKernels() {
    return Array.from(this.#kernels.values()).map(({ fn: _fn, ...rest }) => ({ ...rest }));
  }

  // ------------------------------------------------------------------ //
  // Register bridge                                                      //
  // ------------------------------------------------------------------ //

  /**
   * Queue an organism register update.
   * Updates are drained on each heartbeat beat, or immediately via flush().
   * @param {OrganismRegisterUpdate} update
   */
  queueUpdate(update) {
    const validRegisters = ['cognitive', 'affective', 'somatic', 'sovereign'];
    if (!validRegisters.includes(update.register)) {
      throw new Error(`Invalid register: "${update.register}"`);
    }
    this.#pendingUpdates.push({ ...update });
  }

  /**
   * Flush all pending register updates immediately.
   * @returns {OrganismRegisterUpdate[]}  The updates that were flushed
   */
  flush() {
    return this.#drainPending();
  }

  /**
   * Register a listener called whenever pending updates are flushed.
   * @param {function} fn  Receives OrganismRegisterUpdate[]
   * @returns {function}  Unsubscribe
   */
  onFlush(fn) {
    if (typeof fn !== 'function') throw new TypeError('Listener must be a function');
    this.#updateListeners.push(fn);
    return () => { this.#updateListeners = this.#updateListeners.filter(l => l !== fn); };
  }

  /**
   * Convenience: push a CARS finding into the organism's cognitive register.
   * @param {string} finding  A published CARS finding string
   */
  ingestCARSFinding(finding) {
    this.queueUpdate({
      register: 'cognitive',
      key: 'nova-cars-finding',
      value: { finding, timestamp: Date.now(), phi: PHI },
    });
  }

  /**
   * Convenience: push a Nova governance signal into the sovereign register.
   * @param {{ proposalId: string, status: string, coherenceScore: number }} proposal
   */
  ingestGovernanceSignal(proposal) {
    this.queueUpdate({
      register: 'sovereign',
      key: 'nova-governance-signal',
      value: { ...proposal, nova: NOVA_ID, timestamp: Date.now() },
    });
  }

  /**
   * Wire status summary.
   * @returns {Object}
   */
  status() {
    return {
      wireId: this.#wireId,
      sovereign: NOVA_SOVEREIGN_ID,
      kernelCount: this.#kernels.size,
      pendingUpdateCount: this.#pendingUpdates.length,
      phiResonance: this.#phiResonance,
      heartbeatRunning: this.isRunning,
      beatCount: this.#beatCount,
      heartbeatMs: HEARTBEAT_MS,
    };
  }

  // ------------------------------------------------------------------ //
  // Private helpers                                                      //
  // ------------------------------------------------------------------ //

  /**
   * @returns {OrganismRegisterUpdate[]}
   */
  #drainPending() {
    if (this.#pendingUpdates.length === 0) return [];
    const batch = this.#pendingUpdates.splice(0);
    for (const fn of this.#updateListeners) {
      try { fn([...batch]); } catch { /* non-fatal */ }
    }
    return batch;
  }

  /**
   * Register built-in Nova kernels that are always available.
   */
  #registerBuiltinKernels() {
    this.loadKernel('nova:identity', () => ({
      id: NOVA_ID,
      sovereign: NOVA_SOVEREIGN_ID,
      phi: PHI,
      timestamp: Date.now(),
    }), { priority: 10 });

    this.loadKernel('nova:phi-pulse', (input) => {
      const signal = typeof input === 'number' ? input : 0.5;
      return phiBlend(signal, PHI_INVERSE);
    }, { priority: 5 });

    this.loadKernel('nova:coherence-check', (input) => {
      const score = typeof input === 'number' ? input : PHI_INVERSE;
      return {
        score,
        isCoherent: score >= PHI_INVERSE,
        phiDelta: score - PHI_INVERSE,
      };
    }, { priority: 5 });
  }
}
