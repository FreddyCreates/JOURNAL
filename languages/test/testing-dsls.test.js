/**
 * Test Suite for New Testing DSLs
 * CTL, MTL, WTL, ATL, ETL Parsers
 * 
 * ENCODED IDENTITY: TEST.DSL.TESTING
 */

import test from 'node:test';
import assert from 'node:assert';

import { parse as parseCTL } from '../ctl/parser.js';
import { parse as parseMTL } from '../mtl/parser.js';
import { parse as parseWTL } from '../wtl/parser.js';
import { parse as parseATL } from '../atl/parser.js';
import { parse as parseETL } from '../etl/parser.js';

// ═══════════════════════════════════════════════════════════════════════════
// CTL (Capability Testing Language) Tests
// ═══════════════════════════════════════════════════════════════════════════

test('CTL Parser - Basic Capability', () => {
  const source = `
    capability MEMORY_OPS [ENCODED_ID: CAP-001] {
      requires: ["heap", "gc"]
      level: ADVANCED
    }
  `;
  const ast = parseCTL(source);
  assert.strictEqual(ast.type, 'CTLProgram');
  assert.strictEqual(ast.capabilities.length, 1);
  assert.strictEqual(ast.capabilities[0].name, 'MEMORY_OPS');
  assert.strictEqual(ast.capabilities[0].encodedId, 'CAP-001');
  assert.strictEqual(ast.capabilities[0].level, 'ADVANCED');
  assert.deepStrictEqual(ast.capabilities[0].requires, ['heap', 'gc']);
});

test('CTL Parser - Capability with Test', () => {
  const source = `
    capability COMPUTE [ENCODED_ID: CAP-002] {
      level: INTERMEDIATE
      
      test basic_compute {
        input: { value: 42 }
        expect: { success: true }
        timeout: 100ms
      }
    }
  `;
  const ast = parseCTL(source);
  assert.strictEqual(ast.capabilities[0].tests.length, 1);
  assert.strictEqual(ast.capabilities[0].tests[0].name, 'basic_compute');
  assert.deepStrictEqual(ast.capabilities[0].tests[0].input, { value: 42 });
});

test('CTL Parser - Capability with Benchmark', () => {
  const source = `
    capability THROUGHPUT [ENCODED_ID: CAP-003] {
      level: EXPERT
      
      benchmark high_volume {
        iterations: 10000
        target: >= 1000000
        variance: <= 5%
      }
    }
  `;
  const ast = parseCTL(source);
  assert.strictEqual(ast.capabilities[0].benchmarks.length, 1);
  assert.strictEqual(ast.capabilities[0].benchmarks[0].name, 'high_volume');
  assert.strictEqual(ast.capabilities[0].benchmarks[0].iterations, 10000);
});

test('CTL Parser - Multiple Capabilities', () => {
  const source = `
    capability CAP_A { level: BASIC }
    capability CAP_B { level: SOVEREIGN }
  `;
  const ast = parseCTL(source);
  assert.strictEqual(ast.capabilities.length, 2);
  assert.strictEqual(ast.capabilities[0].name, 'CAP_A');
  assert.strictEqual(ast.capabilities[1].name, 'CAP_B');
});

test('CTL Parser - PHI Constants', () => {
  const ast = parseCTL('capability TEST { level: BASIC }');
  assert.ok(Math.abs(ast.metadata.phi - 1.618033988749895) < 0.0001);
  assert.ok(Math.abs(ast.metadata.phiInverse - 0.618033988749895) < 0.0001);
});

// ═══════════════════════════════════════════════════════════════════════════
// MTL (Memory Testing Language) Tests
// ═══════════════════════════════════════════════════════════════════════════

test('MTL Parser - Basic Memory Space', () => {
  const source = `
    memory_space HEAP [ENCODED_ID: MEM001] {
      capacity: 1GB
      alignment: 64
      strategy: FIBONACCI_ALLOCATION
    }
  `;
  const ast = parseMTL(source);
  assert.strictEqual(ast.type, 'MTLProgram');
  assert.strictEqual(ast.memorySpaces.length, 1);
  assert.strictEqual(ast.memorySpaces[0].name, 'HEAP');
  assert.strictEqual(ast.memorySpaces[0].encodedId, 'MEM001');
  assert.deepStrictEqual(ast.memorySpaces[0].capacity, { value: 1, unit: 'GB' });
  assert.strictEqual(ast.memorySpaces[0].alignment, 64);
  assert.strictEqual(ast.memorySpaces[0].strategy, 'FIBONACCI_ALLOCATION');
});

