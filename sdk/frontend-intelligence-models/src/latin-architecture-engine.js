/**
 * @medina/frontend-intelligence-models — LatinArchitectureEngine
 *
 * Mathematical architecture intelligence with Latin-named AI architect models.
 * The engine analyzes architecture requirements and tells what the system needs:
 * model families, ring priorities, and intelligence pressure.
 */

const PHI = 1.618033988749895;
const E = 2.718281828459045;
const TAU = Math.PI * 2;

const LATIN_ARCHITECT_MODELS = [
  { modelId: 'LAM-001', latinName: 'Architectus Primus', domain: 'foundation', ring: 'Projection Ring', vector: [0.92, 0.88, 0.73, 0.66] },
  { modelId: 'LAM-002', latinName: 'Geometria Mentis', domain: 'layout', ring: 'Visual Ring', vector: [0.95, 0.81, 0.69, 0.62] },
  { modelId: 'LAM-003', latinName: 'Orchestrator Nexus', domain: 'framework', ring: 'Interface Ring', vector: [0.84, 0.94, 0.82, 0.76] },
  { modelId: 'LAM-004', latinName: 'Memoria Fluxus', domain: 'state', ring: 'Memory Ring', vector: [0.79, 0.9, 0.96, 0.71] },
  { modelId: 'LAM-005', latinName: 'Pipelina Ratio', domain: 'build', ring: 'Build Ring', vector: [0.76, 0.87, 0.74, 0.95] },
  { modelId: 'LAM-006', latinName: 'Probatio Aeterna', domain: 'verification', ring: 'Proof Ring', vector: [0.71, 0.82, 0.89, 0.98] },
  { modelId: 'LAM-007', latinName: 'Geometrica Lux', domain: 'graphics', ring: 'Geometry Ring', vector: [0.98, 0.7, 0.64, 0.72] },
  { modelId: 'LAM-008', latinName: 'Canalis Vivus', domain: 'transport', ring: 'Transport Ring', vector: [0.74, 0.85, 0.78, 0.9] },
  { modelId: 'LAM-009', latinName: 'Vaultum Persistens', domain: 'persistence', ring: 'Persistence Ring', vector: [0.67, 0.8, 0.93, 0.86] },
  { modelId: 'LAM-010', latinName: 'Sensorium Sapiens', domain: 'native-capabilities', ring: 'Native Capability Ring', vector: [0.88, 0.76, 0.81, 0.84] }
];

class LatinArchitectureEngine {
  constructor(config = {}) {
    this.phiWeight = config.phiWeight ?? PHI;
    this.entropyWeight = config.entropyWeight ?? 0.34;
    this.runtimeWeight = config.runtimeWeight ?? 0.21;
    this.safetyWeight = config.safetyWeight ?? 0.18;
    this.phiNormalizedWeight = this.phiWeight / (this.phiWeight + 1);
    this.models = new Map(LATIN_ARCHITECT_MODELS.map(model => [model.modelId, model]));
  }

  listArchitectModels() {
    return Array.from(this.models.values());
  }

  getArchitectModel(modelId) {
    return this.models.get(modelId);
  }

  /**
   * Compute a normalized intelligence score [0, 1].
   * @param {Object} signals
   * @param {number} [signals.complexity=0.5]
   * @param {number} [signals.uncertainty=0.5]
   * @param {number} [signals.runtimePressure=0.5]
   * @param {number} [signals.risk=0.5]
   */
  computeIntelligenceScore(signals = {}) {
    const complexity = this._clamp01(signals.complexity ?? 0.5);
    const uncertainty = this._clamp01(signals.uncertainty ?? 0.5);
    const runtimePressure = this._clamp01(signals.runtimePressure ?? 0.5);
    const risk = this._clamp01(signals.risk ?? 0.5);

    const phiCurve = Math.pow(complexity + 1, 1 / PHI) - 1;
    const entropyCurve = -(
      uncertainty * Math.log2(Math.max(uncertainty, Number.EPSILON)) +
      (1 - uncertainty) * Math.log2(Math.max(1 - uncertainty, Number.EPSILON))
    );
    const runtimeCurve = Math.log1p(runtimePressure * E) / Math.log1p(E);
    const safetyCurve = Math.sqrt(risk);
    const harmonic = (Math.cos((complexity - uncertainty) * TAU) + 1) / 2;

    const weighted =
      phiCurve * this.phiNormalizedWeight +
      entropyCurve * this.entropyWeight +
      runtimeCurve * this.runtimeWeight +
      safetyCurve * this.safetyWeight +
      harmonic * 0.12;

    return this._clamp01(weighted);
  }

