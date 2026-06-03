import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class RuleEngine {
  constructor() { this._rules = new Map(); this._results = []; }
  addRule(name, predicate, message = '') { if (typeof predicate !== 'function') throw new TypeError('predicate must be a function'); this._rules.set(name, { predicate, message }); return { name, ruleCount: this._rules.size }; }
  validate(data) { const errors = []; let passed = 0; for (const [name, rule] of this._rules) { if (rule.predicate(data)) { passed++; } else { errors.push({ rule: name, message: rule.message || `Rule "${name}" failed` }); } } const confidence = this._rules.size > 0 ? (passed / this._rules.size) * (PHI / (PHI + 1)) : 1; const result = { validationId: crypto.randomUUID(), valid: errors.length === 0, errors, passed, total: this._rules.size, confidence, timestamp: Date.now() }; this._results.push(result); return result; }
  removeRule(name) { return this._rules.delete(name); }
  getRules() { return [...this._rules.keys()]; }
  getResults() { return [...this._results]; }
}
