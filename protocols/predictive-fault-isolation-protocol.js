/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  PREDICTIVE FAULT ISOLATION PROTOCOL — PRE-EMPTIVE FAILURE CONTAINMENT                ║
 * ║  "Praedictio Defectuum — Isolate Failures Before They Cascade"                        ║
 * ║                                                                                        ║
 * ║  "Praevideo ergo protego. Defectus isolatur. Organismus integer manet."               ║
 * ║  (I foresee therefore I protect. The fault is isolated. The organism remains whole.)  ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// FAULT TYPES AND ISOLATION LEVELS
// ════════════════════════════════════════════════════════════════════════════════

const FaultType = {
  MEMORY_LEAK: 'MEMORY_LEAK',
  COHERENCE_DRIFT: 'COHERENCE_DRIFT',
  LATENCY_SPIKE: 'LATENCY_SPIKE',
  THROUGHPUT_COLLAPSE: 'THROUGHPUT_COLLAPSE',
  STATE_CORRUPTION: 'STATE_CORRUPTION',
  CASCADING_FAILURE: 'CASCADING_FAILURE',
  RESOURCE_EXHAUSTION: 'RESOURCE_EXHAUSTION',
  DEADLOCK: 'DEADLOCK',
};

const IsolationLevel = {
  MONITOR: 'MONITOR',       // Watch but don't act
  THROTTLE: 'THROTTLE',     // Reduce load to component
  QUARANTINE: 'QUARANTINE', // Isolate from neighbors
  CIRCUIT_BREAK: 'CIRCUIT_BREAK', // Full disconnect
  KILL: 'KILL',             // Terminate and restart
};

const PredictionConfidence = {
  LOW: { threshold: 0.3, action: IsolationLevel.MONITOR },
  MEDIUM: { threshold: 0.5, action: IsolationLevel.THROTTLE },
  HIGH: { threshold: 0.7, action: IsolationLevel.QUARANTINE },
  CERTAIN: { threshold: 0.9, action: IsolationLevel.CIRCUIT_BREAK },
};

// ════════════════════════════════════════════════════════════════════════════════
// HEALTH METRIC TRACKER
// ════════════════════════════════════════════════════════════════════════════════

class HealthMetricTracker {
  constructor(metricName, windowSize = 100) {
    this.metricName = metricName;
    this.values = [];
    this.windowSize = windowSize;
    this.baseline = null;
    this.mean = 0;
    this.stdDev = 0;
    this.trend = 0;
    this.anomalyCount = 0;
  }

  record(value) {
    this.values.push({ value, timestamp: Date.now() });
    if (this.values.length > this.windowSize) this.values.shift();
    this.updateStatistics();
    return this.isAnomaly(value);
  }

  updateStatistics() {
    const vals = this.values.map(v => v.value);
    const n = vals.length;
    if (n < 3) return;

    this.mean = vals.reduce((a, b) => a + b, 0) / n;
    this.stdDev = Math.sqrt(
      vals.reduce((sum, v) => sum + (v - this.mean) ** 2, 0) / n
    );

    // Calculate trend (linear regression slope)
    const xMean = (n - 1) / 2;
    let numerator = 0;
    let denominator = 0;
    vals.forEach((y, x) => {
      numerator += (x - xMean) * (y - this.mean);
      denominator += (x - xMean) ** 2;
    });
    this.trend = denominator > 0 ? numerator / denominator : 0;

    if (!this.baseline && n >= 20) {
      this.baseline = { mean: this.mean, stdDev: this.stdDev };
    }
  }

  isAnomaly(value) {
    if (this.values.length < 10) return false;
    const deviation = Math.abs(value - this.mean) / (this.stdDev || 1);
    const isAnomalous = deviation > PHI; // More than φ standard deviations
    if (isAnomalous) this.anomalyCount++;
    return isAnomalous;
  }

  predictNextValue() {
    if (this.values.length < 5) return this.mean;
    return this.mean + this.trend * PHI;
  }

  getHealthScore() {
    if (!this.baseline) return 1.0;
    const drift = Math.abs(this.mean - this.baseline.mean) / (this.baseline.stdDev || 1);
    return Math.max(0, 1 - drift * PHI_COMPLEMENT);
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// FAULT PREDICTOR
// ════════════════════════════════════════════════════════════════════════════════

class FaultPredictor {
  constructor(componentId) {
    this.componentId = componentId;
    this.metrics = new Map();
    this.predictions = [];
    this.maxPredictions = 50;
    this.faultPatterns = new Map();
  }

  trackMetric(metricName) {
    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, new HealthMetricTracker(metricName));
    }
    return this.metrics.get(metricName);
  }

  recordMetric(metricName, value) {
    const tracker = this.trackMetric(metricName);
    const isAnomaly = tracker.record(value);

    if (isAnomaly) {
      this.evaluateFaultRisk();
    }

    return { isAnomaly, healthScore: tracker.getHealthScore() };
  }

