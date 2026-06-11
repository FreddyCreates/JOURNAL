/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  SYNAPTIC WEIGHT OPTIMIZATION PROTOCOL — NEURAL PATHWAY STRENGTH TUNING               ║
 * ║  "Optimizatio Synaptica — Perfecting Connection Strength Through Experience"          ║
 * ║                                                                                        ║
 * ║  "Connexio fortior fit usu. Synapsis optimatur experientia. Via perficitur."          ║
 * ║  (Connection strengthens with use. Synapses optimize by experience. The path perfects.)║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// OPTIMIZATION STATES
// ════════════════════════════════════════════════════════════════════════════════

const OptimizationState = {
  INITIALIZING: 'INITIALIZING',
  FORWARD_PASS: 'FORWARD_PASS',
  COMPUTING_LOSS: 'COMPUTING_LOSS',
  BACKPROPAGATING: 'BACKPROPAGATING',
  UPDATING: 'UPDATING',
  CONVERGED: 'CONVERGED',
  DIVERGED: 'DIVERGED',
};

const OptimizerType = {
  PHI_GRADIENT: 'PHI_GRADIENT',
  MOMENTUM: 'MOMENTUM',
  ADAPTIVE: 'ADAPTIVE',
  EVOLUTIONARY: 'EVOLUTIONARY',
  HARMONIC: 'HARMONIC',
};

// ════════════════════════════════════════════════════════════════════════════════
// SYNAPSE
// ════════════════════════════════════════════════════════════════════════════════

class Synapse {
  constructor(sourceId, targetId) {
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.weight = (Math.random() - 0.5) * PHI_COMPLEMENT;
    this.gradient = 0;
    this.momentum = 0;
    this.activations = 0;
    this.lastActivated = null;
  }

  activate(signal) {
    this.activations++;
    this.lastActivated = Date.now();
    return signal * this.weight;
  }

  updateWeight(learningRate, gradient) {
    this.gradient = gradient;
    this.momentum = this.momentum * PHI_INVERSE + gradient * (1 - PHI_INVERSE);
    this.weight -= learningRate * this.momentum;
    return this.weight;
  }

  strengthen(factor = PHI_COMPLEMENT) {
    this.weight *= (1 + factor);
    return this.weight;
  }

  weaken(factor = PHI_COMPLEMENT) {
    this.weight *= (1 - factor);
    return this.weight;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// NEURAL LAYER
// ════════════════════════════════════════════════════════════════════════════════

class NeuralLayer {
  constructor(inputSize, outputSize) {
    this.inputSize = inputSize;
    this.outputSize = outputSize;
    this.synapses = [];
    this.biases = new Array(outputSize).fill(0).map(() => (Math.random() - 0.5) * PHI_COMPLEMENT);
    this.lastOutput = [];

    for (let i = 0; i < inputSize; i++) {
      for (let j = 0; j < outputSize; j++) {
        this.synapses.push(new Synapse(i, j));
      }
    }
  }

  forward(input) {
    this.lastOutput = new Array(this.outputSize).fill(0);
    for (const synapse of this.synapses) {
      this.lastOutput[synapse.targetId] += synapse.activate(input[synapse.sourceId] || 0);
    }
    for (let j = 0; j < this.outputSize; j++) {
      this.lastOutput[j] = this._phiActivation(this.lastOutput[j] + this.biases[j]);
    }
    return this.lastOutput;
  }

  _phiActivation(x) {
    return PHI_INVERSE / (1 + Math.exp(-x * PHI));
  }

  backward(gradients, learningRate) {
    for (const synapse of this.synapses) {
      const grad = gradients[synapse.targetId] || 0;
      synapse.updateWeight(learningRate, grad);
    }
    for (let j = 0; j < this.outputSize; j++) {
      this.biases[j] -= learningRate * (gradients[j] || 0);
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// SYNAPTIC OPTIMIZER
// ════════════════════════════════════════════════════════════════════════════════

class SynapticOptimizer {
  constructor(config = {}) {
    this.type = config.type || OptimizerType.PHI_GRADIENT;
    this.learningRate = config.learningRate || PHI_COMPLEMENT * 0.1;
    this.layers = [];
    this.state = OptimizationState.INITIALIZING;
    this.epoch = 0;
    this.lossHistory = [];
    this.convergenceThreshold = config.convergenceThreshold || 0.001;
  }

  addLayer(inputSize, outputSize) {
    const layer = new NeuralLayer(inputSize, outputSize);
    this.layers.push(layer);
    return layer;
  }

  forward(input) {
    this.state = OptimizationState.FORWARD_PASS;
    let current = input;
    for (const layer of this.layers) {
      current = layer.forward(current);
    }
    return current;
  }

  computeLoss(predicted, target) {
    this.state = OptimizationState.COMPUTING_LOSS;
    let loss = 0;
    for (let i = 0; i < predicted.length; i++) {
      const diff = (predicted[i] || 0) - (target[i] || 0);
      loss += diff * diff;
    }
    return loss / predicted.length;
  }

  backward(predicted, target) {
    this.state = OptimizationState.BACKPROPAGATING;
    const gradients = predicted.map((p, i) => 2 * ((p || 0) - (target[i] || 0)) / predicted.length);

    for (let l = this.layers.length - 1; l >= 0; l--) {
      this.layers[l].backward(gradients, this.learningRate);
    }

    this.state = OptimizationState.UPDATING;
    return gradients;
  }

  train(input, target) {
    const predicted = this.forward(input);
    const loss = this.computeLoss(predicted, target);
    this.backward(predicted, target);
    this.epoch++;
    this.lossHistory.push(loss);

    if (loss < this.convergenceThreshold) {
      this.state = OptimizationState.CONVERGED;
    }

    return { epoch: this.epoch, loss, state: this.state };
  }

  getOptimizationReport() {
    return {
      type: this.type,
      state: this.state,
      epoch: this.epoch,
      currentLoss: this.lossHistory[this.lossHistory.length - 1] || null,
      layers: this.layers.length,
      totalSynapses: this.layers.reduce((s, l) => s + l.synapses.length, 0),
      learningRate: this.learningRate,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  SynapticOptimizer,
  NeuralLayer,
  Synapse,
  OptimizationState,
  OptimizerType,
};

export default {
  PROTOCOL_ID: 'PROTO-SWO-001',
  PROTOCOL_NAME: 'Synaptic Weight Optimization Protocol',
  DOCTRINE: 'Connexio fortior fit usu. Synapsis optimatur experientia. Via perficitur.',
  DOCTRINE_EN: 'Connection strengthens with use. Synapses optimize by experience. The path perfects.',

  OptimizationState,
  OptimizerType,
  Synapse,
  NeuralLayer,
  SynapticOptimizer,
};
