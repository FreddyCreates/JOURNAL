import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {Object} Baseline
 * @property {string} category
 * @property {number} mean
 * @property {number} stddev
 * @property {number} sampleCount
 * @property {number} trainedAt
 */

/**
 * @typedef {Object} AnomalyRecord
 * @property {string} anomalyId
 * @property {string} category
 * @property {number} sample
 * @property {number} deviation
 * @property {number} score
 * @property {boolean} quarantined
 * @property {number} detectedAt
 */

/**
 * @typedef {Object} EvaluationResult
 * @property {boolean} isAnomaly
 * @property {string} category
 * @property {number} sample
 * @property {number} deviation
 * @property {number} score
 * @property {string|null} anomalyId
 */

/**
 * AnomalyShield — detects and blocks anomalous behavior patterns
 * in organism data streams. Uses statistical baseline training with
 * phi-weighted deviation thresholds and confidence scoring.
 */
export class AnomalyShield {
  /** @type {Map<string, Baseline>} */
  #baselines;

  /** @type {Map<string, AnomalyRecord>} */
  #anomalies;

  /** @type {number} */
  #totalEvaluations;

  /** @type {number} */
  #totalDetections;

  /** @type {number} */
  #deviationThreshold

  /**
   * @param {Object} [config]
   * @param {number} [config.deviationThreshold=2] — number of standard deviations before flagging
   */
  constructor(config = {}) {
    this.#baselines = new Map();
    this.#anomalies = new Map();
    this.#totalEvaluations = 0;
    this.#totalDetections = 0;
    this.#deviationThreshold = config.deviationThreshold ?? 2;
  }

  /**
   * Trains a baseline from normal samples for the given category.
   *
   * Computes the arithmetic mean and standard deviation of the samples.
   * If a baseline already exists for this category, it is retrained with
   * the new samples.
   *
   * @param {string} category — the behavior category to train
   * @param {number[]} samples — array of numeric sample values
   * @returns {{ category: string, mean: number, stddev: number, sampleCount: number }}
   */
  trainBaseline(category, samples) {
    if (!Array.isArray(samples) || samples.length < 2) {
      throw new Error(`At least 2 samples required for baseline training, got ${samples?.length ?? 0}`);
    }

    const n = samples.length;
    const mean = samples.reduce((sum, v) => sum + v, 0) / n;
    const variance = samples.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (n - 1);
    const stddev = Math.sqrt(variance);

    this.#baselines.set(category, {
      category,
      mean,
      stddev: stddev || 1e-10,
      sampleCount: n,
      trainedAt: Date.now(),
    });

    return {
      category,
      mean: Math.round(mean * 10000) / 10000,
      stddev: Math.round(stddev * 10000) / 10000,
      sampleCount: n,
    };
  }

  /**
   * Evaluates a sample against its category's trained baseline.
   *
   * The deviation is measured in standard deviations from the mean.
   * A phi-weighted anomaly score is computed: score = |deviation| × (1/PHI)
   * normalized to [0, 1]. Samples exceeding the deviation threshold are
   * flagged as anomalies and recorded.
   *
   * @param {string} category — the behavior category to evaluate against
   * @param {number} sample — the numeric value to evaluate
   * @returns {EvaluationResult}
   */
  evaluate(category, sample) {
    const baseline = this.#baselines.get(category);
    if (!baseline) {
      throw new Error(`No baseline trained for category "${category}". Call trainBaseline() first.`);
    }

    this.#totalEvaluations++;

    const rawDeviation = (sample - baseline.mean) / baseline.stddev;
    const absDeviation = Math.abs(rawDeviation);
    const score = Math.min(1, absDeviation * (1 / PHI));
    const isAnomaly = absDeviation > this.#deviationThreshold;

    let anomalyId = null;
    if (isAnomaly) {
      anomalyId = `anomaly-${crypto.randomUUID().slice(0, 12)}`;
      this.#totalDetections++;

      this.#anomalies.set(anomalyId, {
        anomalyId,
        category,
        sample,
        deviation: Math.round(rawDeviation * 10000) / 10000,
        score: Math.round(score * 10000) / 10000,
        quarantined: false,
        detectedAt: Date.now(),
      });
    }

    return {
      isAnomaly,
      category,
      sample,
      deviation: Math.round(rawDeviation * 10000) / 10000,
      score: Math.round(score * 10000) / 10000,
      anomalyId,
    };
  }

  /**
   * Returns all detected anomalies.
   *
   * @returns {AnomalyRecord[]}
   */
  getAnomalies() {
    return [...this.#anomalies.values()].map((a) => ({ ...a }));
  }

  /**
   * Quarantines an anomaly for review.
   *
   * Quarantined anomalies are marked for human or automated review
   * and excluded from normal processing flows.
   *
   * @param {string} anomalyId — the anomaly to quarantine
   * @returns {{ anomalyId: string, quarantined: boolean, category: string }}
   */
  quarantine(anomalyId) {
    const anomaly = this.#anomalies.get(anomalyId);
    if (!anomaly) {
      throw new Error(`Anomaly "${anomalyId}" not found`);
    }

    if (anomaly.quarantined) {
      return { anomalyId, quarantined: true, category: anomaly.category };
    }

    anomaly.quarantined = true;
    return { anomalyId, quarantined: true, category: anomaly.category };
  }

  /**
   * Returns the overall detection confidence score.
   *
   * Confidence is phi-weighted based on training data volume and
   * detection consistency. Higher sample counts and lower false-positive
   * rates yield higher confidence.
   *
   * Formula: confidence = (1 - PHI^(-totalSamples/10)) × consistencyFactor
   * where consistencyFactor rewards consistent detection patterns.
   *
   * @returns {{ confidence: number, totalEvaluations: number, totalDetections: number, baselineCount: number, detectionRate: number }}
   */
  getConfidenceScore() {
    let totalSamples = 0;
    for (const baseline of this.#baselines.values()) {
      totalSamples += baseline.sampleCount;
    }

    const dataCoverage = 1 - Math.pow(PHI, -(totalSamples / 10));

    const detectionRate = this.#totalEvaluations > 0
      ? this.#totalDetections / this.#totalEvaluations
      : 0;

    const consistencyFactor = detectionRate > 0 && detectionRate < 1
      ? 1 - Math.abs(detectionRate - (1 / PHI)) * PHI
      : detectionRate === 0 ? 0.5 : 0.3;

    const confidence = Math.min(1, Math.max(0, dataCoverage * Math.abs(consistencyFactor)));

    return {
      confidence: Math.round(confidence * 10000) / 10000,
      totalEvaluations: this.#totalEvaluations,
      totalDetections: this.#totalDetections,
      baselineCount: this.#baselines.size,
      detectionRate: Math.round(detectionRate * 10000) / 10000,
    };
  }

  /**
   * Returns a summary of baselines and their training status.
   * @returns {Array<{ category: string, mean: number, stddev: number, sampleCount: number, trainedAt: number }>}
   */
  listBaselines() {
    return [...this.#baselines.values()].map((b) => ({
      category: b.category,
      mean: Math.round(b.mean * 10000) / 10000,
      stddev: Math.round(b.stddev * 10000) / 10000,
      sampleCount: b.sampleCount,
      trainedAt: b.trainedAt,
    }));
  }
}

export default AnomalyShield;
