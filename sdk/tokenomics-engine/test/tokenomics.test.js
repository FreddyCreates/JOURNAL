import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { TokenGovernor } from '../src/token-governor.js';
import { SalienceEngine } from '../src/salience-engine.js';
import { CognitiveReturnScorer } from '../src/cognitive-return-scorer.js';
import { CompressionAuditor } from '../src/compression-auditor.js';
import { WasteDetector } from '../src/waste-detector.js';
import { ReuseExtractor } from '../src/reuse-extractor.js';
import { BenchmarkHarness } from '../src/benchmark-harness.js';

// ─────────────────────────────────────────────
// Token Governor
// ─────────────────────────────────────────────
describe('TokenGovernor', () => {
  let gov;
  beforeEach(() => { gov = new TokenGovernor(); });

  test('should have default task budgets', () => {
    assert.strictEqual(gov.getBudget('invoice'), 400);
    assert.strictEqual(gov.getBudget('research'), 1200);
    assert.strictEqual(gov.getBudget('unknown-type'), 1000); // default
  });

  test('should set custom budgets', () => {
    gov.setBudget('custom', 750);
    assert.strictEqual(gov.getBudget('custom'), 750);
  });

  test('should throw on invalid budget', () => {
    assert.throws(() => gov.setBudget('x', -1), /positive number/);
    assert.throws(() => gov.setBudget('x', 0), /positive number/);
  });

  test('should allocate tokens for a task', () => {
    const alloc = gov.allocate('invoice');
    assert.strictEqual(alloc.totalBudget, 400);
    assert.strictEqual(alloc.remaining, 400);
    assert.strictEqual(alloc.status, 'active');
  });

  test('should spend tokens against allocation', () => {
    const alloc = gov.allocate('invoice');
    const updated = gov.spend(alloc.allocationId, 100);
    assert.strictEqual(updated.spent, 100);
    assert.strictEqual(updated.remaining, 300);
  });

  test('should throw when budget exceeded', () => {
    const alloc = gov.allocate('memory'); // 300 budget
    assert.throws(() => gov.spend(alloc.allocationId, 500), /exceeded/);
  });

  test('should close allocation', () => {
    const alloc = gov.allocate('invoice');
    gov.spend(alloc.allocationId, 200);
    const closed = gov.close(alloc.allocationId);
    assert.strictEqual(closed.status, 'closed');
    assert.strictEqual(closed.efficiency, 0.5);
  });

  test('should list task types', () => {
    const types = gov.getTaskTypes();
    assert.ok('invoice' in types);
    assert.ok('research' in types);
  });
});

// ─────────────────────────────────────────────
// Salience Engine
// ─────────────────────────────────────────────
describe('SalienceEngine', () => {
  let engine;
  beforeEach(() => { engine = new SalienceEngine(); });

  test('should score a single item', () => {
    const score = engine.score({
      urgency: 5, risk: 4, mission: 3, timeSensitivity: 2, novelty: 4, knownContext: 1
    });
    assert.ok(score > 0);
  });

  test('should penalize known context', () => {
    const highNovelty = engine.score({ urgency: 3, risk: 3, mission: 3, novelty: 5, knownContext: 0 });
    const highKnown = engine.score({ urgency: 3, risk: 3, mission: 3, novelty: 0, knownContext: 5 });
    assert.ok(highNovelty > highKnown);
  });

  test('should allocate budgets proportionally', () => {
    const items = [
      { label: 'critical', urgency: 5, risk: 5, mission: 5, novelty: 5, knownContext: 0 },
      { label: 'routine', urgency: 1, risk: 1, mission: 1, novelty: 1, knownContext: 4 }
    ];
    const allocated = engine.allocate(items, 1000);
    assert.strictEqual(allocated.length, 2);
    assert.ok(allocated[0].budget > allocated[1].budget);
    // Total budget should approximate 1000
    const total = allocated.reduce((s, a) => s + a.budget, 0);
    assert.ok(Math.abs(total - 1000) <= 2); // rounding tolerance
  });

  test('should handle empty items', () => {
    assert.deepStrictEqual(engine.allocate([], 1000), []);
  });

  test('should handle all-zero salience', () => {
    const items = [
      { label: 'a', urgency: 0, risk: 0, mission: 0, novelty: 0, knownContext: 0 },
      { label: 'b', urgency: 0, risk: 0, mission: 0, novelty: 0, knownContext: 0 }
    ];
    const allocated = engine.allocate(items, 1000);
    assert.strictEqual(allocated[0].budget, 500);
  });

  test('should update weights', () => {
    engine.setWeights({ urgency: 2.0 });
    assert.strictEqual(engine.getWeights().urgency, 2.0);
  });
});

