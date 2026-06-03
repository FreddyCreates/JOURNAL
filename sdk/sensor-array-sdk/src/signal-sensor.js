import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {Object} ChannelConfig
 * @property {number} [sampleRate=1000] - Expected samples per second
 * @property {number} [bufferSize=256] - Signal buffer size
 * @property {string} [unit=''] - Signal measurement unit
 */

/**
 * @typedef {Object} ChannelRecord
 * @property {string} channelId
 * @property {ChannelConfig} config
 * @property {Array<number>} buffer - Circular signal buffer
 * @property {number} writeIndex - Current write position
 * @property {number} sampleCount - Total samples ingested
 * @property {number} lastIngestTime - Timestamp of last ingest
 */

/**
 * @typedef {Object} SpectrumBin
 * @property {number} frequency - Frequency bin center
 * @property {number} magnitude - Phi-weighted magnitude
 * @property {number} phase - Phase angle in radians
 */

/**
 * @typedef {Object} AnomalyReport
 * @property {string} channelId
 * @property {boolean} anomalyDetected
 * @property {number} anomalyScore - 0–1 score, higher = more anomalous
 * @property {string} type - 'none' | 'spike' | 'dropout' | 'drift' | 'saturation'
 * @property {number} timestamp
 * @property {string} reportId
 */

/**
 * SignalSensor — processes and analyzes signal patterns in organism communication.
 *
 * Registers signal channels with configurable sample rates and buffer sizes,
 * ingests raw signals, computes phi-weighted FFT approximations for frequency
 * spectrum analysis, detects anomalies, and measures signal-to-noise ratio.
 */
export class SignalSensor {
  /** @type {Map<string, ChannelRecord>} */
  #channels;

  constructor() {
    this.#channels = new Map();
  }

  /**
   * Registers a signal channel for ingestion and analysis.
   * @param {string} channelId - Unique channel identifier
   * @param {ChannelConfig} [config={}]
   * @throws {Error} If channel already exists
   */
  registerChannel(channelId, config = {}) {
    if (this.#channels.has(channelId)) {
      throw new Error(`Signal channel "${channelId}" is already registered`);
    }

    const bufferSize = config.bufferSize ?? 256;

    /** @type {ChannelRecord} */
    const record = {
      channelId,
      config: {
        sampleRate: config.sampleRate ?? 1000,
        bufferSize,
        unit: config.unit ?? '',
      },
      buffer: new Array(bufferSize).fill(0),
      writeIndex: 0,
      sampleCount: 0,
      lastIngestTime: 0,
    };

    this.#channels.set(channelId, record);
  }

  /**
   * Ingests a raw signal value into the channel's circular buffer.
   * @param {string} channelId
   * @param {number} signal - Raw signal value
   * @returns {{channelId: string, sampleIndex: number, bufferUtilization: number, timestamp: number}}
   * @throws {Error} If channel is not registered
   */
  ingest(channelId, signal) {
    const ch = this.#getChannel(channelId);

    ch.buffer[ch.writeIndex] = signal;
    ch.writeIndex = (ch.writeIndex + 1) % ch.config.bufferSize;
    ch.sampleCount++;
    ch.lastIngestTime = Date.now();

    const utilization = Math.min(1, ch.sampleCount / ch.config.bufferSize);

    return {
      channelId,
      sampleIndex: ch.sampleCount,
      bufferUtilization: Math.round(utilization * 10000) / 10000,
      timestamp: ch.lastIngestTime,
    };
  }

  /**
   * Returns a phi-weighted frequency spectrum approximation for the channel.
   * Uses a simplified DFT with phi-scaled frequency bins for efficient analysis.
   * @param {string} channelId
   * @returns {Array<SpectrumBin>}
   * @throws {Error} If channel is not registered
   */
  getSpectrum(channelId) {
    const ch = this.#getChannel(channelId);
    const data = this.#getOrderedBuffer(ch);
    const N = data.length;

    const numBins = Math.min(N, Math.round(N / PHI));
    const spectrum = [];

    for (let k = 0; k < numBins; k++) {
      let realSum = 0;
      let imagSum = 0;

      const freqWeight = Math.pow(1 / PHI, k / numBins);

      for (let n = 0; n < N; n++) {
        const angle = (2 * Math.PI * k * n) / N;
        realSum += data[n] * Math.cos(angle) * freqWeight;
        imagSum -= data[n] * Math.sin(angle) * freqWeight;
      }

      realSum /= N;
      imagSum /= N;

      const magnitude = Math.sqrt(realSum * realSum + imagSum * imagSum);
      const phase = Math.atan2(imagSum, realSum);
      const frequency = (k * ch.config.sampleRate) / N;

      spectrum.push({
        frequency: Math.round(frequency * 100) / 100,
        magnitude: Math.round(magnitude * 10000) / 10000,
        phase: Math.round(phase * 10000) / 10000,
      });
    }

    return spectrum;
  }

