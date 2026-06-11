/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  COGNITIVE RESONANCE AMPLIFICATION PROTOCOL — PHI-HARMONIC THOUGHT AMPLIFICATION      ║
 * ║  "Amplificatio Cognitiva — Scaling Intelligence Through Resonant Feedback"            ║
 * ║                                                                                        ║
 * ║  "Resonantia crescit. Cogitatio amplificatur. Mens infinita fit."                     ║
 * ║  (Resonance grows. Thought amplifies. The mind becomes infinite.)                     ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// RESONANCE STATES
// ════════════════════════════════════════════════════════════════════════════════

const ResonanceState = {
  SILENT: 'SILENT',
  INITIATING: 'INITIATING',
  OSCILLATING: 'OSCILLATING',
  RESONATING: 'RESONATING',
  AMPLIFYING: 'AMPLIFYING',
  PEAK: 'PEAK',
  DAMPENING: 'DAMPENING',
};

const AmplificationMode = {
  LINEAR: 'LINEAR',
  EXPONENTIAL: 'EXPONENTIAL',
  PHI_HARMONIC: 'PHI_HARMONIC',
  RECURSIVE: 'RECURSIVE',
};

// ════════════════════════════════════════════════════════════════════════════════
// RESONANCE CHAMBER
// ════════════════════════════════════════════════════════════════════════════════

class ResonanceChamber {
  constructor(frequency = PHI) {
    this.frequency = frequency;
    this.amplitude = 0;
    this.phase = 0;
    this.harmonics = [];
    this.feedbackLoops = [];
    this.state = ResonanceState.SILENT;
  }

  inject(signal) {
    const harmonicMatch = this._computeHarmonicAlignment(signal);
    if (harmonicMatch > PHI_INVERSE) {
      this.amplitude += signal.strength * harmonicMatch;
      this.harmonics.push({
        signal,
        alignment: harmonicMatch,
        timestamp: Date.now(),
      });
      this._updateState();
    }
    return { accepted: harmonicMatch > PHI_INVERSE, alignment: harmonicMatch };
  }

  _computeHarmonicAlignment(signal) {
    const frequencyRatio = signal.frequency / this.frequency;
    const phiDistance = Math.abs(frequencyRatio - PHI);
    const inverseDistance = Math.abs(frequencyRatio - PHI_INVERSE);
    const minDistance = Math.min(phiDistance, inverseDistance, Math.abs(frequencyRatio - 1));
    return Math.exp(-minDistance * PHI);
  }

  _updateState() {
    if (this.amplitude <= 0) this.state = ResonanceState.SILENT;
    else if (this.amplitude < PHI_COMPLEMENT) this.state = ResonanceState.INITIATING;
    else if (this.amplitude < PHI_INVERSE) this.state = ResonanceState.OSCILLATING;
    else if (this.amplitude < 1.0) this.state = ResonanceState.RESONATING;
    else if (this.amplitude < PHI) this.state = ResonanceState.AMPLIFYING;
    else this.state = ResonanceState.PEAK;
  }

  addFeedbackLoop(loop) {
    this.feedbackLoops.push(loop);
  }

  tick() {
    this.phase += this.frequency * PHI_COMPLEMENT;
    for (const loop of this.feedbackLoops) {
      const feedback = loop(this.amplitude, this.phase);
      this.amplitude += feedback * PHI_COMPLEMENT;
    }
    this.amplitude *= (1 - PHI_COMPLEMENT * 0.01); // natural decay
    this._updateState();
    return { amplitude: this.amplitude, phase: this.phase, state: this.state };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// COGNITIVE AMPLIFIER
// ════════════════════════════════════════════════════════════════════════════════

class CognitiveAmplifier {
  constructor(config = {}) {
    this.chambers = [];
    this.mode = config.mode || AmplificationMode.PHI_HARMONIC;
    this.gainFactor = config.gainFactor || PHI;
    this.maxAmplitude = config.maxAmplitude || PHI * PHI * PHI;
    this.thoughtStream = [];
    this.totalAmplification = 0;
  }

  createChamber(frequency) {
    const chamber = new ResonanceChamber(frequency || PHI * (this.chambers.length + 1));
    this.chambers.push(chamber);
    return chamber;
  }

  amplifyThought(thought) {
    const signal = {
      frequency: this._thoughtFrequency(thought),
      strength: this._thoughtStrength(thought),
      content: thought,
    };

    let totalGain = 0;
    for (const chamber of this.chambers) {
      const result = chamber.inject(signal);
      if (result.accepted) {
        totalGain += result.alignment * this.gainFactor;
      }
    }

    const amplifiedStrength = this._applyMode(signal.strength, totalGain);
    const amplified = {
      original: thought,
      amplifiedStrength: Math.min(amplifiedStrength, this.maxAmplitude),
      gain: totalGain,
      mode: this.mode,
      timestamp: Date.now(),
    };

    this.thoughtStream.push(amplified);
    this.totalAmplification += amplified.amplifiedStrength;
    return amplified;
  }

  _thoughtFrequency(thought) {
    const str = typeof thought === 'string' ? thought : JSON.stringify(thought);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash % 1000) * PHI_COMPLEMENT + PHI_INVERSE;
  }

  _thoughtStrength(thought) {
    const str = typeof thought === 'string' ? thought : JSON.stringify(thought);
    return (str.length * PHI_COMPLEMENT) / 100;
  }

  _applyMode(base, gain) {
    switch (this.mode) {
      case AmplificationMode.LINEAR:
        return base + gain;
      case AmplificationMode.EXPONENTIAL:
        return base * Math.pow(PHI, gain);
      case AmplificationMode.PHI_HARMONIC:
        return base * (1 + gain * PHI_INVERSE);
      case AmplificationMode.RECURSIVE:
        return this._recursiveAmplify(base, gain, 5);
      default:
        return base + gain;
    }
  }

  _recursiveAmplify(value, gain, depth) {
    if (depth <= 0) return value;
    return this._recursiveAmplify(value * (1 + gain * PHI_COMPLEMENT), gain * PHI_INVERSE, depth - 1);
  }

  getResonanceReport() {
    return {
      chambers: this.chambers.length,
      totalAmplification: this.totalAmplification,
      thoughtCount: this.thoughtStream.length,
      averageGain: this.thoughtStream.length > 0
        ? this.thoughtStream.reduce((s, t) => s + t.gain, 0) / this.thoughtStream.length
        : 0,
      mode: this.mode,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  CognitiveAmplifier,
  ResonanceChamber,
  ResonanceState,
  AmplificationMode,
};

export default {
  PROTOCOL_ID: 'PROTO-CRA-001',
  PROTOCOL_NAME: 'Cognitive Resonance Amplification Protocol',
  DOCTRINE: 'Resonantia crescit. Cogitatio amplificatur. Mens infinita fit.',
  DOCTRINE_EN: 'Resonance grows. Thought amplifies. The mind becomes infinite.',

  ResonanceState,
  AmplificationMode,
  ResonanceChamber,
  CognitiveAmplifier,
};
