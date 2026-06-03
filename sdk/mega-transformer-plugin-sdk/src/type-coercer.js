const PHI = 1.618033988749895;
export class TypeCoercer {
  constructor() { this._rules = new Map(); }
  addRule(type, coercer) { if (typeof coercer !== 'function') throw new TypeError('coercer must be a function'); this._rules.set(type, coercer); return { type, ruleCount: this._rules.size }; }
  coerce(value, targetType) { const rule = this._rules.get(targetType); if (!rule) throw new Error(`No coercion rule for type "${targetType}"`); const result = rule(value); return { original: value, coerced: result, targetType, phiConfidence: PHI / (PHI + 1) }; }
  getRules() { return [...this._rules.keys()]; }
}
