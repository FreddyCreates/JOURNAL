import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { InferenceEngine } from '../src/inference-engine.js';
import { ProofChainBuilder } from '../src/proof-chain-builder.js';
import { LogicGateProcessor } from '../src/logic-gate-processor.js';
import { HypothesisValidator } from '../src/hypothesis-validator.js';
import { DeductionOracle } from '../src/deduction-oracle.js';

const PHI = 1.618033988749895;

describe('InferenceEngine', () => {
  let engine;
  beforeEach(() => { engine = new InferenceEngine(); });

  test('should create with defaults', () => {
    assert.strictEqual(engine.maxInferenceDepth, 12);
  });

  test('should add fact', () => {
    const r = engine.addFact('sky is blue');
    assert.ok(r.factId);
    assert.strictEqual(r.fact, 'sky is blue');
  });

  test('should add rule', () => {
    const r = engine.addRule('raining', 'wet ground', 0.9);
    assert.ok(r.ruleId);
    assert.strictEqual(r.confidence, 0.9);
  });

  test('should infer direct fact', () => {
    engine.addFact('sun exists');
    const r = engine.infer('sun exists');
    assert.strictEqual(r.answer, true);
    assert.strictEqual(r.confidence, 1.0);
  });

  test('should infer via rule', () => {
    engine.addFact('raining');
    engine.addRule('raining', 'wet', 0.8);
    const r = engine.infer('wet');
    assert.strictEqual(r.answer, true);
    assert.ok(r.rulesApplied > 0);
  });

  test('should return null for unknown query', () => {
    const r = engine.infer('unknown');
    assert.strictEqual(r.answer, null);
  });

  test('should get facts and rules', () => {
    engine.addFact('a');
    engine.addRule('a', 'b');
    assert.strictEqual(engine.getFacts().length, 1);
    assert.strictEqual(engine.getRules().length, 1);
  });

  test('should get stats', () => {
    engine.addFact('x');
    engine.infer('x');
    const s = engine.getStats();
    assert.strictEqual(s.inferencesRun, 1);
  });
});

describe('ProofChainBuilder', () => {
  let builder;
  beforeEach(() => { builder = new ProofChainBuilder(); });

  test('should start proof', () => {
    const r = builder.startProof('P implies Q');
    assert.ok(r.proofId);
    assert.strictEqual(r.status, 'building');
  });

  test('should add step', () => {
    const p = builder.startProof('theorem');
    const s = builder.addStep(p.proofId, 'assume P', 'given');
    assert.ok(s.stepId);
    assert.strictEqual(s.depth, 0);
  });

  test('should verify valid proof', () => {
    const p = builder.startProof('t');
    builder.addStep(p.proofId, 's1', 'axiom');
    builder.addStep(p.proofId, 's2', 'from s1');
    const r = builder.verify(p.proofId);
    assert.ok(r.isValid);
    assert.strictEqual(r.gaps.length, 0);
  });

  test('should throw for max chain length', () => {
    const b = new ProofChainBuilder({ maxChainLength: 2 });
    const p = b.startProof('t');
    b.addStep(p.proofId, 'a', 'x');
    b.addStep(p.proofId, 'b', 'y');
    assert.throws(() => b.addStep(p.proofId, 'c', 'z'), /Max chain/);
  });

  test('should abandon proof', () => {
    const p = builder.startProof('t');
    const r = builder.abandon(p.proofId);
    assert.strictEqual(r.status, 'abandoned');
  });

  test('should get all proofs', () => {
    builder.startProof('a');
    builder.startProof('b');
    assert.strictEqual(builder.getProofs().length, 2);
  });
});

