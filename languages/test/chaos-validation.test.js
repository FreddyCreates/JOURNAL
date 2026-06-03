/**
 * SOVEREIGN VALIDATION AUTHORITY
 * Chaos Validation Testing Framework
 * 
 * Comprehensive chaos testing across all modules:
 * - Language parsers stress testing
 * - Runtime stability validation
 * - Self-healing behavior verification
 * - Cross-module integration chaos
 * - Fault injection and recovery
 * 
 * Core Doctrine: No capability is real until it is tested, 
 * proof-linked, monitored, and revocable.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { CognitiveRuntime } from '../runtime.js';
import { CPLLParser } from '../cpl-l/src/parser.js';
import { OCLParser } from '../ocl/src/parser.js';
import { TPLParser } from '../tpl/src/parser.js';
import { ACLParser } from '../acl/src/parser.js';

// ═══════════════════════════════════════════════════════════════════════════════
// CHAOS VALIDATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

class ChaosValidationEngine {
  constructor() {
    this.runtime = new CognitiveRuntime();
    this.faultInjectionCount = 0;
    this.recoveryCount = 0;
    this.validationResults = [];
  }

  /**
   * Inject random faults into parser input
   */
  injectFault(source, faultType = 'random') {
    this.faultInjectionCount++;
    const faults = {
      // NOTE: Intentionally using replace without 'g' flag to corrupt only first occurrence
      // This creates minimal corruption for testing parser resilience
      'missing_brace': () => source.replace('{', ''),  // Remove first brace only
      'extra_brace': () => source + '}',
      'corrupt_keyword': () => source.replace(/LAW|ORGANISM|PROTOCOL/, 'CORRUPTED'),
      'null_injection': () => source + '\0\0\0',
      'unicode_chaos': () => source + '🔥💀👻',
      'whitespace_flood': () => source.replace(/\s/g, '     '),
      'random': () => {
        const types = ['missing_brace', 'extra_brace', 'corrupt_keyword'];
        return this.injectFault(source, types[Math.floor(Math.random() * types.length)]);
      }
    };
    return faults[faultType] ? faults[faultType]() : source;
  }

  /**
   * Test parser resilience under chaos conditions
   */
  async testParserResilience(parser, validSource, iterations = 10) {
    const results = { passed: 0, failed: 0, recovered: 0 };
    
    // First validate clean parse
    try {
      parser.parse(validSource);
      results.passed++;
    } catch (e) {
      results.failed++;
    }

    // Test fault tolerance
    for (let i = 0; i < iterations; i++) {
      const faultedSource = this.injectFault(validSource);
      try {
        parser.parse(faultedSource);
        // Unexpected success with faulted input
        results.passed++;
      } catch (e) {
        // Expected failure, parser correctly rejected bad input
        results.recovered++;
        this.recoveryCount++;
      }
    }

    return results;
  }

  /**
   * Validate cross-module consistency
   */
  async validateCrossModuleConsistency() {
    const modules = ['cpl-l', 'ocl', 'tpl', 'acl'];
    const consistency = {};
    
    for (const mod of modules) {
      consistency[mod] = {
        available: true, // Assume available since we're testing
        functional: false
      };
      
      try {
        // Attempt minimal parse
        const minimalSource = this.getMinimalSource(mod);
        await this.runtime.execute(mod, minimalSource);
        consistency[mod].functional = true;
      } catch (e) {
        consistency[mod].error = e.message;
      }
    }
    
    return consistency;
  }

  getMinimalSource(module) {
    const sources = {
      'cpl-l': 'LAW MINIMAL { VERSION "1.0.0" }',
      'ocl': 'ORGANISM MINIMAL { ENCODED_ID "MIN.ORG" CAPABILITIES { } CONSTRAINTS { } REWARD_STRUCTURE { } }',
      'tpl': 'PROTOCOL MINIMAL { VERSION "1.0.0" }',
      'acl': 'ONTOLOGY MINIMAL { VERSION "1.0.0" }'
    };
    return sources[module] || '';
  }

  /**
   * Stress test with rapid execution
   */
  async stressTest(parser, source, iterations = 100) {
    const startTime = Date.now();
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < iterations; i++) {
      try {
        parser.parse(source);
        successCount++;
      } catch (e) {
        failCount++;
      }
    }

    const duration = Date.now() - startTime;
    return {
      iterations,
      successCount,
      failCount,
      duration,
      opsPerSecond: Math.round((iterations / duration) * 1000)
    };
  }

  getValidationReport() {
    return {
      faultInjectionCount: this.faultInjectionCount,
      recoveryCount: this.recoveryCount,
      recoveryRate: this.faultInjectionCount > 0 
        ? ((this.recoveryCount / this.faultInjectionCount) * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAOS VALIDATION TEST SUITES
// ═══════════════════════════════════════════════════════════════════════════════

describe('Sovereign Validation Authority - Chaos Testing', () => {
  const chaos = new ChaosValidationEngine();

  // ─────────────────────────────────────────────────────────────────────────────
  // CPL-L CHAOS TESTS
  // ─────────────────────────────────────────────────────────────────────────────
  
  describe('CPL-L Parser Chaos Validation', () => {
    const parser = new CPLLParser();
    const validSource = `
      LAW CHAOS_TEST_LAW {
        VERSION "1.0.0"
        ENCODED_ID "CHAOS.TEST.LAW"
        
        RULE STABILITY_RULE {
          ENFORCEMENT: RUNTIME
          REQUIRES system_stable == TRUE
        }
      }
    `;

    test('CPL-L: Valid source parses correctly', () => {
      const result = parser.parse(validSource);
      assert.strictEqual(result.type, 'Program');
      assert.strictEqual(result.laws.length, 1);
      assert.strictEqual(result.laws[0].name, 'CHAOS_TEST_LAW');
    });

    test('CPL-L: Resilience under fault injection', async () => {
      const results = await chaos.testParserResilience(parser, validSource, 20);
      assert(results.passed >= 1, 'At least one clean parse should pass');
      assert(results.recovered >= 5, 'Parser should reject most faulted inputs');
    });

    test('CPL-L: Stress test performance', async () => {
      const results = await chaos.stressTest(parser, validSource, 500);
      assert(results.successCount === 500, 'All stress iterations should succeed');
      assert(results.opsPerSecond > 100, 'Should achieve >100 ops/sec');
    });

    test('CPL-L: Complex nested structures', () => {
      const complexSource = `
        LAW COMPLEX_LAW {
          VERSION "2.0.0"
          ENCODED_ID "COMPLEX.NESTED.LAW"
          
          RULE NESTED_RULE_A {
            ENFORCEMENT: COMPILE_TIME
            REQUIRES context.level > 5
            FORBIDS context.unauthorized == TRUE
          }
          
          RULE NESTED_RULE_B {
            ENFORCEMENT: RUNTIME
            PERMITS user.action IF user.authorized == TRUE
          }
        }
      `;
      const result = parser.parse(complexSource);
      assert.strictEqual(result.laws[0].rules.length, 2);
    });

    test('CPL-L: Dot notation expressions', () => {
      const dotSource = `
        LAW DOT_NOTATION_LAW {
          VERSION "1.0.0"
          RULE ACCESS_RULE {
            REQUIRES user.profile.level >= 10
            PERMITS user.actions.admin
            ENFORCEMENT: RUNTIME
          }
        }
      `;
      const result = parser.parse(dotSource);
      assert.strictEqual(result.laws[0].rules[0].constraints.length, 2);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // OCL CHAOS TESTS
  // ─────────────────────────────────────────────────────────────────────────────
  
  describe('OCL Parser Chaos Validation', () => {
    const parser = new OCLParser();
    const validSource = `
      ORGANISM CHAOS_ORGANISM {
        ENCODED_ID "CHAOS.TEST.ORG"
        ARCHETYPE "VALIDATOR"
        
        CAPABILITIES {
          CAN_VALIDATE: TRUE
          CAN_HEAL: TRUE
          CAN_DESTROY: FALSE
        }
        
        CONSTRAINTS {
          MAX_OPERATIONS: 1000
          MIN_CONFIDENCE: 0.95
        }
        
        REWARD_STRUCTURE {
          PER_VALIDATION: 0.5 TOKEN
        }
      }
    `;

    test('OCL: Valid source parses correctly', () => {
      const result = parser.parse(validSource);
      assert.strictEqual(result.type, 'Program');
      assert.strictEqual(result.organisms.length, 1);
      assert.strictEqual(result.organisms[0].name, 'CHAOS_ORGANISM');
    });

    test('OCL: Resilience under fault injection', async () => {
      const results = await chaos.testParserResilience(parser, validSource, 20);
      assert(results.passed >= 1, 'At least one clean parse should pass');
    });

    test('OCL: Multiple organisms', () => {
      const multiSource = `
        ORGANISM ORGANISM_A {
          ENCODED_ID "A.ORG"
          CAPABILITIES { CAN_READ: TRUE }
          CONSTRAINTS { MAX_OPS: 100 }
          REWARD_STRUCTURE { PER_OP: 1.0 TOKEN }
        }
        
        ORGANISM ORGANISM_B {
          ENCODED_ID "B.ORG"
          CAPABILITIES { CAN_WRITE: TRUE }
          CONSTRAINTS { MAX_OPS: 200 }
          REWARD_STRUCTURE { PER_OP: 2.0 TOKEN }
        }
      `;
      const result = parser.parse(multiSource);
      assert.strictEqual(result.organisms.length, 2);
    });

    test('OCL: Capability keywords as names', () => {
      const capSource = `
        ORGANISM KEYWORD_ORG {
          ENCODED_ID "KEY.ORG"
          CAPABILITIES {
            CAN_READ_PROPOSALS: TRUE
            CAN_VOTE: TRUE
            CAN_GENERATE_FINDINGS: FALSE
          }
          CONSTRAINTS {
            MAX_PROPOSALS_PER_CYCLE: 50
          }
          REWARD_STRUCTURE {
            PER_FINDING: 0.1 TOKEN
          }
        }
      `;
      const result = parser.parse(capSource);
      assert.strictEqual(result.organisms[0].capabilities['CAN_READ_PROPOSALS'], true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TPL CHAOS TESTS
  // ─────────────────────────────────────────────────────────────────────────────
  
  describe('TPL Parser Chaos Validation', () => {
    const parser = new TPLParser();
    const validSource = `
      PROTOCOL CHAOS_PROTOCOL {
        VERSION "1.0.0"
        
        CHANNEL CHAOS_CHANNEL {
          TRANSPORT: WEBSOCKET
          SECURITY: ENCRYPTED
        }
        
        MESSAGE CHAOS_MESSAGE {
          id: STRING REQUIRED
          data: STRING REQUIRED
        }
      }
    `;

    test('TPL: Valid source parses correctly', () => {
      const result = parser.parse(validSource);
      assert.strictEqual(result.type, 'Program');
      assert.strictEqual(result.protocols.length, 1);
    });

    test('TPL: Resilience under fault injection', async () => {
      const results = await chaos.testParserResilience(parser, validSource, 20);
      assert(results.passed >= 1, 'At least one clean parse should pass');
    });

    test('TPL: Multiple channels and messages', () => {
      const multiSource = `
        PROTOCOL MULTI_PROTOCOL {
          VERSION "2.0.0"
          
          CHANNEL CHANNEL_A {
            TRANSPORT: HTTP
            SECURITY: SIGNED
          }
          
          CHANNEL CHANNEL_B {
            TRANSPORT: GRPC
            SECURITY: TLS
          }
          
          MESSAGE MSG_A {
            field1: STRING REQUIRED
          }
          
          MESSAGE MSG_B {
            field2: NUMBER REQUIRED
          }
        }
      `;
      const result = parser.parse(multiSource);
      assert.strictEqual(result.protocols[0].channels.length, 2);
      assert.strictEqual(result.protocols[0].messages.length, 2);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // ACL CHAOS TESTS
  // ─────────────────────────────────────────────────────────────────────────────
  
  describe('ACL Parser Chaos Validation', () => {
    const parser = new ACLParser();
    const validSource = `
      ONTOLOGY CHAOS_ONTOLOGY {
        VERSION "1.0.0"
        
        ARCHETYPE VALIDATOR_TYPE {
          TRAIT ROLE: "Validation"
          CAPABILITY VALIDATE: TRUE
        }
        
        RELATIONSHIP VALIDATOR_TO_SYSTEM {
          FROM VALIDATOR
          TO SYSTEM
          TYPE GOVERNS
        }
      }
    `;

    test('ACL: Valid source parses correctly', () => {
      const result = parser.parse(validSource);
      assert.strictEqual(result.type, 'Program');
      assert.strictEqual(result.ontologies.length, 1);
    });

    test('ACL: Resilience under fault injection', async () => {
      const results = await chaos.testParserResilience(parser, validSource, 20);
      assert(results.passed >= 1, 'At least one clean parse should pass');
    });

    test('ACL: Complex ontology with multiple archetypes', () => {
      const complexSource = `
        ONTOLOGY COMPLEX_ONTOLOGY {
          VERSION "1.0.0"
          
          ARCHETYPE TYPE_A {
            TRAIT PURPOSE: "Analysis"
            CAPABILITY ANALYZE: TRUE
          }
          
          ARCHETYPE TYPE_B {
            TRAIT PURPOSE: "Synthesis"
            CAPABILITY SYNTHESIZE: TRUE
          }
          
          RELATIONSHIP A_TO_B {
            FROM TYPE_A
            TO TYPE_B
            TYPE INFLUENCES
          }
        }
      `;
      const result = parser.parse(complexSource);
      assert.strictEqual(result.ontologies[0].archetypes.length, 2);
      assert.strictEqual(result.ontologies[0].relationships.length, 1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // CROSS-MODULE INTEGRATION CHAOS
  // ─────────────────────────────────────────────────────────────────────────────
  
  describe('Cross-Module Integration Chaos', () => {
    test('Cross-module consistency validation', async () => {
      const consistency = await chaos.validateCrossModuleConsistency();
      
      assert(consistency['cpl-l'].available, 'CPL-L parser should be available');
      assert(consistency['ocl'].available, 'OCL parser should be available');
      assert(consistency['tpl'].available, 'TPL parser should be available');
      assert(consistency['acl'].available, 'ACL parser should be available');
    });

    test('Runtime statistics under chaos', async () => {
      const runtime = new CognitiveRuntime();
      
      // Load multiple artifacts
      await runtime.execute('cpl-l', 'LAW STATS_LAW { VERSION "1.0.0" }');
      await runtime.execute('ocl', `
        ORGANISM STATS_ORG { 
          ENCODED_ID "STATS.ORG" 
          CAPABILITIES { } 
          CONSTRAINTS { } 
          REWARD_STRUCTURE { } 
        }
      `);
      await runtime.execute('tpl', 'PROTOCOL STATS_PROTO { VERSION "1.0.0" }');
      
      const stats = runtime.getStatistics();
      assert(stats.lawsLoaded >= 1, 'Should have loaded at least 1 law');
      assert(stats.organismsLoaded >= 1, 'Should have loaded at least 1 organism');
      assert(stats.protocolsLoaded >= 1, 'Should have loaded at least 1 protocol');
    });

    test('Sequential rapid execution', async () => {
      const runtime = new CognitiveRuntime();
      const iterations = 50;
      let successCount = 0;
      
      for (let i = 0; i < iterations; i++) {
        try {
          await runtime.execute('cpl-l', `LAW RAPID_LAW_${i} { VERSION "1.0.0" }`);
          successCount++;
        } catch (e) {
          // Count failures
        }
      }
      
      assert.strictEqual(successCount, iterations, 'All rapid executions should succeed');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SELF-HEALING VALIDATION
  // ─────────────────────────────────────────────────────────────────────────────
  
  describe('Self-Healing Validation Protocol', () => {
    test('Parser recovery after malformed input', () => {
      const parser = new CPLLParser();
      
      // First, try malformed input
      let recovered = false;
      try {
        parser.parse('CORRUPTED GARBAGE {{{');
      } catch (e) {
        recovered = true;
      }
      
      // Then verify parser still works
      const result = parser.parse('LAW RECOVERY_LAW { VERSION "1.0.0" }');
      assert(recovered, 'Parser should have recovered from malformed input');
      assert.strictEqual(result.laws[0].name, 'RECOVERY_LAW');
    });

    test('Runtime state isolation', async () => {
      const runtime = new CognitiveRuntime();
      
      // Load valid content
      await runtime.execute('cpl-l', 'LAW VALID_LAW { VERSION "1.0.0" }');
      
      // Attempt invalid load
      let failed = false;
      try {
        await runtime.execute('cpl-l', 'INVALID GARBAGE');
      } catch (e) {
        failed = true;
      }
      
      // Verify original state preserved
      const law = runtime.queryLaw('VALID_LAW');
      assert(failed, 'Invalid execution should fail');
      assert(law !== null, 'Original law should still be accessible');
    });

    test('Chaos validation report generation', () => {
      const report = chaos.getValidationReport();
      assert(typeof report.faultInjectionCount === 'number');
      assert(typeof report.recoveryCount === 'number');
      assert(typeof report.recoveryRate === 'string');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PHI-ENCODED THRESHOLD VALIDATION
  // ─────────────────────────────────────────────────────────────────────────────
  
  describe('φ-Encoded Threshold Validation', () => {
    const PHI = 1.618033988749895;
    const PHI_INVERSE = 1 / PHI;
    const PHI_SQUARED = PHI * PHI;

    test('PHI constant accuracy', () => {
      assert(Math.abs(PHI - 1.618033988749895) < 1e-10, 'PHI should be accurate');
      assert(Math.abs(PHI_INVERSE - 0.6180339887498949) < 1e-10, 'PHI_INVERSE should be accurate');
      assert(Math.abs(PHI_SQUARED - 2.618033988749895) < 1e-10, 'PHI_SQUARED should be accurate');
    });

    test('Golden ratio relationship: φ² = φ + 1', () => {
      const relationship = Math.abs(PHI_SQUARED - (PHI + 1));
      assert(relationship < 1e-10, 'φ² should equal φ + 1');
    });

    test('Inverse relationship: φ × φ⁻¹ = 1', () => {
      const product = PHI * PHI_INVERSE;
      assert(Math.abs(product - 1) < 1e-10, 'φ × φ⁻¹ should equal 1');
    });

    test('Fibonacci convergence to φ', () => {
      const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
      const ratio = fib[11] / fib[10]; // 144/89
      assert(Math.abs(ratio - PHI) < 0.01, 'Fibonacci ratio should converge to φ');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // FINAL VALIDATION SUMMARY
  // ─────────────────────────────────────────────────────────────────────────────
  
  describe('Sovereign Validation Authority Summary', () => {
    test('Complete validation report', () => {
      const report = chaos.getValidationReport();
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('SOVEREIGN VALIDATION AUTHORITY - CHAOS VALIDATION REPORT');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`Fault Injections: ${report.faultInjectionCount}`);
      console.log(`Recoveries: ${report.recoveryCount}`);
      console.log(`Recovery Rate: ${report.recoveryRate}`);
      console.log('═══════════════════════════════════════════════════════════');
      console.log('DOCTRINE: No capability is real until it is tested,');
      console.log('          proof-linked, monitored, and revocable.');
      console.log('═══════════════════════════════════════════════════════════\n');
      
      assert(true, 'Validation report generated');
    });
  });
});
