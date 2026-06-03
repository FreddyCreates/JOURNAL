import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class CompositeValidator {
  constructor() { this._validators = []; }
  add(name, validateFn) { if (typeof validateFn !== 'function') throw new TypeError('validateFn must be a function'); this._validators.push({ name, validateFn }); return { name, position: this._validators.length - 1 }; }
  validate(data) { const results = []; let allValid = true; for (const v of this._validators) { const result = v.validateFn(data); const valid = result === true || (result && result.valid); results.push({ name: v.name, valid }); if (!valid) allValid = false; } return { compositeId: crypto.randomUUID(), valid: allValid, results, validCount: results.filter(r => r.valid).length, total: results.length, phiScore: allValid ? PHI / (PHI + 1) : 0 }; }
  getValidators() { return this._validators.map(v => v.name); }
}
