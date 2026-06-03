import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class AnalyticsPipeline {
  constructor(config = {}) {
    this.maxStages = config.maxStages ?? 12;
    this.phiDecay = config.phiDecay ?? PHI;
    this._stages = [];
    this._events = [];
    this._results = [];
  }

  addStage(name, transform) {
    if (this._stages.length >= this.maxStages) throw new Error('Max stages reached');
    if (typeof transform !== 'function') throw new TypeError('transform must be a function');
    const stage = { stageId: crypto.randomUUID(), name, transform, addedAt: Date.now(), order: this._stages.length };
    this._stages.push(stage);
    return { stageId: stage.stageId, name, order: stage.order };
  }

  ingest(event) {
    if (!event || typeof event !== 'object') throw new Error('Event must be an object');
    const enriched = { ...event, eventId: crypto.randomUUID(), ingestedAt: Date.now(), phiWeight: PHI / (PHI + 1) };
    this._events.push(enriched);
    return enriched;
  }

  process() {
    const results = [];
    for (const event of this._events) {
      let data = { ...event };
      let stagesApplied = 0;
      for (const stage of this._stages) {
        data = stage.transform(data);
        stagesApplied++;
      }
      const phiScore = stagesApplied > 0 ? Math.min(1, (stagesApplied / this._stages.length) * (PHI / (PHI + 1))) : 0;
      const result = { resultId: crypto.randomUUID(), data, stagesApplied, phiScore, processedAt: Date.now() };
      results.push(result);
      this._results.push(result);
    }
    this._events = [];
    return { processed: results.length, results };
  }

  getStages() { return this._stages.map(s => ({ stageId: s.stageId, name: s.name, order: s.order })); }
  getResults() { return [...this._results]; }
  flush() { this._events = []; this._results = []; }
}
