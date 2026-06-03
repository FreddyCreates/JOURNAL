const PHI = 1.618033988749895;

export class LogicGateProcessor {
  constructor(config = {}) {
    this.gates = config.gates ?? ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'PHI-GATE'];
    this.fuzzyLogic = config.fuzzyLogic ?? true;
    this._gateStats = {};
    for (const g of this.gates) this._gateStats[g] = 0;
  }

  evaluate(expression) {
    const { type, inputs } = expression;
    let result;
    const gatesUsed = [type];
    this._gateStats[type] = (this._gateStats[type] ?? 0) + 1;

    const vals = inputs.map(i => typeof i === 'number' ? i : (i ? 1 : 0));

    switch (type) {
      case 'AND': result = Math.min(...vals); break;
      case 'OR': result = Math.max(...vals); break;
      case 'NOT': result = 1 - vals[0]; break;
      case 'XOR': result = vals.reduce((a, b) => Math.abs(a - b)); break;
      case 'NAND': result = 1 - Math.min(...vals); break;
      case 'PHI-GATE': result = vals.reduce((a, b) => (a + b) / PHI, 0); break;
      default: result = 0;
    }

    const truth = Math.min(1, Math.max(0, result));
    return { result: truth > 0.5, truth, gatesUsed, evaluationPath: [{ gate: type, inputs: vals, output: truth }] };
  }

  createGate(type, inputs) {
    if (!this.gates.includes(type)) throw new Error(`Unknown gate: ${type}`);
    return { type, inputs, id: `gate_${Date.now()}` };
  }

  chain(gates) {
    let result = gates[0]?.inputs ?? [];
    const path = [];
    for (const gate of gates) {
      const eval_ = this.evaluate({ type: gate.type, inputs: result.length > 0 ? result : gate.inputs });
      result = [eval_.truth];
      path.push(eval_);
    }
    return { result: result[0] ?? 0, path, gatesChained: gates.length };
  }

  truthTable(expression, variables) {
    const rows = [];
    const n = variables.length;
    for (let i = 0; i < Math.pow(2, n); i++) {
      const inputs = variables.map((_, j) => (i >> (n - 1 - j)) & 1);
      const result = this.evaluate({ ...expression, inputs });
      rows.push({ inputs, output: result.truth });
    }
    return rows;
  }

  getGateStats() { return { ...this._gateStats }; }
}
