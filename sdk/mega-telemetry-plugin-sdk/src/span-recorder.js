import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class SpanRecorder {
  constructor() { this._spans = []; this._active = new Map(); }
  start(name, parentId = null) { const span = { spanId: crypto.randomUUID(), name, parentId, startedAt: Date.now(), attributes: {} }; this._active.set(span.spanId, span); return { spanId: span.spanId, name }; }
  end(spanId) { const span = this._active.get(spanId); if (!span) throw new Error('Span not found'); span.duration = Date.now() - span.startedAt; span.phiWeight = Math.min(1, span.duration / 1000 * (PHI / (PHI + 1))); this._active.delete(spanId); this._spans.push(span); return { spanId, duration: span.duration }; }
  setAttribute(spanId, key, value) { const span = this._active.get(spanId); if (!span) throw new Error('Span not found'); span.attributes[key] = value; return { spanId, key, value }; }
  getCompleted() { return [...this._spans]; }
  getActive() { return [...this._active.values()]; }
}
