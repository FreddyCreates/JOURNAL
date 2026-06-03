/**
 * ErrorHook — captures and handles errors with intelligent recovery strategies.
 *
 * Supports retry (with phi-weighted exponential backoff), fallback, escalate,
 * absorb, and circuit-break strategies. Circuit breakers track failure counts
 * and transition through closed → open → half-open states automatically.
 */
export class ErrorHook {
  /** @type {number} Golden ratio for retry delay weighting */
  static PHI = 1.618033988749895;

  /** @type {string[]} Valid recovery strategies */
  static STRATEGIES = ['retry', 'fallback', 'escalate', 'absorb', 'circuit-break'];

  /** @type {number} Default base delay for retries in milliseconds */
  static BASE_DELAY_MS = 100;

  /** @type {number} Default maximum retry attempts */
  static MAX_RETRIES = 5;

  /** @type {number} Circuit breaker failure threshold before opening */
  static CIRCUIT_THRESHOLD = 5;

  /** @type {number} Circuit breaker recovery window in milliseconds */
  static CIRCUIT_RECOVERY_MS = 30000;

  /** @type {Map<string, {hookId: string, errorType: string, handler: function, strategy: string, retryCount: number, maxRetries: number}>} */
  #hooks;

  /** @type {Array<{hookId: string, errorType: string, strategy: string, timestamp: number, resolved: boolean, message: string, attempts: number}>} */
  #errorHistory;

  /** @type {Map<string, {state: string, failures: number, lastFailure: number, lastStateChange: number}>} */
  #circuits;

  /** @type {Map<string, function>} */
  #escalationHandlers;

  constructor() {
    this.#hooks = new Map();
    this.#errorHistory = [];
    this.#circuits = new Map();
    this.#escalationHandlers = new Map();
  }

  /**
   * Registers an error handling hook.
   * @param {string} hookId - Unique hook identifier
   * @param {string} errorType - Error type or class name to match
   * @param {function} handler - Error handler: (error, context) => result
   * @param {string} [strategy='retry'] - Recovery strategy
   * @param {Object} [options={}] - Additional options
   * @param {number} [options.maxRetries=5] - Max retry attempts for retry strategy
   * @param {function} [options.fallbackFn] - Fallback function for fallback strategy
   * @param {function} [options.escalateTo] - Escalation handler
   * @returns {{hookId: string, errorType: string, strategy: string}}
   */
  register(hookId, errorType, handler, strategy = 'retry', options = {}) {
    if (!ErrorHook.STRATEGIES.includes(strategy)) {
      throw new Error(`Invalid strategy "${strategy}". Valid: ${ErrorHook.STRATEGIES.join(', ')}`);
    }
    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be a function');
    }
    if (this.#hooks.has(hookId)) {
      throw new Error(`Hook "${hookId}" is already registered`);
    }

    const entry = {
      hookId,
      errorType,
      handler,
      strategy,
      retryCount: 0,
      maxRetries: options.maxRetries ?? ErrorHook.MAX_RETRIES,
    };

    this.#hooks.set(hookId, entry);

