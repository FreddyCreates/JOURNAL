import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class WaveformComposer {
  constructor(config = {}) {
    this.sampleRate = config.sampleRate ?? 44100;
    this.bufferSize = config.bufferSize ?? 1024;
    this.phiModulation = config.phiModulation ?? true;
    this._waves = new Map();
    this._compositions = new Map();
  }

  createWave(type, frequency, amplitude = 1.0) {
    const waveId = crypto.randomUUID();
    const samples = [];
    for (let i = 0; i < this.bufferSize; i++) {
      const t = i / this.sampleRate;
      let value;
      switch (type) {
        case 'sine': value = amplitude * Math.sin(2 * Math.PI * frequency * t); break;
        case 'square': value = amplitude * Math.sign(Math.sin(2 * Math.PI * frequency * t)); break;
        case 'triangle': value = amplitude * (2 * Math.abs(2 * (frequency * t % 1) - 1) - 1); break;
        case 'phi-golden': value = amplitude * Math.sin(2 * Math.PI * frequency * PHI * t); break;
        default: value = 0;
      }
      samples.push(value);
    }
    const wave = { waveId, type, frequency, amplitude, samples };
    this._waves.set(waveId, wave);
    return { waveId, type, frequency, amplitude, samples: samples.slice(0, 10) };
  }

  compose(waveIds) {
    const compositeId = crypto.randomUUID();
    const waves = waveIds.map(id => this._waves.get(id)).filter(Boolean);
    if (waves.length === 0) throw new Error('No valid waves to compose');
    const composite = new Array(this.bufferSize).fill(0);
    for (const wave of waves) {
      for (let i = 0; i < this.bufferSize; i++) composite[i] += wave.samples[i] ?? 0;
    }
    const peakAmplitude = Math.max(...composite.map(Math.abs));
    const phiBalance = Math.abs(peakAmplitude - PHI) < 1 ? 1 - Math.abs(peakAmplitude - PHI) : 0;
    this._compositions.set(compositeId, { compositeId, waveIds, composite, peakAmplitude });
    return { compositeId, components: waves.length, peakAmplitude, phiBalance };
  }

  transform(waveId, operation) {
    const wave = this._waves.get(waveId);
    if (!wave) throw new Error(`Wave ${waveId} not found`);
    const transformed = [...wave.samples];
    switch (operation) {
      case 'shift': transformed.push(transformed.shift()); break;
      case 'scale': for (let i = 0; i < transformed.length; i++) transformed[i] *= PHI; break;
      case 'phi-morph': for (let i = 0; i < transformed.length; i++) transformed[i] = transformed[i] * Math.pow(PHI, -i / this.bufferSize); break;
    }
    wave.samples = transformed;
    return { waveId, operation, applied: true };
  }

  getWave(waveId) { const w = this._waves.get(waveId); return w ? { ...w, samples: w.samples.slice(0, 10) } : null; }
  getCompositions() { return [...this._compositions.values()].map(c => ({ compositeId: c.compositeId, components: c.waveIds.length, peakAmplitude: c.peakAmplitude })); }
}