test('MTL Parser - Memory Space with Region', () => {
  const source = `
    memory_space ARENA [ENCODED_ID: MEM002] {
      capacity: 512MB
      
      region working_set {
        size: 256MB
        access: READ_WRITE
        persistence: VOLATILE
      }
    }
  `;
  const ast = parseMTL(source);
  assert.strictEqual(ast.memorySpaces[0].regions.length, 1);
  assert.strictEqual(ast.memorySpaces[0].regions[0].name, 'working_set');
  assert.deepStrictEqual(ast.memorySpaces[0].regions[0].size, { value: 256, unit: 'MB' });
  assert.strictEqual(ast.memorySpaces[0].regions[0].access, 'READ_WRITE');
});

test('MTL Parser - Memory Test', () => {
  const source = `
    memory_space TEST_HEAP {
      capacity: 100MB
      
      test allocation_test {
        allocate: { count: 1000, size: 1KB }
        measure: [latency, fragmentation]
        assert: { fragmentation: <= 15% }
      }
    }
  `;
  const ast = parseMTL(source);
  assert.strictEqual(ast.memorySpaces[0].tests.length, 1);
  assert.strictEqual(ast.memorySpaces[0].tests[0].name, 'allocation_test');
  assert.strictEqual(ast.memorySpaces[0].tests[0].allocate.count, 1000);
});

test('MTL Parser - GC Policy', () => {
  const source = `
    memory_space GC_TEST {
      capacity: 1GB
      
      gc_policy {
        trigger: utilization >= 80%
        algorithm: GENERATIONAL
        target_pause: <= 5ms
      }
    }
  `;
  const ast = parseMTL(source);
  assert.ok(ast.memorySpaces[0].gcPolicy);
  assert.strictEqual(ast.memorySpaces[0].gcPolicy.algorithm, 'GENERATIONAL');
});

test('MTL Parser - Multiple Memory Spaces', () => {
  const source = `
    memory_space HEAP_A { capacity: 1GB }
    memory_space HEAP_B { capacity: 2GB }
  `;
  const ast = parseMTL(source);
  assert.strictEqual(ast.memorySpaces.length, 2);
});

// ═══════════════════════════════════════════════════════════════════════════
// WTL (Workflow Testing Language) Tests
// ═══════════════════════════════════════════════════════════════════════════

test('WTL Parser - Basic Workflow', () => {
  const source = `
    workflow ORDER_FLOW [ENCODED_ID: WFL001] {
      initial_state: PENDING
      phi_weight: 1.618
      
      state PENDING {
        on PAYMENT -> PROCESSING
      }
    }
  `;
  const ast = parseWTL(source);
  assert.strictEqual(ast.type, 'WTLProgram');
  assert.strictEqual(ast.workflows.length, 1);
  assert.strictEqual(ast.workflows[0].name, 'ORDER_FLOW');
  assert.strictEqual(ast.workflows[0].encodedId, 'WFL001');
  assert.strictEqual(ast.workflows[0].initialState, 'PENDING');
});

test('WTL Parser - State with Transitions', () => {
  const source = `
    workflow PROCESS [ENCODED_ID: WFL002] {
      initial_state: START
      
      state START {
        on EVENT_A -> MIDDLE
        on EVENT_B -> END
        timeout: 24h -> EXPIRED
      }
      
      state MIDDLE {
        on COMPLETE -> END
        invariant: valid == true
      }
      
      state END {}
    }
  `;
  const ast = parseWTL(source);
  assert.strictEqual(ast.workflows[0].states.length, 3);
  assert.strictEqual(ast.workflows[0].states[0].transitions.length, 2);
  assert.ok(ast.workflows[0].states[0].timeout);
  assert.strictEqual(ast.workflows[0].states[1].invariants.length, 1);
});

test('WTL Parser - Workflow Test', () => {
  const source = `
    workflow TEST_FLOW {
      initial_state: A
      
      state A { on GO -> B }
      state B {}
      
      test happy_path {
        scenario: [A -> B]
        assert: { state_count: == 2 }
      }
    }
  `;
  const ast = parseWTL(source);
  assert.strictEqual(ast.workflows[0].tests.length, 1);
  assert.strictEqual(ast.workflows[0].tests[0].name, 'happy_path');
  assert.deepStrictEqual(ast.workflows[0].tests[0].scenario, ['A', 'B']);
});

test('WTL Parser - Fault Injection Test', () => {
  const source = `
    workflow FAULT_TEST {
      initial_state: READY
      
      state READY { on START -> RUNNING }
      state RUNNING {}
      
      test fault_recovery {
        inject_fault: { at_state: RUNNING, fault: NETWORK_ERROR }
        expect_recovery: { max_retries: 3, final_state: RUNNING }
      }
    }
  `;
  const ast = parseWTL(source);
  assert.ok(ast.workflows[0].tests[0].faultInjection);
  assert.strictEqual(ast.workflows[0].tests[0].faultInjection.atState, 'RUNNING');
  assert.strictEqual(ast.workflows[0].tests[0].expectedRecovery.maxRetries, 3);
});

