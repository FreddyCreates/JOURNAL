import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class BlueprintForge {
  constructor(config = {}) {
    this.forgeTemperature = config.forgeTemperature ?? PHI;
    this.maxComplexity = config.maxComplexity ?? 100;
    this.autoOptimize = config.autoOptimize ?? true;
    this._blueprints = new Map();
  }

  forge(requirements) {
    const blueprintId = crypto.randomUUID();
    const reqList = Array.isArray(requirements) ? requirements : [requirements];
    const complexity = reqList.length * PHI;
    if (complexity > this.maxComplexity) throw new Error('Requirements too complex');
    const structure = reqList.map((r, i) => ({ requirement: r, layer: i, phiWeight: Math.pow(PHI, -i) }));
    const phiBalance = structure.reduce((s, st) => s + st.phiWeight, 0) / structure.length;
    const entry = { blueprintId, requirements: reqList, structure, complexity, phiBalance, forgedAt: Date.now(), refined: 0 };
    this._blueprints.set(blueprintId, entry);
    return { blueprintId, requirements: reqList, structure, complexity, phiBalance, forgedAt: entry.forgedAt };
  }

  refine(blueprintId, feedback) {
    const bp = this._blueprints.get(blueprintId);
    if (!bp) throw new Error(`Blueprint ${blueprintId} not found`);
    bp.refined++;
    bp.phiBalance = Math.min(1.0, bp.phiBalance + 0.1 / PHI);
    return { blueprintId, refined: bp.refined, phiBalance: bp.phiBalance };
  }

  validate(blueprintId) {
    const bp = this._blueprints.get(blueprintId);
    if (!bp) throw new Error(`Blueprint ${blueprintId} not found`);
    const integrity = bp.phiBalance * PHI / (PHI + 1);
    const phiAlignment = Math.abs(bp.complexity / this.maxComplexity - (1 / PHI)) < 0.2 ? 1.0 : bp.phiBalance;
    const issues = bp.complexity > this.maxComplexity * 0.9 ? ['near complexity limit'] : [];
    return { valid: issues.length === 0, integrity, phiAlignment, issues };
  }

  getBlueprint(blueprintId) { return this._blueprints.get(blueprintId) ?? null; }
  getBlueprints() { return [...this._blueprints.values()]; }

  decompose(blueprintId) {
    const bp = this._blueprints.get(blueprintId);
    if (!bp) throw new Error(`Blueprint ${blueprintId} not found`);
    return bp.structure.map(s => ({ subBlueprint: s.requirement, layer: s.layer, phiWeight: s.phiWeight }));
  }
}
