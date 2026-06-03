import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class ContextPropagator {
  constructor() { this._contexts = new Map(); }
  inject(carrier, context) { const encoded = Buffer.from(JSON.stringify(context)).toString('base64'); carrier['x-trace-context'] = encoded; return { injected: true, size: encoded.length }; }
  extract(carrier) { const encoded = carrier['x-trace-context']; if (!encoded) return { extracted: false, context: null }; const context = JSON.parse(Buffer.from(encoded, 'base64').toString()); return { extracted: true, context, phiIntegrity: PHI / (PHI + 1) }; }
  createContext(traceId, spanId) { return { traceId, spanId, phiCorrelation: PHI / (PHI + 1), createdAt: Date.now() }; }
}
