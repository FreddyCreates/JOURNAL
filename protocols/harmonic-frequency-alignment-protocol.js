/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  HARMONIC FREQUENCY ALIGNMENT PROTOCOL — PHI-TUNED OSCILLATION SYNCHRONIZATION        ║
 * ║  "Frequentia Harmonica — Aligning All Systems To The Golden Frequency"                ║
 * ║                                                                                        ║
 * ║  "Omnia vibrant. Harmonia unit. Frequentia aurea regnat."                             ║
 * ║  (All things vibrate. Harmony unites. The golden frequency reigns.)                   ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// ALIGNMENT STATES
// ════════════════════════════════════════════════════════════════════════════════

const AlignmentState = {
  DISCORDANT: 'DISCORDANT',
  CALIBRATING: 'CALIBRATING',
  APPROACHING: 'APPROACHING',
  ALIGNED: 'ALIGNED',
  HARMONIC: 'HARMONIC',
  TRANSCENDENT: 'TRANSCENDENT',
  DETUNED: 'DETUNED',
};

const HarmonicSeries = {
  FUNDAMENTAL: PHI,
  SECOND: PHI * 2,
  THIRD: PHI * 3,
  FIFTH: PHI * 5,
  OCTAVE: PHI * 8,
  PHI_SQUARED: PHI * PHI,
};

// ════════════════════════════════════════════════════════════════════════════════
// OSCILLATOR
// ════════════════════════════════════════════════════════════════════════════════

class Oscillator {
  constructor(id, naturalFrequency) {
    this.id = id;
    this.naturalFrequency = naturalFrequency;
    this.currentFrequency = naturalFrequency;
    this.phase = Math.random() * Math.PI * 2;
    this.amplitude = 1.0;
    this.coupled = [];
    this.history = [];
  }

  tick(dt = 0.01) {
    this.phase += this.currentFrequency * dt * Math.PI * 2;
    if (this.phase > Math.PI * 2) this.phase -= Math.PI * 2;
    this.history.push({ freq: this.currentFrequency, phase: this.phase, t: Date.now() });
    if (this.history.length > 100) this.history.shift();
    return Math.sin(this.phase) * this.amplitude;
  }

  couple(other, strength = PHI_COMPLEMENT) {
    this.coupled.push({ oscillator: other, strength });
  }

  synchronize() {
    if (this.coupled.length === 0) return;
    let totalPull = 0;
    for (const { oscillator, strength } of this.coupled) {
      const phaseDiff = oscillator.phase - this.phase;
      totalPull += Math.sin(phaseDiff) * strength;
    }
    this.currentFrequency += totalPull * PHI_COMPLEMENT;
  }

  getDetuning() {
    return Math.abs(this.currentFrequency - this.naturalFrequency) / this.naturalFrequency;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// HARMONIC ALIGNMENT ENGINE
// ════════════════════════════════════════════════════════════════════════════════

class HarmonicAlignmentEngine {
  constructor(config = {}) {
    this.targetFrequency = config.targetFrequency || HarmonicSeries.FUNDAMENTAL;
    this.tolerance = config.tolerance || PHI_COMPLEMENT * 0.1;
    this.oscillators = [];
    this.state = AlignmentState.DISCORDANT;
    this.epoch = 0;
    this.coherenceHistory = [];
  }

  addOscillator(id, frequency) {
    const osc = new Oscillator(id, frequency || this.targetFrequency + (Math.random() - 0.5));
    this.oscillators.push(osc);

    // Couple to existing oscillators
    for (const existing of this.oscillators) {
      if (existing.id !== id) {
        osc.couple(existing, PHI_COMPLEMENT / this.oscillators.length);
        existing.couple(osc, PHI_COMPLEMENT / this.oscillators.length);
      }
    }
    return osc;
  }

  align() {
    this.state = AlignmentState.CALIBRATING;
    this.epoch++;

    for (const osc of this.oscillators) {
      osc.synchronize();
      osc.tick();
    }

    // Apply phi-correction toward target
    for (const osc of this.oscillators) {
      const deviation = this.targetFrequency - osc.currentFrequency;
      osc.currentFrequency += deviation * PHI_COMPLEMENT * 0.1;
    }

    const coherence = this._computeCoherence();
    this.coherenceHistory.push(coherence);
    this._updateState(coherence);

    return { epoch: this.epoch, coherence, state: this.state };
  }

  _computeCoherence() {
    if (this.oscillators.length < 2) return 1.0;
    let totalAlignment = 0;
    let pairs = 0;

    for (let i = 0; i < this.oscillators.length - 1; i++) {
      for (let j = i + 1; j < this.oscillators.length; j++) {
        const phaseDiff = Math.abs(this.oscillators[i].phase - this.oscillators[j].phase);
        const freqDiff = Math.abs(this.oscillators[i].currentFrequency - this.oscillators[j].currentFrequency);
        totalAlignment += Math.cos(phaseDiff) * Math.exp(-freqDiff);
        pairs++;
      }
    }
    return pairs > 0 ? (totalAlignment / pairs + 1) / 2 : 0;
  }

  _updateState(coherence) {
    if (coherence < 0.2) this.state = AlignmentState.DISCORDANT;
    else if (coherence < 0.4) this.state = AlignmentState.CALIBRATING;
    else if (coherence < 0.6) this.state = AlignmentState.APPROACHING;
    else if (coherence < 0.8) this.state = AlignmentState.ALIGNED;
    else if (coherence < 0.95) this.state = AlignmentState.HARMONIC;
    else this.state = AlignmentState.TRANSCENDENT;
  }

  getAlignmentReport() {
    return {
      state: this.state,
      epoch: this.epoch,
      oscillators: this.oscillators.length,
      targetFrequency: this.targetFrequency,
      currentCoherence: this.coherenceHistory[this.coherenceHistory.length - 1] || 0,
      averageDetuning: this.oscillators.reduce((s, o) => s + o.getDetuning(), 0) / (this.oscillators.length || 1),
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  HarmonicAlignmentEngine,
  Oscillator,
  AlignmentState,
  HarmonicSeries,
};

export default {
  PROTOCOL_ID: 'PROTO-HFA-001',
  PROTOCOL_NAME: 'Harmonic Frequency Alignment Protocol',
  DOCTRINE: 'Omnia vibrant. Harmonia unit. Frequentia aurea regnat.',
  DOCTRINE_EN: 'All things vibrate. Harmony unites. The golden frequency reigns.',

  AlignmentState,
  HarmonicSeries,
  Oscillator,
  HarmonicAlignmentEngine,
};
