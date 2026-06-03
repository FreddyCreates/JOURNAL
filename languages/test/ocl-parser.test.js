/**
 * OCL Parser Tests
 * Organism Contract Language Parser Tests
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { OCLParser } from '../ocl/src/parser.js';

describe('OCL Parser - Basic Organism', () => {
  test('parses organism with name', () => {
    const source = `
      ORGANISM TESTORG {
        ENCODED_ID "TEST.ORG"
        CAPABILITIES {
        }
        CONSTRAINTS {
        }
        REWARD_STRUCTURE {
        }
      }
    `;
    
    const parser = new OCLParser();
    const ast = parser.parse(source);
    
    assert.strictEqual(ast.type, 'Program');
    assert.strictEqual(ast.language, 'OCL');
    assert.strictEqual(ast.organisms.length, 1);
    assert.strictEqual(ast.organisms[0].name, 'TESTORG');
  });

  test('parses organism with encoded ID', () => {
    const source = `
      ORGANISM TESTORGANISM {
        ENCODED_ID "ORO.TEST.001"
        CAPABILITIES {
        }
        CONSTRAINTS {
        }
        REWARD_STRUCTURE {
        }
      }
    `;
    
    const parser = new OCLParser();
    const ast = parser.parse(source);
    
    assert.strictEqual(ast.organisms[0].metadata.encodedId, 'ORO.TEST.001');
  });

  test('parses multiple organisms', () => {
    const source = `
      ORGANISM FIRSTORG {
        ENCODED_ID "FIRST.ORG"
        CAPABILITIES {
        }
        CONSTRAINTS {
        }
        REWARD_STRUCTURE {
        }
      }
      
      ORGANISM SECONDORG {
        ENCODED_ID "SECOND.ORG"
        CAPABILITIES {
        }
        CONSTRAINTS {
        }
        REWARD_STRUCTURE {
        }
      }
    `;
    
    const parser = new OCLParser();
    const ast = parser.parse(source);
    
    assert.strictEqual(ast.organisms.length, 2);
    assert.strictEqual(ast.organisms[0].name, 'FIRSTORG');
    assert.strictEqual(ast.organisms[1].name, 'SECONDORG');
  });
});

describe('OCL Parser - Capabilities', () => {
  test('parses capabilities block', () => {
    const source = `
      ORGANISM CAPTEST {
        ENCODED_ID "CAP.TEST"
        CAPABILITIES {
          CANREAD: TRUE
          CANWRITE: FALSE
        }
        CONSTRAINTS {
        }
        REWARD_STRUCTURE {
        }
      }
    `;
    
    const parser = new OCLParser();
    const ast = parser.parse(source);
    
    const caps = ast.organisms[0].capabilities;
    assert.ok(caps);
    assert.strictEqual(caps.CANREAD, true);
    assert.strictEqual(caps.CANWRITE, false);
  });
});

describe('OCL Parser - Constraints', () => {
  test('parses constraints block', () => {
    const source = `
      ORGANISM CONSTTEST {
        ENCODED_ID "CONST.TEST"
        CAPABILITIES {
        }
        CONSTRAINTS {
          MAXACTIONS: 100
          MINCONFIDENCE: 0.85
        }
        REWARD_STRUCTURE {
        }
      }
    `;
    
    const parser = new OCLParser();
    const ast = parser.parse(source);
    
    const constraints = ast.organisms[0].constraints;
    assert.ok(constraints);
    // Constraints are stored as {value: X} objects
    assert.strictEqual(constraints.MAXACTIONS.value, 100);
    assert.strictEqual(constraints.MINCONFIDENCE.value, 0.85);
  });
});

describe('OCL Parser - Reward Structure', () => {
  test('parses reward structure block', () => {
    const source = `
      ORGANISM REWARDTEST {
        ENCODED_ID "REWARD.TEST"
        CAPABILITIES {
        }
        CONSTRAINTS {
        }
        REWARD_STRUCTURE {
          PERACTION: 0.1 TOKEN
          PERCYCLE: 1.0 TOKEN
        }
      }
    `;
    
    const parser = new OCLParser();
    const ast = parser.parse(source);
    
    const rewards = ast.organisms[0].rewards;
    assert.ok(rewards);
    assert.ok(rewards.PERACTION);
  });
});

describe('OCL Parser - Complete Organism', () => {
  test('parses organism with all sections', () => {
    const source = `
      ORGANISM COMPLETEORG {
        ENCODED_ID "ORO.COMPLETE.001"
        ARCHETYPE "GOVERNANCE_AGENT"
        
        CAPABILITIES {
          VOTE: TRUE
          PROPOSE: TRUE
          EXECUTE: FALSE
        }
        
        CONSTRAINTS {
          MAXPROPOSALS: 50
          REQUIREDCONFIDENCE: 0.9
        }
        
        REWARD_STRUCTURE {
          PERVOTE: 0.05 TOKEN
          PERPROPOSAL: 0.2 TOKEN
        }
      }
    `;
    
    const parser = new OCLParser();
    const ast = parser.parse(source);
    
    const org = ast.organisms[0];
    assert.strictEqual(org.name, 'COMPLETEORG');
    assert.strictEqual(org.metadata.encodedId, 'ORO.COMPLETE.001');
    assert.ok(org.capabilities);
    assert.ok(org.constraints);
    assert.ok(org.rewards);
  });
});

describe('OCL Parser - Edge Cases', () => {
  test('handles whitespace variations', () => {
    const source = `ORGANISM   WHITESPACETEST   {
      ENCODED_ID   "WS.TEST"
      CAPABILITIES{
      }
      CONSTRAINTS{
      }
      REWARD_STRUCTURE{
      }
    }`;
    
    const parser = new OCLParser();
    const ast = parser.parse(source);
    assert.strictEqual(ast.organisms[0].name, 'WHITESPACETEST');
  });
});
