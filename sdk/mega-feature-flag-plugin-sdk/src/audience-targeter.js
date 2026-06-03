import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class AudienceTargeter {
  constructor() { this._segments = new Map(); }
  defineSegment(name, predicate) { if (typeof predicate !== 'function') throw new TypeError('predicate must be a function'); this._segments.set(name, predicate); return { name, segmentCount: this._segments.size }; }
  evaluate(context) { const matched = []; for (const [name, predicate] of this._segments) { if (predicate(context)) matched.push(name); } return { matched, matchCount: matched.length, phiTargeting: matched.length / (this._segments.size || 1) * (PHI / (PHI + 1)) }; }
  isInSegment(segmentName, context) { const predicate = this._segments.get(segmentName); if (!predicate) throw new Error(`Segment "${segmentName}" not found`); return predicate(context); }
  getSegments() { return [...this._segments.keys()]; }
}
