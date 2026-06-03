import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class ConceptBlender {
  constructor(config = {}) {
    this.blendingMode = config.blendingMode ?? 'phi-interpolation';
    this.creativityFactor = config.creativityFactor ?? PHI;
    this.constraintStrength = config.constraintStrength ?? 0.5;
    this._blends = [];
  }

  blend(conceptA, conceptB) {
    const blendId = crypto.randomUUID();
    const aStr = typeof conceptA === 'string' ? conceptA : JSON.stringify(conceptA);
    const bStr = typeof conceptB === 'string' ? conceptB : JSON.stringify(conceptB);
    const noveltyScore = Math.min(1.0, (aStr.length + bStr.length) / (100 * PHI));
    const phiRatio = PHI / (PHI + 1);
    const emergentProperties = [`${aStr.slice(0, 5)}-${bStr.slice(0, 5)}-emergence`];
    const output = `blend(${aStr.slice(0, 20)}, ${bStr.slice(0, 20)})`;
    const entry = { blendId, inputs: [conceptA, conceptB], output, noveltyScore, phiRatio, emergentProperties };
    this._blends.push(entry);
    return { ...entry };
  }

  multiBlend(concepts) {
    let result = concepts[0];
    const blends = [];
    for (let i = 1; i < concepts.length; i++) {
      const b = this.blend(result, concepts[i]);
      result = b.output;
      blends.push(b);
    }
    return { finalOutput: result, steps: blends.length, blends };
  }

  getBlendHistory() { return [...this._blends]; }
  setCreativity(factor) { this.creativityFactor = factor; }
  getStats() { return { totalBlends: this._blends.length, creativityFactor: this.creativityFactor, mode: this.blendingMode }; }
}
