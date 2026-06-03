const PHI = 1.618033988749895;

export class AnomalyForecaster {
  constructor(config = {}) {
    this.baselineWindow = config.baselineWindow ?? 32;
    this.deviationThreshold = config.deviationThreshold ?? PHI;
    this.adaptiveBaseline = config.adaptiveBaseline ?? true;
    this._baseline = null;
    this._history = [];
  }

  train(historicalData) {
    const values = historicalData.map(d => typeof d === 'number' ? d : d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    this._baseline = { mean, stdDev, size: values.length, phiBand: stdDev * PHI };
    this._history = [...values];
    return { trained: true, baselineSize: values.length, mean, stdDev, phiBand: this._baseline.phiBand };
  }

  forecast(horizon = 5) {
    if (!this._baseline) throw new Error('Model not trained');
    const forecasts = [];
    for (let step = 1; step <= horizon; step++) {
      const expectedValue = this._baseline.mean + (Math.random() - 0.5) * this._baseline.stdDev * 0.1;
      const anomalyProbability = Math.min(1.0, step * 0.05 / PHI);
      forecasts.push({ step, expectedValue, anomalyProbability });
    }
    const riskLevel = forecasts.reduce((s, f) => s + f.anomalyProbability, 0) / horizon > 0.5 ? 'high' : 'low';
    return { forecasts, riskLevel };
  }

  detect(value) {
    if (!this._baseline) throw new Error('Model not trained');
    const deviation = Math.abs(value - this._baseline.mean) / (this._baseline.stdDev || 1);
    const isAnomaly = deviation > this.deviationThreshold;
    const score = Math.min(1.0, deviation / (this.deviationThreshold * 2));
    return { isAnomaly, deviation, score, threshold: this.deviationThreshold };
  }

  getBaseline() { return this._baseline ? { ...this._baseline } : null; }
  reset() { this._baseline = null; this._history = []; }
}
