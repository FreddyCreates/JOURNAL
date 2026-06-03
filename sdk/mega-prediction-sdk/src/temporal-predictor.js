import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class TemporalPredictor {
  constructor(config = {}) {
    this.horizon = config.horizon ?? 12;
    this.phiDecay = config.phiDecay ?? PHI;
    this.windowSize = config.windowSize ?? 64;
    this.method = config.method ?? 'phi-exponential';
    this._observations = [];
  }

  addObservation(value, timestamp = Date.now()) {
    const obs = { observationId: crypto.randomUUID(), index: this._observations.length, value, timestamp };
    this._observations.push(obs);
    if (this._observations.length > this.windowSize) this._observations.shift();
    return { ...obs };
  }

  predict(stepsAhead = 1) {
    if (this._observations.length === 0) return { predictions: [], method: this.method, horizon: stepsAhead, generatedAt: Date.now() };
    const predictions = [];
    const recent = this._observations.slice(-Math.min(this._observations.length, 10));
    const weights = recent.map((_, i) => Math.pow(PHI, -(recent.length - 1 - i)));
    const weightSum = weights.reduce((a, b) => a + b, 0);
    const smoothed = recent.reduce((sum, obs, i) => sum + obs.value * weights[i], 0) / weightSum;
    const trend = recent.length > 1 ? (recent[recent.length - 1].value - recent[0].value) / recent.length : 0;

    for (let step = 1; step <= stepsAhead; step++) {
      const value = smoothed + trend * step * Math.pow(PHI, -step);
      const confidence = Math.max(0.1, 1.0 - step * 0.05 / PHI);
      predictions.push({ step, value, confidence });
    }
    return { predictions, method: this.method, horizon: stepsAhead, generatedAt: Date.now() };
  }

  getHistory() { return [...this._observations]; }

  getAccuracy() {
    if (this._observations.length < 3) return { accuracy: 0, sampleSize: 0 };
    let errors = 0;
    for (let i = 2; i < this._observations.length; i++) {
      const predicted = this._observations[i - 1].value + (this._observations[i - 1].value - this._observations[i - 2].value) / PHI;
      errors += Math.abs(predicted - this._observations[i].value);
    }
    const mae = errors / (this._observations.length - 2);
    return { accuracy: Math.max(0, 1 - mae), sampleSize: this._observations.length, mae };
  }

  reset() { this._observations = []; }
}
