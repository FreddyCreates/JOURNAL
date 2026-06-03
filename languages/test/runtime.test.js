/**
 * CognitiveRuntime Tests
 * Tests for the unified runtime engine
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { CognitiveRuntime } from '../runtime.js';

test('Runtime - Constructor initializes parsers', () => {
  const runtime = new CognitiveRuntime();
  
  assert.strictEqual(runtime.parsers.size, 8);
  assert(runtime.parsers.has('cpl-l'));
  assert(runtime.parsers.has('tpl'));
  assert(runtime.parsers.has('ocl'));
  assert(runtime.parsers.has('acl'));
  assert(runtime.parsers.has('cpl-c'));
  assert(runtime.parsers.has('cpl-p'));
  assert(runtime.parsers.has('cil'));
  assert(runtime.parsers.has('cdl'));
});

test('Runtime - Constructor initializes compilers', () => {
  const runtime = new CognitiveRuntime();
  
  assert.strictEqual(runtime.compilers.size, 2);
  assert(runtime.compilers.has('cpl-l'));
  assert(runtime.compilers.has('lml'));
});

test('Runtime - Execute CPL-L law', async () => {
  const runtime = new CognitiveRuntime();
  const source = `
    LAW TEST_LAW {
      VERSION "1.0.0"
      ENCODED_ID "TEST.LAW"
    }
  `;

  const result = await runtime.execute('cpl-l', source);

  assert.strictEqual(result.type, 'CPL-L Execution');
  assert.strictEqual(result.lawsRegistered, 1);
  assert.strictEqual(result.results[0].law, 'TEST_LAW');
  assert.strictEqual(result.results[0].encodedId, 'TEST.LAW');
  assert.strictEqual(result.results[0].registered, true);
});

test('Runtime - Execute TPL protocol', async () => {
  const runtime = new CognitiveRuntime();
  const source = `
    PROTOCOL TEST_PROTO {
      VERSION "1.0.0"
      
      CHANNEL TEST_CHANNEL {
        TRANSPORT: HTTP
      }
      
      MESSAGE TEST_MSG {
        data: STRING REQUIRED
      }
    }
  `;

  const result = await runtime.execute('tpl', source);

  assert.strictEqual(result.type, 'TPL Execution');
  assert.strictEqual(result.protocolsRegistered, 1);
  assert.strictEqual(result.results[0].protocol, 'TEST_PROTO');
  assert.strictEqual(result.results[0].channels, 1);
  assert.strictEqual(result.results[0].messages, 1);
});

test('Runtime - Execute OCL organism', async () => {
  const runtime = new CognitiveRuntime();
  const source = `
    ORGANISM TEST_ORG {
      ENCODED_ID "TEST.ORG"
      
      CAPABILITIES {
        CAN_VOTE: TRUE
      }
      
      CONSTRAINTS {
        MAX_VOTES: 100
      }
      
      REWARD_STRUCTURE {
        PER_VOTE: 0.1 TOKEN
      }
    }
  `;

  const result = await runtime.execute('ocl', source);

  assert.strictEqual(result.type, 'OCL Execution');
  assert.strictEqual(result.organismsRegistered, 1);
  assert.strictEqual(result.results[0].organism, 'TEST_ORG');
  assert.strictEqual(result.results[0].capabilities, 1);
  assert.strictEqual(result.results[0].constraints, 1);
});

test('Runtime - Execute ACL ontology', async () => {
  const runtime = new CognitiveRuntime();
  const source = `
    ONTOLOGY TEST_ONTOLOGY {
      VERSION "1.0.0"
      
      ARCHETYPE WORKER {
        TRAIT TYPE: "worker"
      }
      
      RELATIONSHIP R1 {
        FROM A
        TO B
        TYPE CONTAINS
      }
    }
  `;

  const result = await runtime.execute('acl', source);

  assert.strictEqual(result.type, 'ACL Execution');
  assert.strictEqual(result.ontologiesRegistered, 1);
  assert.strictEqual(result.results[0].archetypes, 1);
  assert.strictEqual(result.results[0].relationships, 1);
});

test('Runtime - Execute CPL-C contract', async () => {
  const runtime = new CognitiveRuntime();
  const source = `
    CONTRACT TEST_CONTRACT {
      VERSION "1.0.0"
      
      PARTIES {
        PARTY_A: {
          PRINCIPAL: "a-id"
          ROLE: "buyer"
        }
      }
      
      TERMS {
        TERM_A: {
          DEADLINE: PERPETUAL
        }
      }
      
      ACTIONS {
        ACTION_A: {
          MODIFIES: state
        }
      }
    }
  `;

  const result = await runtime.execute('cpl-c', source);

  assert.strictEqual(result.type, 'CPL-C Execution');
  assert.strictEqual(result.contractsRegistered, 1);
  assert.strictEqual(result.results[0].parties, 1);
  assert.strictEqual(result.results[0].terms, 1);
  assert.strictEqual(result.results[0].actions, 1);
});

test('Runtime - Execute CPL-P pipeline', async () => {
  const runtime = new CognitiveRuntime();
  const source = `
    PIPELINE TEST_PIPELINE {
      VERSION "1.0.0"
      DETERMINISTIC: TRUE
      IDEMPOTENT: FALSE
      
      STAGES {
        STAGE_A: {
          TYPE: VALIDATE
        }
        STAGE_B: {
          TYPE: MAP
        }
      }
    }
  `;

  const result = await runtime.execute('cpl-p', source);

  assert.strictEqual(result.type, 'CPL-P Execution');
  assert.strictEqual(result.pipelinesRegistered, 1);
  assert.strictEqual(result.results[0].stages, 2);
  assert.strictEqual(result.results[0].deterministic, true);
  assert.strictEqual(result.results[0].idempotent, false);
});

test('Runtime - Execute CIL cognitive space', async () => {
  const runtime = new CognitiveRuntime();
  const source = `
    COGNITIVE_SPACE TEST_SPACE {
      VERSION "1.0.0"
      TOPOLOGY: EUCLIDEAN
      
      DIMENSIONS {
        DIM_A: {
          TYPE: CONTINUOUS
        }
      }
      
      CONCEPTS {
        CONCEPT_A: {
          COORDINATES: [0.5]
          ACTIVATION: 1.0
        }
      }
    }
  `;

  const result = await runtime.execute('cil', source);

  assert.strictEqual(result.type, 'CIL Execution');
  assert.strictEqual(result.spacesRegistered, 1);
  assert.strictEqual(result.results[0].dimensions, 1);
  assert.strictEqual(result.results[0].concepts, 1);
});

test('Runtime - Execute CDL doctrine', async () => {
  const runtime = new CognitiveRuntime();
  const source = `
    DOCTRINE TEST_DOCTRINE {
      VERSION "1.0.0"
      
      AXIOMS {
        AXIOM_A: {
          STATEMENT: "Test axiom"
          FOUNDATION: TRUE
        }
      }
      
      PRINCIPLES {
        PRINCIPLE_A: {
          DESCRIPTION: "Test principle"
          PRIORITY: 1
        }
      }
      
      VALUES {
        VALUE_A: {
          WEIGHT: 0.9
          DOMAIN: "test"
        }
      }
      
      VIRTUES {
        VIRTUE_A: {
          DEFINITION: "Test virtue"
        }
      }
      
      PROHIBITIONS {
        PROHIBITION_A: {
          SEVERITY: STRONG
        }
      }
    }
  `;

  const result = await runtime.execute('cdl', source);

  assert.strictEqual(result.type, 'CDL Execution');
  assert.strictEqual(result.doctrinesRegistered, 1);
  assert.strictEqual(result.results[0].axioms, 1);
  assert.strictEqual(result.results[0].principles, 1);
  assert.strictEqual(result.results[0].values, 1);
  assert.strictEqual(result.results[0].virtues, 1);
  assert.strictEqual(result.results[0].prohibitions, 1);
});

test('Runtime - Execute throws for unknown language', async () => {
  const runtime = new CognitiveRuntime();

  await assert.rejects(
    () => runtime.execute('unknown-lang', 'test'),
    /No parser available/
  );
});

test('Runtime - queryLaw returns loaded law', async () => {
  const runtime = new CognitiveRuntime();
  const source = `
    LAW QUERY_LAW {
      VERSION "1.0.0"
      ENCODED_ID "QUERY.LAW"
    }
  `;

  await runtime.execute('cpl-l', source);
  const law = runtime.queryLaw('QUERY_LAW');

  assert(law !== null);
  assert.strictEqual(law.name, 'QUERY_LAW');
  assert.strictEqual(law.metadata.version, '1.0.0');
});

test('Runtime - queryLaw returns null for unknown law', () => {
  const runtime = new CognitiveRuntime();
  const law = runtime.queryLaw('UNKNOWN_LAW');

  assert.strictEqual(law, null);
});

test('Runtime - queryOrganism returns loaded organism', async () => {
  const runtime = new CognitiveRuntime();
  const source = `
    ORGANISM QUERY_ORG {
      ENCODED_ID "QUERY.ORG"
      
      CAPABILITIES {
        CAN_QUERY: TRUE
      }
      
      CONSTRAINTS {
        MAX_QUERIES: 10
      }
      
      REWARD_STRUCTURE {
        PER_QUERY: 0.01 TOKEN
      }
    }
  `;

  await runtime.execute('ocl', source);
  const organism = runtime.queryOrganism('QUERY_ORG');

  assert(organism !== null);
  assert.strictEqual(organism.name, 'QUERY_ORG');
});

test('Runtime - queryOrganism returns null for unknown organism', () => {
  const runtime = new CognitiveRuntime();
  const organism = runtime.queryOrganism('UNKNOWN_ORG');

  assert.strictEqual(organism, null);
});

test('Runtime - queryProtocol returns loaded protocol', async () => {
  const runtime = new CognitiveRuntime();
  const source = `
    PROTOCOL QUERY_PROTO {
      VERSION "1.0.0"
    }
  `;

  await runtime.execute('tpl', source);
  const protocol = runtime.queryProtocol('QUERY_PROTO');

  assert(protocol !== null);
  assert.strictEqual(protocol.name, 'QUERY_PROTO');
});

test('Runtime - queryProtocol returns null for unknown protocol', () => {
  const runtime = new CognitiveRuntime();
  const protocol = runtime.queryProtocol('UNKNOWN_PROTO');

  assert.strictEqual(protocol, null);
});

test('Runtime - organismCan returns true for capability', async () => {
  const runtime = new CognitiveRuntime();
  const source = `
    ORGANISM CAN_ORG {
      ENCODED_ID "CAN.ORG"
      
      CAPABILITIES {
        CAN_VOTE: TRUE
        CAN_DELETE: FALSE
      }
      
      CONSTRAINTS {
        MAX: 10
      }
      
      REWARD_STRUCTURE {
        PER_ACTION: 0.1 TOKEN
      }
    }
  `;

  await runtime.execute('ocl', source);

  assert.strictEqual(runtime.organismCan('CAN_ORG', 'CAN_VOTE'), true);
  assert.strictEqual(runtime.organismCan('CAN_ORG', 'CAN_DELETE'), false);
});

test('Runtime - organismCan returns false for unknown capability', async () => {
  const runtime = new CognitiveRuntime();
  const source = `
    ORGANISM LIMITED_ORG {
      ENCODED_ID "LIMITED.ORG"
      
      CAPABILITIES {
        CAN_READ: TRUE
      }
      
      CONSTRAINTS {
        MAX: 10
      }
      
      REWARD_STRUCTURE {
        PER_READ: 0.1 TOKEN
      }
    }
  `;

  await runtime.execute('ocl', source);

  assert.strictEqual(runtime.organismCan('LIMITED_ORG', 'CAN_UNKNOWN'), false);
});

test('Runtime - organismCan returns false for unknown organism', () => {
  const runtime = new CognitiveRuntime();

  assert.strictEqual(runtime.organismCan('UNKNOWN_ORG', 'CAN_VOTE'), false);
});

test('Runtime - verifyCompliance returns compliant for existing law', async () => {
  const runtime = new CognitiveRuntime();
  const source = `
    LAW COMPLIANCE_LAW {
      VERSION "1.0.0"
      
      RULE TEST_RULE {
        PERMITS user.action
        ENFORCEMENT: RUNTIME
      }
    }
  `;

  await runtime.execute('cpl-l', source);
  const result = await runtime.verifyCompliance('COMPLIANCE_LAW', 'user.action');

  assert.strictEqual(result.compliant, true);
  assert.strictEqual(result.law, 'COMPLIANCE_LAW');
  assert.strictEqual(result.action, 'user.action');
});

test('Runtime - verifyCompliance returns error for unknown law', async () => {
  const runtime = new CognitiveRuntime();
  const result = await runtime.verifyCompliance('UNKNOWN_LAW', 'action');

  assert.strictEqual(result.compliant, false);
  assert.strictEqual(result.error, 'Law not found');
});

test('Runtime - getStatistics returns correct counts', async () => {
  const runtime = new CognitiveRuntime();
  
  // Load some entities
  await runtime.execute('cpl-l', `
    LAW LAW_A { VERSION "1.0.0" }
  `);
  await runtime.execute('cpl-l', `
    LAW LAW_B { VERSION "1.0.0" }
  `);
  await runtime.execute('tpl', `
    PROTOCOL PROTO_A { VERSION "1.0.0" }
  `);
  await runtime.execute('ocl', `
    ORGANISM ORG_A {
      ENCODED_ID "A"
      CAPABILITIES { CAN_DO: TRUE }
      CONSTRAINTS { MAX: 10 }
      REWARD_STRUCTURE { PER_DO: 0.1 TOKEN }
    }
  `);

  const stats = runtime.getStatistics();

  assert.strictEqual(stats.lawsLoaded, 2);
  assert.strictEqual(stats.protocolsLoaded, 1);
  assert.strictEqual(stats.organismsLoaded, 1);
  assert.strictEqual(stats.parsersAvailable, 8);
  assert.strictEqual(stats.compilersAvailable, 2);
  assert(Array.isArray(stats.languages));
});

test('Runtime - getStatistics returns languages list', () => {
  const runtime = new CognitiveRuntime();
  const stats = runtime.getStatistics();

  assert(stats.languages.includes('cpl-l'));
  assert(stats.languages.includes('tpl'));
  assert(stats.languages.includes('ocl'));
  assert(stats.languages.includes('acl'));
});

test('Runtime - Multiple laws can be loaded', async () => {
  const runtime = new CognitiveRuntime();
  
  await runtime.execute('cpl-l', `
    LAW FIRST_LAW { VERSION "1.0.0" }
  `);
  await runtime.execute('cpl-l', `
    LAW SECOND_LAW { VERSION "2.0.0" }
  `);
  await runtime.execute('cpl-l', `
    LAW THIRD_LAW { VERSION "3.0.0" }
  `);

  const first = runtime.queryLaw('FIRST_LAW');
  const second = runtime.queryLaw('SECOND_LAW');
  const third = runtime.queryLaw('THIRD_LAW');

  assert(first !== null);
  assert(second !== null);
  assert(third !== null);
  assert.strictEqual(first.metadata.version, '1.0.0');
  assert.strictEqual(second.metadata.version, '2.0.0');
  assert.strictEqual(third.metadata.version, '3.0.0');
});
