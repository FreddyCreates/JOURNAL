import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class InsightEngine {
  constructor(config = {}) {
    this.confidenceThreshold = config.confidenceThreshold ?? 0.7;
    this.maxInsights = config.maxInsights ?? 50;
    this._insights = [];
    this._patterns = [];
  }

  detectPattern(dataPoints) {
    if (!Array.isArray(dataPoints) || dataPoints.length < 2) throw new Error('Need at least 2 data points');
    const diffs = [];
    for (let i = 1; i < dataPoints.length; i++) diffs.push(dataPoints[i] - dataPoints[i - 1]);
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const trend = avgDiff > 0 ? 'increasing' : avgDiff < 0 ? 'decreasing' : 'stable';
    const variance = diffs.reduce((a, d) => a + Math.pow(d - avgDiff, 2), 0) / diffs.length;
    const confidence = Math.min(1, 1 / (1 + variance) * (PHI / (PHI + 1)));
    const pattern = { patternId: crypto.randomUUID(), trend, confidence, avgDiff, variance, pointCount: dataPoints.length };
    this._patterns.push(pattern);
    return pattern;
  }

  generateInsight(pattern, context = '') {
    if (this._insights.length >= this.maxInsights) throw new Error('Max insights reached');
    const significance = pattern.confidence * (PHI / (PHI + 1));
    const insight = { insightId: crypto.randomUUID(), pattern: pattern.patternId, trend: pattern.trend, significance, context, generatedAt: Date.now(), actionable: significance >= this.confidenceThreshold };
    this._insights.push(insight);
    return insight;
  }

  getInsights(filter = {}) {
    let results = [...this._insights];
    if (filter.actionable !== undefined) results = results.filter(i => i.actionable === filter.actionable);
    if (filter.minSignificance) results = results.filter(i => i.significance >= filter.minSignificance);
    return results;
  }

  getPatterns() { return [...this._patterns]; }
  clear() { this._insights = []; this._patterns = []; }
}
