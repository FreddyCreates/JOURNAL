import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {Object} RhythmConfig
 * @property {string} rhythmId - Unique rhythm identifier
 * @property {number} periodMs - Natural period in milliseconds
 * @property {number} amplitude - Base amplitude (0–1)
 * @property {number} phase - Current phase in radians (0–2π)
 * @property {number} frequency - Derived frequency (1/periodMs)
 * @property {Array<number>} samples - Recent sample values
 * @property {number} sampleCount - Total samples taken
 * @property {number} lastSampleTime - Timestamp of last sample
 * @property {number} registeredAt - Registration timestamp
 * @property {number} driftAccumulator - Accumulated phase drift
 */

/**
 * @typedef {Object} RhythmSample
 * @property {string} rhythmId
 * @property {number} value - Current rhythm value (-amplitude to +amplitude)
 * @property {number} phase - Current phase in radians
 * @property {number} normalizedPhase - Phase normalized to 0–1
 * @property {number} timestamp
 * @property {string} sampleId
 */

/**
 * @typedef {Object} PhaseReport
 * @property {string} rhythmId
 * @property {number} phase - Phase in radians (0–2π)
 * @property {number} normalizedPhase - Phase normalized to 0–1
 * @property {string} quadrant - 'rising' | 'peak' | 'falling' | 'trough'
 * @property {number} angularVelocity - Radians per second
 * @property {number} timestamp
 */

/**
 * @typedef {Object} ArrhythmiaReport
 * @property {string} rhythmId
 * @property {boolean} irregular
 * @property {number} irregularityScore - 0–1, higher = more irregular
 * @property {string} type - 'none' | 'tachycardia' | 'bradycardia' | 'fibrillation' | 'skipped'
 * @property {number} expectedInterval - Expected sample interval in ms
 * @property {number} observedMeanInterval - Observed mean interval in ms
 * @property {number} timestamp
 * @property {string} reportId
 */

/**
 * @typedef {Object} SyncResult
 * @property {Array<string>} rhythmIds
 * @property {number} orderParameter - Kuramoto order parameter r (0–1)
 * @property {number} meanPhase - Mean phase in radians
 * @property {Array<{rhythmId: string, phaseAdjustment: number}>} adjustments
 * @property {number} timestamp
 */

/**
 * BioRhythmSensor — tracks biological rhythm patterns in organism lifecycle.
 *
 * Registers rhythms with configurable periods and amplitudes, samples waveforms,
 * detects arrhythmias via interval analysis, synchronizes multiple rhythms
 * using Kuramoto-style phase coupling, and computes overall resonance coherence.
 */
export class BioRhythmSensor {
  /** @type {Map<string, RhythmConfig>} */
  #rhythms;

  /** @type {number} Maximum sample buffer size */
  #maxSamples;

  /** @type {number} Kuramoto coupling strength */
  #couplingStrength;

  constructor() {
    this.#rhythms = new Map();
    this.#maxSamples = 100;
    this.#couplingStrength = 1 / PHI;
  }

  /**
   * Registers a new biological rhythm for tracking.
   * @param {string} rhythmId - Unique rhythm identifier
   * @param {number} periodMs - Natural oscillation period in milliseconds
   * @param {number} amplitude - Base amplitude (0–1)
   * @throws {Error} If rhythm already exists or parameters are invalid
   */
  registerRhythm(rhythmId, periodMs, amplitude) {
    if (this.#rhythms.has(rhythmId)) {
      throw new Error(`Rhythm "${rhythmId}" is already registered`);
    }
    if (typeof periodMs !== 'number' || periodMs <= 0) {
      throw new RangeError('Period must be a positive number in milliseconds');
    }
    if (typeof amplitude !== 'number' || amplitude < 0 || amplitude > 1) {
      throw new RangeError('Amplitude must be a number between 0 and 1');
    }

    const now = Date.now();

    /** @type {RhythmConfig} */
    const config = {
      rhythmId,
      periodMs,
      amplitude,
      phase: 0,
      frequency: 1 / periodMs,
      samples: [],
      sampleCount: 0,
      lastSampleTime: now,
      registeredAt: now,
      driftAccumulator: 0,
    };

    this.#rhythms.set(rhythmId, config);
  }

  /**
   * Takes a rhythm sample, advancing the phase based on elapsed time.
   * The waveform is a phi-modulated sinusoid.
   * @param {string} rhythmId
   * @returns {RhythmSample}
   * @throws {Error} If rhythm is not registered
   */
  sample(rhythmId) {
    const rhythm = this.#getRhythm(rhythmId);
    const now = Date.now();
    const elapsed = now - rhythm.lastSampleTime;

    const phaseAdvance = (2 * Math.PI * elapsed) / rhythm.periodMs;
    rhythm.phase = (rhythm.phase + phaseAdvance) % (2 * Math.PI);
    rhythm.lastSampleTime = now;

    const phiModulation = 1 + (Math.sin(rhythm.phase * PHI) / (PHI * PHI));
    const value = rhythm.amplitude * Math.sin(rhythm.phase) * phiModulation;

    rhythm.samples.push(value);
    rhythm.sampleCount++;

    if (rhythm.samples.length > this.#maxSamples) {
      rhythm.samples.shift();
    }

    const normalizedPhase = rhythm.phase / (2 * Math.PI);

    return {
      rhythmId,
      value: Math.round(value * 10000) / 10000,
      phase: Math.round(rhythm.phase * 10000) / 10000,
      normalizedPhase: Math.round(normalizedPhase * 10000) / 10000,
      timestamp: now,
      sampleId: crypto.randomUUID(),
    };
  }