test('WTL Parser - Multiple Workflows', () => {
  const source = `
    workflow FLOW_A { initial_state: START }
    workflow FLOW_B { initial_state: BEGIN }
  `;
  const ast = parseWTL(source);
  assert.strictEqual(ast.workflows.length, 2);
});

// ═══════════════════════════════════════════════════════════════════════════
// ATL (Autonomous Testing Language) Tests
// ═══════════════════════════════════════════════════════════════════════════

test('ATL Parser - Basic Autonomous Suite', () => {
  const source = `
    autonomous_suite HEALTH_CHECK [ENCODED_ID: ATL-001] {
      schedule: every 5m
      phi_threshold: 0.618
    }
  `;
  const ast = parseATL(source);
  assert.strictEqual(ast.type, 'ATLProgram');
  assert.strictEqual(ast.suites.length, 1);
  assert.strictEqual(ast.suites[0].name, 'HEALTH_CHECK');
  assert.strictEqual(ast.suites[0].encodedId, 'ATL-001');
  assert.ok(ast.suites[0].schedule);
  assert.strictEqual(ast.suites[0].phiThreshold, 0.618);
});

test('ATL Parser - Probe Definition', () => {
  const source = `
    autonomous_suite API_MONITOR {
      schedule: every 1m
      
      probe health {
        target: /api/health
        method: GET
        expect: { status: 200, latency: <= 100ms }
        on_failure: { alert: "ops", severity: HIGH }
      }
    }
  `;
  const ast = parseATL(source);
  assert.strictEqual(ast.suites[0].probes.length, 1);
  assert.strictEqual(ast.suites[0].probes[0].name, 'health');
  assert.strictEqual(ast.suites[0].probes[0].target, '/api/health');
  assert.strictEqual(ast.suites[0].probes[0].method, 'GET');
  assert.ok(ast.suites[0].probes[0].onFailure);
});

test('ATL Parser - Continuous Monitoring', () => {
  const source = `
    autonomous_suite DB_MONITOR {
      schedule: every 30s
      
      continuous data_check {
        query: "SELECT count(*) FROM data"
        expect: { result: > 0 }
        healing: { action: RESTART_SERVICE, max_attempts: 3 }
      }
    }
  `;
  const ast = parseATL(source);
  assert.strictEqual(ast.suites[0].continuous.length, 1);
  assert.strictEqual(ast.suites[0].continuous[0].name, 'data_check');
  assert.ok(ast.suites[0].continuous[0].healing);
});

test('ATL Parser - Chaos Monkey', () => {
  const source = `
    autonomous_suite CHAOS {
      schedule: every 1h
      
      chaos_monkey random_failures {
        probability: 0.01
        targets: ["service-a", "service-b"]
        observe: { recovery_time: <= 30s }
      }
    }
  `;
  const ast = parseATL(source);
  assert.strictEqual(ast.suites[0].chaosMonkeys.length, 1);
  assert.strictEqual(ast.suites[0].chaosMonkeys[0].probability, 0.01);
  assert.deepStrictEqual(ast.suites[0].chaosMonkeys[0].targets, ['service-a', 'service-b']);
});

test('ATL Parser - Multiple Components', () => {
  const source = `
    autonomous_suite FULL_SUITE {
      schedule: every 5m
      
      probe p1 { target: /health, method: GET }
      probe p2 { target: /status, method: GET }
      continuous c1 { query: "SELECT 1" }
      chaos_monkey chaos1 { probability: 0.001 }
    }
  `;
  const ast = parseATL(source);
  assert.strictEqual(ast.suites[0].probes.length, 2);
  assert.strictEqual(ast.suites[0].continuous.length, 1);
  assert.strictEqual(ast.suites[0].chaosMonkeys.length, 1);
});

// ═══════════════════════════════════════════════════════════════════════════
// ETL (Exam Testing Language) Tests
// ═══════════════════════════════════════════════════════════════════════════

test('ETL Parser - Basic Examination', () => {
  const source = `
    examination CERTIFICATION [ENCODED_ID: ETL001] {
      passing_score: 0.618
      time_limit: 2h
      phi_grading: true
    }
  `;
  const ast = parseETL(source);
  assert.strictEqual(ast.type, 'ETLProgram');
  assert.strictEqual(ast.examinations.length, 1);
  assert.strictEqual(ast.examinations[0].name, 'CERTIFICATION');
  assert.strictEqual(ast.examinations[0].encodedId, 'ETL001');
  assert.strictEqual(ast.examinations[0].passingScore, 0.618);
  assert.strictEqual(ast.examinations[0].phiGrading, true);
});

