import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { SensoryFusionEngine } from '../src/sensory-fusion-engine.js';
import { ModalityProcessor } from '../src/modality-processor.js';
import { PatternRecognizer } from '../src/pattern-recognizer.js';
import { DepthPerceptionField } from '../src/depth-perception-field.js';
import { PerceptualMemoryBuffer } from '../src/perceptual-memory-buffer.js';

const PHI = 1.618033988749895;

describe('SensoryFusionEngine', () => {
  let engine;
  beforeEach(() => { engine = new SensoryFusionEngine(); });

  test('should create with default modalities', () => {
    assert.strictEqual(engine.modalities.length, 5);
    assert.strictEqual(engine.confidenceThreshold, 0.618);
  });

  test('should ingest signal', () => {
    const result = engine.ingest('visual', { strength: 0.8 });
    assert.ok(result.signalId);
    assert.strictEqual(result.modality, 'visual');
    assert.strictEqual(result.strength, 0.8);
  });

  test('should fuse signals', () => {
    engine.ingest('visual', { strength: 1.0 });
    engine.ingest('auditory', { strength: 0.8 });
    const result = engine.fuse();
    assert.ok(result.fusedSignal.strength > 0);
    assert.strictEqual(result.componentCount, 2);
    assert.strictEqual(result.fusedSignal.dominantModality, 'visual');
  });

  test('should fuse with no signals', () => {
    const result = engine.fuse();
    assert.strictEqual(result.componentCount, 0);
    assert.strictEqual(result.fusedSignal.confidence, 0);
  });

  test('should get modality state', () => {
    engine.ingest('tactile', { strength: 0.5 });
    const state = engine.getModalityState('tactile');
    assert.strictEqual(state.length, 1);
  });

  test('should get overall state', () => {
    engine.ingest('visual', { strength: 1.0 });
    engine.ingest('visual', { strength: 0.5 });
    const state = engine.getState();
    assert.strictEqual(state.totalSignals, 2);
    assert.strictEqual(state.modalities.visual, 2);
  });

  test('should reset', () => {
    engine.ingest('visual', { strength: 1.0 });
    engine.reset();
    assert.strictEqual(engine.getState().totalSignals, 0);
  });

  test('should handle unknown modality', () => {
    const result = engine.ingest('unknown', { strength: 1.0 });
    assert.strictEqual(result.modality, 'unknown');
  });
});

describe('ModalityProcessor', () => {
  let proc;
  beforeEach(() => { proc = new ModalityProcessor(); });

  test('should create with defaults', () => {
    assert.strictEqual(proc.modalityType, 'generic');
    assert.strictEqual(proc.processingLayers, 5);
  });

  test('should process numeric signal', () => {
    const result = proc.process(10.0);
    assert.ok(result.processedSignal > 0);
    assert.strictEqual(result.layers.length, 5);
    assert.ok(result.confidence >= 0);
  });

  test('should process object signal', () => {
    const result = proc.process({ value: 5.0 });
    assert.ok(result.processedSignal > 0);
  });

  test('should calibrate from reference signals', () => {
    const result = proc.calibrate([1.0, 2.0, 3.0]);
    assert.ok(result.threshold > 0);
    assert.strictEqual(result.referenceCount, 3);
  });

  test('should get calibration', () => {
    proc.calibrate([5.0]);
    const cal = proc.getCalibration();
    assert.ok(cal.calibratedAt);
  });

  test('should set threshold', () => {
    proc.setThreshold(0.9);
    assert.strictEqual(proc.getCalibration().threshold, 0.9);
  });
});

describe('PatternRecognizer', () => {
  let rec;
  beforeEach(() => { rec = new PatternRecognizer(); });

  test('should register pattern', () => {
    const result = rec.registerPattern('test', [1, 2, 3]);
    assert.ok(result.patternId);
    assert.strictEqual(result.name, 'test');
    assert.ok(result.complexity > 0);
  });

  test('should recognize matching pattern', () => {
    rec.registerPattern('nums', [1, 2, 3]);
    const result = rec.recognize([1, 2, 3]);
    assert.ok(result.matches.length > 0);
    assert.ok(result.bestMatch);
  });

  test('should list patterns', () => {
    rec.registerPattern('a', [1]);
    rec.registerPattern('b', [2]);
    assert.strictEqual(rec.getPatterns().length, 2);
  });

  test('should remove pattern', () => {
    rec.registerPattern('x', [1]);
    rec.removePattern('x');
    assert.strictEqual(rec.getPatterns().length, 0);
  });

  test('should get stats', () => {
    rec.registerPattern('p', [1]);
    rec.recognize([1]);
    const stats = rec.getStats();
    assert.strictEqual(stats.recognitions, 1);
  });
});

describe('DepthPerceptionField', () => {
  let field;
  beforeEach(() => { field = new DepthPerceptionField(); });

  test('should create with defaults', () => {
    assert.strictEqual(field.dimensions, 3);
    assert.strictEqual(field.fieldResolution, 64);
  });

  test('should map a point', () => {
    const result = field.mapPoint([1, 2, 3], 5.0);
    assert.ok(result.pointId);
    assert.ok(result.depth !== undefined);
    assert.ok(result.fieldStrength > 0);
  });

  test('should get depth at coordinates', () => {
    field.mapPoint([1, 2, 3], 10.0);
    const result = field.getDepthAt([1, 2, 3]);
    assert.ok(result);
    assert.strictEqual(result.value, 10.0);
  });

  test('should return null for unmapped coords', () => {
    assert.strictEqual(field.getDepthAt([99, 99, 99]), null);
  });

  test('should compute gradient', () => {
    const a = field.mapPoint([0, 0, 0], 1.0);
    const b = field.mapPoint([1, 1, 1], 2.0);
    const gradient = field.computeGradient(a.pointId, b.pointId);
    assert.ok(gradient);
    assert.ok(gradient.distance > 0);
  });

  test('should get field state', () => {
    field.mapPoint([1, 0, 0], 1);
    field.mapPoint([0, 1, 0], 2);
    const state = field.getFieldState();
    assert.strictEqual(state.pointCount, 2);
  });
});

describe('PerceptualMemoryBuffer', () => {
  let buf;
  beforeEach(() => { buf = new PerceptualMemoryBuffer(); });

  test('should create with defaults', () => {
    assert.strictEqual(buf.bufferSize, 128);
  });

  test('should buffer perception', () => {
    const result = buf.buffer({ type: 'visual', data: 'red' });
    assert.ok(result.entryId);
    assert.strictEqual(result.strength, 1.0);
  });

  test('should recall perceptions', () => {
    buf.buffer({ color: 'red' });
    buf.buffer({ color: 'blue' });
    const results = buf.recall({ color: 'red' });
    assert.ok(results.length > 0);
  });

  test('should consolidate strong entries', () => {
    buf.buffer({ x: 1 });
    const result = buf.consolidate();
    assert.ok(result.consolidated >= 0);
  });

  test('should get buffer state', () => {
    buf.buffer({ a: 1 });
    const state = buf.getBufferState();
    assert.strictEqual(state.buffered, 1);
    assert.ok(state.newestEntry);
  });

  test('should flush buffer', () => {
    buf.buffer({ a: 1 });
    buf.buffer({ b: 2 });
    const result = buf.flush();
    assert.strictEqual(result.flushed, 2);
    assert.strictEqual(buf.getBufferState().buffered, 0);
  });
});