    if (strategy === 'circuit-break') {
      this.#circuits.set(hookId, {
        state: 'closed',
        failures: 0,
        lastFailure: 0,
        lastStateChange: Date.now(),
      });
    }

    if (strategy === 'escalate' && typeof options.escalateTo === 'function') {
      this.#escalationHandlers.set(hookId, options.escalateTo);
    }

    if (strategy === 'fallback' && typeof options.fallbackFn === 'function') {
      this.#escalationHandlers.set(`${hookId}:fallback`, options.fallbackFn);
    }

    return { hookId, errorType, strategy };
  }

  /**
   * Handles an error by matching it to registered hooks and applying the strategy.
   * @param {Error} error - The error to handle
   * @param {Object} [context={}] - Additional context
   * @returns {Promise<{handled: boolean, hookId: string|null, strategy: string|null, result: *, attempts: number}>}
   */
  async handle(error, context = {}) {
    const errorType = error.constructor?.name || 'Error';
    const matchingHook = this.#findMatchingHook(errorType);

    if (!matchingHook) {
      this.#errorHistory.push({
        hookId: null,
        errorType,
        strategy: null,
        timestamp: Date.now(),
        resolved: false,
        message: error.message,
        attempts: 0,
      });
      return { handled: false, hookId: null, strategy: null, result: null, attempts: 0 };
    }

    const { hookId, strategy } = matchingHook;

    switch (strategy) {
      case 'retry':
        return this.#handleRetry(matchingHook, error, context);
      case 'fallback':
        return this.#handleFallback(matchingHook, error, context);
      case 'escalate':
        return this.#handleEscalate(matchingHook, error, context);
      case 'absorb':
        return this.#handleAbsorb(matchingHook, error, context);
      case 'circuit-break':
        return this.#handleCircuitBreak(matchingHook, error, context);
      default:
        return { handled: false, hookId, strategy, result: null, attempts: 0 };
    }
  }

  /**
   * Returns the full error history with resolution status.
   * @returns {Array<{hookId: string|null, errorType: string, strategy: string|null, timestamp: number, resolved: boolean, message: string, attempts: number}>}
   */
  getErrorHistory() {
    return [...this.#errorHistory];
  }

  /**
   * Returns the circuit breaker state for a given hook.
   * @param {string} hookId - Hook identifier
   * @returns {{state: string, failures: number, lastFailure: number, lastStateChange: number}}
   */
  getCircuitState(hookId) {
    const circuit = this.#circuits.get(hookId);
    if (!circuit) {
      throw new Error(`No circuit breaker found for hook "${hookId}"`);
    }

    if (circuit.state === 'open') {
      const elapsed = Date.now() - circuit.lastFailure;
      if (elapsed >= ErrorHook.CIRCUIT_RECOVERY_MS) {
        circuit.state = 'half-open';
        circuit.lastStateChange = Date.now();
      }
    }

    return { ...circuit };
  }

  /**
   * Resets a circuit breaker to closed state.
   * @param {string} hookId - Hook identifier
   * @returns {boolean} True if the circuit was found and reset
   */
  resetCircuit(hookId) {
    const circuit = this.#circuits.get(hookId);
    if (!circuit) return false;

    circuit.state = 'closed';
    circuit.failures = 0;
    circuit.lastFailure = 0;
    circuit.lastStateChange = Date.now();
    return true;
  }

  /**
   * Finds a hook matching the error type. Falls back to a wildcard '*' hook.
   * @param {string} errorType
   * @returns {{hookId: string, errorType: string, handler: function, strategy: string, maxRetries: number}|null}
   */
  #findMatchingHook(errorType) {
    for (const entry of this.#hooks.values()) {
      if (entry.errorType === errorType || entry.errorType === '*') {
        return entry;
      }
    }
    return null;
  }

  /**
   * Retry strategy with phi-weighted exponential backoff.
   * Delay = BASE_DELAY_MS × PHI^attemptNumber
   */
  async #handleRetry(hook, error, context) {
    let attempts = 0;
    let lastError = error;

    while (attempts < hook.maxRetries) {
      attempts++;
      const delay = ErrorHook.BASE_DELAY_MS * Math.pow(ErrorHook.PHI, attempts);
      await this.#sleep(delay);

      try {
        const result = await hook.handler(lastError, { ...context, attempt: attempts });
        this.#errorHistory.push({
          hookId: hook.hookId,
          errorType: hook.errorType,
          strategy: 'retry',
          timestamp: Date.now(),
          resolved: true,
          message: error.message,
          attempts,
        });
        return { handled: true, hookId: hook.hookId, strategy: 'retry', result, attempts };
      } catch (retryError) {
        lastError = retryError;
      }
    }

    this.#errorHistory.push({
      hookId: hook.hookId,
      errorType: hook.errorType,
      strategy: 'retry',
      timestamp: Date.now(),
      resolved: false,
      message: error.message,
      attempts,
    });
    return { handled: false, hookId: hook.hookId, strategy: 'retry', result: null, attempts };
  }

  /** Fallback strategy: invokes the fallback function when the handler fails. */
  async #handleFallback(hook, error, context) {
    try {
      const result = await hook.handler(error, context);
      this.#logResolution(hook, error, true, 1);
      return { handled: true, hookId: hook.hookId, strategy: 'fallback', result, attempts: 1 };
    } catch (_handlerError) {
      const fallbackFn = this.#escalationHandlers.get(`${hook.hookId}:fallback`);
      if (fallbackFn) {
        try {
          const result = await fallbackFn(error, context);
          this.#logResolution(hook, error, true, 1);
          return { handled: true, hookId: hook.hookId, strategy: 'fallback', result, attempts: 1 };
        } catch (_fallbackError) { /* fall through */ }
      }
      this.#logResolution(hook, error, false, 1);
      return { handled: false, hookId: hook.hookId, strategy: 'fallback', result: null, attempts: 1 };
    }
  }

  /** Escalate strategy: passes the error to an escalation handler. */
  async #handleEscalate(hook, error, context) {
    const escalateTo = this.#escalationHandlers.get(hook.hookId);
    if (escalateTo) {
      try {
        const result = await escalateTo(error, context);
        this.#logResolution(hook, error, true, 1);
        return { handled: true, hookId: hook.hookId, strategy: 'escalate', result, attempts: 1 };
      } catch (_err) { /* fall through */ }
    }
    this.#logResolution(hook, error, false, 1);
    return { handled: false, hookId: hook.hookId, strategy: 'escalate', result: null, attempts: 1 };
  }

  /** Absorb strategy: swallows the error and logs it silently. */
  async #handleAbsorb(hook, error, _context) {
    this.#logResolution(hook, error, true, 1);
    return { handled: true, hookId: hook.hookId, strategy: 'absorb', result: null, attempts: 1 };
  }

  /** Circuit-break strategy: tracks failures and opens the circuit when threshold is exceeded. */
  async #handleCircuitBreak(hook, error, context) {
    const circuit = this.#circuits.get(hook.hookId);
    if (!circuit) {
      return { handled: false, hookId: hook.hookId, strategy: 'circuit-break', result: null, attempts: 0 };
    }

    if (circuit.state === 'open') {
      const elapsed = Date.now() - circuit.lastFailure;
      if (elapsed < ErrorHook.CIRCUIT_RECOVERY_MS) {
        this.#logResolution(hook, error, false, 0);
        return { handled: false, hookId: hook.hookId, strategy: 'circuit-break', result: null, attempts: 0 };
      }
      circuit.state = 'half-open';
      circuit.lastStateChange = Date.now();
    }

    try {
      const result = await hook.handler(error, context);
      if (circuit.state === 'half-open') {
        circuit.state = 'closed';
        circuit.failures = 0;
        circuit.lastStateChange = Date.now();
      }
      this.#logResolution(hook, error, true, 1);
      return { handled: true, hookId: hook.hookId, strategy: 'circuit-break', result, attempts: 1 };
    } catch (_err) {
      circuit.failures++;
      circuit.lastFailure = Date.now();
      if (circuit.failures >= ErrorHook.CIRCUIT_THRESHOLD) {
        circuit.state = 'open';
        circuit.lastStateChange = Date.now();
      }
      this.#logResolution(hook, error, false, 1);
      return { handled: false, hookId: hook.hookId, strategy: 'circuit-break', result: null, attempts: 1 };
    }
  }

  /**
   * Logs an error resolution entry.
   * @param {{hookId: string, errorType: string, strategy: string}} hook
   * @param {Error} error
   * @param {boolean} resolved
   * @param {number} attempts
   */
  #logResolution(hook, error, resolved, attempts) {
    this.#errorHistory.push({
      hookId: hook.hookId,
      errorType: hook.errorType,
      strategy: hook.strategy,
      timestamp: Date.now(),
      resolved,
      message: error.message,
      attempts,
    });
  }

  /**
   * Async sleep utility.
   * @param {number} ms
   * @returns {Promise<void>}
   */
  #sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ErrorHook;
