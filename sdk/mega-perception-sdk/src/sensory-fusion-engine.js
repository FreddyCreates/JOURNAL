import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class SensoryFusionEngine {
  constructor(config = {}) {
    this.modalities = config.modalities ?? ['visual', 'auditory', 'tactile', 'semantic', 'temporal'];
    this.fusionAlgorithm = config.fusionAlgorithm ?? 'phi-weighted';
    this.confidenceThreshold = config.confidenceThreshold ?? 0.618;
    this._signals = new Map();
    for (const m of this.modalities) this._signals.set(m, []);
  }

  ingest(modality, signal) {
    if (!this._signals.has(modality)) this._signals.set(modality, []);
    const modalityIndex = this.modalities.indexOf(modality);
    const entry = {
      signalId: crypto.randomUUID(),
      modality,
      strength: signal.strength ?? 1.0,
      data: signal,
      timestamp: Date.now(),
      phiWeight: Math.pow(PHI, modalityIndex >= 0 ? modalityIndex : 0)
    };
    this._signals.get(modality).push(entry);
    return { signalId: entry.signalId, modality, strength: entry.strength, timestamp: entry.timestamp, phiWeight: entry.phiWeight };
  }

  fuse() {
    let totalStrength = 0;
    let weightedSum = 0;
    let componentCount = 0;
    let dominantModality = null;
    let maxStrength = 0;

    for (let i = 0; i < this.modalities.length; i++) {
      const signals = this._signals.get(this.modalities[i]) ?? [];
      const weight = Math.pow(PHI, -i);
      for (const s of signals) {
        weightedSum += s.strength * weight;
        totalStrength += s.strength;
        componentCount++;
        if (s.strength > maxStrength) {
          maxStrength = s.strength;
          dominantModality = this.modalities[i];
        }
      }
    }

    const confidence = componentCount > 0 ? Math.min(1.0, weightedSum / (componentCount * PHI)) : 0;
    const coherenceScore = confidence * PHI / (PHI + 1);

    return {
      fusedSignal: { strength: weightedSum, confidence, dominantModality },
      componentCount,
      fusionTimestamp: Date.now(),
      coherenceScore
    };
  }

  getModalityState(modality) {
    return [...(this._signals.get(modality) ?? [])];
  }

  getState() {
    const state = {};
    let total = 0;
    for (const [m, signals] of this._signals) {
      state[m] = signals.length;
      total += signals.length;
    }
    return { modalities: state, totalSignals: total };
  }

  reset() {
    for (const [key] of this._signals) this._signals.set(key, []);
  }
}
