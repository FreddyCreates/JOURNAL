const PHI = 1.618033988749895;

export class ConfidenceCalibrator {
  constructor(config = {}) {
    this.calibrationBins = config.calibrationBins ?? 10;
    this.phiAdjustment = config.phiAdjustment ?? true;
    this.minSamples = config.minSamples ?? 20;
    this._records = [];
  }

  record(predictedConfidence, actualOutcome) {
    this._records.push({ predicted: predictedConfidence, actual: actualOutcome ? 1 : 0, timestamp: Date.now() });
    return { recorded: true, totalRecords: this._records.length };
  }

  calibrate() {
    const bins = Array.from({ length: this.calibrationBins }, (_, i) => ({
      predicted: (i + 0.5) / this.calibrationBins,
      actual: 0,
      count: 0
    }));

    for (const r of this._records) {
      const binIdx = Math.min(this.calibrationBins - 1, Math.floor(r.predicted * this.calibrationBins));
      bins[binIdx].actual += r.actual;
      bins[binIdx].count++;
    }

    for (const bin of bins) {
      if (bin.count > 0) bin.actual /= bin.count;
    }

    const brierScore = this._records.length > 0
      ? this._records.reduce((s, r) => s + Math.pow(r.predicted - r.actual, 2), 0) / this._records.length
      : 1.0;
    const phiAlignment = 1 - Math.abs(brierScore - 1 / PHI);
    const isCalibrated = this._records.length >= this.minSamples && brierScore < 0.25;

    return { bins, brierScore, phiAlignment, isCalibrated };
  }

  adjustConfidence(rawConfidence) {
    if (this._records.length < this.minSamples) return rawConfidence;
    const binIdx = Math.min(this.calibrationBins - 1, Math.floor(rawConfidence * this.calibrationBins));
    const binRecords = this._records.filter(r => Math.floor(r.predicted * this.calibrationBins) === binIdx);
    if (binRecords.length === 0) return rawConfidence;
    const empirical = binRecords.reduce((s, r) => s + r.actual, 0) / binRecords.length;
    return this.phiAdjustment ? rawConfidence * (1 - 1/PHI) + empirical * (1/PHI) : empirical;
  }

  getReliabilityDiagram() {
    const { bins } = this.calibrate();
    return bins.filter(b => b.count > 0);
  }

  getStats() {
    return { totalRecords: this._records.length, bins: this.calibrationBins, minSamples: this.minSamples };
  }
}
