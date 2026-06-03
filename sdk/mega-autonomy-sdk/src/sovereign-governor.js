import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class SovereignGovernor {
  constructor(config = {}) {
    this.autonomyLevel = config.autonomyLevel ?? 7;
    this.overrideThreshold = config.overrideThreshold ?? (PHI * 0.9);
    this._constitution = [];
    this._overrideLog = [];
  }

  setConstitution(rules) {
    this._constitution = Array.isArray(rules) ? [...rules] : [rules];
    const hash = crypto.createHash('sha256').update(JSON.stringify(this._constitution)).digest('hex').slice(0, 16);
    return { rulesCount: this._constitution.length, lastUpdated: Date.now(), constitutionHash: hash };
  }

  checkAction(action) {
    const actionStr = typeof action === 'string' ? action : JSON.stringify(action);
    let matchedRule = null;
    let permitted = true;
    for (const rule of this._constitution) {
      const ruleStr = typeof rule === 'string' ? rule : (rule.pattern ?? '');
      if (actionStr.includes(ruleStr) || ruleStr.includes(actionStr)) {
        matchedRule = rule;
        permitted = rule.allow !== false;
        break;
      }
    }
    const phiCompliance = permitted ? PHI / (PHI + 1) : 1 / (PHI + 1);
    return { action, permitted, rule: matchedRule, overrideRequired: !permitted, phiCompliance };
  }

  override(action, justification) {
    const entry = { overrideId: crypto.randomUUID(), action, justification, timestamp: Date.now() };
    this._overrideLog.push(entry);
    return { ...entry };
  }

  getConstitution() { return [...this._constitution]; }
  getOverrideLog() { return [...this._overrideLog]; }
  getAutonomyLevel() { return this.autonomyLevel; }
}
