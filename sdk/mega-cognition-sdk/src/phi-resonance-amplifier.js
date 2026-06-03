const PHI = 1.618033988749895;

export class PhiResonanceAmplifier {
  constructor(config = {}) {
    this.baseFrequency = config.baseFrequency ?? 432;
    this.harmonics = config.harmonics ?? 7;
    this.amplificationFactor = config.amplificationFactor ?? PHI;
  }

  amplify(signal) {
    const amplified = signal * this.amplificationFactor;
    const harmonic = signal * Math.pow(PHI, 2);
    const resonanceField = this.generateField(signal);
    return { original: signal, amplified, harmonic, resonanceField };
  }

  generateField(signal) {
    const field = [];
    for (let i = 0; i < this.harmonics; i++) {
      field.push(signal * Math.pow(PHI, i + 1) / (i + 1));
    }
    return field;
  }

  detectResonance(signalA, signalB) {
    const ratio = Math.max(signalA, signalB) / Math.min(signalA, signalB);
    const isResonant = Math.abs(ratio - PHI) < 0.1 || Math.abs(ratio - Math.pow(PHI, 2)) < 0.1;
    const harmonicOrder = Math.round(Math.log(ratio) / Math.log(PHI));
    return { ratio, isResonant, harmonicOrder };
  }

  getSpectrum() {
    return { baseFrequency: this.baseFrequency, harmonics: this.harmonics, amplificationFactor: this.amplificationFactor };
  }

  tuneFrequency(newFreq) {
    this.baseFrequency = newFreq;
    return { baseFrequency: this.baseFrequency };
  }
}
