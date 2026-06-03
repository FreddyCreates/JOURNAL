import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class ClaimVerifier {
  constructor() { this._rules = new Map(); this._verifications = []; }
  addRule(claimType, validator) { if (typeof validator !== 'function') throw new TypeError('validator must be a function'); this._rules.set(claimType, validator); return { claimType, registered: true }; }
  verify(claims) { const results = {}; let passed = 0; let total = 0; for (const [type, value] of Object.entries(claims)) { total++; const rule = this._rules.get(type); if (rule) { const valid = rule(value); results[type] = { valid, value }; if (valid) passed++; } else { results[type] = { valid: true, value, noRule: true }; passed++; } } const confidence = total > 0 ? (passed / total) * (PHI / (PHI + 1)) : 0; const record = { verificationId: crypto.randomUUID(), results, passed, total, confidence, timestamp: Date.now() }; this._verifications.push(record); return record; }
  getRules() { return [...this._rules.keys()]; }
  getVerifications() { return [...this._verifications]; }
}
