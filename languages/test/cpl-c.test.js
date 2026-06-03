/**
 * CPL-C Parser Tests
 * Cognitive Contract Language Parser Tests
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { CPLCParser } from '../cpl-c/src/parser.js';

test('CPL-C Parser - Basic Contract', () => {
  const source = `
    CONTRACT TEST_CONTRACT {
      VERSION "1.0.0"
    }
  `;

  const parser = new CPLCParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.language, 'CPL-C');
  assert.strictEqual(ast.contracts.length, 1);
  assert.strictEqual(ast.contracts[0].name, 'TEST_CONTRACT');
  assert.strictEqual(ast.contracts[0].metadata.version, '1.0.0');
});

test('CPL-C Parser - Contract with Metadata', () => {
  const source = `
    CONTRACT FULL_META {
      VERSION "1.0.0"
      ENCODED_ID "CPL-C.CONTRACT.001"
      JURISDICTION "COSMOS"
      TIMESTAMP 1704067200
    }
  `;

  const parser = new CPLCParser();
  const ast = parser.parse(source);

  const contract = ast.contracts[0];
  assert.strictEqual(contract.metadata.version, '1.0.0');
  assert.strictEqual(contract.metadata.encodedId, 'CPL-C.CONTRACT.001');
  assert.strictEqual(contract.metadata.jurisdiction, 'COSMOS');
  assert.strictEqual(contract.metadata.timestamp, 1704067200);
});

test('CPL-C Parser - Contract with Parties', () => {
  const source = `
    CONTRACT MULTI_PARTY {
      VERSION "1.0.0"

      PARTIES {
        ALICE: {
          PRINCIPAL: "alice-principal-id"
          ROLE: "buyer"
        }
        BOB: {
          PRINCIPAL: "bob-principal-id"
          ROLE: "seller"
        }
      }
    }
  `;

  const parser = new CPLCParser();
  const ast = parser.parse(source);

  const contract = ast.contracts[0];
  assert.strictEqual(contract.parties.length, 2);
  
  assert.strictEqual(contract.parties[0].name, 'ALICE');
  assert.strictEqual(contract.parties[0].principal, 'alice-principal-id');
  assert.strictEqual(contract.parties[0].role, 'buyer');
  
  assert.strictEqual(contract.parties[1].name, 'BOB');
  assert.strictEqual(contract.parties[1].principal, 'bob-principal-id');
  assert.strictEqual(contract.parties[1].role, 'seller');
});

test('CPL-C Parser - Contract with Terms', () => {
  const source = `
    CONTRACT TERMS_CONTRACT {
      VERSION "1.0.0"

      TERMS {
        PAYMENT: {
          DEADLINE: PERPETUAL
        }
        DELIVERY: {
          DEADLINE: PERPETUAL
        }
      }
    }
  `;

  const parser = new CPLCParser();
  const ast = parser.parse(source);

  const contract = ast.contracts[0];
  assert.strictEqual(contract.terms.length, 2);
  assert.strictEqual(contract.terms[0].name, 'PAYMENT');
  assert.strictEqual(contract.terms[1].name, 'DELIVERY');
});

test('CPL-C Parser - Contract with Actions', () => {
  const source = `
    CONTRACT ACTION_CONTRACT {
      VERSION "1.0.0"

      ACTIONS {
        TRANSFER: {
          MODIFIES: balance, ownership
        }
        VALIDATE: {
          MODIFIES: status
        }
      }
    }
  `;

  const parser = new CPLCParser();
  const ast = parser.parse(source);

  const contract = ast.contracts[0];
  assert.strictEqual(contract.actions.length, 2);
  assert.strictEqual(contract.actions[0].name, 'TRANSFER');
  assert.deepStrictEqual(contract.actions[0].modifies, ['balance', 'ownership']);
  assert.strictEqual(contract.actions[1].name, 'VALIDATE');
});

test('CPL-C Parser - Contract with Events', () => {
  const source = `
    CONTRACT EVENT_CONTRACT {
      VERSION "1.0.0"

      EVENTS {
        ON BREACH: {
          notify_parties
        }
        ON FULFILL: {
          finalize
        }
      }
    }
  `;

  const parser = new CPLCParser();
  const ast = parser.parse(source);

  const contract = ast.contracts[0];
  assert.strictEqual(contract.events.length, 2);
  assert.strictEqual(contract.events[0].eventType, 'BREACH');
  assert.strictEqual(contract.events[1].eventType, 'FULFILL');
});

test('CPL-C Parser - Full Contract', () => {
  const source = `
    CONTRACT COMPLETE_CONTRACT {
      VERSION "2.0.0"
      ENCODED_ID "CPL-C.COMPLETE"
      JURISDICTION "GLOBAL"

      PARTIES {
        BUYER: {
          PRINCIPAL: "buyer-id"
          ROLE: "purchaser"
        }
        SELLER: {
          PRINCIPAL: "seller-id"
          ROLE: "vendor"
        }
      }

      TERMS {
        PAYMENT_TERM: {
          DEADLINE: PERPETUAL
        }
      }

      ACTIONS {
        PAY: {
          MODIFIES: balance
        }
      }

      EVENTS {
        ON BREACH: {
          handle_breach
        }
      }
    }
  `;

  const parser = new CPLCParser();
  const ast = parser.parse(source);

  const contract = ast.contracts[0];
  assert.strictEqual(contract.name, 'COMPLETE_CONTRACT');
  assert.strictEqual(contract.metadata.version, '2.0.0');
  assert.strictEqual(contract.parties.length, 2);
  assert.strictEqual(contract.terms.length, 1);
  assert.strictEqual(contract.actions.length, 1);
  assert.strictEqual(contract.events.length, 1);
});

test('CPL-C Parser - Multiple Contracts', () => {
  const source = `
    CONTRACT CONTRACT_A {
      VERSION "1.0.0"
    }

    CONTRACT CONTRACT_B {
      VERSION "2.0.0"
    }
  `;

  const parser = new CPLCParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.contracts.length, 2);
  assert.strictEqual(ast.contracts[0].name, 'CONTRACT_A');
  assert.strictEqual(ast.contracts[1].name, 'CONTRACT_B');
});

test('CPL-C Parser - Party with Capabilities', () => {
  const source = `
    CONTRACT CAP_CONTRACT {
      VERSION "1.0.0"

      PARTIES {
        ADMIN: {
          PRINCIPAL: "admin-id"
          ROLE: "administrator"
          CAPABILITIES: read, write, delete
        }
      }
    }
  `;

  const parser = new CPLCParser();
  const ast = parser.parse(source);

  const party = ast.contracts[0].parties[0];
  assert.strictEqual(party.name, 'ADMIN');
  assert.deepStrictEqual(party.capabilities, ['read', 'write', 'delete']);
});

test('CPL-C Parser - Comments', () => {
  const source = `
    // Contract comment
    CONTRACT COMMENTED {
      VERSION "1.0.0"
      // Inner comment
    }
  `;

  const parser = new CPLCParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.contracts.length, 1);
});

test('CPL-C Parser - Empty Program', () => {
  const source = ``;

  const parser = new CPLCParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.contracts.length, 0);
});
