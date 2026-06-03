import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class CognitiveLayerStack {
  constructor(config = {}) {
    this.layerCount = config.layerCount ?? 7;
    this.phiScaling = config.phiScaling ?? true;
    this._layers = [];
    for (let i = 0; i < this.layerCount; i++) {
      this._layers.push({
        id: crypto.randomUUID(),
        depth: i,
        capacity: Math.round(64 * Math.pow(PHI, i)),
        activations: [],
        phiWeight: Math.pow(PHI, -i)
      });
    }
  }

  activate(layerIndex, signal) {
    if (layerIndex < 0 || layerIndex >= this._layers.length) throw new Error('Invalid layer index');
    const layer = this._layers[layerIndex];
    const activation = { signalId: crypto.randomUUID(), signal, timestamp: Date.now() };
    layer.activations.push(activation);
    return { layerIndex, signalId: activation.signalId, phiWeight: layer.phiWeight, timestamp: activation.timestamp };
  }

  propagate(signal) {
    const results = [];
    let current = signal;
    for (let i = 0; i < this._layers.length; i++) {
      const transformed = current * this._layers[i].phiWeight;
      const result = this.activate(i, transformed);
      results.push(result);
      current = transformed;
    }
    return results;
  }

  getLayer(index) {
    if (index < 0 || index >= this._layers.length) return undefined;
    const l = this._layers[index];
    return { id: l.id, depth: l.depth, capacity: l.capacity, activationCount: l.activations.length, phiWeight: l.phiWeight };
  }

  getStackState() {
    const totalActivations = this._layers.reduce((sum, l) => sum + l.activations.length, 0);
    const avgPhiWeight = this._layers.reduce((sum, l) => sum + l.phiWeight, 0) / this._layers.length;
    return { layers: this.layerCount, totalActivations, avgPhiWeight };
  }

  reset() {
    for (const layer of this._layers) layer.activations = [];
  }
}
