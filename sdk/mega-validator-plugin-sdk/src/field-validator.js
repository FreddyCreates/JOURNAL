const PHI = 1.618033988749895;
export class FieldValidator {
  constructor() { this._validators = new Map(); }
  register(fieldName, validator) { if (typeof validator !== 'function') throw new TypeError('validator must be a function'); this._validators.set(fieldName, validator); return { fieldName, registered: true }; }
  validate(fieldName, value) { const validator = this._validators.get(fieldName); if (!validator) throw new Error(`No validator for field "${fieldName}"`); const result = validator(value); const valid = result === true; return { fieldName, value, valid, phiConfidence: valid ? PHI / (PHI + 1) : 0 }; }
  validateAll(data) { const results = {}; let passed = 0; for (const [field, validator] of this._validators) { const valid = validator(data[field]) === true; results[field] = { valid, value: data[field] }; if (valid) passed++; } return { results, passed, total: this._validators.size, allValid: passed === this._validators.size }; }
  getFields() { return [...this._validators.keys()]; }
}
