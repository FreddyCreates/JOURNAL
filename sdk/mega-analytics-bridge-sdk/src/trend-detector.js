import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class TrendDetector {
  constructor(config = {}) {
    this.sensitivity = config.sensitivity ?? 0.5;
    this.windowSize = config.windowSize ?? 10;
    this._series = new Map();
    this._alerts = [];
  }

  addSeries(name) {
    if (this._series.has(name)) throw new Error(`Series "${name}" already exists`);
    this._series.set(name, { name, points: [], createdAt: Date.now() });
    return { name, created: true };
  }

  addPoint(seriesName, value) {
    const series = this._series.get(seriesName);
    if (!series) throw new Error(`Series "${seriesName}" not found`);
    series.points.push({ value, timestamp: Date.now() });
    if (series.points.length > this.windowSize * 3) series.points = series.points.slice(-this.windowSize * 3);
    return { seriesName, pointCount: series.points.length };
  }

  detect(seriesName) {
    const series = this._series.get(seriesName);
    if (!series) throw new Error(`Series "${seriesName}" not found`);
    if (series.points.length < this.windowSize) return { trend: 'insufficient_data', confidence: 0 };
    const recent = series.points.slice(-this.windowSize).map(p => p.value);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const slope = (recent[recent.length - 1] - recent[0]) / recent.length;
    const normalizedSlope = slope / (Math.abs(avg) || 1);
    const trend = normalizedSlope > this.sensitivity ? 'rising' : normalizedSlope < -this.sensitivity ? 'falling' : 'stable';
    const confidence = Math.min(1, Math.abs(normalizedSlope) * PHI);
    const result = { alertId: crypto.randomUUID(), seriesName, trend, slope, confidence, phiAdjusted: confidence * (PHI / (PHI + 1)), timestamp: Date.now() };
    if (trend !== 'stable') this._alerts.push(result);
    return result;
  }

  getAlerts() { return [...this._alerts]; }
  getSeries() { return [...this._series.keys()]; }
  clearAlerts() { this._alerts = []; }
}
