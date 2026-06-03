import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class SchemaValidator {
  constructor() { this._schemas = new Map(); }
  register(name, schema) { if (!schema || typeof schema !== 'object') throw new Error('Schema must be an object'); this._schemas.set(name, schema); return { name, registered: true }; }
  validate(schemaName, data) { const schema = this._schemas.get(schemaName); if (!schema) throw new Error(`Schema "${schemaName}" not found`); const errors = []; for (const [field, rules] of Object.entries(schema)) { if (rules.required && (data[field] === undefined || data[field] === null)) errors.push({ field, error: 'required' }); if (rules.type && data[field] !== undefined && typeof data[field] !== rules.type) errors.push({ field, error: `expected ${rules.type}` }); if (rules.min !== undefined && data[field] < rules.min) errors.push({ field, error: `min ${rules.min}` }); if (rules.max !== undefined && data[field] > rules.max) errors.push({ field, error: `max ${rules.max}` }); } return { valid: errors.length === 0, errors, phiCompliance: errors.length === 0 ? PHI / (PHI + 1) : 0 }; }
  getSchemas() { return [...this._schemas.keys()]; }
}