  createArchitectureGenome(requirements = {}) {
    const signals = {
      complexity: requirements.complexity ?? 0.5,
      uncertainty: requirements.uncertainty ?? 0.5,
      runtimePressure: requirements.runtimePressure ?? 0.5,
      risk: requirements.risk ?? 0.5
    };

    const intelligenceScore = this.computeIntelligenceScore(signals);
    const intensity = 1 + intelligenceScore * PHI;
    const architectureVector = [
      this._clamp01((signals.complexity * PHI + signals.uncertainty) / (PHI + 1)),
      this._clamp01((signals.runtimePressure * PHI + signals.complexity) / (PHI + 1)),
      this._clamp01((signals.risk * PHI + (1 - signals.uncertainty)) / (PHI + 1)),
      this._clamp01((signals.uncertainty * PHI + signals.runtimePressure) / (PHI + 1))
    ];

    return {
      signals,
      intelligenceScore,
      intensity,
      architectureVector,
      confidence: this._clamp01(1 - Math.abs(signals.uncertainty - 0.5)),
      heartbeatMs: Math.max(233, Math.round(873 / (1 + intelligenceScore / PHI)))
    };
  }

  generateLatinModelBlueprint(requirements = {}) {
    const genome = this.createArchitectureGenome(requirements);
    const rankedArchitects = this.listArchitectModels()
      .map(model => ({
        ...model,
        fitScore: this._averageDot(model.vector, genome.architectureVector)
      }))
      .sort((a, b) => b.fitScore - a.fitScore);

    const leadArchitects = rankedArchitects.slice(0, 3);
    const requiredRings = [...new Set(leadArchitects.map(model => model.ring))];
    const requiredDomains = [...new Set(leadArchitects.map(model => model.domain))];

    return {
      architectureNeeds: this.tellArchitectureNeeds(requirements),
      intelligenceGenome: genome,
      leadArchitects: leadArchitects.map(model => ({
        modelId: model.modelId,
        latinName: model.latinName,
        ring: model.ring,
        domain: model.domain,
        fitScore: Number(model.fitScore.toFixed(4))
      })),
      requiredRings,
      requiredDomains
    };
  }

  tellArchitectureNeeds(requirements = {}) {
    const genome = this.createArchitectureGenome(requirements);
    const score = genome.intelligenceScore;

    if (score > 0.82) {
      return 'Architecture requires full sovereign orchestration: multi-ring routing, self-healing runtime, and high-frequency proof loops.';
    }
    if (score > 0.62) {
      return 'Architecture requires balanced intelligence: strong interface-memory coupling, adaptive transport, and continuous verification.';
    }
    if (score > 0.42) {
      return 'Architecture requires modular composition: projection + build alignment, moderate runtime adaptation, and standard safety checks.';
    }
    return 'Architecture requires focused baseline intelligence: lightweight rings, deterministic routing, and low-overhead telemetry.';
  }

  _averageDot(a, b) {
    let sum = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      sum += a[i] * b[i];
    }
    return sum / Math.max(a.length, 1);
  }

  _clamp01(value) {
    return Math.min(1, Math.max(0, value));
  }
}

export { LatinArchitectureEngine, LATIN_ARCHITECT_MODELS };
export default LatinArchitectureEngine;