  evaluateFaultRisk() {
    const risks = [];

    this.metrics.forEach((tracker, name) => {
      const health = tracker.getHealthScore();
      const trend = tracker.trend;
      const anomalies = tracker.anomalyCount;

      // Memory leak pattern: steadily increasing trend
      if (name.includes('memory') && trend > 0.5) {
        risks.push({
          faultType: FaultType.MEMORY_LEAK,
          confidence: Math.min(1, trend * PHI_INVERSE),
          metric: name,
        });
      }

      // Latency spike: high anomaly count
      if (name.includes('latency') && anomalies > 5) {
        risks.push({
          faultType: FaultType.LATENCY_SPIKE,
          confidence: Math.min(1, anomalies * 0.1),
          metric: name,
        });
      }

      // Coherence drift: health declining
      if (name.includes('coherence') && health < PHI_COMPLEMENT) {
        risks.push({
          faultType: FaultType.COHERENCE_DRIFT,
          confidence: 1 - health,
          metric: name,
        });
      }

      // General degradation
      if (health < 0.5) {
        risks.push({
          faultType: FaultType.THROUGHPUT_COLLAPSE,
          confidence: 1 - health,
          metric: name,
        });
      }
    });

    if (risks.length > 0) {
      const prediction = {
        componentId: this.componentId,
        risks: risks.sort((a, b) => b.confidence - a.confidence),
        highestRisk: risks[0],
        timestamp: Date.now(),
      };
      this.predictions.push(prediction);
      if (this.predictions.length > this.maxPredictions) this.predictions.shift();
      return prediction;
    }

    return null;
  }

  getRecommendedAction() {
    if (this.predictions.length === 0) return IsolationLevel.MONITOR;

    const latest = this.predictions[this.predictions.length - 1];
    const confidence = latest.highestRisk.confidence;

    for (const [, level] of Object.entries(PredictionConfidence)) {
      if (confidence >= level.threshold) {
        return level.action;
      }
    }
    return IsolationLevel.MONITOR;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// ISOLATION CHAMBER
// ════════════════════════════════════════════════════════════════════════════════

class IsolationChamber {
  constructor() {
    this.isolatedComponents = new Map();
    this.isolationHistory = [];
    this.maxHistory = 200;
  }

  isolate(componentId, level, reason) {
    this.isolatedComponents.set(componentId, {
      level,
      reason,
      isolatedAt: Date.now(),
      escalations: 0,
    });
    this.isolationHistory.push({
      componentId,
      level,
      reason,
      action: 'ISOLATED',
      timestamp: Date.now(),
    });
    if (this.isolationHistory.length > this.maxHistory) this.isolationHistory.shift();
    return this;
  }

  escalate(componentId) {
    const entry = this.isolatedComponents.get(componentId);
    if (!entry) return null;

    const levels = Object.values(IsolationLevel);
    const currentIdx = levels.indexOf(entry.level);
    if (currentIdx < levels.length - 1) {
      entry.level = levels[currentIdx + 1];
      entry.escalations++;
    }
    return entry;
  }

  release(componentId) {
    this.isolatedComponents.delete(componentId);
    this.isolationHistory.push({
      componentId,
      action: 'RELEASED',
      timestamp: Date.now(),
    });
    return this;
  }

  isIsolated(componentId) {
    return this.isolatedComponents.has(componentId);
  }

  getStatus() {
    return {
      isolatedCount: this.isolatedComponents.size,
      components: Object.fromEntries(this.isolatedComponents),
      recentActions: this.isolationHistory.slice(-10),
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// PREDICTIVE FAULT ISOLATION ENGINE
// ════════════════════════════════════════════════════════════════════════════════

class PredictiveFaultIsolationEngine {
  constructor() {
    this.predictors = new Map();
    this.chamber = new IsolationChamber();
    this.globalHealthScore = 1.0;
    this.eventLog = [];
    this.autoIsolate = true;
  }

  registerComponent(componentId) {
    this.predictors.set(componentId, new FaultPredictor(componentId));
    return this;
  }

  recordMetric(componentId, metricName, value) {
    const predictor = this.predictors.get(componentId);
    if (!predictor) return null;

    const result = predictor.recordMetric(metricName, value);

    if (this.autoIsolate && result.healthScore < PHI_COMPLEMENT) {
      const action = predictor.getRecommendedAction();
      if (action !== IsolationLevel.MONITOR) {
        this.chamber.isolate(componentId, action, `Health score: ${result.healthScore.toFixed(3)}`);
        this.logEvent('AUTO_ISOLATED', { componentId, action, healthScore: result.healthScore });
      }
    }

    this.updateGlobalHealth();
    return result;
  }

  updateGlobalHealth() {
    const predictors = Array.from(this.predictors.values());
    if (predictors.length === 0) { this.globalHealthScore = 1.0; return; }

    const healthScores = predictors.map(p => {
      const metrics = Array.from(p.metrics.values());
      if (metrics.length === 0) return 1.0;
      return metrics.reduce((sum, m) => sum + m.getHealthScore(), 0) / metrics.length;
    });

    this.globalHealthScore = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
  }

  logEvent(type, data) {
    this.eventLog.push({ type, data, timestamp: Date.now() });
    if (this.eventLog.length > 500) this.eventLog.shift();
  }

  getStatus() {
    return {
      globalHealthScore: this.globalHealthScore,
      componentCount: this.predictors.size,
      isolatedCount: this.chamber.isolatedComponents.size,
      autoIsolate: this.autoIsolate,
      chamber: this.chamber.getStatus(),
      recentEvents: this.eventLog.slice(-10),
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  FaultType,
  IsolationLevel,
  PredictionConfidence,
  HealthMetricTracker,
  FaultPredictor,
  IsolationChamber,
  PredictiveFaultIsolationEngine,
};

export default {
  PROTOCOL_ID: 'PROTO-PFI-001',
  PROTOCOL_NAME: 'Predictive Fault Isolation Protocol',
  DOCTRINE: 'Praevideo ergo protego. Defectus isolatur. Organismus integer manet.',
  DOCTRINE_EN: 'I foresee therefore I protect. The fault is isolated. The organism remains whole.',

  FaultType,
  IsolationLevel,
  PredictionConfidence,
  HealthMetricTracker,
  FaultPredictor,
  IsolationChamber,
  PredictiveFaultIsolationEngine,
};
