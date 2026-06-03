import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class HarmonicFieldGenerator {
  constructor(config = {}) {
    this.baseFrequency = config.baseFrequency ?? 432;
    this.harmonicCount = config.harmonicCount ?? 12;
    this.fieldStrength = config.fieldStrength ?? 1.0;
    this.phiSpacing = config.phiSpacing ?? true;
    this._fields = new Map();
  }

  generate() {
    const fieldId = crypto.randomUUID();
    const frequencies = [];
    for (let i = 0; i < this.harmonicCount; i++) {
      frequencies.push(this.baseFrequency * Math.pow(PHI, i / this.harmonicCount));
    }
    const coherence = frequencies.reduce((s, f, i) => s + Math.cos(f * Math.pow(PHI, -i)), 0) / this.harmonicCount;
    const field = { fieldId, frequencies, fieldStrength: this.fieldStrength, coherence: Math.abs(coherence), timestamp: Date.now() };
    this._fields.set(fieldId, field);
    return { ...field };
  }

  modulate(fieldId, factor) {
    const field = this._fields.get(fieldId);
    if (!field) throw new Error(`Field ${fieldId} not found`);
    field.fieldStrength *= factor;
    return { fieldId, fieldStrength: field.fieldStrength };
  }

  getField(fieldId) { return this._fields.get(fieldId) ?? null; }
  getFields() { return [...this._fields.values()]; }
  dissolve(fieldId) { return this._fields.delete(fieldId); }

  getSpectrum() {
    const allFreqs = [];
    for (const field of this._fields.values()) allFreqs.push(...field.frequencies);
    return { fieldCount: this._fields.size, totalFrequencies: allFreqs.length, minFreq: Math.min(...allFreqs, 0), maxFreq: Math.max(...allFreqs, 0) };
  }
}
