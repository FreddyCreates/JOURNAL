import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class RecurrenceEngine {
  constructor() { this._rules = new Map(); this._occurrences = []; }
  addRule(name, config) { if (!config || !config.interval) throw new Error('interval required'); const rule = { ruleId: crypto.randomUUID(), name, interval: config.interval, unit: config.unit ?? 'ms', maxOccurrences: config.maxOccurrences ?? Infinity, occurrenceCount: 0 }; this._rules.set(rule.ruleId, rule); return { ruleId: rule.ruleId, name }; }
  trigger(ruleId) { const rule = this._rules.get(ruleId); if (!rule) throw new Error('Rule not found'); if (rule.occurrenceCount >= rule.maxOccurrences) throw new Error('Max occurrences reached'); rule.occurrenceCount++; const occ = { occurrenceId: crypto.randomUUID(), ruleId, occurrence: rule.occurrenceCount, phiRhythm: PHI / (PHI + 1), timestamp: Date.now() }; this._occurrences.push(occ); return occ; }
  getRules() { return [...this._rules.values()]; }
  getOccurrences(ruleId) { return this._occurrences.filter(o => o.ruleId === ruleId); }
}
