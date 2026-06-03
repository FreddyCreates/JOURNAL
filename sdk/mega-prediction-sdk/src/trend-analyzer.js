const PHI = 1.618033988749895;

export class TrendAnalyzer {
  constructor(config = {}) {
    this.sensitivity = config.sensitivity ?? 0.618;
    this.smoothingFactor = config.smoothingFactor ?? (1 / PHI);
    this.minDataPoints = config.minDataPoints ?? 5;
    this._data = [];
  }

  addDataPoint(value, label = null) {
    this._data.push({ value, label, index: this._data.length, timestamp: Date.now() });
    return { index: this._data.length - 1, value, label };
  }

  detectTrend() {
    if (this._data.length < this.minDataPoints) return { direction: 'insufficient', strength: 0, changePoints: [], phiMomentum: 0, confidence: 0 };
    const values = this._data.map(d => d.value);
    const n = values.length;
    let sumUp = 0, sumDown = 0;
    for (let i = 1; i < n; i++) {
      if (values[i] > values[i - 1]) sumUp++;
      else if (values[i] < values[i - 1]) sumDown++;
    }
    const direction = sumUp > sumDown * PHI ? 'upward' : sumDown > sumUp * PHI ? 'downward' : 'stable';
    const strength = Math.abs(sumUp - sumDown) / (n - 1);
    const phiMomentum = strength * PHI;
    const changePoints = this._detectChangePoints(values);
    return { direction, strength, changePoints, phiMomentum, confidence: Math.min(1.0, strength * PHI) };
  }

  _detectChangePoints(values) {
    const points = [];
    for (let i = 2; i < values.length; i++) {
      const prevSlope = values[i - 1] - values[i - 2];
      const currSlope = values[i] - values[i - 1];
      if (Math.abs(currSlope - prevSlope) > this.sensitivity) points.push(i);
    }
    return points;
  }

  getMovingAverage(window = 5) {
    if (this._data.length < window) return [];
    const result = [];
    for (let i = window - 1; i < this._data.length; i++) {
      let sum = 0, wSum = 0;
      for (let j = 0; j < window; j++) {
        const w = Math.pow(PHI, -j);
        sum += this._data[i - j].value * w;
        wSum += w;
      }
      result.push({ index: i, average: sum / wSum });
    }
    return result;
  }

  getSeasonality() {
    if (this._data.length < 10) return { detected: false, period: null };
    const values = this._data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const crossings = [];
    for (let i = 1; i < values.length; i++) {
      if ((values[i - 1] < mean && values[i] >= mean) || (values[i - 1] >= mean && values[i] < mean)) crossings.push(i);
    }
    const period = crossings.length > 2 ? Math.round((crossings[crossings.length - 1] - crossings[0]) / (crossings.length - 1) * 2) : null;
    return { detected: period !== null, period };
  }

  getDataPoints() { return [...this._data]; }
}
