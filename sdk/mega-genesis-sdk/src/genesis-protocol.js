import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class GenesisProtocol {
  constructor(config = {}) {
    this.protocolVersion = config.protocolVersion ?? '1.0.0';
    this.phiSeed = config.phiSeed ?? PHI;
    this._rules = config.genesisRules ?? [];
    this.validationStrict = config.validationStrict ?? true;
    this._geneses = new Map();
  }

  initiate(spec) {
    const genesisId = crypto.randomUUID();
    const phiSignature = crypto.createHash('sha256').update(JSON.stringify(spec) + this.phiSeed).digest('hex').slice(0, 16);
    const entry = { genesisId, spec, phase: 'initiated', validations: [], phiSignature, initiatedAt: Date.now() };
    this._geneses.set(genesisId, entry);
    return { genesisId, spec, phase: 'initiated', validations: [], phiSignature };
  }

  validate(genesisId) {
    const genesis = this._geneses.get(genesisId);
    if (!genesis) throw new Error(`Genesis ${genesisId} not found`);
    const errors = [];
    const warnings = [];
    if (this.validationStrict && !genesis.spec.type) errors.push('Missing type in spec');
    if (!genesis.spec.name) warnings.push('No name specified');
    const phiCompliance = errors.length === 0 ? PHI / (PHI + 1) : 1 / (PHI + 1);
    genesis.validations = [...errors, ...warnings];
    genesis.phase = errors.length === 0 ? 'validated' : 'failed';
    return { genesisId, valid: errors.length === 0, errors, warnings, phiCompliance };
  }

  execute(genesisId) {
    const genesis = this._geneses.get(genesisId);
    if (!genesis) throw new Error(`Genesis ${genesisId} not found`);
    if (genesis.phase === 'failed') throw new Error('Cannot execute failed genesis');
    genesis.phase = 'executed';
    return { genesisId, entityId: crypto.randomUUID(), spec: genesis.spec, executedAt: Date.now() };
  }

  getGenesis(genesisId) { return this._geneses.get(genesisId) ?? null; }
  getHistory() { return [...this._geneses.values()]; }
  addRule(rule) { this._rules.push(rule); return { ruleCount: this._rules.length }; }
}
