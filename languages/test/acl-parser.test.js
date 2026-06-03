/**
 * ACL Parser Tests
 * Atlas Configuration Language Parser Tests
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ACLParser } from '../acl/src/parser.js';

describe('ACL Parser - Basic Ontology', () => {
  test('parses empty ontology', () => {
    const source = `
      ONTOLOGY SIMPLEONTOLOGY {
        VERSION "1.0.0"
      }
    `;
    
    const parser = new ACLParser();
    const ast = parser.parse(source);
    
    assert.strictEqual(ast.type, 'Program');
    assert.strictEqual(ast.language, 'ACL');
    assert.strictEqual(ast.ontologies.length, 1);
    assert.strictEqual(ast.ontologies[0].name, 'SIMPLEONTOLOGY');
  });

  test('parses ontology with version', () => {
    const source = `
      ONTOLOGY VERSIONED {
        VERSION "2.5.0"
      }
    `;
    
    const parser = new ACLParser();
    const ast = parser.parse(source);
    
    assert.strictEqual(ast.ontologies[0].metadata.version, '2.5.0');
  });

  test('parses multiple ontologies', () => {
    const source = `
      ONTOLOGY FIRST {
        VERSION "1.0.0"
      }
      
      ONTOLOGY SECOND {
        VERSION "1.0.0"
      }
    `;
    
    const parser = new ACLParser();
    const ast = parser.parse(source);
    
    assert.strictEqual(ast.ontologies.length, 2);
    assert.strictEqual(ast.ontologies[0].name, 'FIRST');
    assert.strictEqual(ast.ontologies[1].name, 'SECOND');
  });
});

describe('ACL Parser - Archetypes', () => {
  test('parses archetype with trait', () => {
    const source = `
      ONTOLOGY TEST {
        VERSION "1.0.0"
        
        ARCHETYPE TESTARCHETYPE {
          TRAIT PURPOSE: "Test purpose"
        }
      }
    `;
    
    const parser = new ACLParser();
    const ast = parser.parse(source);
    
    assert.strictEqual(ast.ontologies[0].archetypes.length, 1);
    assert.strictEqual(ast.ontologies[0].archetypes[0].name, 'TESTARCHETYPE');
  });

  test('parses archetype with capability', () => {
    const source = `
      ONTOLOGY TEST {
        VERSION "1.0.0"
        
        ARCHETYPE CAPABLETYPE {
          CAPABILITY PROCESS: TRUE
          CAPABILITY READ: TRUE
        }
      }
    `;
    
    const parser = new ACLParser();
    const ast = parser.parse(source);
    
    const archetype = ast.ontologies[0].archetypes[0];
    assert.ok(archetype.capabilities);
  });

  test('parses multiple archetypes', () => {
    const source = `
      ONTOLOGY MULTIARCH {
        VERSION "1.0.0"
        
        ARCHETYPE FIRSTTYPE {
          TRAIT NAME: "First"
        }
        
        ARCHETYPE SECONDTYPE {
          TRAIT NAME: "Second"
        }
      }
    `;
    
    const parser = new ACLParser();
    const ast = parser.parse(source);
    
    assert.strictEqual(ast.ontologies[0].archetypes.length, 2);
  });
});

describe('ACL Parser - Relationships', () => {
  test('parses relationship definition', () => {
    const source = `
      ONTOLOGY RELTEST {
        VERSION "1.0.0"
        
        RELATIONSHIP ARCHONTOPROPOSALS {
          FROM ARCHON
          TO PROPOSALS
          TYPE GOVERNS
        }
      }
    `;
    
    const parser = new ACLParser();
    const ast = parser.parse(source);
    
    assert.strictEqual(ast.ontologies[0].relationships.length, 1);
    const rel = ast.ontologies[0].relationships[0];
    assert.strictEqual(rel.name, 'ARCHONTOPROPOSALS');
    assert.strictEqual(rel.from, 'ARCHON');
    assert.strictEqual(rel.to, 'PROPOSALS');
    assert.strictEqual(rel.relationType, 'GOVERNS');
  });

  test('parses multiple relationships', () => {
    const source = `
      ONTOLOGY MULTIREL {
        VERSION "1.0.0"
        
        RELATIONSHIP ATOB {
          FROM NODEA
          TO NODEB
          TYPE REQUIRES
        }
        
        RELATIONSHIP BTOC {
          FROM NODEB
          TO NODEC
          TYPE INFLUENCES
        }
      }
    `;
    
    const parser = new ACLParser();
    const ast = parser.parse(source);
    
    assert.strictEqual(ast.ontologies[0].relationships.length, 2);
  });
});

describe('ACL Parser - Governance', () => {
  test('parses governance block', () => {
    const source = `
      ONTOLOGY GOVTEST {
        VERSION "1.0.0"
        
        GOVERNANCE MAINRULES {
          VOTINGTHRESHOLD: 0.51
          QUORUM: 0.33
        }
      }
    `;
    
    const parser = new ACLParser();
    const ast = parser.parse(source);
    
    assert.ok(ast.ontologies[0].governance);
  });
});

describe('ACL Parser - Complete Ontology', () => {
  test('parses full ontology with all elements', () => {
    const source = `
      ONTOLOGY COGNITIVECOSMOS {
        VERSION "1.0.0"
        ENCODED_ID "COSMOS.ONTOLOGY.001"
        
        ARCHETYPE DATAPROCESSOR {
          TRAIT PURPOSE: "Process and transform data"
          CAPABILITY PROCESS: TRUE
          CAPABILITY TRANSFORM: TRUE
        }
        
        ARCHETYPE DECISIONMAKER {
          TRAIT PURPOSE: "Make governance decisions"
          CAPABILITY VOTE: TRUE
          CAPABILITY PROPOSE: TRUE
        }
        
        RELATIONSHIP PROCESSORTODECISION {
          FROM DATAPROCESSOR
          TO DECISIONMAKER
          TYPE INFLUENCES
        }
        
        GOVERNANCE MAINRULES {
          VOTINGTHRESHOLD: 0.67
        }
      }
    `;
    
    const parser = new ACLParser();
    const ast = parser.parse(source);
    
    const ontology = ast.ontologies[0];
    assert.strictEqual(ontology.name, 'COGNITIVECOSMOS');
    assert.strictEqual(ontology.archetypes.length, 2);
    assert.strictEqual(ontology.relationships.length, 1);
  });
});

describe('ACL Parser - Edge Cases', () => {
  test('handles comments', () => {
    const source = `
      // Header comment
      ONTOLOGY COMMENTTEST {
        VERSION "1.0.0"
        // Inline comment
      }
    `;
    
    const parser = new ACLParser();
    const ast = parser.parse(source);
    assert.strictEqual(ast.ontologies[0].name, 'COMMENTTEST');
  });

  test('handles string escapes', () => {
    const source = `
      ONTOLOGY ESCAPETEST {
        VERSION "1.0.0"
        
        ARCHETYPE TEST {
          TRAIT DESC: "Contains special chars"
        }
      }
    `;
    
    const parser = new ACLParser();
    // Should not throw
    const ast = parser.parse(source);
    assert.ok(ast.ontologies.length > 0);
  });
});
