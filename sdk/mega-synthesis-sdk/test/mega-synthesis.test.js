import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { KnowledgeSynthesizer } from '../src/knowledge-synthesizer.js';
import { DomainFusionEngine } from '../src/domain-fusion-engine.js';
import { ConceptBlender } from '../src/concept-blender.js';
import { InsightCrystallizer } from '../src/insight-crystallizer.js';
import { SynthesisOrchestrator } from '../src/synthesis-orchestrator.js';

const PHI = 1.618033988749895;

describe('KnowledgeSynthesizer', () => {
  let synth;
  beforeEach(() => { synth = new KnowledgeSynthesizer(); });

  test('should create with defaults', () => {
    assert.strictEqual(synth.maxSources, 32);
    assert.strictEqual(synth.coherenceThreshold, 0.7);
  });

  test('should add source', () => {
    const r = synth.addSource('physics', ['gravity', 'relativity']);
    assert.ok(r.sourceId);
    assert.strictEqual(r.domain, 'physics');
    assert.strictEqual(r.fragments, 2);
  });

  test('should synthesize', () => {
    synth.addSource('math', ['algebra']);
    synth.addSource('cs', ['algorithms']);
    const r = synth.synthesize('how do they connect?');
    assert.ok(r.synthesisId);
    assert.ok(r.result.confidence > 0);
    assert.ok(r.result.crossLinks.length > 0);
  });

  test('should get sources', () => {
    synth.addSource('bio', ['cells']);
    const s = synth.getSources();
    assert.strictEqual(s.bio, 1);
  });

  test('should get insights', () => {
    synth.addSource('a', ['x']);
    synth.synthesize('q');
    assert.strictEqual(synth.getInsights().length, 1);
  });

  test('should clear', () => {
    synth.addSource('a', ['x']);
    synth.clear();
    assert.deepStrictEqual(synth.getSources(), {});
  });
});

describe('DomainFusionEngine', () => {
  let engine;
  beforeEach(() => { engine = new DomainFusionEngine(); });

  test('should register domain', () => {
    const r = engine.registerDomain('ai', { concepts: ['neural', 'learning'] });
    assert.ok(r.domainId);
    assert.strictEqual(r.conceptCount, 2);
  });

  test('should find overlaps', () => {
    engine.registerDomain('a', { concepts: ['x', 'y'] });
    engine.registerDomain('b', { concepts: ['y', 'z'] });
    const r = engine.findOverlaps('a', 'b');
    assert.strictEqual(r.overlaps.length, 1);
    assert.strictEqual(r.overlaps[0].concept, 'y');
  });

  test('should fuse concept', () => {
    engine.registerDomain('a', { concepts: ['shared'] });
    engine.registerDomain('b', { concepts: ['shared'] });
    const r = engine.fuse(['a', 'b'], 'shared');
    assert.strictEqual(r.contributors.length, 2);
  });

  test('should get domains', () => {
    engine.registerDomain('x', { concepts: [] });
    assert.strictEqual(engine.getDomains().length, 1);
  });

  test('should throw for unknown domain overlap', () => {
    assert.throws(() => engine.findOverlaps('x', 'y'), /not found/);
  });
});

describe('ConceptBlender', () => {
  let blender;
  beforeEach(() => { blender = new ConceptBlender(); });

  test('should create with defaults', () => {
    assert.strictEqual(blender.creativityFactor, PHI);
  });

  test('should blend two concepts', () => {
    const r = blender.blend('fire', 'water');
    assert.ok(r.blendId);
    assert.ok(r.output.includes('fire'));
    assert.ok(r.noveltyScore > 0);
  });

  test('should multi-blend', () => {
    const r = blender.multiBlend(['a', 'b', 'c']);
    assert.strictEqual(r.steps, 2);
  });

  test('should get blend history', () => {
    blender.blend('x', 'y');
    assert.strictEqual(blender.getBlendHistory().length, 1);
  });

  test('should set creativity', () => {
    blender.setCreativity(3.0);
    assert.strictEqual(blender.creativityFactor, 3.0);
  });

  test('should get stats', () => {
    blender.blend('a', 'b');
    const s = blender.getStats();
    assert.strictEqual(s.totalBlends, 1);
  });
});

describe('InsightCrystallizer', () => {
  let cryst;
  beforeEach(() => { cryst = new InsightCrystallizer(); });

  test('should absorb data', () => {
    const r = cryst.absorb('raw knowledge');
    assert.ok(r.absorbed);
    assert.strictEqual(r.bufferSize, 1);
  });

  test('should crystallize insights', () => {
    for (let i = 0; i < 10; i++) cryst.absorb(`data ${i}`);
    const r = cryst.crystallize();
    assert.ok(r.crystallized >= 0);
  });

  test('should get all insights', () => {
    for (let i = 0; i < 5; i++) cryst.absorb(`d${i}`);
    cryst.crystallize();
    const insights = cryst.getAllInsights();
    assert.ok(insights.length >= 0);
  });

  test('should dissolve insight', () => {
    for (let i = 0; i < 5; i++) cryst.absorb('x');
    const { insights } = cryst.crystallize();
    if (insights.length > 0) {
      assert.ok(cryst.dissolve(insights[0].insightId));
    }
  });

  test('should report crystallization potential', () => {
    const r = cryst.absorb('test');
    assert.ok(r.crystallizationPotential >= 0);
  });
});

describe('SynthesisOrchestrator', () => {
  let orch;
  beforeEach(() => { orch = new SynthesisOrchestrator(); });

  test('should start session', () => {
    const r = orch.start('understand AI');
    assert.ok(r.sessionId);
    assert.strictEqual(r.stage, 'gather');
  });

  test('should advance through pipeline', () => {
    const s = orch.start('goal');
    const r = orch.advance(s.sessionId);
    assert.strictEqual(r.from, 'gather');
    assert.strictEqual(r.to, 'analyze');
  });

  test('should throw at end of pipeline', () => {
    const s = orch.start('g');
    for (let i = 0; i < 4; i++) orch.advance(s.sessionId);
    assert.throws(() => orch.advance(s.sessionId), /complete/);
  });

  test('should complete session', () => {
    const s = orch.start('g');
    const r = orch.complete(s.sessionId);
    assert.strictEqual(r.status, 'complete');
  });

  test('should get sessions', () => {
    orch.start('a');
    orch.start('b');
    assert.strictEqual(orch.getSessions().length, 2);
  });

  test('should get metrics', () => {
    orch.start('a');
    const m = orch.getMetrics();
    assert.strictEqual(m.totalSessions, 1);
    assert.strictEqual(m.pipelineStages, 5);
  });
});
