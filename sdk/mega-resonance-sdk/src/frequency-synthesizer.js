const PHI = 1.618033988749895;

export class FrequencySynthesizer {
  constructor(config = {}) {
    this.fundamentalFreq = config.fundamentalFreq ?? 432;
    this.octaves = config.octaves ?? 7;
    this.temperament = config.temperament ?? 'phi-just';
    this.precision = config.precision ?? 6;
    this._registry = [];
  }

  synthesize(note) {
    const noteIndex = typeof note === 'number' ? note : (note.index ?? 0);
    const octave = Math.floor(noteIndex / 12);
    const frequency = this.fundamentalFreq * Math.pow(PHI, noteIndex / 12);
    const phiRatio = Math.pow(PHI, (noteIndex % 12) / 12);
    const harmonics = Array.from({ length: 5 }, (_, i) => frequency * (i + 2));
    const entry = { frequency: parseFloat(frequency.toFixed(this.precision)), note, octave, phiRatio, harmonics };
    this._registry.push(entry);
    return entry;
  }

  chord(notes) {
    const frequencies = notes.map(n => this.synthesize(n).frequency);
    const ratios = frequencies.map(f => f / frequencies[0]);
    const consonance = ratios.reduce((s, r) => s + (1 - Math.abs(r - Math.round(r * PHI) / PHI)), 0) / ratios.length;
    const tension = 1 - consonance;
    return { frequencies, consonance, tension };
  }

  getScale(root = 0, mode = 'phi-major') {
    const steps = [0, 2, 4, 5, 7, 9, 11];
    return steps.map(s => this.synthesize(root + s).frequency);
  }

  detune(frequency, cents) {
    return frequency * Math.pow(2, cents / 1200);
  }

  getRegistry() { return [...this._registry]; }
}