// ─────────────────────────────────────────────
// Cognitive Return Scorer
// ─────────────────────────────────────────────
describe('CognitiveReturnScorer', () => {
  let scorer;
  beforeEach(() => { scorer = new CognitiveReturnScorer(); });

  test('should score an output', () => {
    const result = scorer.score({
      decisionQuality: 4, actionability: 5, riskControl: 3, reuseValue: 4, learningGain: 2, waste: 1
    }, 500);
    assert.strictEqual(result.tokenValue, 4 + 5 + 3 + 4 + 2 - 1); // 17
    assert.strictEqual(result.crpt, 17 / 500);
    assert.ok(result.scoreId);
  });

  test('should clamp scores to 0–5', () => {
    const result = scorer.score({ decisionQuality: 10, actionability: -2 }, 100);
    assert.strictEqual(result.dimensions.decisionQuality, 5);
    assert.strictEqual(result.dimensions.actionability, 0);
  });

  test('should throw on invalid tokens', () => {
    assert.throws(() => scorer.score({}, 0), /positive number/);
  });

  test('should compare two systems', () => {
    const comparison = scorer.compare(
      { decisionQuality: 3, actionability: 3, riskControl: 2, reuseValue: 1, learningGain: 1, waste: 2 },
      800,
      { decisionQuality: 4, actionability: 4, riskControl: 3, reuseValue: 3, learningGain: 2, waste: 0 },
      400
    );
    assert.ok(comparison.isImprovement);
    assert.ok(comparison.tokenomicGain > 0);
  });

  test('should track history', () => {
    scorer.score({ decisionQuality: 3 }, 100);
    scorer.score({ decisionQuality: 4 }, 200);
    assert.strictEqual(scorer.getHistory().length, 2);
  });

  test('should calculate average CRPT', () => {
    scorer.score({ decisionQuality: 5, actionability: 5, riskControl: 5, reuseValue: 5, learningGain: 5, waste: 0 }, 100);
    assert.strictEqual(scorer.getAverageCRPT(), 25 / 100);
  });
});

// ─────────────────────────────────────────────
// Compression Auditor
// ─────────────────────────────────────────────
describe('CompressionAuditor', () => {
  let auditor;
  beforeEach(() => { auditor = new CompressionAuditor(); });

  test('should audit good compression', () => {
    const result = auditor.audit({
      originalTokens: 500,
      compressedTokens: 200,
      informationRetained: 4,
      actionClarity: 5,
      riskPreserved: 4
    });
    assert.ok(result.passed);
    assert.strictEqual(result.verdict, 'compression');
    assert.strictEqual(result.tokensSaved, 300);
    assert.ok(result.cef > 0);
  });

  test('should detect bad compression (deletion)', () => {
    const result = auditor.audit({
      originalTokens: 500,
      compressedTokens: 50,
      informationRetained: 1,
      actionClarity: 1,
      riskPreserved: 1
    });
    assert.strictEqual(result.passed, false);
    assert.strictEqual(result.verdict, 'deletion');
  });

  test('should throw on missing tokens', () => {
    assert.throws(() => auditor.audit({}), /required/);
  });

  test('should check actionability', () => {
    assert.strictEqual(auditor.canUserAct(4), true);
    assert.strictEqual(auditor.canUserAct(2), false);
  });

  test('should track pass rate', () => {
    auditor.audit({ originalTokens: 100, compressedTokens: 50, informationRetained: 5, actionClarity: 5, riskPreserved: 5 });
    auditor.audit({ originalTokens: 100, compressedTokens: 50, informationRetained: 1, actionClarity: 1, riskPreserved: 1 });
    assert.strictEqual(auditor.getPassRate(), 0.5);
  });
});

// ─────────────────────────────────────────────
// Waste Detector
// ─────────────────────────────────────────────
describe('WasteDetector', () => {
  let detector;
  beforeEach(() => { detector = new WasteDetector(); });

  test('should detect waste findings', () => {
    const result = detector.detect({
      totalTokens: 500,
      findings: [
        { patternId: 'context-restatement', tokenCount: 100 },
        { patternId: 'empty-sophistication', tokenCount: 50 }
      ]
    });
    assert.strictEqual(result.wastedTokens, 150);
    assert.strictEqual(result.usefulTokens, 350);
    assert.ok(result.wasteRatio > 0);
  });

  test('should grade output quality', () => {
    const excellent = detector.detect({ totalTokens: 1000, findings: [{ patternId: 'context-restatement', tokenCount: 10 }] });
    assert.strictEqual(excellent.grade, 'excellent');

    const poor = detector.detect({ totalTokens: 100, findings: [{ patternId: 'expansion-over-execution', tokenCount: 80 }] });
    assert.strictEqual(poor.grade, 'poor');
  });

  test('should throw on invalid input', () => {
    assert.throws(() => detector.detect({ totalTokens: 0, findings: [] }), /positive number/);
    assert.throws(() => detector.detect({ totalTokens: 100 }), /array/);
  });

  test('should check if mostly waste', () => {
    assert.strictEqual(detector.isMostlyWaste(0.6), true);
    assert.strictEqual(detector.isMostlyWaste(0.3), false);
  });

  test('should add custom patterns', () => {
    detector.addPattern({ id: 'custom-waste', label: 'Custom', weight: 2.0 });
    assert.strictEqual(detector.getPatterns().length, 6);
  });
});

