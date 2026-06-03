/**
 * OCL Parser Tests
 * Organism Contract Language Parser Tests
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { OCLParser } from '../ocl/src/parser.js';

test('OCL Parser - Basic Organism', () => {
  const source = `
    ORGANISM TEST_ORG {
      ENCODED_ID "TEST.ORG.001"
    }
  `;

  const parser = new OCLParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.language, 'OCL');
  assert.strictEqual(ast.organisms.length, 1);
  assert.strictEqual(ast.organisms[0].name, 'TEST_ORG');
  assert.strictEqual(ast.organisms[0].metadata.encodedId, 'TEST.ORG.001');
});

test('OCL Parser - Organism with Archetype', () => {
  const source = `
    ORGANISM ARCHON {
      ENCODED_ID "ORO.ARCHON.001"
      ARCHETYPE "INTEGRITY_CHECKER"
    }
  `;

  const parser = new OCLParser();
  const ast = parser.parse(source);

  const organism = ast.organisms[0];
  assert.strictEqual(organism.name, 'ARCHON');
  assert.strictEqual(organism.metadata.encodedId, 'ORO.ARCHON.001');
  assert.strictEqual(organism.metadata.archetype, 'INTEGRITY_CHECKER');
});

test('OCL Parser - Organism with Capabilities', () => {
  const source = `
    ORGANISM VOTER {
      ENCODED_ID "TEST.VOTER"

      CAPABILITIES {
        CAN_VOTE: TRUE
        CAN_READ_PROPOSALS: TRUE
        CAN_DELETE: FALSE
      }
    }
  `;

  const parser = new OCLParser();
  const ast = parser.parse(source);

  const organism = ast.organisms[0];
  assert.strictEqual(organism.capabilities.CAN_VOTE, true);
  assert.strictEqual(organism.capabilities.CAN_READ_PROPOSALS, true);
  assert.strictEqual(organism.capabilities.CAN_DELETE, false);
});

test('OCL Parser - Organism with Constraints', () => {
  const source = `
    ORGANISM WORKER {
      ENCODED_ID "TEST.WORKER"

      CONSTRAINTS {
        MAX_PROPOSALS_PER_CYCLE: 100
        REQUIRED_CONFIDENCE: 0.8
      }
    }
  `;

  const parser = new OCLParser();
  const ast = parser.parse(source);

  const organism = ast.organisms[0];
  assert.deepStrictEqual(organism.constraints.MAX_PROPOSALS_PER_CYCLE, { value: 100 });
  assert.deepStrictEqual(organism.constraints.REQUIRED_CONFIDENCE, { value: 0.8 });
});

test('OCL Parser - Organism with Reward Structure', () => {
  const source = `
    ORGANISM MINER {
      ENCODED_ID "TEST.MINER"

      REWARD_STRUCTURE {
        PER_FINDING: 0.1 ORG_TOKEN
        PER_VALIDATION: 0.05 ORG_TOKEN
      }
    }
  `;

  const parser = new OCLParser();
  const ast = parser.parse(source);

  const organism = ast.organisms[0];
  assert.deepStrictEqual(organism.rewards.PER_FINDING, { amount: 0.1, token: 'ORG_TOKEN' });
  assert.deepStrictEqual(organism.rewards.PER_VALIDATION, { amount: 0.05, token: 'ORG_TOKEN' });
});

test('OCL Parser - Full Organism Contract', () => {
  const source = `
    ORGANISM ARCHON_ALPHA {
      ENCODED_ID "ORO.ARCHON.ALPHA"
      ARCHETYPE "GOVERNANCE_AGENT"
      CIVILIZATION "COSMOS"
      RATIFIED "2024-01-01"

      CAPABILITIES {
        CAN_VOTE: TRUE
        CAN_GENERATE_FINDINGS: TRUE
        CAN_DISPUTE_CLAIMS: TRUE
        CAN_ACCESS_NNS: TRUE
        CAN_ACCESS_SNS: FALSE
      }

      CONSTRAINTS {
        MAX_PROPOSALS_PER_CYCLE: 50
        REQUIRED_CONFIDENCE: 0.95
      }

      REWARD_STRUCTURE {
        PER_FINDING: 0.25 COSMOS_TOKEN
        PER_VOTE: 0.01 COSMOS_TOKEN
      }
    }
  `;

  const parser = new OCLParser();
  const ast = parser.parse(source);

  const organism = ast.organisms[0];
  assert.strictEqual(organism.name, 'ARCHON_ALPHA');
  assert.strictEqual(organism.metadata.encodedId, 'ORO.ARCHON.ALPHA');
  assert.strictEqual(organism.metadata.archetype, 'GOVERNANCE_AGENT');
  assert.strictEqual(organism.metadata.civilization, 'COSMOS');
  assert.strictEqual(organism.metadata.ratified, '2024-01-01');
  
  assert.strictEqual(organism.capabilities.CAN_VOTE, true);
  assert.strictEqual(organism.capabilities.CAN_ACCESS_SNS, false);
  
  assert.deepStrictEqual(organism.constraints.MAX_PROPOSALS_PER_CYCLE, { value: 50 });
  assert.deepStrictEqual(organism.constraints.REQUIRED_CONFIDENCE, { value: 0.95 });
  
  assert.deepStrictEqual(organism.rewards.PER_FINDING, { amount: 0.25, token: 'COSMOS_TOKEN' });
});

test('OCL Parser - Multiple Organisms', () => {
  const source = `
    ORGANISM ORG_ONE {
      ENCODED_ID "ONE"
    }

    ORGANISM ORG_TWO {
      ENCODED_ID "TWO"
    }

    ORGANISM ORG_THREE {
      ENCODED_ID "THREE"
    }
  `;

  const parser = new OCLParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.organisms.length, 3);
  assert.strictEqual(ast.organisms[0].name, 'ORG_ONE');
  assert.strictEqual(ast.organisms[1].name, 'ORG_TWO');
  assert.strictEqual(ast.organisms[2].name, 'ORG_THREE');
});

test('OCL Parser - Constraint with Greater Than Operator', () => {
  const source = `
    ORGANISM TEST {
      ENCODED_ID "TEST"

      CONSTRAINTS {
        MIN_SCORE: >= 0.5
      }
    }
  `;

  const parser = new OCLParser();
  const ast = parser.parse(source);

  const organism = ast.organisms[0];
  assert.deepStrictEqual(organism.constraints.MIN_SCORE, { operator: '>=', value: 0.5 });
});

test('OCL Parser - Empty Program', () => {
  const source = ``;

  const parser = new OCLParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.organisms.length, 0);
});
