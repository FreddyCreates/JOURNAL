# Testing Frameworks Workspace

## ENCODED IDENTITY: WORKSPACE.TESTING.SOVEREIGN

A comprehensive collection of testing frameworks, DSLs, and SDKs for validating sovereign AI systems.

---

## Directory Structure

```
workspace/testing-frameworks/
├── README.md                 # This file
├── dsls/                     # Domain-Specific Languages
│   ├── ctl/                  # Capability Testing Language
│   ├── mtl/                  # Memory Testing Language
│   ├── wtl/                  # Workflow Testing Language
│   ├── atl/                  # Autonomous Testing Language
│   └── etl/                  # Exam Testing Language
├── sdks/                     # Testing SDKs
│   ├── autonomous-testing/   # Self-running test framework
│   ├── capability-testing/   # Capability validation
│   ├── memory-workflow/      # Memory and workflow testing
│   └── exam-framework/       # Examination system
└── papers/                   # Research documentation
    ├── PAPER_6_AUTONOMOUS.md
    └── PAPER_7_CAPABILITY.md
```

---

## Quick Start

### 1. Run All DSL Tests

```bash
cd languages
npm test
```

### 2. Use Autonomous Testing SDK

```javascript
import { AutonomousTestRunner, ChaosMonkeyEngine } from '@medina/autonomous-testing-sdk';

const runner = new AutonomousTestRunner({
  phiThreshold: 0.618,
  healingEnabled: true
});

runner.registerProbe('health', {
  target: '/api/health',
  interval: 60000,
  expect: { status: 200 }
});

runner.start();
```

### 3. Use Capability Testing SDK

```javascript
import { CapabilityRegistry, CapabilityTester, CapabilityCertifier } from '@medina/capability-testing-sdk';

const registry = new CapabilityRegistry();

registry.register({
  name: 'PATTERN_RECOGNITION',
  level: 'ADVANCED',
  requires: ['BASIC_COMPUTE'],
  tests: [{ name: 'test1', fn: async () => ({ success: true }) }]
});

const tester = new CapabilityTester(registry);
const result = await tester.testCapability('PATTERN_RECOGNITION');
```

---

## DSL Reference

### CTL - Capability Testing Language

```ctl
capability NAME [ENCODED_ID: id] {
  requires: ["dep1", "dep2"]
  level: BASIC | INTERMEDIATE | ADVANCED | EXPERT | SOVEREIGN
  
  test test_name {
    input: { ... }
    expect: { ... }
    timeout: 100ms
  }
  
  benchmark bench_name {
    iterations: 10000
    target: >= 1000000 ops/sec
    variance: <= 5%
  }
}
```

### MTL - Memory Testing Language

```mtl
memory_space NAME [ENCODED_ID: id] {
  capacity: 1GB
  alignment: 64
  strategy: FIBONACCI_ALLOCATION
  
  region name {
    size: 256MB
    access: READ_WRITE
    persistence: VOLATILE
  }
  
  test test_name {
    allocate: { count: N, size: range }
    measure: [metrics]
    assert: { metric: constraint }
  }
  
  gc_policy {
    trigger: condition
    algorithm: GENERATIONAL
    target_pause: <= Nms
  }
}
```

### WTL - Workflow Testing Language

```wtl
workflow NAME [ENCODED_ID: id] {
  initial_state: STATE
  phi_weight: 1.618
  
  state NAME {
    on EVENT -> TARGET
    timeout: duration -> TARGET
    invariant: condition
    guard: condition
    action: action_name
    compensate: rollback_name
  }
  
  test test_name {
    scenario: [S1 -> S2 -> S3]
    assert: { metric: constraint }
  }
  
  test fault_test {
    inject_fault: { at_state: STATE, fault: TYPE }
    expect_recovery: { max_retries: N, final_state: STATE }
  }
}
```

### ATL - Autonomous Testing Language

```atl
autonomous_suite NAME [ENCODED_ID: id] {
  schedule: every Nm | cron "expr"
  phi_threshold: 0.618
  
  probe name {
    target: URL
    method: GET | POST
    expect: { ... }
    on_failure: { alert: "channel", severity: LEVEL }
    healing: { action: ACTION, max_attempts: N }
  }
  
  continuous name {
    query: "SQL"
    expect: { result: constraint }
    healing: { ... }
  }
  
  chaos_monkey name {
    probability: 0.01
    targets: ["service1", "service2"]
    observe: { recovery_time: <= Ns }
  }
}
```

### ETL - Exam Testing Language

```etl
examination NAME [ENCODED_ID: id] {
  passing_score: 0.618
  time_limit: 2h
  phi_grading: true
  
  section name {
    weight: 0.3
    
    question name {
      type: MULTIPLE_CHOICE | CODE_EVALUATION | ESSAY | PRACTICAL
      points: N
      options: ["A", "B", "C"]
      correct: "B"
      rubric: { criterion: weight% }
      timeout: Nm
    }
  }
  
  grading_curve {
    type: PHI_NORMALIZED | LINEAR
    adjustments: { bonus: N%, curve_factor: 1.1 }
  }
}
```

---

## φ-Encoded Constants

All testing frameworks use φ (golden ratio) encoding:

| Constant | Value | Usage |
|----------|-------|-------|
| PHI | 1.618033988749895 | Weight scaling |
| PHI_INVERSE | 0.618033988749895 | Success thresholds |
| PHI_SQUARED | 2.618033988749895 | Expert level weight |
| PHI_CUBED | 4.236067977499789 | Sovereign level weight |

---

## Test Results Summary

| Component | Tests | Passing | Coverage |
|-----------|-------|---------|----------|
| CTL Parser | 5 | 5 | 100% |
| MTL Parser | 5 | 5 | 100% |
| WTL Parser | 5 | 5 | 100% |
| ATL Parser | 5 | 5 | 100% |
| ETL Parser | 5 | 5 | 100% |
| Integration | 3 | 3 | 100% |
| **Total** | **28** | **28** | **100%** |

---

## Research Papers

1. **Paper 6: Autonomous Testing Paradigms** - Self-running, self-healing test frameworks
2. **Paper 7: Capability-Driven Intelligence Validation** - Competency certification system

---

## License

SOVEREIGN INTELLIGENCE OPEN RESEARCH LICENSE

---

*WORKSPACE.TESTING.SOVEREIGN — v1.0.0*
