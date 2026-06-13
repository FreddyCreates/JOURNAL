import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { TokenValueFunction } from '../src/token-value-function.js';
import { MeasurementLoop } from '../src/measurement-loop.js';
import { EvaluationCriteria } from '../src/evaluation-criteria.js';

// ─────────────────────────────────────────────
// Token Value Function
// ─────────────────────────────────────────────
describe('TokenValueFunction', () => {
  let tvf;
  beforeEach(() => { tvf = new TokenValueFunction(); });

  test('should evaluate token value with default weights', () => {
    const result = tvf.evaluate({
      decision: 4, action: 3, risk: 2, compression: 3, memory: 2, noise: 1
    });
    assert.ok(result.tokenValue > 0);
    assert.ok(result.isPositive);
    assert.strictEqual(result.taskType, 'default');
  });

  test('should apply task-specific weight profiles', () => {
    const invoiceResult = tvf.evaluate({ decision: 3, action: 5, risk: 2, compression: 1, memory: 1, noise: 0 }, 'invoice');
    const researchResult = tvf.evaluate({ decision: 3, action: 5, risk: 2, compression: 1, memory: 1, noise: 0 }, 'research');
    // Invoice weights action higher, research weights compression higher
    assert.notStrictEqual(invoiceResult.tokenValue, researchResult.tokenValue);
  });

  test('should produce negative value for high-noise tokens', () => {
    const result = tvf.evaluate({ decision: 0, action: 0, risk: 0, compression: 0, memory: 0, noise: 5 });
    assert.ok(result.tokenValue < 0);
    assert.strictEqual(result.isPositive, false);
  });

  test('should clamp dimension values to 0–5', () => {
    const result = tvf.evaluate({ decision: 10, action: -3, risk: 2, compression: 0, memory: 0, noise: 0 });
    assert.strictEqual(result.dimensions.decision, 5);
    assert.strictEqual(result.dimensions.action, 0);
  });

  test('should batch evaluate segments', () => {
    const batch = tvf.evaluateBatch([
      { dimensions: { decision: 4, action: 4, risk: 3, compression: 2, memory: 2, noise: 1 } },
      { dimensions: { decision: 0, action: 0, risk: 0, compression: 0, memory: 0, noise: 5 } },
      { dimensions: { decision: 5, action: 5, risk: 5, compression: 5, memory: 5, noise: 0 }, taskType: 'invoice' }
    ]);
    assert.strictEqual(batch.segments.length, 3);
    assert.ok(batch.totalValue > 0);
    assert.strictEqual(batch.negativeTokens, 1);
  });

  test('should handle empty batch', () => {
    const batch = tvf.evaluateBatch([]);
    assert.strictEqual(batch.totalValue, 0);
    assert.strictEqual(batch.positiveRate, 0);
  });

  test('should get and set profiles', () => {
    tvf.setProfile('custom-task', { decision: 2.0, action: 2.0 });
    const profile = tvf.getProfile('custom-task');
    assert.strictEqual(profile.decision, 2.0);
    assert.strictEqual(profile.action, 2.0);
  });

  test('should throw on empty taskType for setProfile', () => {
    assert.throws(() => tvf.setProfile('', {}), /required/);
  });

  test('should track evaluation history', () => {
    tvf.evaluate({ decision: 3 });
    tvf.evaluate({ decision: 4 });
    assert.strictEqual(tvf.getHistory().length, 2);
    tvf.reset();
    assert.strictEqual(tvf.getHistory().length, 0);
  });

  test('should list all task profiles', () => {
    const profiles = tvf.getProfiles();
    assert.ok('invoice' in profiles);
    assert.ok('research' in profiles);
    assert.ok('red-team' in profiles);
  });
});

