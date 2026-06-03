import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { HarmonicFieldGenerator } from '../src/harmonic-field-generator.js';
import { ResonanceCoupler } from '../src/resonance-coupler.js';
import { FrequencySynthesizer } from '../src/frequency-synthesizer.js';
import { PhaseAligner } from '../src/phase-aligner.js';
import { WaveformComposer } from '../src/waveform-composer.js';

const PHI = 1.618033988749895;

describe('HarmonicFieldGenerator', () => {
  let gen;
  beforeEach(() => { gen = new HarmonicFieldGenerator(); });

  test('should create with defaults', () => {
    assert.strictEqual(gen.baseFrequency, 432);
    assert.strictEqual(gen.harmonicCount, 12);
  });

  test('should generate harmonic field', () => {
    const r = gen.generate();
    assert.ok(r.fieldId);
    assert.strictEqual(r.frequencies.length, 12);
    assert.ok(r.coherence >= 0);
  });

  test('should modulate field', () => {
    const f = gen.generate();
    const r = gen.modulate(f.fieldId, 2.0);
    assert.strictEqual(r.fieldStrength, 2.0);
  });

  test('should throw for unknown field modulation', () => {
    assert.throws(() => gen.modulate('fake', 1), /not found/);
  });

  test('should dissolve field', () => {
    const f = gen.generate();
    assert.ok(gen.dissolve(f.fieldId));
    assert.strictEqual(gen.getFields().length, 0);
  });

  test('should get spectrum', () => {
    gen.generate();
    const s = gen.getSpectrum();
    assert.strictEqual(s.fieldCount, 1);
    assert.ok(s.totalFrequencies > 0);
  });

  test('should get field by id', () => {
    const f = gen.generate();
    assert.ok(gen.getField(f.fieldId));
  });

  test('should return null for unknown field', () => {
    assert.strictEqual(gen.getField('fake'), null);
  });
});

describe('ResonanceCoupler', () => {
  let coupler;
  beforeEach(() => { coupler = new ResonanceCoupler(); });

  test('should create with defaults', () => {
    assert.strictEqual(coupler.couplingStrength, PHI);
  });

  test('should couple two systems', () => {
    const r = coupler.couple({ frequency: 432 }, { frequency: 528 });
    assert.ok(r.couplingId);
    assert.ok(r.resonance >= 0);
    assert.ok(typeof r.stable === 'boolean');
  });

  test('should decouple', () => {
    const c = coupler.couple({ frequency: 1 }, { frequency: 2 });
    assert.ok(coupler.decouple(c.couplingId));
  });

  test('should get resonance', () => {
    const c = coupler.couple({ frequency: 432 }, { frequency: 432 });
    const r = coupler.getResonance(c.couplingId);
    assert.ok(r);
  });

  test('should get strongest coupling', () => {
    coupler.couple({ frequency: 1 }, { frequency: 2 });
    coupler.couple({ frequency: 432 }, { frequency: 432 });
    const s = coupler.getStrongest();
    assert.ok(s);
  });

  test('should optimize couplings', () => {
    coupler.couple({ frequency: 100 }, { frequency: 200 });
    const r = coupler.optimizeCouplings();
    assert.strictEqual(r.optimized, 1);
  });

  test('should get all couplings', () => {
    coupler.couple({ frequency: 1 }, { frequency: 2 });
    assert.strictEqual(coupler.getCouplings().length, 1);
  });
});

describe('FrequencySynthesizer', () => {
  let synth;
  beforeEach(() => { synth = new FrequencySynthesizer(); });

  test('should create with defaults', () => {
    assert.strictEqual(synth.fundamentalFreq, 432);
  });

  test('should synthesize frequency', () => {
    const r = synth.synthesize(0);
    assert.ok(r.frequency > 0);
    assert.strictEqual(r.harmonics.length, 5);
  });

  test('should generate chord', () => {
    const r = synth.chord([0, 4, 7]);
    assert.strictEqual(r.frequencies.length, 3);
    assert.ok(r.consonance >= 0);
  });

  test('should generate scale', () => {
    const s = synth.getScale(0);
    assert.strictEqual(s.length, 7);
  });

  test('should detune', () => {
    const detuned = synth.detune(440, 100);
    assert.ok(detuned > 440);
  });

  test('should get registry', () => {
    synth.synthesize(0);
    synth.synthesize(1);
    assert.strictEqual(synth.getRegistry().length, 2);
  });
});

describe('PhaseAligner', () => {
  let aligner;
  beforeEach(() => { aligner = new PhaseAligner(); });

  test('should create with defaults', () => {
    assert.strictEqual(aligner.alignmentPrecision, 0.001);
  });

  test('should measure aligned signals', () => {
    const r = aligner.measure({ phase: 0.5 }, { phase: 0.5 });
    assert.ok(r.isAligned);
  });

  test('should measure misaligned signals', () => {
    const r = aligner.measure({ phase: 0 }, { phase: Math.PI });
    assert.strictEqual(r.isAligned, false);
  });

  test('should align signal', () => {
    const r = aligner.align('sig1', 1.5);
    assert.ok(r.aligned);
  });

  test('should lock signals', () => {
    const r = aligner.lock(['s1', 's2', 's3']);
    assert.ok(r.lockId);
    assert.strictEqual(r.signals, 3);
    assert.ok(r.locked);
  });

  test('should unlock', () => {
    const l = aligner.lock(['a', 'b']);
    assert.ok(aligner.unlock(l.lockId));
  });

  test('should get phase state', () => {
    aligner.align('x', 0);
    aligner.lock(['a']);
    const s = aligner.getPhaseState();
    assert.strictEqual(s.signals, 1);
    assert.strictEqual(s.locks, 1);
  });
});

describe('WaveformComposer', () => {
  let composer;
  beforeEach(() => { composer = new WaveformComposer(); });

  test('should create with defaults', () => {
    assert.strictEqual(composer.sampleRate, 44100);
    assert.strictEqual(composer.bufferSize, 1024);
  });

  test('should create sine wave', () => {
    const r = composer.createWave('sine', 440);
    assert.ok(r.waveId);
    assert.strictEqual(r.type, 'sine');
    assert.strictEqual(r.frequency, 440);
  });

  test('should create square wave', () => {
    const r = composer.createWave('square', 220);
    assert.strictEqual(r.type, 'square');
  });

  test('should create phi-golden wave', () => {
    const r = composer.createWave('phi-golden', 432);
    assert.strictEqual(r.type, 'phi-golden');
  });

  test('should compose waves', () => {
    const w1 = composer.createWave('sine', 440);
    const w2 = composer.createWave('sine', 880);
    const r = composer.compose([w1.waveId, w2.waveId]);
    assert.ok(r.compositeId);
    assert.strictEqual(r.components, 2);
  });

  test('should throw composing invalid waves', () => {
    assert.throws(() => composer.compose(['fake']), /No valid/);
  });

  test('should transform wave', () => {
    const w = composer.createWave('sine', 440);
    const r = composer.transform(w.waveId, 'scale');
    assert.ok(r.applied);
  });

  test('should get compositions', () => {
    const w = composer.createWave('sine', 440);
    composer.compose([w.waveId]);
    assert.strictEqual(composer.getCompositions().length, 1);
  });
});
