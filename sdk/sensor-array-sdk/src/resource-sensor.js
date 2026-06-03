import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {'cpu' | 'memory' | 'storage'} ResourceType
 */

/**
 * @typedef {Object} ResourceSnapshot
 * @property {string} snapshotId
 * @property {number} timestamp
 * @property {number} cpu - CPU utilization (0–100)
 * @property {number} memory - Memory utilization (0–100)
 * @property {number} storage - Storage utilization (0–100)
 */

/**
 * @typedef {Object} UtilizationReport
 * @property {number} cpu
 * @property {number} memory
 * @property {number} storage
 * @property {number} composite - Phi-weighted composite score
 * @property {number} timestamp
 */

/**
 * @typedef {Object} ExhaustionPrediction
 * @property {ResourceType} resource
 * @property {number} currentUtilization
 * @property {number} trend - Rate of change per second
 * @property {number} predictedExhaustionMs - Estimated ms until 100% (Infinity if stable/declining)
 * @property {number} confidence - Prediction confidence (0–1)
 * @property {number} timestamp
 */

/**
 * @typedef {Object} ResourceAlert
 * @property {ResourceType} resource
 * @property {number} threshold
 * @property {function} callback
 * @property {string} alertId
 * @property {boolean} fired - Whether the alert has fired at least once
 */

/**
 * ResourceSensor — monitors compute resource usage (CPU, memory, storage).
 *
 * Takes periodic snapshots of resource utilization, computes phi-weighted
 * composite scores, predicts exhaustion using trend analysis, and supports
 * threshold-based alerting.
 */
export class ResourceSensor {
  /** @type {Array<ResourceSnapshot>} */
  #history;

  /** @type {number} */
  #maxHistory;

  /** @type {Array<ResourceAlert>} */
  #alerts;

  /** @type {{cpu: number, memory: number, storage: number}} */
  #simState;