// ─────────────────────────────────────────────
// Measurement Loop
// ─────────────────────────────────────────────
describe('MeasurementLoop', () => {
  let loop;
  beforeEach(() => { loop = new MeasurementLoop(); });

  test('Step 1: should classify a task', () => {
    const result = loop.classify({ description: 'Update invoice totals', type: 'invoice' });
    assert.strictEqual(result.step, 1);
    assert.strictEqual(result.taskType, 'invoice');
  });

  test('Step 1: should throw on missing description', () => {
    assert.throws(() => loop.classify({}), /description/);
  });

  test('Step 2: should estimate risk', () => {
    const result = loop.estimateRisk({
      taskType: 'cashflow',
      factors: { stakes: 4, ambiguity: 3, dependencies: 2, novelty: 3 }
    });
    assert.strictEqual(result.step, 2);
    assert.ok(result.riskScore > 0);
    assert.ok(['low', 'moderate', 'critical'].includes(result.riskLevel));
  });

  test('Step 3: should rank salience', () => {
    const items = [
      { label: 'payment', urgency: 5, risk: 4, mission: 5, novelty: 2, knownContext: 0 },
      { label: 'formatting', urgency: 1, risk: 0, mission: 1, novelty: 0, knownContext: 3 }
    ];
    const result = loop.rankSalience(items, 500);
    assert.strictEqual(result.step, 3);
    assert.strictEqual(result.items.length, 2);
    assert.ok(result.topPriority.label === 'payment');
  });

  test('Step 4: should allocate budget', () => {
    const result = loop.allocateBudget('invoice');
    assert.strictEqual(result.step, 4);
    assert.strictEqual(result.allocation.totalBudget, 400);
  });

  test('Step 5: should recruit modules based on risk', () => {
    const critical = loop.recruitModules({ taskType: 'cashflow', riskLevel: 'critical', complexity: 3 });
    assert.ok(critical.recruitedModules.includes('waste-detector'));
    assert.ok(critical.recruitedModules.includes('compression-auditor'));

    const low = loop.recruitModules({ taskType: 'invoice', riskLevel: 'low', complexity: 1 });
    assert.ok(!low.recruitedModules.includes('waste-detector'));
  });

  test('Step 7: should audit compression', () => {
    const result = loop.auditCompression({
      originalTokens: 800, compressedTokens: 300,
      informationRetained: 4, actionClarity: 5, riskPreserved: 4
    });
    assert.strictEqual(result.step, 7);
    assert.ok(result.passed);
  });

  test('Step 8: should score cognitive return', () => {
    const result = loop.scoreCognitiveReturn({
      decisionQuality: 4, actionability: 4, riskControl: 3, reuseValue: 3, learningGain: 2, waste: 1
    }, 400);
    assert.strictEqual(result.step, 8);
    assert.ok(result.crpt > 0);
  });

  test('Step 9: should detect waste', () => {
    const result = loop.detectWaste({
      totalTokens: 500,
      findings: [{ patternId: 'context-restatement', tokenCount: 80 }]
    });
    assert.strictEqual(result.step, 9);
    assert.strictEqual(result.wastedTokens, 80);
  });

  test('Step 10: should extract reuse', () => {
    const result = loop.extractReuse({
      content: 'Always verify payment before scheduling crew',
      type: 'rule',
      source: 'cashflow-decision',
      reuseScore: 4
    });
    assert.strictEqual(result.step, 10);
    assert.strictEqual(result.extracted, true);
  });

  test('Step 11: should update policy on high waste', () => {
    const result = loop.updatePolicy({
      taskType: 'invoice',
      crpt: 0.03,
      wasteRatio: 0.5,
      compressionPassed: true
    });
    assert.strictEqual(result.step, 11);
    assert.strictEqual(result.action, 'reduce');
    assert.ok(result.newBudget < result.previousBudget);
  });

  test('Step 11: should not change policy when metrics acceptable', () => {
    const result = loop.updatePolicy({
      taskType: 'research',
      crpt: 0.02,
      wasteRatio: 0.1,
      compressionPassed: true
    });
    assert.strictEqual(result.action, 'no-change');
  });

  test('should run full 11-step loop', () => {
    const result = loop.run({
      task: { description: 'Price a furniture install job', type: 'estimating' },
      riskFactors: { stakes: 3, ambiguity: 4, dependencies: 2, novelty: 3 },
      salienceItems: [
        { label: 'labor-cost', urgency: 4, risk: 3, mission: 5, novelty: 2, knownContext: 0 },
        { label: 'material-list', urgency: 2, risk: 1, mission: 3, novelty: 0, knownContext: 3 }
      ],
      output: {
        originalTokens: 800, compressedTokens: 350,
        informationRetained: 4, actionClarity: 4, riskPreserved: 3
      },
      scores: { decisionQuality: 4, actionability: 4, riskControl: 3, reuseValue: 2, learningGain: 2, waste: 1 },
      totalTokens: 350,
      wasteFindings: { findings: [{ patternId: 'context-restatement', tokenCount: 30 }] },
      reuseCandidate: { content: 'Standard furniture install = 2hr base + 30min per piece', type: 'rule', source: 'estimate-42', reuseScore: 4 }
    });

    assert.ok(result.classification);
    assert.ok(result.riskEstimate);
    assert.ok(result.salienceRanking);
    assert.ok(result.allocation);
    assert.ok(result.recruitment);
    assert.ok(result.cognitiveReturn);
    assert.ok(result.compressionAudit);
    assert.ok(result.wasteDetection);
    assert.ok(result.reuseExtraction);
    assert.ok(result.policyUpdate);
    assert.ok(result.summary);
    assert.ok(result.summary.crpt > 0);
  });

  test('should track history and stats', () => {
    loop.run({
      task: { description: 'Test task', type: 'memory' },
      riskFactors: { stakes: 1 },
      scores: { decisionQuality: 3 },
      totalTokens: 100
    });
    assert.strictEqual(loop.getHistory().length, 1);
    const stats = loop.getStats();
    assert.strictEqual(stats.runs, 1);
    assert.ok(stats.averageCRPT > 0);
  });

  test('should reset all state', () => {
    loop.run({
      task: { description: 'x', type: 'invoice' },
      riskFactors: {},
      scores: { decisionQuality: 2 },
      totalTokens: 200
    });
    loop.reset();
    assert.strictEqual(loop.getHistory().length, 0);
    assert.strictEqual(loop.getStats().runs, 0);
  });
});

