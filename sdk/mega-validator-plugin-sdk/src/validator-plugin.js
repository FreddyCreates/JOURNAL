import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class ValidatorPlugin {
  constructor(config = {}) { this.name = config.name ?? 'validator'; this.strict = config.strict ?? false; this._history = []; }
  validate(data, rules) { if (!Array.isArray(rules)) throw new Error('rules must be an array'); const errors = []; for (const rule of rules) { if (typeof rule !== 'function') continue; const result = rule(data); if (result !== true) errors.push(typeof result === 'string' ? result : 'Validation failed'); } const record = { validationId: crypto.randomUUID(), valid: errors.length === 0, errors, phiStrength: errors.length === 0 ? PHI / (PHI + 1) : 0, timestamp: Date.now() }; this._history.push(record); if (this.strict && errors.length > 0) throw new Error(errors[0]); return record; }
  getHistory() { return [...this._history]; }
}