describe('LogicGateProcessor', () => {
  let proc;
  beforeEach(() => { proc = new LogicGateProcessor(); });

  test('should evaluate AND gate', () => {
    const r = proc.evaluate({ type: 'AND', inputs: [1, 1] });
    assert.strictEqual(r.result, true);
    assert.strictEqual(r.truth, 1);
  });

  test('should evaluate OR gate', () => {
    const r = proc.evaluate({ type: 'OR', inputs: [0, 1] });
    assert.strictEqual(r.result, true);
  });

  test('should evaluate NOT gate', () => {
    const r = proc.evaluate({ type: 'NOT', inputs: [1] });
    assert.strictEqual(r.result, false);
  });

  test('should evaluate XOR gate', () => {
    const r = proc.evaluate({ type: 'XOR', inputs: [1, 1] });
    assert.strictEqual(r.result, false);
  });

  test('should evaluate PHI-GATE', () => {
    const r = proc.evaluate({ type: 'PHI-GATE', inputs: [1, 1] });
    assert.ok(r.truth >= 0 && r.truth <= 1);
  });

  test('should create gate', () => {
    const g = proc.createGate('AND', [1, 0]);
    assert.strictEqual(g.type, 'AND');
  });

  test('should generate truth table', () => {
    const table = proc.truthTable({ type: 'AND' }, ['A', 'B']);
    assert.strictEqual(table.length, 4);
  });

  test('should get gate stats', () => {
    proc.evaluate({ type: 'AND', inputs: [1, 1] });
    const s = proc.getGateStats();
    assert.strictEqual(s.AND, 1);
  });
});

describe('HypothesisValidator', () => {
  let validator;
  beforeEach(() => { validator = new HypothesisValidator(); });

  test('should propose hypothesis', () => {
    const r = validator.propose('water is wet', 0.6);
    assert.ok(r.hypothesisId);
    assert.strictEqual(r.confidence, 0.6);
  });

  test('should add supporting evidence', () => {
    const h = validator.propose('x', 0.5);
    const r = validator.addEvidence(h.hypothesisId, 'observed x', true);
    assert.ok(r.newConfidence > 0.5);
  });

  test('should add contradicting evidence', () => {
    const h = validator.propose('x', 0.5);
    const r = validator.addEvidence(h.hypothesisId, 'not x', false);
    assert.ok(r.newConfidence < 0.5);
  });

  test('should evaluate supported', () => {
    const h = validator.propose('x', 0.9);
    const r = validator.evaluate(h.hypothesisId);
    assert.strictEqual(r.verdict, 'supported');
  });

  test('should evaluate refuted', () => {
    const h = validator.propose('x', 0.05);
    const r = validator.evaluate(h.hypothesisId);
    assert.strictEqual(r.verdict, 'refuted');
  });

  test('should get all hypotheses', () => {
    validator.propose('a');
    validator.propose('b');
    assert.strictEqual(validator.getAll().length, 2);
  });
});

describe('DeductionOracle', () => {
  let oracle;
  beforeEach(() => { oracle = new DeductionOracle(); });

  test('should create with defaults', () => {
    assert.strictEqual(oracle.oracleDepth, 7);
    assert.strictEqual(oracle.certaintyThreshold, 0.9);
  });

  test('should query with premises', () => {
    const r = oracle.query(['all men are mortal', 'Socrates is a man'], 'Is Socrates mortal?');
    assert.ok(r.answer);
    assert.ok(r.certainty > 0);
    assert.ok(r.deductionPath.length > 0);
  });

  test('should add axiom', () => {
    const r = oracle.addAxiom('A = A');
    assert.ok(r.axiomId);
  });

  test('should get axioms', () => {
    oracle.addAxiom('x');
    oracle.addAxiom('y');
    assert.strictEqual(oracle.getAxioms().length, 2);
  });

  test('should assess consistency', () => {
    oracle.addAxiom('p');
    oracle.addAxiom('q');
    const r = oracle.assessConsistency();
    assert.ok(r.isConsistent);
  });

  test('should detect duplicates', () => {
    oracle.addAxiom('same');
    oracle.addAxiom('same');
    const r = oracle.assessConsistency();
    assert.strictEqual(r.isConsistent, false);
  });

  test('should get deduction history', () => {
    oracle.query(['p'], 'q');
    assert.strictEqual(oracle.getDeductionHistory().length, 1);
  });
});