// ─────────────────────────────────────────────
// Evaluation Criteria
// ─────────────────────────────────────────────
describe('EvaluationCriteria', () => {
  let criteria;
  beforeEach(() => { criteria = new EvaluationCriteria(); });

  test('should list all 8 criteria', () => {
    assert.strictEqual(criteria.getCriteria().length, 8);
  });

  test('should assess a system', () => {
    const result = criteria.assess({
      crpt: 4, compressionFidelity: 4, actionConversion: 5,
      riskPreservation: 3, reuseExtraction: 3, contextHygiene: 4,
      adaptiveDepth: 3, errorAvoidance: 4
    });
    assert.ok(result.normalizedScore > 0);
    assert.ok(result.maturityLevel);
    assert.ok(result.strengths.length > 0);
  });

  test('should determine maturity levels', () => {
    const sovereign = criteria.assess({
      crpt: 5, compressionFidelity: 5, actionConversion: 5,
      riskPreservation: 5, reuseExtraction: 5, contextHygiene: 5,
      adaptiveDepth: 5, errorAvoidance: 5
    });
    assert.strictEqual(sovereign.maturityLevel, 'sovereign');

    const nascent = criteria.assess({
      crpt: 1, compressionFidelity: 1, actionConversion: 1,
      riskPreservation: 1, reuseExtraction: 1, contextHygiene: 1,
      adaptiveDepth: 1, errorAvoidance: 1
    });
    assert.strictEqual(nascent.maturityLevel, 'nascent');
  });

  test('should identify strengths and weaknesses', () => {
    const result = criteria.assess({
      crpt: 5, compressionFidelity: 5, actionConversion: 1,
      riskPreservation: 1, reuseExtraction: 3, contextHygiene: 3,
      adaptiveDepth: 4, errorAvoidance: 4
    });
    assert.ok(result.strengths.includes('crpt'));
    assert.ok(result.weaknesses.includes('actionConversion'));
  });

  test('should clamp scores to 0–5', () => {
    const result = criteria.assess({ crpt: 10, errorAvoidance: -2 });
    assert.strictEqual(result.dimensions.crpt, 5);
    assert.strictEqual(result.dimensions.errorAvoidance, 0);
  });

  test('should throw on missing scores', () => {
    assert.throws(() => criteria.assess(null), /required/);
  });

  test('should compare two systems', () => {
    const comparison = criteria.compare(
      { crpt: 2, compressionFidelity: 2, actionConversion: 3, riskPreservation: 2, reuseExtraction: 1, contextHygiene: 2, adaptiveDepth: 2, errorAvoidance: 3 },
      { crpt: 4, compressionFidelity: 4, actionConversion: 4, riskPreservation: 4, reuseExtraction: 3, contextHygiene: 4, adaptiveDepth: 4, errorAvoidance: 4 }
    );
    assert.ok(comparison.isImprovement);
    assert.ok(comparison.overallGain > 0);
    assert.ok(comparison.biggestGain);
  });

  test('should support custom weights', () => {
    criteria.setWeights({ crpt: 3.0, errorAvoidance: 2.0 });
    const result = criteria.assess({ crpt: 5, errorAvoidance: 5 });
    // CRPT and errorAvoidance should be weighted higher
    assert.ok(result.weightedTotal > 0);
  });

  test('should track history and averages', () => {
    criteria.assess({ crpt: 3, errorAvoidance: 4 });
    criteria.assess({ crpt: 5, errorAvoidance: 2 });
    assert.strictEqual(criteria.getHistory().length, 2);
    const avgs = criteria.getAverages();
    assert.strictEqual(avgs.crpt, 4);
    assert.strictEqual(avgs.errorAvoidance, 3);
  });

  test('should reset', () => {
    criteria.assess({ crpt: 3 });
    criteria.reset();
    assert.strictEqual(criteria.getHistory().length, 0);
    assert.strictEqual(criteria.getAverages(), null);
  });
});