  /**
   * Returns the current phase information for a rhythm.
   * Quadrants: rising (0–π/2), peak (π/2–π), falling (π–3π/2), trough (3π/2–2π).
   * @param {string} rhythmId
   * @returns {PhaseReport}
   * @throws {Error} If rhythm is not registered
   */
  getPhase(rhythmId) {
    const rhythm = this.#getRhythm(rhythmId);
    const now = Date.now();

    const elapsed = now - rhythm.lastSampleTime;
    const currentPhase = (rhythm.phase + (2 * Math.PI * elapsed) / rhythm.periodMs) % (2 * Math.PI);

    const normalizedPhase = currentPhase / (2 * Math.PI);
    const halfPi = Math.PI / 2;

    let quadrant = 'rising';
    if (currentPhase >= halfPi && currentPhase < Math.PI) quadrant = 'peak';
    else if (currentPhase >= Math.PI && currentPhase < 3 * halfPi) quadrant = 'falling';
    else if (currentPhase >= 3 * halfPi) quadrant = 'trough';

    const angularVelocity = (2 * Math.PI) / (rhythm.periodMs / 1000);

    return {
      rhythmId,
      phase: Math.round(currentPhase * 10000) / 10000,
      normalizedPhase: Math.round(normalizedPhase * 10000) / 10000,
      quadrant,
      angularVelocity: Math.round(angularVelocity * 10000) / 10000,
      timestamp: now,
    };
  }

