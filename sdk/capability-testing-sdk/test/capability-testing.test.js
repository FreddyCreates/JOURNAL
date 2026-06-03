/**
 * Capability Testing SDK Test Suite
 * 
 * Comprehensive tests for CapabilityRegistry, CapabilityTester, and CapabilityCertifier
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  PHI,
  PHI_INVERSE,
  PHI_SQUARED,
  CapabilityLevel,
  CapabilityRegistry,
  CapabilityTester,
  CapabilityCertifier
} from '../src/index.js';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

describe('PHI Constants', () => {
  test('PHI should equal golden ratio', () => {
    assert.strictEqual(PHI, 1.618033988749895);
  });

  test('PHI_INVERSE should equal 1/PHI', () => {
    assert.strictEqual(PHI_INVERSE, 0.618033988749895);
  });

  test('PHI_SQUARED should equal PHI * PHI', () => {
    assert.strictEqual(PHI_SQUARED, PHI * PHI);
  });

  test('PHI relationships hold', () => {
    assert.ok(Math.abs(PHI * PHI_INVERSE - 1) < 1e-10);
    assert.ok(Math.abs(PHI - 1 - PHI_INVERSE) < 1e-10);
  });
});

describe('CapabilityLevel', () => {
  test('should have all levels defined', () => {
    assert.ok(CapabilityLevel.BASIC);
    assert.ok(CapabilityLevel.INTERMEDIATE);
    assert.ok(CapabilityLevel.ADVANCED);
    assert.ok(CapabilityLevel.EXPERT);
    assert.ok(CapabilityLevel.SOVEREIGN);
  });

  test('levels should have correct weights', () => {
    assert.strictEqual(CapabilityLevel.BASIC.weight, 1);
    assert.strictEqual(CapabilityLevel.INTERMEDIATE.weight, PHI_INVERSE);
    assert.strictEqual(CapabilityLevel.ADVANCED.weight, PHI);
    assert.strictEqual(CapabilityLevel.EXPERT.weight, PHI_SQUARED);
  });

  test('levels should have increasing thresholds', () => {
    const thresholds = [
      CapabilityLevel.BASIC.threshold,
      CapabilityLevel.INTERMEDIATE.threshold,
      CapabilityLevel.ADVANCED.threshold,
      CapabilityLevel.EXPERT.threshold,
      CapabilityLevel.SOVEREIGN.threshold
    ];
    
    for (let i = 1; i < thresholds.length; i++) {
      assert.ok(thresholds[i] >= thresholds[i-1], 
        `Threshold ${i} (${thresholds[i]}) should be >= ${thresholds[i-1]}`);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CAPABILITY REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

describe('CapabilityRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new CapabilityRegistry();
  });

  describe('constructor', () => {
    test('should initialize empty maps', () => {
      assert.strictEqual(registry.capabilities.size, 0);
      assert.strictEqual(registry.dependencies.size, 0);
      assert.strictEqual(registry.certifications.size, 0);
    });
  });

  describe('register', () => {
    test('should register a basic capability', () => {
      registry.register({
        name: 'test-cap',
        level: 'BASIC'
      });

      assert.strictEqual(registry.capabilities.size, 1);
      const cap = registry.get('test-cap');
      assert.strictEqual(cap.name, 'test-cap');
      assert.strictEqual(cap.level.name, 'BASIC');
    });

    test('should register with all properties', () => {
      registry.register({
        name: 'full-cap',
        level: 'ADVANCED',
        requires: ['base-cap'],
        provides: ['feature-a', 'feature-b'],
        tests: [{ name: 'test1' }],
        benchmarks: [{ name: 'bench1' }]
      });

      const cap = registry.get('full-cap');
      assert.deepStrictEqual(cap.requires, ['base-cap']);
      assert.deepStrictEqual(cap.provides, ['feature-a', 'feature-b']);
      assert.strictEqual(cap.tests.length, 1);
      assert.strictEqual(cap.benchmarks.length, 1);
    });

    test('should chain registrations', () => {
      const result = registry
        .register({ name: 'cap1', level: 'BASIC' })
        .register({ name: 'cap2', level: 'BASIC' });

      assert.strictEqual(result, registry);
      assert.strictEqual(registry.capabilities.size, 2);
    });

    test('should track dependencies', () => {
      registry.register({ name: 'base', level: 'BASIC' });
      registry.register({ name: 'derived', level: 'INTERMEDIATE', requires: ['base'] });

      const dependents = registry.getDependents('base');
      assert.deepStrictEqual(dependents, ['derived']);
    });

    test('should default to BASIC level for unknown level', () => {
      registry.register({ name: 'unknown-level', level: 'NONEXISTENT' });
      const cap = registry.get('unknown-level');
      assert.strictEqual(cap.level.name, 'BASIC');
    });

    test('should initialize tracking fields', () => {
      registry.register({ name: 'tracked', level: 'BASIC' });
      const cap = registry.get('tracked');
      
      assert.strictEqual(cap.certified, false);
      assert.strictEqual(cap.score, 0);
      assert.strictEqual(cap.lastTested, null);
    });
  });

  describe('get', () => {
    test('should return capability by name', () => {
      registry.register({ name: 'my-cap', level: 'EXPERT' });
      const cap = registry.get('my-cap');
      assert.strictEqual(cap.name, 'my-cap');
    });

    test('should return undefined for unknown capability', () => {
      const cap = registry.get('nonexistent');
      assert.strictEqual(cap, undefined);
    });
  });

  describe('getAll', () => {
    test('should return empty array when no capabilities', () => {
      const all = registry.getAll();
      assert.deepStrictEqual(all, []);
    });

    test('should return all registered capabilities', () => {
      registry.register({ name: 'cap1', level: 'BASIC' });
      registry.register({ name: 'cap2', level: 'ADVANCED' });
      registry.register({ name: 'cap3', level: 'EXPERT' });

      const all = registry.getAll();
      assert.strictEqual(all.length, 3);
    });
  });

  describe('getByLevel', () => {
    test('should filter by level', () => {
      registry.register({ name: 'basic1', level: 'BASIC' });
      registry.register({ name: 'basic2', level: 'BASIC' });
      registry.register({ name: 'advanced1', level: 'ADVANCED' });

      const basics = registry.getByLevel('BASIC');
      assert.strictEqual(basics.length, 2);
      assert.ok(basics.every(c => c.level.name === 'BASIC'));
    });

    test('should return empty array for no matches', () => {
      registry.register({ name: 'basic', level: 'BASIC' });
      const experts = registry.getByLevel('EXPERT');
      assert.deepStrictEqual(experts, []);
    });
  });

  describe('getDependents', () => {
    test('should return empty array for no dependents', () => {
      registry.register({ name: 'standalone', level: 'BASIC' });
      const dependents = registry.getDependents('standalone');
      assert.deepStrictEqual(dependents, []);
    });

    test('should return all dependent capabilities', () => {
      registry.register({ name: 'base', level: 'BASIC' });
      registry.register({ name: 'child1', level: 'INTERMEDIATE', requires: ['base'] });
      registry.register({ name: 'child2', level: 'INTERMEDIATE', requires: ['base'] });

      const dependents = registry.getDependents('base');
      assert.strictEqual(dependents.length, 2);
      assert.ok(dependents.includes('child1'));
      assert.ok(dependents.includes('child2'));
    });
  });

  describe('areRequirementsMet', () => {
    test('should return true for no requirements', () => {
      registry.register({ name: 'no-reqs', level: 'BASIC' });
      assert.strictEqual(registry.areRequirementsMet('no-reqs'), true);
    });

    test('should return false for unknown capability', () => {
      assert.strictEqual(registry.areRequirementsMet('nonexistent'), false);
    });

    test('should return false when requirements not certified', () => {
      registry.register({ name: 'base', level: 'BASIC' });
      registry.register({ name: 'derived', level: 'INTERMEDIATE', requires: ['base'] });
      
      assert.strictEqual(registry.areRequirementsMet('derived'), false);
    });

    test('should return true when all requirements certified', () => {
      registry.register({ name: 'base', level: 'BASIC' });
      registry.get('base').certified = true;
      registry.register({ name: 'derived', level: 'INTERMEDIATE', requires: ['base'] });
      
      assert.strictEqual(registry.areRequirementsMet('derived'), true);
    });
  });

  describe('getCertificationSummary', () => {
    test('should return zeros for empty registry', () => {
      const summary = registry.getCertificationSummary();
      
      assert.strictEqual(summary.total, 0);
      assert.strictEqual(summary.certified, 0);
      assert.strictEqual(summary.certificationRate, 0);
    });

    test('should calculate certification rate', () => {
      registry.register({ name: 'cap1', level: 'BASIC' });
      registry.register({ name: 'cap2', level: 'BASIC' });
      registry.get('cap1').certified = true;

      const summary = registry.getCertificationSummary();
      
      assert.strictEqual(summary.total, 2);
      assert.strictEqual(summary.certified, 1);
      assert.strictEqual(summary.certificationRate, 0.5);
    });

    test('should break down by level', () => {
      registry.register({ name: 'basic', level: 'BASIC' });
      registry.register({ name: 'advanced', level: 'ADVANCED' });
      registry.get('basic').certified = true;

      const summary = registry.getCertificationSummary();
      
      assert.strictEqual(summary.byLevel.BASIC.total, 1);
      assert.strictEqual(summary.byLevel.BASIC.certified, 1);
      assert.strictEqual(summary.byLevel.ADVANCED.total, 1);
      assert.strictEqual(summary.byLevel.ADVANCED.certified, 0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CAPABILITY TESTER
// ═══════════════════════════════════════════════════════════════════════════

describe('CapabilityTester', () => {
  let registry;
  let tester;

  beforeEach(() => {
    registry = new CapabilityRegistry();
    tester = new CapabilityTester(registry);
  });

  describe('constructor', () => {
    test('should initialize with registry', () => {
      assert.strictEqual(tester.registry, registry);
      assert.deepStrictEqual(tester.results, []);
      assert.deepStrictEqual(tester.benchmarkResults, []);
    });
  });

  describe('testCapability', () => {
    test('should throw for unknown capability', async () => {
      await assert.rejects(
        async () => await tester.testCapability('nonexistent'),
        /Unknown capability/
      );
    });

    test('should fail when requirements not met', async () => {
      registry.register({ name: 'base', level: 'BASIC' });
      registry.register({ name: 'derived', level: 'INTERMEDIATE', requires: ['base'] });

      const result = await tester.testCapability('derived');
      
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.reason, 'REQUIREMENTS_NOT_MET');
      assert.deepStrictEqual(result.missingRequirements, ['base']);
    });

    test('should pass capability with passing tests', async () => {
      registry.register({
        name: 'testable',
        level: 'BASIC',
        tests: [
          { name: 'test1', fn: async () => ({ success: true }), expect: { success: true } },
          { name: 'test2', fn: async () => ({ value: 42 }), expect: { value: 42 } }
        ]
      });

      const result = await tester.testCapability('testable');
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.score, 1);
      assert.strictEqual(result.testResults.length, 2);
    });

    test('should fail capability with failing tests', async () => {
      registry.register({
        name: 'failing',
        level: 'ADVANCED', // threshold 0.8
        tests: [
          { name: 'pass', fn: async () => ({ ok: true }), expect: { ok: true } },
          { name: 'fail', fn: async () => ({ ok: false }), expect: { ok: true } }
        ]
      });

      const result = await tester.testCapability('failing');
      
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.score, 0.5);
    });

    test('should track test history', async () => {
      registry.register({ name: 'tracked', level: 'BASIC', tests: [] });
      
      await tester.testCapability('tracked');
      await tester.testCapability('tracked');

      assert.strictEqual(tester.results.length, 2);
    });

    test('should update capability certification status', async () => {
      registry.register({
        name: 'certifiable',
        level: 'BASIC',
        tests: [{ name: 't1', fn: async () => ({ pass: true }), expect: { pass: true } }]
      });

      await tester.testCapability('certifiable');
      
      const cap = registry.get('certifiable');
      assert.strictEqual(cap.certified, true);
      assert.ok(cap.lastTested);
    });
  });

  describe('runTest', () => {
    test('should run test function', async () => {
      const result = await tester.runTest({
        name: 'simple',
        fn: async () => ({ value: 100 }),
        expect: { value: 100 }
      });

      assert.strictEqual(result.passed, true);
      assert.ok(result.duration >= 0);
    });

    test('should handle test errors', async () => {
      const result = await tester.runTest({
        name: 'error-test',
        fn: async () => { throw new Error('Test error'); }
      });

      assert.strictEqual(result.passed, false);
      assert.strictEqual(result.reason, 'ERROR');
      assert.ok(result.error.includes('Test error'));
    });

    test('should detect timeout', async () => {
      const result = await tester.runTest({
        name: 'slow-test',
        fn: async () => {
          await new Promise(r => setTimeout(r, 50));
          return { done: true };
        },
        timeout: { value: 10 }
      });

      assert.strictEqual(result.passed, false);
      assert.strictEqual(result.reason, 'TIMEOUT');
    });

    test('should use default result when no fn provided', async () => {
      const result = await tester.runTest({ name: 'no-fn' });
      assert.strictEqual(result.passed, true);
    });
  });

  describe('validateExpectations', () => {
    test('should return true for no expectations', () => {
      assert.strictEqual(tester.validateExpectations({ any: 'value' }, undefined), true);
      assert.strictEqual(tester.validateExpectations({ any: 'value' }, null), true);
    });

    test('should validate exact matches', () => {
      assert.strictEqual(
        tester.validateExpectations({ a: 1, b: 2 }, { a: 1, b: 2 }),
        true
      );
      assert.strictEqual(
        tester.validateExpectations({ a: 1 }, { a: 2 }),
        false
      );
    });

    test('should validate operator comparisons', () => {
      assert.strictEqual(
        tester.validateExpectations({ value: 10 }, { value: { operator: 'GTE', value: 5 } }),
        true
      );
      assert.strictEqual(
        tester.validateExpectations({ value: 10 }, { value: { operator: 'LT', value: 5 } }),
        false
      );
    });
  });

  describe('compare', () => {
    test('should handle GTE', () => {
      assert.strictEqual(tester.compare(10, 'GTE', 10), true);
      assert.strictEqual(tester.compare(10, 'GTE', 5), true);
      assert.strictEqual(tester.compare(5, 'GTE', 10), false);
    });

    test('should handle LTE', () => {
      assert.strictEqual(tester.compare(10, 'LTE', 10), true);
      assert.strictEqual(tester.compare(5, 'LTE', 10), true);
      assert.strictEqual(tester.compare(10, 'LTE', 5), false);
    });

    test('should handle GT', () => {
      assert.strictEqual(tester.compare(10, 'GT', 5), true);
      assert.strictEqual(tester.compare(10, 'GT', 10), false);
    });

    test('should handle LT', () => {
      assert.strictEqual(tester.compare(5, 'LT', 10), true);
      assert.strictEqual(tester.compare(10, 'LT', 10), false);
    });

    test('should handle EQ', () => {
      assert.strictEqual(tester.compare(5, 'EQ', 5), true);
      assert.strictEqual(tester.compare(5, 'EQ', 6), false);
    });

    test('should default to equality for unknown operator', () => {
      assert.strictEqual(tester.compare(5, 'UNKNOWN', 5), true);
      assert.strictEqual(tester.compare(5, 'UNKNOWN', 6), false);
    });
  });

  describe('runBenchmark', () => {
    test('should return null for unknown capability', async () => {
      const result = await tester.runBenchmark('nonexistent');
      assert.strictEqual(result, null);
    });

    test('should return null for capability without benchmarks', async () => {
      registry.register({ name: 'no-bench', level: 'BASIC' });
      const result = await tester.runBenchmark('no-bench');
      assert.strictEqual(result, null);
    });

    test('should run benchmarks and collect statistics', async () => {
      registry.register({
        name: 'benchmarked',
        level: 'BASIC',
        benchmarks: [{
          name: 'fast-op',
          iterations: 100,
          fn: async () => { return 1 + 1; }
        }]
      });

      const result = await tester.runBenchmark('benchmarked');
      
      assert.strictEqual(result.capability, 'benchmarked');
      assert.strictEqual(result.benchmarks.length, 1);
      
      const bench = result.benchmarks[0];
      assert.ok(bench.min >= 0);
      assert.ok(bench.max >= bench.min);
      assert.ok(bench.avg >= 0);
      assert.ok(bench.median >= 0);
      assert.ok(bench.p95 >= 0);
      assert.ok(bench.p99 >= 0);
    });
  });

  describe('testAll', () => {
    test('should test all capabilities in order', async () => {
      registry.register({ name: 'base', level: 'BASIC', tests: [] });
      registry.register({ name: 'derived', level: 'INTERMEDIATE', requires: ['base'], tests: [] });

      const result = await tester.testAll();
      
      assert.strictEqual(result.results.length, 2);
      assert.strictEqual(result.results[0].name, 'base');
      assert.strictEqual(result.results[1].name, 'derived');
    });
  });

  describe('topologicalSort', () => {
    test('should sort by dependencies', () => {
      registry.register({ name: 'c', level: 'BASIC', requires: ['b'] });
      registry.register({ name: 'b', level: 'BASIC', requires: ['a'] });
      registry.register({ name: 'a', level: 'BASIC' });

      const sorted = tester.topologicalSort();
      
      assert.ok(sorted.indexOf('a') < sorted.indexOf('b'));
      assert.ok(sorted.indexOf('b') < sorted.indexOf('c'));
    });

    test('should detect circular dependencies', () => {
      registry.register({ name: 'a', level: 'BASIC', requires: ['b'] });
      registry.register({ name: 'b', level: 'BASIC', requires: ['a'] });

      assert.throws(() => tester.topologicalSort(), /Circular dependency/);
    });
  });

  describe('getHistory', () => {
    test('should return test history', async () => {
      registry.register({ name: 'cap', level: 'BASIC', tests: [] });
      await tester.testCapability('cap');

      const history = tester.getHistory();
      assert.strictEqual(history.length, 1);
    });
  });

  describe('getPhiWeightedScore', () => {
    test('should return 0 for empty registry', () => {
      assert.strictEqual(tester.getPhiWeightedScore(), 0);
    });

    test('should calculate weighted score', async () => {
      registry.register({
        name: 'basic',
        level: 'BASIC',
        tests: [{ name: 't1', fn: async () => ({ ok: true }), expect: { ok: true } }]
      });
      registry.register({
        name: 'advanced',
        level: 'ADVANCED',
        tests: [{ name: 't2', fn: async () => ({ ok: true }), expect: { ok: true } }]
      });

      await tester.testCapability('basic');
      await tester.testCapability('advanced');

      const score = tester.getPhiWeightedScore();
      assert.ok(score > 0);
      assert.ok(score <= 1);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CAPABILITY CERTIFIER
// ═══════════════════════════════════════════════════════════════════════════

describe('CapabilityCertifier', () => {
  let registry;
  let tester;
  let certifier;

  beforeEach(() => {
    registry = new CapabilityRegistry();
    tester = new CapabilityTester(registry);
    certifier = new CapabilityCertifier(registry, tester);
  });

  describe('constructor', () => {
    test('should initialize with registry and tester', () => {
      assert.strictEqual(certifier.registry, registry);
      assert.strictEqual(certifier.tester, tester);
      assert.deepStrictEqual(certifier.certificates, []);
    });
  });

  describe('certify', () => {
    test('should certify passing capability', async () => {
      registry.register({
        name: 'certifiable',
        level: 'BASIC',
        tests: [{ name: 't1', fn: async () => ({ ok: true }), expect: { ok: true } }]
      });

      const result = await certifier.certify('certifiable');
      
      assert.strictEqual(result.certified, true);
      assert.ok(result.certificate);
      assert.ok(result.certificate.id.startsWith('CERT-certifiable-'));
      assert.strictEqual(result.certificate.capability, 'certifiable');
    });

    test('should reject failing capability', async () => {
      registry.register({
        name: 'failing',
        level: 'ADVANCED',
        tests: [{ name: 't1', fn: async () => ({ ok: false }), expect: { ok: true } }]
      });

      const result = await certifier.certify('failing');
      
      assert.strictEqual(result.certified, false);
      assert.strictEqual(result.reason, 'TEST_FAILED');
    });

    test('should store certificate in registry', async () => {
      registry.register({
        name: 'stored',
        level: 'BASIC',
        tests: []
      });

      await certifier.certify('stored');
      
      assert.ok(registry.certifications.has('stored'));
    });
  });

  describe('certifyAll', () => {
    test('should certify all capabilities', async () => {
      registry.register({ name: 'cap1', level: 'BASIC', tests: [] });
      registry.register({ name: 'cap2', level: 'BASIC', tests: [] });

      const result = await certifier.certifyAll();
      
      assert.strictEqual(result.total, 2);
      assert.strictEqual(result.totalCertified, 2);
    });
  });

  describe('verify', () => {
    test('should verify valid certificate', async () => {
      registry.register({ name: 'verifiable', level: 'BASIC', tests: [] });
      const certResult = await certifier.certify('verifiable');
      
      const verification = certifier.verify(certResult.certificate.id);
      
      assert.strictEqual(verification.valid, true);
      assert.ok(verification.certificate);
    });

    test('should reject unknown certificate', () => {
      const verification = certifier.verify('nonexistent-id');
      
      assert.strictEqual(verification.valid, false);
      assert.strictEqual(verification.reason, 'NOT_FOUND');
    });
  });

  describe('getCertificates', () => {
    test('should return all certificates', async () => {
      registry.register({ name: 'c1', level: 'BASIC', tests: [] });
      registry.register({ name: 'c2', level: 'BASIC', tests: [] });
      
      await certifier.certify('c1');
      await certifier.certify('c2');

      const certs = certifier.getCertificates();
      assert.strictEqual(certs.length, 2);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Integration', () => {
  test('should support full certification workflow', async () => {
    const registry = new CapabilityRegistry();
    const tester = new CapabilityTester(registry);
    const certifier = new CapabilityCertifier(registry, tester);

    // Register capability hierarchy
    registry.register({
      name: 'foundation',
      level: 'BASIC',
      tests: [{ name: 'base-test', fn: async () => ({ ready: true }), expect: { ready: true } }]
    });

    registry.register({
      name: 'advanced-feature',
      level: 'INTERMEDIATE',
      requires: ['foundation'],
      tests: [{ name: 'adv-test', fn: async () => ({ level: 2 }), expect: { level: { operator: 'GTE', value: 1 } } }]
    });

    // Certify all
    const result = await certifier.certifyAll();
    
    assert.strictEqual(result.totalCertified, 2);
    
    // Verify summary
    const summary = registry.getCertificationSummary();
    assert.strictEqual(summary.certificationRate, 1);
  });
});