test('ETL Parser - Section with Questions', () => {
  const source = `
    examination TEST_EXAM {
      passing_score: 0.7
      
      section fundamentals {
        weight: 0.3
        
        question q1 {
          type: MULTIPLE_CHOICE
          points: 10
          options: ["A", "B", "C", "D"]
          correct: "B"
          explanation: "Because B is correct"
        }
      }
    }
  `;
  const ast = parseETL(source);
  assert.strictEqual(ast.examinations[0].sections.length, 1);
  assert.strictEqual(ast.examinations[0].sections[0].weight, 0.3);
  assert.strictEqual(ast.examinations[0].sections[0].questions.length, 1);
  assert.strictEqual(ast.examinations[0].sections[0].questions[0].questionType, 'MULTIPLE_CHOICE');
  assert.strictEqual(ast.examinations[0].sections[0].questions[0].points, 10);
});

test('ETL Parser - Code Evaluation Question', () => {
  const source = `
    examination CODE_EXAM {
      passing_score: 0.6
      
      section coding {
        weight: 0.5
        
        question impl_test {
          type: CODE_EVALUATION
          points: 25
          rubric: {
            correctness: 50%,
            efficiency: 30%,
            style: 20%
          }
          timeout: 10m
        }
      }
    }
  `;
  const ast = parseETL(source);
  const question = ast.examinations[0].sections[0].questions[0];
  assert.strictEqual(question.questionType, 'CODE_EVALUATION');
  assert.ok(question.rubric);
  assert.ok(question.timeout);
});

test('ETL Parser - Grading Curve', () => {
  const source = `
    examination CURVED_EXAM {
      passing_score: 0.65
      
      grading_curve {
        type: PHI_NORMALIZED
        adjustments: { bonus: 5%, curve_factor: 1.1 }
      }
    }
  `;
  const ast = parseETL(source);
  assert.ok(ast.examinations[0].gradingCurve);
  assert.strictEqual(ast.examinations[0].gradingCurve.curveType, 'PHI_NORMALIZED');
  assert.ok(ast.examinations[0].gradingCurve.adjustments.bonus);
});

test('ETL Parser - Multiple Sections', () => {
  const source = `
    examination FULL_EXAM {
      passing_score: 0.7
      
      section basics {
        weight: 0.3
        question q1 { type: TRUE_FALSE, points: 5 }
      }
      
      section advanced {
        weight: 0.7
        question q2 { type: ESSAY, points: 20 }
      }
    }
  `;
  const ast = parseETL(source);
  assert.strictEqual(ast.examinations[0].sections.length, 2);
  assert.strictEqual(ast.examinations[0].sections[0].weight, 0.3);
  assert.strictEqual(ast.examinations[0].sections[1].weight, 0.7);
});

// ═══════════════════════════════════════════════════════════════════════════
// Integration Tests
// ═══════════════════════════════════════════════════════════════════════════

test('All Parsers - Empty Programs', () => {
  assert.strictEqual(parseCTL('').capabilities.length, 0);
  assert.strictEqual(parseMTL('').memorySpaces.length, 0);
  assert.strictEqual(parseWTL('').workflows.length, 0);
  assert.strictEqual(parseATL('').suites.length, 0);
  assert.strictEqual(parseETL('').examinations.length, 0);
});

test('All Parsers - Have PHI Metadata', () => {
  const parsers = [parseCTL, parseMTL, parseWTL, parseATL, parseETL];
  for (const parser of parsers) {
    const ast = parser('');
    assert.ok(ast.metadata);
    assert.ok(ast.metadata.phi);
    assert.ok(ast.metadata.phiInverse);
    assert.ok(ast.metadata.encodedIdentity);
  }
});

test('All Parsers - Handle Comments', () => {
  const sources = [
    'capability TEST { level: BASIC } // comment',
    'memory_space HEAP { capacity: 1GB } // comment',
    'workflow FLOW { initial_state: START } // comment',
    'autonomous_suite SUITE { schedule: every 1m } // comment',
    'examination EXAM { passing_score: 0.7 } // comment'
  ];
  
  const parsers = [parseCTL, parseMTL, parseWTL, parseATL, parseETL];
  
  for (let i = 0; i < parsers.length; i++) {
    const ast = parsers[i](sources[i]);
    assert.ok(ast, `Parser ${i} should handle comments`);
  }
});

console.log('✓ All Testing DSL Parser tests completed');
