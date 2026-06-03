import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class TraceCollector {
  constructor(config = {}) { this.maxTraces = config.maxTraces ?? 10000; this._traces = new Map(); }
  startTrace(name, metadata = {}) { const trace = { traceId: crypto.randomUUID(), name, metadata, spans: [], startedAt: Date.now(), status: 'active' }; this._traces.set(trace.traceId, trace); return { traceId: trace.traceId, name }; }
  endTrace(traceId) { const trace = this._traces.get(traceId); if (!trace) throw new Error('Trace not found'); trace.status = 'completed'; trace.duration = Date.now() - trace.startedAt; trace.phiEfficiency = Math.min(1, trace.spans.length / (trace.duration / 100) * (PHI / (PHI + 1))); return { traceId, duration: trace.duration, spans: trace.spans.length, phiEfficiency: trace.phiEfficiency }; }
  addSpan(traceId, spanName) { const trace = this._traces.get(traceId); if (!trace) throw new Error('Trace not found'); const span = { spanId: crypto.randomUUID(), name: spanName, startedAt: Date.now() }; trace.spans.push(span); return span; }
  getTrace(traceId) { return this._traces.get(traceId) ?? null; }
  getTraces() { return [...this._traces.values()]; }
}
