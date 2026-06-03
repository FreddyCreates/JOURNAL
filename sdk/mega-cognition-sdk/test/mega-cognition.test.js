import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { ThoughtChainProcessor } from '../src/thought-chain-processor.js';
import { CognitiveLayerStack } from '../src/cognitive-layer-stack.js';
import { PhiResonanceAmplifier } from '../src/phi-resonance-amplifier.js';
import { AttentionFocusEngine } from '../src/attention-focus-engine.js';
import { MetaCognitionController } from '../src/meta-cognition-controller.js';

const PHI = 1.618033988749895;

describe('ThoughtChainProcessor', () => {
  let processor;
  beforeEach(() => { processor = new ThoughtChainProcessor(); });

  test('should create with default config', () => {
    assert.strictEqual(processor.maxChainDepth, 12);
    assert.strictEqual(processor.phiDecay, PHI);
    assert.strictEqual(processor.resonanceThreshold, 0.618);
  });

  test('should create with custom config', () => {
    const p = new ThoughtChainProcessor({ maxChainDepth: 5, resonanceThreshold: 0.8 });
    assert.strictEqual(p.maxChainDepth, 5);
    assert.strictEqual(p.resonanceThreshold, 0.8);
  });

  test('should create a thought chain', () => {
    const chain = processor.createChain('initial concept');
    assert.ok(chain.chainId);
    assert.strictEqual(chain.seed, 'initial concept');
    assert.strictEqual(chain.nodes.length, 1);
    assert.strictEqual(chain.status, 'active');
    assert.strictEqual(chain.nodes[0].resonance, 1.0);
  });

  test('should extend a chain', () => {
    const chain = processor.createChain('start');
    const node = processor.extendChain(chain.chainId, 'next thought');
    assert.strictEqual(node.concept, 'next thought');
    assert.strictEqual(node.depth, 1);
    assert.ok(node.resonance < 1.0);
  });

  test('should throw when extending completed chain', () => {
    const chain = processor.createChain('start');
    processor.completeChain(chain.chainId);
    assert.throws(() => processor.extendChain(chain.chainId, 'more'), /complete/);
  });

  test('should throw for unknown chain', () => {
    assert.throws(() => processor.extendChain('fake-id', 'x'), /not found/);
  });

  test('should get chain', () => {
    const chain = processor.createChain('test');
    const retrieved = processor.getChain(chain.chainId);
    assert.strictEqual(retrieved.seed, 'test');
  });

  test('should evaluate chain coherence', () => {
    const chain = processor.createChain('a');
    processor.extendChain(chain.chainId, 'b');
    processor.extendChain(chain.chainId, 'c');
    const evaluation = processor.evaluateChain(chain.chainId);
    assert.strictEqual(evaluation.depth, 3);
    assert.ok(evaluation.totalResonance > 0);
    assert.ok(typeof evaluation.isCoherent === 'boolean');
  });

  test('should complete a chain', () => {
    const chain = processor.createChain('x');
    const result = processor.completeChain(chain.chainId);
    assert.strictEqual(result.status, 'complete');
  });
});

describe('CognitiveLayerStack', () => {
  let stack;
  beforeEach(() => { stack = new CognitiveLayerStack(); });

  test('should create with default 7 layers', () => {
    assert.strictEqual(stack.layerCount, 7);
    assert.ok(stack.phiScaling);
  });

  test('should create with custom layer count', () => {
    const s = new CognitiveLayerStack({ layerCount: 3 });
    assert.strictEqual(s.layerCount, 3);
  });

  test('should activate a layer', () => {
    const result = stack.activate(0, 5.0);
    assert.ok(result.signalId);
    assert.strictEqual(result.layerIndex, 0);
    assert.strictEqual(result.phiWeight, 1.0);
  });

  test('should throw for invalid layer index', () => {
    assert.throws(() => stack.activate(99, 1.0), /Invalid/);
  });

  test('should propagate signal through all layers', () => {
    const results = stack.propagate(10.0);
    assert.strictEqual(results.length, 7);
    assert.ok(results[0].phiWeight >= results[6].phiWeight);
  });

  test('should get layer info', () => {
    const layer = stack.getLayer(0);
    assert.ok(layer.id);
    assert.strictEqual(layer.depth, 0);
    assert.strictEqual(layer.capacity, 64);
  });

  test('should get stack state', () => {
    stack.propagate(1.0);
    const state = stack.getStackState();
    assert.strictEqual(state.layers, 7);
    assert.strictEqual(state.totalActivations, 7);
  });

  test('should reset all activations', () => {
    stack.propagate(1.0);
    stack.reset();
    const state = stack.getStackState();
    assert.strictEqual(state.totalActivations, 0);
  });
});