  /**
   * Detects arrhythmia by analyzing sample intervals and amplitude variance.
   * Types: tachycardia (too fast), bradycardia (too slow), fibrillation (erratic),
   * skipped (missing beats).
   * @param {string} rhythmId
   * @returns {ArrhythmiaReport}
   * @throws {Error} If rhythm is not registered
   */
  detectArrhythmia(rhythmId) {
    const rhythm = this.#getRhythm(rhythmId);

    if (rhythm.samples.length < 5) {
      return this.#buildArrhythmiaReport(rhythmId, false, 0, 'none', rhythm.periodMs, rhythm.periodMs);
    }

    const samples = rhythm.samples;
    const N = samples.length;

    const mean = samples.reduce((s, v) => s + v, 0) / N;
    const variance = samples.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / N;
    const stdDev = Math.sqrt(variance);

    const expectedAmplitude = rhythm.amplitude;
    const amplitudeRatio = stdDev / Math.max(0.0001, expectedAmplitude);

    const zerocrossings = this.#countZeroCrossings(samples);
    const expectedCrossings = Math.max(1, Math.round(N / (this.#maxSamples / (rhythm.periodMs / 100))));

    const crossingRatio = zerocrossings / Math.max(1, expectedCrossings);

    let type = 'none';
    let score = 0;

    if (crossingRatio > PHI * PHI) {
      type = 'fibrillation';
      score = Math.min(1, (crossingRatio - 1) / (PHI * PHI));
    } else if (crossingRatio > PHI) {
      type = 'tachycardia';
      score = Math.min(1, (crossingRatio - 1) / PHI);
    } else if (crossingRatio < 1 / PHI && N > 10) {
      type = 'bradycardia';
      score = Math.min(1, (1 - crossingRatio) * PHI);
    } else if (amplitudeRatio < 1 / (PHI * PHI) && N > 10) {
      type = 'skipped';
      score = Math.min(1, 1 - amplitudeRatio * PHI);
    }

    const observedInterval = rhythm.periodMs * (1 / Math.max(0.1, crossingRatio));

    return this.#buildArrhythmiaReport(
      rhythmId,
      score > 0.1,
      score,
      type,
      rhythm.periodMs,
      Math.round(observedInterval * 100) / 100,
    );
  }

  /**
   * Synchronizes multiple rhythms using Kuramoto-style phase coupling.
   * Each rhythm's phase is adjusted toward the mean phase, weighted by coupling strength.
   * @param {Array<string>} rhythmIds - IDs of rhythms to synchronize
   * @returns {SyncResult}
   * @throws {Error} If fewer than 2 rhythms or any rhythm not found
   */
  synchronize(rhythmIds) {
    if (!Array.isArray(rhythmIds) || rhythmIds.length < 2) {
      throw new Error('At least 2 rhythm IDs are required for synchronization');
    }

    const rhythms = rhythmIds.map(id => this.#getRhythm(id));
    const N = rhythms.length;

    let sinSum = 0;
    let cosSum = 0;

    for (const r of rhythms) {
      sinSum += Math.sin(r.phase);
      cosSum += Math.cos(r.phase);
    }

    const orderParameter = Math.sqrt(sinSum * sinSum + cosSum * cosSum) / N;
    const meanPhase = Math.atan2(sinSum / N, cosSum / N);

    const adjustments = [];

    for (const r of rhythms) {
      const phaseDiff = Math.sin(meanPhase - r.phase);
      const adjustment = this.#couplingStrength * phaseDiff / PHI;

      r.phase = (r.phase + adjustment + 2 * Math.PI) % (2 * Math.PI);
      r.driftAccumulator += adjustment;

      adjustments.push({
        rhythmId: r.rhythmId,
        phaseAdjustment: Math.round(adjustment * 10000) / 10000,
      });
    }

    return {
      rhythmIds: [...rhythmIds],
      orderParameter: Math.round(orderParameter * 10000) / 10000,
      meanPhase: Math.round(((meanPhase + 2 * Math.PI) % (2 * Math.PI)) * 10000) / 10000,
      adjustments,
      timestamp: Date.now(),
    };
  }

  /**
   * Computes overall rhythm coherence (resonance score) across all registered rhythms.
   * Uses the Kuramoto order parameter averaged with phi-weighted amplitude consistency.
   * @returns {{resonanceScore: number, orderParameter: number, amplitudeCoherence: number, rhythmCount: number, timestamp: number}}
   */
  getResonanceScore() {
    const rhythms = [...this.#rhythms.values()];
    const N = rhythms.length;

    if (N === 0) {
      return {
        resonanceScore: 0,
        orderParameter: 0,
        amplitudeCoherence: 0,
        rhythmCount: 0,
        timestamp: Date.now(),
      };
    }

    if (N === 1) {
      return {
        resonanceScore: 1,
        orderParameter: 1,
        amplitudeCoherence: 1,
        rhythmCount: 1,
        timestamp: Date.now(),
      };
    }

    let sinSum = 0;
    let cosSum = 0;

    for (const r of rhythms) {
      sinSum += Math.sin(r.phase);
      cosSum += Math.cos(r.phase);
    }

    const orderParameter = Math.sqrt(sinSum * sinSum + cosSum * cosSum) / N;

    const amplitudes = rhythms.map(r => r.amplitude);
    const meanAmp = amplitudes.reduce((s, a) => s + a, 0) / N;
    const ampVariance = amplitudes.reduce((s, a) => s + Math.pow(a - meanAmp, 2), 0) / N;
    const amplitudeCoherence = Math.max(0, 1 - Math.sqrt(ampVariance) * PHI);

    const resonanceScore = (orderParameter / PHI + amplitudeCoherence * (1 - 1 / PHI));

    return {
      resonanceScore: Math.round(Math.min(1, Math.max(0, resonanceScore)) * 10000) / 10000,
      orderParameter: Math.round(orderParameter * 10000) / 10000,
      amplitudeCoherence: Math.round(amplitudeCoherence * 10000) / 10000,
      rhythmCount: N,
      timestamp: Date.now(),
    };
  }

  /**
   * Counts zero crossings in a sample array.
   * @param {Array<number>} samples
   * @returns {number}
   */
  #countZeroCrossings(samples) {
    let count = 0;
    for (let i = 1; i < samples.length; i++) {
      if ((samples[i - 1] >= 0 && samples[i] < 0) || (samples[i - 1] < 0 && samples[i] >= 0)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Retrieves a rhythm config or throws.
   * @param {string} rhythmId
   * @returns {RhythmConfig}
   */
  #getRhythm(rhythmId) {
    const rhythm = this.#rhythms.get(rhythmId);
    if (!rhythm) {
      throw new Error(`Rhythm "${rhythmId}" not found`);
    }
    return rhythm;
  }

  /**
   * Builds a standardized arrhythmia report.
   * @param {string} rhythmId
   * @param {boolean} irregular
   * @param {number} score
   * @param {string} type
   * @param {number} expectedInterval
   * @param {number} observedMeanInterval
   * @returns {ArrhythmiaReport}
   */
  #buildArrhythmiaReport(rhythmId, irregular, score, type, expectedInterval, observedMeanInterval) {
    return {
      rhythmId,
      irregular,
      irregularityScore: Math.round(score * 10000) / 10000,
      type,
      expectedInterval,
      observedMeanInterval,
      timestamp: Date.now(),
      reportId: crypto.randomUUID(),
    };
  }

  /**
   * Unregisters a rhythm.
   * @param {string} rhythmId
   */
  unregisterRhythm(rhythmId) {
    if (!this.#rhythms.has(rhythmId)) {
      throw new Error(`Rhythm "${rhythmId}" not found`);
    }
    this.#rhythms.delete(rhythmId);
  }

  /**
   * Cleans up all rhythms.
   */
  destroy() {
    this.#rhythms.clear();
  }
}

export default BioRhythmSensor;
