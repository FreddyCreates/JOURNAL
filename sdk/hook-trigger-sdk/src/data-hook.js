/**
 * DataHook — intercepts data flows for transformation and validation.
 *
 * Registers transform and validation hooks at configurable positions
 * (before, after, wrap) and processes data through hook pipelines.
 * Maintains a full audit log and supports benchmarking hook overhead.
 */
export class DataHook {
  /** @type {number} Golden ratio for weighted transform scoring */
  static PHI = 1.618033988749895;

  /** @type {string[]} Valid hook positions */
  static POSITIONS = ['before', 'after', 'wrap'];

  /** @type {Map<string, Array<{hookId: string, dataType: string, transformFn: function, position: string, weight: number}>>} */
  #hooks;

  /** @type {Array<{hookId: string, dataType: string, position: string, timestamp: number, durationMs: number, inputHash: string, outputHash: string}>} */
  #transformLog;

  /** @type {Map<string, Array<{hookId: string, validatorFn: function}>>} */
  #validators;

  /** @type {number} */
  #processedCount;

  constructor() {
    this.#hooks = new Map();
    this.#transformLog = [];
    this.#validators = new Map();
    this.#processedCount = 0;
  }

  /**
   * Registers a data transformation hook.
   * @param {string} hookId - Unique hook identifier
   * @param {string} dataType - Data type this hook applies to
   * @param {function} transformFn - Transform function: (data) => transformedData
   * @param {string} [position='after'] - Hook position: 'before'|'after'|'wrap'
   * @returns {{hookId: string, dataType: string, position: string, weight: number}}
   */
  register(hookId, dataType, transformFn, position = 'after') {
    if (!DataHook.POSITIONS.includes(position)) {
      throw new Error(`Invalid position "${position}". Valid positions: ${DataHook.POSITIONS.join(', ')}`);
    }
    if (typeof transformFn !== 'function') {
      throw new TypeError('transformFn must be a function');
    }

    if (!this.#hooks.has(dataType)) {
      this.#hooks.set(dataType, []);
    }

    const chain = this.#hooks.get(dataType);
    const existing = chain.find(h => h.hookId === hookId);
    if (existing) {
      throw new Error(`Hook "${hookId}" is already registered for dataType "${dataType}"`);
    }

    const positionWeights = { before: DataHook.PHI * DataHook.PHI, after: DataHook.PHI, wrap: 1.0 };
    const weight = positionWeights[position];

    const entry = { hookId, dataType, transformFn, position, weight };
    chain.push(entry);
    chain.sort((a, b) => b.weight - a.weight);

    return { hookId, dataType, position, weight };
  }

  /**
   * Registers a validation hook for a data type.
   * @param {string} hookId - Unique validator identifier
   * @param {string} dataType - Data type to validate
   * @param {function} validatorFn - Validator: (data) => {valid: boolean, errors?: string[]}
   */
  registerValidator(hookId, dataType, validatorFn) {
    if (typeof validatorFn !== 'function') {
      throw new TypeError('validatorFn must be a function');
    }

    if (!this.#validators.has(dataType)) {
      this.#validators.set(dataType, []);
    }

    this.#validators.get(dataType).push({ hookId, validatorFn });
  }

  /**
   * Processes data through all registered hooks for the given data type.
   * Hooks fire in weight-sorted order: before hooks, then wrap hooks, then after hooks.
   * @param {string} dataType - Data type to process
   * @param {*} data - Input data
   * @returns {{data: *, hooksFired: number, totalMs: number}}
   */
  process(dataType, data) {
    const chain = this.#hooks.get(dataType);
    if (!chain || chain.length === 0) {
      return { data, hooksFired: 0, totalMs: 0 };
    }

    let result = this.#deepClone(data);
    let hooksFired = 0;
    const processStart = Date.now();
    this.#processedCount++;

    for (const entry of chain) {
      const hookStart = Date.now();
      const inputHash = this.#hashData(result);

      try {
        if (entry.position === 'wrap') {
          const original = result;
          result = entry.transformFn(original);
        } else {
          result = entry.transformFn(result);
        }
      } catch (err) {
        console.error(`[DataHook] Transform error in hook "${entry.hookId}":`, err);
        continue;
      }

      const durationMs = Date.now() - hookStart;
      const outputHash = this.#hashData(result);
      hooksFired++;

      this.#transformLog.push({
        hookId: entry.hookId,
        dataType,
        position: entry.position,
        timestamp: hookStart,
        durationMs,
        inputHash,
        outputHash,
      });
    }

    const totalMs = Date.now() - processStart;
    return { data: result, hooksFired, totalMs };
  }

  /**
   * Validates data using all registered validation hooks for the data type.
   * @param {string} dataType - Data type to validate
   * @param {*} data - Data to validate
   * @returns {{valid: boolean, errors: string[], validatorCount: number}}
   */
  validate(dataType, data) {
    const validators = this.#validators.get(dataType);
    if (!validators || validators.length === 0) {
      return { valid: true, errors: [], validatorCount: 0 };
    }

    const allErrors = [];
    let allValid = true;

    for (const { hookId, validatorFn } of validators) {
      try {
        const result = validatorFn(data);
        if (!result.valid) {
          allValid = false;
          const prefixed = (result.errors || []).map(e => `[${hookId}] ${e}`);
          allErrors.push(...prefixed);
        }
      } catch (err) {
        allValid = false;
        allErrors.push(`[${hookId}] Validator threw: ${err.message}`);
      }
    }

    return { valid: allValid, errors: allErrors, validatorCount: validators.length };
  }

  /**
   * Returns the transformation audit log.
   * @returns {Array<{hookId: string, dataType: string, position: string, timestamp: number, durationMs: number, inputHash: string, outputHash: string}>}
   */
  getTransformLog() {
    return [...this.#transformLog];
  }

  /**
   * Benchmarks hook overhead for a given data type by running the pipeline multiple times.
   * Uses phi-weighted averaging for stabilized results.
   * @param {string} dataType - Data type to benchmark
   * @param {*} sampleData - Sample data for the benchmark
   * @param {number} [iterations=10] - Number of benchmark iterations
   * @returns {{dataType: string, iterations: number, avgMs: number, minMs: number, maxMs: number, phiWeightedAvgMs: number}}
   */
  benchmark(dataType, sampleData, iterations = 10) {
    const timings = [];

    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      this.process(dataType, sampleData);
      timings.push(Date.now() - start);
    }

    const sorted = [...timings].sort((a, b) => a - b);
    const sum = timings.reduce((a, b) => a + b, 0);
    const avgMs = sum / timings.length;
    const minMs = sorted[0];
    const maxMs = sorted[sorted.length - 1];

    let phiWeightedSum = 0;
    let phiWeightTotal = 0;
    for (let i = 0; i < timings.length; i++) {
      const weight = Math.pow(DataHook.PHI, -(i / timings.length));
      phiWeightedSum += timings[i] * weight;
      phiWeightTotal += weight;
    }
    const phiWeightedAvgMs = phiWeightedSum / phiWeightTotal;

    return { dataType, iterations, avgMs, minMs, maxMs, phiWeightedAvgMs };
  }

  /**
   * Computes a simple hash string for audit logging.
   * @param {*} data
   * @returns {string}
   */
  #hashData(data) {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash |= 0;
    }
    return hash.toString(16);
  }

  /**
   * Creates a deep clone of the input data.
   * @param {*} data
   * @returns {*}
   */
  #deepClone(data) {
    if (data === null || typeof data !== 'object') return data;
    return JSON.parse(JSON.stringify(data));
  }
}

export default DataHook;