  constructor() {
    this.#history = [];
    this.#maxHistory = 200;
    this.#alerts = [];
    this.#simState = {
      cpu: 20 + Math.random() * 30,
      memory: 30 + Math.random() * 20,
      storage: 40 + Math.random() * 15,
    };
  }

  /**
   * Takes a resource usage snapshot with simulated phi-drift values.
   * Each call advances the simulated resource state.
   * @returns {ResourceSnapshot}
   */
  sample() {
    this.#advanceSimulation();

    /** @type {ResourceSnapshot} */
    const snapshot = {
      snapshotId: crypto.randomUUID(),
      timestamp: Date.now(),
      cpu: Math.round(this.#simState.cpu * 100) / 100,
      memory: Math.round(this.#simState.memory * 100) / 100,
      storage: Math.round(this.#simState.storage * 100) / 100,
    };

    this.#history.push(snapshot);

    if (this.#history.length > this.#maxHistory) {
      this.#history.shift();
    }

    this.#evaluateAlerts(snapshot);

    return snapshot;
  }

  /**
   * Returns current utilization percentages and a phi-weighted composite score.
   * Composite = cpu/φ² + memory/φ + storage, normalized.
   * @returns {UtilizationReport}
   */
  getUtilization() {
    const latest = this.#history.length > 0
      ? this.#history[this.#history.length - 1]
      : this.sample();

    const phiSq = PHI * PHI;
    const rawComposite = (latest.cpu / phiSq) + (latest.memory / PHI) + latest.storage;
    const maxComposite = (100 / phiSq) + (100 / PHI) + 100;
    const composite = (rawComposite / maxComposite) * 100;

    return {
      cpu: latest.cpu,
      memory: latest.memory,
      storage: latest.storage,
      composite: Math.round(composite * 100) / 100,
      timestamp: latest.timestamp,
    };
  }

  /**
   * Uses phi-weighted trend analysis on recent samples to predict when
   * each resource will reach exhaustion (100% utilization).
   * @returns {Array<ExhaustionPrediction>}
   */
  predictExhaustion() {
    if (this.#history.length < 3) {
      const needed = 3 - this.#history.length;
      for (let i = 0; i < needed; i++) this.sample();
    }

    /** @type {ResourceType[]} */
    const resources = ['cpu', 'memory', 'storage'];
    const predictions = [];

    for (const resource of resources) {
      const trend = this.#computePhiWeightedTrend(resource);
      const currentVal = this.#simState[resource];

      let predictedExhaustionMs = Infinity;
      let confidence = 0;

      if (trend > 0) {
        const remaining = 100 - currentVal;
        predictedExhaustionMs = Math.round((remaining / trend) * 1000);

        const sampleCount = Math.min(this.#history.length, 20);
        const sampleFactor = sampleCount / 20;
        const trendStrength = Math.min(1, Math.abs(trend) * PHI);
        confidence = Math.round(sampleFactor * trendStrength * 10000) / 10000;
      }

      predictions.push({
        resource,
        currentUtilization: Math.round(currentVal * 100) / 100,
        trend: Math.round(trend * 10000) / 10000,
        predictedExhaustionMs,
        confidence: Math.min(1, confidence),
        timestamp: Date.now(),
      });
    }

    return predictions;
  }

  /**
   * Returns usage history snapshots within the given time window.
   * @param {number} windowMs - Time window in milliseconds
   * @returns {Array<ResourceSnapshot>}
   */
  getHistory(windowMs) {
    if (typeof windowMs !== 'number' || windowMs <= 0) {
      throw new RangeError('windowMs must be a positive number');
    }

    const cutoff = Date.now() - windowMs;
    return this.#history.filter(snap => snap.timestamp >= cutoff);
  }

  /**
   * Sets an alert that fires when a resource exceeds the given threshold.
   * @param {ResourceType} resource - Resource to monitor
   * @param {number} threshold - Threshold percentage (0–100)
   * @param {function} callback - Called with alert payload when threshold is crossed
   * @returns {string} Alert ID for removal
   */
  setAlert(resource, threshold, callback) {
    const validResources = ['cpu', 'memory', 'storage'];
    if (!validResources.includes(resource)) {
      throw new Error(`Invalid resource: "${resource}". Valid: ${validResources.join(', ')}`);
    }
    if (typeof threshold !== 'number' || threshold < 0 || threshold > 100) {
      throw new RangeError('Threshold must be a number between 0 and 100');
    }
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    const alertId = crypto.randomUUID();

    this.#alerts.push({
      resource,
      threshold,
      callback,
      alertId,
      fired: false,
    });

    return alertId;
  }

  /**
   * Removes an alert by its ID.
   * @param {string} alertId
   * @returns {boolean} True if the alert was found and removed
   */
  removeAlert(alertId) {
    const idx = this.#alerts.findIndex(a => a.alertId === alertId);
    if (idx === -1) return false;
    this.#alerts.splice(idx, 1);
    return true;
  }

  /**
   * Advances simulated resource values using phi-weighted random walk.
   */
  #advanceSimulation() {
    for (const key of /** @type {ResourceType[]} */ (['cpu', 'memory', 'storage'])) {
      const drift = (Math.random() - 0.48) * (10 / PHI);
      this.#simState[key] = Math.max(0, Math.min(100, this.#simState[key] + drift));
    }
  }

  /**
   * Evaluates all alerts against the given snapshot.
   * @param {ResourceSnapshot} snapshot
   */
  #evaluateAlerts(snapshot) {
    for (const alert of this.#alerts) {
      const value = snapshot[alert.resource];
      if (value >= alert.threshold) {
        alert.fired = true;
        try {
          alert.callback({
            alertId: alert.alertId,
            resource: alert.resource,
            threshold: alert.threshold,
            currentValue: value,
            timestamp: snapshot.timestamp,
          });
        } catch (err) {
          console.error(`[ResourceSensor] Alert callback error for "${alert.resource}":`, err);
        }
      }
    }
  }

  /**
   * Computes the phi-weighted trend (rate of change per second) for a resource.
   * More recent samples are weighted more heavily using 1/φ^i decay.
   * @param {ResourceType} resource
   * @returns {number} Rate of change per second
   */
  #computePhiWeightedTrend(resource) {
    const samples = this.#history.slice(-20);
    if (samples.length < 2) return 0;

    let weightedDeltaSum = 0;
    let weightedTimeSum = 0;
    let weightTotal = 0;

    for (let i = 1; i < samples.length; i++) {
      const dt = (samples[i].timestamp - samples[i - 1].timestamp) / 1000;
      if (dt <= 0) continue;

      const dv = samples[i][resource] - samples[i - 1][resource];
      const rate = dv / dt;
      const weight = Math.pow(1 / PHI, samples.length - 1 - i);

      weightedDeltaSum += rate * weight;
      weightTotal += weight;
    }

    return weightTotal > 0 ? weightedDeltaSum / weightTotal : 0;
  }

  /**
   * Cleans up history and alerts.
   */
  destroy() {
    this.#history = [];
    this.#alerts = [];
  }
}

export default ResourceSensor;
