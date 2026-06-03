import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class MetaCognitionController {
  constructor(config = {}) {
    this.reflectionDepth = config.reflectionDepth ?? 3;
    this.selfModelUpdateRate = config.selfModelUpdateRate ?? PHI;
    this._reflections = [];
    this._selfModel = { version: 0, observations: [], lastUpdate: null, phiAlignment: 0 };
  }

  reflect(thought) {
    const complexity = (typeof thought === 'string' ? thought.length : JSON.stringify(thought).length) / PHI;
    const hash = crypto.createHash('sha256').update(JSON.stringify(thought)).digest('hex');
    const novelty = parseInt(hash.slice(0, 8), 16) / 0xFFFFFFFF;
    const coherence = (parseInt(hash.slice(8, 16), 16) / 0xFFFFFFFF) * (PHI / 2);
    const reflection = {
      reflectionId: crypto.randomUUID(),
      thought,
      analysis: { complexity, novelty, coherence },
      depth: 0,
      timestamp: Date.now()
    };
    this._reflections.push(reflection);
    return { ...reflection };
  }

  assessPerformance(metrics) {
    const keys = Object.keys(metrics);
    const values = Object.values(metrics).filter(v => typeof v === 'number');
    const phiWeightedSum = values.reduce((sum, v, i) => sum + v * Math.pow(PHI, -i), 0);
    const overallScore = phiWeightedSum / (values.length || 1);
    const strengths = keys.filter((k, i) => values[i] > 0.7);
    const weaknesses = keys.filter((k, i) => values[i] < 0.3);
    const recommendation = overallScore > 0.7 ? 'maintain' : overallScore > 0.4 ? 'optimize' : 'restructure';
    return { overallScore, strengths, weaknesses, recommendation };
  }

  updateSelfModel(observations) {
    this._selfModel.version++;
    this._selfModel.observations.push(...(Array.isArray(observations) ? observations : [observations]));
    this._selfModel.lastUpdate = Date.now();
    this._selfModel.phiAlignment = (this._selfModel.version * PHI) % 1;
    return { modelVersion: this._selfModel.version, observationCount: this._selfModel.observations.length, lastUpdate: this._selfModel.lastUpdate, phiAlignment: this._selfModel.phiAlignment };
  }

  getSelfModel() {
    return { ...this._selfModel, observations: [...this._selfModel.observations] };
  }

  getReflectionHistory() {
    return [...this._reflections];
  }
}