// ─────────────────────────────────────────────
// Reuse Extractor
// ─────────────────────────────────────────────
describe('ReuseExtractor', () => {
  let extractor;
  beforeEach(() => { extractor = new ReuseExtractor(); });

  test('should extract high-score artifacts', () => {
    const result = extractor.extract({
      content: 'Always validate budget before generating',
      type: 'rule',
      source: 'invoice-task-42',
      reuseScore: 4,
      tags: ['governance', 'budget']
    });
    assert.strictEqual(result.extracted, true);
    assert.ok(result.artifact.artifactId);
    assert.strictEqual(result.artifact.type, 'rule');
  });

  test('should reject low-score artifacts', () => {
    const result = extractor.extract({
      content: 'some throwaway text',
      type: 'pattern',
      reuseScore: 1
    });
    assert.strictEqual(result.extracted, false);
    assert.ok(result.reason.includes('below threshold'));
  });

  test('should record usage', () => {
    const { artifact } = extractor.extract({ content: 'rule', type: 'rule', reuseScore: 5 });
    const updated = extractor.recordUsage(artifact.artifactId);
    assert.strictEqual(updated.usageCount, 1);
  });

  test('should throw on unknown artifact usage', () => {
    assert.throws(() => extractor.recordUsage('fake'), /not found/);
  });

  test('should search by type', () => {
    extractor.extract({ content: 'rule1', type: 'rule', reuseScore: 4 });
    extractor.extract({ content: 'tmpl1', type: 'template', reuseScore: 5 });
    const rules = extractor.search({ type: 'rule' });
    assert.strictEqual(rules.length, 1);
  });

  test('should search by tag', () => {
    extractor.extract({ content: 'r', type: 'rule', reuseScore: 4, tags: ['budget'] });
    extractor.extract({ content: 't', type: 'rule', reuseScore: 4, tags: ['security'] });
    const found = extractor.search({ tag: 'budget' });
    assert.strictEqual(found.length, 1);
  });

  test('should get most reused', () => {
    const { artifact: a1 } = extractor.extract({ content: 'a', type: 'rule', reuseScore: 4 });
    extractor.extract({ content: 'b', type: 'rule', reuseScore: 4 });
    extractor.recordUsage(a1.artifactId);
    extractor.recordUsage(a1.artifactId);
    const top = extractor.getMostReused(1);
    assert.strictEqual(top[0].artifactId, a1.artifactId);
  });
});

// ─────────────────────────────────────────────
// Benchmark Harness
// ─────────────────────────────────────────────
describe('BenchmarkHarness', () => {
  let harness;
  beforeEach(() => { harness = new BenchmarkHarness(); });

  test('should run a single benchmark', () => {
    const result = harness.run({
      taskType: 'invoice',
      description: 'Update invoice totals',
      systemA: {
        tokens: 800,
        scores: { decisionQuality: 3, actionability: 3, riskControl: 2, reuseValue: 1, learningGain: 1, waste: 2 }
      },
      systemB: {
        tokens: 300,
        scores: { decisionQuality: 4, actionability: 5, riskControl: 3, reuseValue: 3, learningGain: 2, waste: 0 }
      }
    });
    assert.strictEqual(result.verdict, 'TOKENOMICS_WINS');
    assert.ok(result.tokenomicGain > 0);
    assert.strictEqual(result.tokensSaved, 500);
  });

  test('should run a batch', () => {
    const results = harness.runBatch([
      {
        taskType: 'research',
        systemA: { tokens: 1200, scores: { decisionQuality: 4, actionability: 3, waste: 1 } },
        systemB: { tokens: 600, scores: { decisionQuality: 4, actionability: 4, waste: 0 } }
      },
      {
        taskType: 'cashflow',
        systemA: { tokens: 500, scores: { decisionQuality: 3, waste: 0 } },
        systemB: { tokens: 400, scores: { decisionQuality: 4, waste: 0 } }
      }
    ]);
    assert.strictEqual(results.length, 2);
  });

  test('should produce summary', () => {
    harness.run({
      taskType: 'architecture',
      systemA: { tokens: 1000, scores: { decisionQuality: 3, waste: 2 } },
      systemB: { tokens: 500, scores: { decisionQuality: 4, waste: 0 } }
    });
    const summary = harness.getSummary();
    assert.strictEqual(summary.runs, 1);
    assert.ok('winRate' in summary);
    assert.ok('byTaskType' in summary);
  });

  test('should throw on missing params', () => {
    assert.throws(() => harness.run({}), /taskType/);
    assert.throws(() => harness.run({ taskType: 'x' }), /systemA.*systemB/);
  });

  test('should reset', () => {
    harness.run({
      taskType: 'memory',
      systemA: { tokens: 200, scores: { decisionQuality: 2 } },
      systemB: { tokens: 100, scores: { decisionQuality: 3 } }
    });
    harness.reset();
    assert.strictEqual(harness.getSummary().runs, 0);
  });
});