  /**
   * Detects signal anomalies using statistical analysis with phi-scaled thresholds.
   * Anomaly types: spike (sudden jump), dropout (sudden drop), drift (trend shift),
   * saturation (all values at extremes).
   * @param {string} channelId
   * @returns {AnomalyReport}
   * @throws {Error} If channel is not registered
   */
  detectAnomaly(channelId) {
    const ch = this.#getChannel(channelId);
    const data = this.#getOrderedBuffer(ch);
    const N = data.length;

    if (N < 4) {
      return this.#buildAnomalyReport(channelId, false, 0, 'none');
    }

    const mean = data.reduce((s, v) => s + v, 0) / N;
    const variance = data.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / N;
    const stdDev = Math.sqrt(variance);

    const spikeThreshold = mean + stdDev * PHI * PHI;
    const dropoutThreshold = mean - stdDev * PHI * PHI;

    const recentWindow = data.slice(-Math.max(4, Math.round(N / PHI)));
    const recentMean = recentWindow.reduce((s, v) => s + v, 0) / recentWindow.length;

    let maxDeviation = 0;
    for (const v of recentWindow) {
      const dev = Math.abs(v - mean);
      if (dev > maxDeviation) maxDeviation = dev;
    }

    const hasSpike = recentWindow.some(v => v > spikeThreshold);
    const hasDropout = recentWindow.some(v => v < dropoutThreshold);

    const driftMagnitude = Math.abs(recentMean - mean);
    const driftThreshold = stdDev * PHI;
    const hasDrift = driftMagnitude > driftThreshold;

    const range = Math.max(...data) - Math.min(...data);
    const hasSaturation = range < stdDev / (PHI * PHI) && N > 10;

    let type = 'none';
    let anomalyScore = 0;

    if (hasSpike) {
      type = 'spike';
      anomalyScore = Math.min(1, maxDeviation / (stdDev * PHI * PHI * PHI));
    } else if (hasDropout) {
      type = 'dropout';
      anomalyScore = Math.min(1, maxDeviation / (stdDev * PHI * PHI * PHI));
    } else if (hasDrift) {
      type = 'drift';
      anomalyScore = Math.min(1, driftMagnitude / (stdDev * PHI * PHI));
    } else if (hasSaturation) {
      type = 'saturation';
      anomalyScore = Math.min(1, 1 - range / (stdDev / PHI));
    }

    return this.#buildAnomalyReport(channelId, anomalyScore > 0, anomalyScore, type);
  }

  /**
   * Computes the signal-to-noise ratio for a channel.
   * Signal power is estimated from the dominant frequency bin; noise is the residual.
   * @param {string} channelId
   * @returns {{channelId: string, snr: number, signalPower: number, noisePower: number, timestamp: number}}
   * @throws {Error} If channel is not registered
   */
  getSignalToNoise(channelId) {
    const ch = this.#getChannel(channelId);
    const data = this.#getOrderedBuffer(ch);
    const N = data.length;

    const mean = data.reduce((s, v) => s + v, 0) / N;
    const totalPower = data.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / N;

    const spectrum = this.getSpectrum(channelId);
    let maxMag = 0;
    for (const bin of spectrum) {
      if (bin.magnitude > maxMag) maxMag = bin.magnitude;
    }

    const signalPower = maxMag * maxMag * PHI;
    const noisePower = Math.max(0.0001, totalPower - signalPower);

    const snr = 10 * Math.log10(Math.max(0.0001, signalPower) / noisePower);

    return {
      channelId,
      snr: Math.round(snr * 100) / 100,
      signalPower: Math.round(signalPower * 10000) / 10000,
      noisePower: Math.round(noisePower * 10000) / 10000,
      timestamp: Date.now(),
    };
  }

  /**
   * Retrieves a channel record or throws.
   * @param {string} channelId
   * @returns {ChannelRecord}
   */
  #getChannel(channelId) {
    const ch = this.#channels.get(channelId);
    if (!ch) {
      throw new Error(`Signal channel "${channelId}" not found`);
    }
    return ch;
  }

  /**
   * Returns the channel buffer in chronological order.
   * @param {ChannelRecord} ch
   * @returns {Array<number>}
   */
  #getOrderedBuffer(ch) {
    const filled = Math.min(ch.sampleCount, ch.config.bufferSize);
    if (filled <= 0) return [0];

    if (ch.sampleCount <= ch.config.bufferSize) {
      return ch.buffer.slice(0, filled);
    }

    return [
      ...ch.buffer.slice(ch.writeIndex),
      ...ch.buffer.slice(0, ch.writeIndex),
    ];
  }

  /**
   * Builds a standardized anomaly report object.
   * @param {string} channelId
   * @param {boolean} detected
   * @param {number} score
   * @param {string} type
   * @returns {AnomalyReport}
   */
  #buildAnomalyReport(channelId, detected, score, type) {
    return {
      channelId,
      anomalyDetected: detected,
      anomalyScore: Math.round(score * 10000) / 10000,
      type,
      timestamp: Date.now(),
      reportId: crypto.randomUUID(),
    };
  }

  /**
   * Unregisters a signal channel.
   * @param {string} channelId
   */
  unregisterChannel(channelId) {
    if (!this.#channels.has(channelId)) {
      throw new Error(`Signal channel "${channelId}" not found`);
    }
    this.#channels.delete(channelId);
  }

  /**
   * Cleans up all channels.
   */
  destroy() {
    this.#channels.clear();
  }
}

export default SignalSensor;
