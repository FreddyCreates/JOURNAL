import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class InsightCrystallizer {
  constructor(config = {}) {
    this.crystallizationThreshold = config.crystallizationThreshold ?? 0.8;
    this.phiPurity = config.phiPurity ?? true;
    this.maxInsights = config.maxInsights ?? 100;
    this._buffer = [];
    this._insights = new Map();
  }

  absorb(rawData) {
    this._buffer.push({ data: rawData, absorbedAt: Date.now(), strength: Math.random() * PHI / (PHI + 1) + 0.3 });
    const crystallizationPotential = this._buffer.filter(b => b.strength >= this.crystallizationThreshold).length / Math.max(this._buffer.length, 1);
    return { absorbed: true, bufferSize: this._buffer.length, crystallizationPotential };
  }

  crystallize() {
    const ready = this._buffer.filter(b => b.strength >= this.crystallizationThreshold);
    const insights = [];
    for (const item of ready) {
      if (this._insights.size >= this.maxInsights) break;
      const insightId = crypto.randomUUID();
      const clarity = item.strength * PHI / (PHI + 1);
      const purity = clarity * (PHI - 1);
      const phiAlignment = Math.abs(clarity - (1 / PHI)) < 0.2 ? 1.0 : clarity;
      const insight = { insightId, content: item.data, clarity, purity, phiAlignment };
      this._insights.set(insightId, insight);
      insights.push(insight);
    }
    this._buffer = this._buffer.filter(b => b.strength < this.crystallizationThreshold);
    return { insights, crystallized: insights.length, remaining: this._buffer.length };
  }

  getInsight(insightId) { return this._insights.get(insightId) ?? null; }
  getAllInsights() { return [...this._insights.values()]; }
  dissolve(insightId) { return this._insights.delete(insightId); }
}