describe('PhiResonanceAmplifier', () => {
  let amp;
  beforeEach(() => { amp = new PhiResonanceAmplifier(); });

  test('should create with defaults', () => {
    assert.strictEqual(amp.baseFrequency, 432);
    assert.strictEqual(amp.harmonics, 7);
    assert.strictEqual(amp.amplificationFactor, PHI);
  });

  test('should amplify signal', () => {
    const result = amp.amplify(10);
    assert.strictEqual(result.original, 10);
    assert.ok(Math.abs(result.amplified - 10 * PHI) < 0.001);
    assert.ok(Math.abs(result.harmonic - 10 * PHI * PHI) < 0.001);
    assert.strictEqual(result.resonanceField.length, 7);
  });

  test('should generate field', () => {
    const field = amp.generateField(5);
    assert.strictEqual(field.length, 7);
    assert.ok(field[0] > 0);
  });

  test('should detect resonance', () => {
    const result = amp.detectResonance(PHI, 1.0);
    assert.ok(result.isResonant);
    assert.ok(result.ratio > 0);
  });

  test('should detect non-resonance', () => {
    const result = amp.detectResonance(3.0, 1.0);
    assert.strictEqual(result.isResonant, false);
  });

  test('should get spectrum', () => {
    const s = amp.getSpectrum();
    assert.strictEqual(s.baseFrequency, 432);
  });

  test('should tune frequency', () => {
    amp.tuneFrequency(528);
    assert.strictEqual(amp.baseFrequency, 528);
  });
});

describe('AttentionFocusEngine', () => {
  let engine;
  beforeEach(() => { engine = new AttentionFocusEngine(); });

  test('should create with defaults', () => {
    assert.strictEqual(engine.focusSlots, 7);
    assert.ok(Math.abs(engine.decayRate - 1/PHI) < 0.001);
  });

  test('should focus on a target', () => {
    const result = engine.focus('important task', 2.0);
    assert.ok(result.targetId);
    assert.strictEqual(result.target, 'important task');
    assert.ok(result.focusStrength > 2.0);
  });

  test('should get top focus items', () => {
    engine.focus('low', 0.5);
    engine.focus('high', 5.0);
    engine.focus('mid', 2.0);
    const top = engine.getTopFocus(2);
    assert.strictEqual(top.length, 2);
    assert.strictEqual(top[0].target, 'high');
  });

  test('should decay focus strengths', () => {
    const entry = engine.focus('test', 1.0);
    const before = entry.focusStrength;
    engine.decay();
    const state = engine.getFocusState();
    assert.ok(state.totalStrength < before);
  });

  test('should boost target', () => {
    const entry = engine.focus('boost me', 1.0);
    const result = engine.boost(entry.targetId);
    assert.ok(result.focusStrength > entry.focusStrength);
  });

  test('should throw for unknown boost target', () => {
    assert.throws(() => engine.boost('fake'), /not found/);
  });

  test('should get focus state', () => {
    engine.focus('a', 1);
    engine.focus('b', 2);
    const state = engine.getFocusState();
    assert.strictEqual(state.activeTargets, 2);
    assert.ok(state.totalStrength > 0);
  });

  test('should clear all targets', () => {
    engine.focus('a', 1);
    engine.clear();
    assert.strictEqual(engine.getFocusState().activeTargets, 0);
  });
});

describe('MetaCognitionController', () => {
  let controller;
  beforeEach(() => { controller = new MetaCognitionController(); });

  test('should create with defaults', () => {
    assert.strictEqual(controller.reflectionDepth, 3);
    assert.strictEqual(controller.selfModelUpdateRate, PHI);
  });

  test('should reflect on thought', () => {
    const r = controller.reflect('What is consciousness?');
    assert.ok(r.reflectionId);
    assert.strictEqual(r.thought, 'What is consciousness?');
    assert.ok(r.analysis.complexity > 0);
    assert.ok(r.analysis.novelty >= 0 && r.analysis.novelty <= 1);
  });

  test('should assess performance', () => {
    const result = controller.assessPerformance({ accuracy: 0.9, speed: 0.8, creativity: 0.2 });
    assert.ok(result.overallScore > 0);
    assert.ok(result.strengths.includes('accuracy'));
    assert.ok(result.weaknesses.includes('creativity'));
  });

  test('should update self model', () => {
    const result = controller.updateSelfModel('learned something new');
    assert.strictEqual(result.modelVersion, 1);
    assert.strictEqual(result.observationCount, 1);
  });

  test('should get self model', () => {
    controller.updateSelfModel('obs1');
    const model = controller.getSelfModel();
    assert.strictEqual(model.version, 1);
    assert.strictEqual(model.observations.length, 1);
  });

  test('should get reflection history', () => {
    controller.reflect('thought1');
    controller.reflect('thought2');
    const history = controller.getReflectionHistory();
    assert.strictEqual(history.length, 2);
  });

  test('should handle multiple model updates', () => {
    controller.updateSelfModel('a');
    controller.updateSelfModel('b');
    const model = controller.getSelfModel();
    assert.strictEqual(model.version, 2);
    assert.strictEqual(model.observations.length, 2);
  });

  test('should handle array observations', () => {
    controller.updateSelfModel(['x', 'y', 'z']);
    assert.strictEqual(controller.getSelfModel().observations.length, 3);
  });
});
