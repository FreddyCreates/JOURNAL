/**
 * ACL Parser Tests
 * Atlas Configuration Language Parser Tests
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { ACLParser } from '../acl/src/parser.js';

test('ACL Parser - Basic Ontology', () => {
  const source = `
    ONTOLOGY TEST_ONTOLOGY {
      VERSION "1.0.0"
    }
  `;

  const parser = new ACLParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.language, 'ACL');
  assert.strictEqual(ast.ontologies.length, 1);
  assert.strictEqual(ast.ontologies[0].name, 'TEST_ONTOLOGY');
  assert.strictEqual(ast.ontologies[0].metadata.version, '1.0.0');
});

test('ACL Parser - Ontology with Encoded ID', () => {
  const source = `
    ONTOLOGY COSMOS {
      VERSION "1.0.0"
      ENCODED_ID "ATLAS.COSMOS.ONTOLOGY"
    }
  `;

  const parser = new ACLParser();
  const ast = parser.parse(source);

  const ontology = ast.ontologies[0];
  assert.strictEqual(ontology.metadata.version, '1.0.0');
  assert.strictEqual(ontology.metadata.encodedId, 'ATLAS.COSMOS.ONTOLOGY');
});

test('ACL Parser - Ontology with Archetype', () => {
  const source = `
    ONTOLOGY COGNITIVE {
      VERSION "1.0.0"

      ARCHETYPE INTEGRITY_CHECKER {
        TRAIT PURPOSE: "Verify claims"
        CAPABILITY DISPUTE_RESOLUTION: TRUE
        CONSTRAINT MAX_DISPUTES: 100
      }
    }
  `;

  const parser = new ACLParser();
  const ast = parser.parse(source);

  const ontology = ast.ontologies[0];
  assert.strictEqual(ontology.archetypes.length, 1);
  
  const archetype = ontology.archetypes[0];
  assert.strictEqual(archetype.name, 'INTEGRITY_CHECKER');
  assert.strictEqual(archetype.traits.PURPOSE, 'Verify claims');
  assert.strictEqual(archetype.capabilities.DISPUTE_RESOLUTION, true);
  assert.strictEqual(archetype.constraints.MAX_DISPUTES, 100);
});

test('ACL Parser - Ontology with Relationship', () => {
  const source = `
    ONTOLOGY RELATIONS {
      VERSION "1.0.0"

      RELATIONSHIP ARCHON_TO_PROPOSALS {
        FROM ARCHON
        TO NNS_PROPOSALS
        TYPE GOVERNS
      }
    }
  `;

  const parser = new ACLParser();
  const ast = parser.parse(source);

  const ontology = ast.ontologies[0];
  assert.strictEqual(ontology.relationships.length, 1);
  
  const relationship = ontology.relationships[0];
  assert.strictEqual(relationship.name, 'ARCHON_TO_PROPOSALS');
  assert.strictEqual(relationship.from, 'ARCHON');
  assert.strictEqual(relationship.to, 'NNS_PROPOSALS');
  assert.strictEqual(relationship.relationType, 'GOVERNS');
});

test('ACL Parser - Ontology with Governance', () => {
  const source = `
    ONTOLOGY GOV {
      VERSION "1.0.0"

      GOVERNANCE VOTING_RULES {
        CONSENSUS_THRESHOLD: 0.67
        DISPUTE_RESOLUTION: MAJORITY_VOTE
        REQUIRES: ALL_AGENTS_REGISTERED
      }
    }
  `;

  const parser = new ACLParser();
  const ast = parser.parse(source);

  const ontology = ast.ontologies[0];
  assert.strictEqual(ontology.governance.length, 1);
  
  const governance = ontology.governance[0];
  assert.strictEqual(governance.name, 'VOTING_RULES');
  assert.strictEqual(governance.rules.CONSENSUS_THRESHOLD, 0.67);
  assert.strictEqual(governance.rules.DISPUTE_RESOLUTION, 'MAJORITY_VOTE');
  assert.strictEqual(governance.rules.REQUIRES, 'ALL_AGENTS_REGISTERED');
});

test('ACL Parser - Full Ontology', () => {
  const source = `
    ONTOLOGY COGNITIVE_COSMOS {
      VERSION "1.0.0"
      ENCODED_ID "ATLAS.COGNITIVE.COSMOS"

      ARCHETYPE VALIDATOR {
        TRAIT PURPOSE: "Validate proposals"
        TRAIT DOMAIN: "Governance"
        CAPABILITY CAN_VALIDATE: TRUE
        CAPABILITY CAN_REJECT: TRUE
        CONSTRAINT MAX_VALIDATIONS: 1000
      }

      ARCHETYPE EXECUTOR {
        TRAIT PURPOSE: "Execute approved proposals"
        CAPABILITY CAN_EXECUTE: TRUE
      }

      RELATIONSHIP VALIDATOR_TO_EXECUTOR {
        FROM VALIDATOR
        TO EXECUTOR
        TYPE INFLUENCES
      }

      GOVERNANCE CONSENSUS {
        CONSENSUS_THRESHOLD: 0.75
      }
    }
  `;

  const parser = new ACLParser();
  const ast = parser.parse(source);

  const ontology = ast.ontologies[0];
  assert.strictEqual(ontology.name, 'COGNITIVE_COSMOS');
  assert.strictEqual(ontology.archetypes.length, 2);
  assert.strictEqual(ontology.relationships.length, 1);
  assert.strictEqual(ontology.governance.length, 1);
});

test('ACL Parser - Multiple Archetypes', () => {
  const source = `
    ONTOLOGY MULTI {
      VERSION "1.0.0"

      ARCHETYPE TYPE_A {
        TRAIT NAME: "A"
      }

      ARCHETYPE TYPE_B {
        TRAIT NAME: "B"
      }

      ARCHETYPE TYPE_C {
        TRAIT NAME: "C"
      }
    }
  `;

  const parser = new ACLParser();
  const ast = parser.parse(source);

  const ontology = ast.ontologies[0];
  assert.strictEqual(ontology.archetypes.length, 3);
  assert.strictEqual(ontology.archetypes[0].name, 'TYPE_A');
  assert.strictEqual(ontology.archetypes[1].name, 'TYPE_B');
  assert.strictEqual(ontology.archetypes[2].name, 'TYPE_C');
});

test('ACL Parser - Multiple Relationships', () => {
  const source = `
    ONTOLOGY GRAPH {
      VERSION "1.0.0"

      RELATIONSHIP R1 {
        FROM A
        TO B
        TYPE CONTAINS
      }

      RELATIONSHIP R2 {
        FROM B
        TO C
        TYPE DERIVES_FROM
      }
    }
  `;

  const parser = new ACLParser();
  const ast = parser.parse(source);

  const ontology = ast.ontologies[0];
  assert.strictEqual(ontology.relationships.length, 2);
  assert.strictEqual(ontology.relationships[0].relationType, 'CONTAINS');
  assert.strictEqual(ontology.relationships[1].relationType, 'DERIVES_FROM');
});

test('ACL Parser - Multiple Ontologies', () => {
  const source = `
    ONTOLOGY FIRST {
      VERSION "1.0.0"
    }

    ONTOLOGY SECOND {
      VERSION "2.0.0"
    }
  `;

  const parser = new ACLParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.ontologies.length, 2);
  assert.strictEqual(ast.ontologies[0].name, 'FIRST');
  assert.strictEqual(ast.ontologies[1].name, 'SECOND');
});

test('ACL Parser - Empty Program', () => {
  const source = ``;

  const parser = new ACLParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.ontologies.length, 0);
});
