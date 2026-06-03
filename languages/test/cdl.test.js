/**
 * CDL Parser Tests
 * Cognitive Doctrine Language Parser Tests
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { CDLParser } from '../cdl/src/parser.js';

test('CDL Parser - Basic Doctrine', () => {
  const source = `
    DOCTRINE TEST_DOCTRINE {
      VERSION "1.0.0"
    }
  `;

  const parser = new CDLParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.language, 'CDL');
  assert.strictEqual(ast.doctrines.length, 1);
  assert.strictEqual(ast.doctrines[0].name, 'TEST_DOCTRINE');
  assert.strictEqual(ast.doctrines[0].metadata.version, '1.0.0');
});

test('CDL Parser - Doctrine with Encoded ID', () => {
  const source = `
    DOCTRINE COSMOS_DOCTRINE {
      VERSION "1.0.0"
      ENCODED_ID "CDL.COSMOS.001"
    }
  `;

  const parser = new CDLParser();
  const ast = parser.parse(source);

  const doctrine = ast.doctrines[0];
  assert.strictEqual(doctrine.metadata.encodedId, 'CDL.COSMOS.001');
});

test('CDL Parser - Doctrine with Immutable Flag', () => {
  const source = `
    DOCTRINE IMMUTABLE_DOCTRINE {
      VERSION "1.0.0"
      IMMUTABLE: TRUE
    }
  `;

  const parser = new CDLParser();
  const ast = parser.parse(source);

  const doctrine = ast.doctrines[0];
  assert.strictEqual(doctrine.metadata.immutable, true);
});

test('CDL Parser - Doctrine with Axioms', () => {
  const source = `
    DOCTRINE AXIOM_DOCTRINE {
      VERSION "1.0.0"

      AXIOMS {
        TRUTH: {
          STATEMENT: "Truth is immutable"
          FOUNDATION: TRUE
        }
        JUSTICE: {
          STATEMENT: "Justice prevails"
          FOUNDATION: FALSE
        }
      }
    }
  `;

  const parser = new CDLParser();
  const ast = parser.parse(source);

  const doctrine = ast.doctrines[0];
  assert.strictEqual(doctrine.axioms.length, 2);
  assert.strictEqual(doctrine.axioms[0].name, 'TRUTH');
  assert.strictEqual(doctrine.axioms[0].statement, 'Truth is immutable');
  assert.strictEqual(doctrine.axioms[0].foundation, true);
  assert.strictEqual(doctrine.axioms[1].name, 'JUSTICE');
  assert.strictEqual(doctrine.axioms[1].foundation, false);
});

test('CDL Parser - Doctrine with Principles', () => {
  const source = `
    DOCTRINE PRINCIPLE_DOCTRINE {
      VERSION "1.0.0"

      PRINCIPLES {
        FAIRNESS: {
          DESCRIPTION: "All agents are treated equally"
          PRIORITY: 1
        }
        TRANSPARENCY: {
          DESCRIPTION: "All actions are visible"
          PRIORITY: 2
        }
      }
    }
  `;

  const parser = new CDLParser();
  const ast = parser.parse(source);

  const doctrine = ast.doctrines[0];
  assert.strictEqual(doctrine.principles.length, 2);
  assert.strictEqual(doctrine.principles[0].name, 'FAIRNESS');
  assert.strictEqual(doctrine.principles[0].description, 'All agents are treated equally');
  assert.strictEqual(doctrine.principles[0].priority, 1);
  assert.strictEqual(doctrine.principles[1].name, 'TRANSPARENCY');
  assert.strictEqual(doctrine.principles[1].priority, 2);
});

test('CDL Parser - Doctrine with Values', () => {
  const source = `
    DOCTRINE VALUE_DOCTRINE {
      VERSION "1.0.0"

      VALUES {
        INTEGRITY: {
          WEIGHT: 0.9
          DOMAIN: "governance"
        }
        EFFICIENCY: {
          WEIGHT: 0.7
          DOMAIN: "operations"
        }
      }
    }
  `;

  const parser = new CDLParser();
  const ast = parser.parse(source);

  const doctrine = ast.doctrines[0];
  assert.strictEqual(doctrine.values.length, 2);
  assert.strictEqual(doctrine.values[0].name, 'INTEGRITY');
  assert.strictEqual(doctrine.values[0].weight, 0.9);
  assert.strictEqual(doctrine.values[0].domain, 'governance');
});

test('CDL Parser - Doctrine with Virtues', () => {
  const source = `
    DOCTRINE VIRTUE_DOCTRINE {
      VERSION "1.0.0"

      VIRTUES {
        WISDOM: {
          DEFINITION: "Knowledge applied correctly"
        }
        COURAGE: {
          DEFINITION: "Acting despite fear"
        }
      }
    }
  `;

  const parser = new CDLParser();
  const ast = parser.parse(source);

  const doctrine = ast.doctrines[0];
  assert.strictEqual(doctrine.virtues.length, 2);
  assert.strictEqual(doctrine.virtues[0].name, 'WISDOM');
  assert.strictEqual(doctrine.virtues[0].definition, 'Knowledge applied correctly');
});

test('CDL Parser - Doctrine with Prohibitions', () => {
  const source = `
    DOCTRINE PROHIBIT_DOCTRINE {
      VERSION "1.0.0"

      PROHIBITIONS {
        DECEPTION: {
          SEVERITY: ABSOLUTE
        }
        HARM: {
          SEVERITY: STRONG
        }
      }
    }
  `;

  const parser = new CDLParser();
  const ast = parser.parse(source);

  const doctrine = ast.doctrines[0];
  assert.strictEqual(doctrine.prohibitions.length, 2);
  assert.strictEqual(doctrine.prohibitions[0].name, 'DECEPTION');
  assert.strictEqual(doctrine.prohibitions[0].severity, 'ABSOLUTE');
  assert.strictEqual(doctrine.prohibitions[1].name, 'HARM');
  assert.strictEqual(doctrine.prohibitions[1].severity, 'STRONG');
});

test('CDL Parser - Doctrine with Priorities', () => {
  const source = `
    DOCTRINE PRIORITY_DOCTRINE {
      VERSION "1.0.0"

      PRIORITIES {
        1: FAIRNESS
        2: TRANSPARENCY
        3: EFFICIENCY
      }
    }
  `;

  const parser = new CDLParser();
  const ast = parser.parse(source);

  const doctrine = ast.doctrines[0];
  assert.strictEqual(doctrine.priorities.length, 3);
  assert.deepStrictEqual(doctrine.priorities[0], { level: 1, principle: 'FAIRNESS' });
  assert.deepStrictEqual(doctrine.priorities[1], { level: 2, principle: 'TRANSPARENCY' });
  assert.deepStrictEqual(doctrine.priorities[2], { level: 3, principle: 'EFFICIENCY' });
});

test('CDL Parser - Full Doctrine', () => {
  const source = `
    DOCTRINE COSMOS_ETHICS {
      VERSION "1.0.0"
      ENCODED_ID "CDL.COSMOS.ETHICS"
      IMMUTABLE: TRUE
      INHERITABLE: TRUE

      AXIOMS {
        FOUNDATION: {
          STATEMENT: "Ethics is universal"
          FOUNDATION: TRUE
        }
      }

      PRINCIPLES {
        FAIRNESS: {
          DESCRIPTION: "Equal treatment"
          PRIORITY: 1
        }
      }

      VALUES {
        INTEGRITY: {
          WEIGHT: 1.0
          DOMAIN: "all"
        }
      }

      VIRTUES {
        WISDOM: {
          DEFINITION: "Knowledge applied"
        }
      }

      PROHIBITIONS {
        DECEPTION: {
          SEVERITY: ABSOLUTE
        }
      }

      PRIORITIES {
        1: FAIRNESS
      }
    }
  `;

  const parser = new CDLParser();
  const ast = parser.parse(source);

  const doctrine = ast.doctrines[0];
  assert.strictEqual(doctrine.name, 'COSMOS_ETHICS');
  assert.strictEqual(doctrine.metadata.immutable, true);
  assert.strictEqual(doctrine.metadata.inheritable, true);
  assert.strictEqual(doctrine.axioms.length, 1);
  assert.strictEqual(doctrine.principles.length, 1);
  assert.strictEqual(doctrine.values.length, 1);
  assert.strictEqual(doctrine.virtues.length, 1);
  assert.strictEqual(doctrine.prohibitions.length, 1);
  assert.strictEqual(doctrine.priorities.length, 1);
});

test('CDL Parser - Multiple Doctrines', () => {
  const source = `
    DOCTRINE DOCTRINE_A {
      VERSION "1.0.0"
    }

    DOCTRINE DOCTRINE_B {
      VERSION "2.0.0"
    }
  `;

  const parser = new CDLParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.doctrines.length, 2);
  assert.strictEqual(ast.doctrines[0].name, 'DOCTRINE_A');
  assert.strictEqual(ast.doctrines[1].name, 'DOCTRINE_B');
});

test('CDL Parser - Comments', () => {
  const source = `
    // Doctrine comment
    DOCTRINE COMMENTED {
      VERSION "1.0.0"
      // Inner comment
    }
  `;

  const parser = new CDLParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.doctrines.length, 1);
});

test('CDL Parser - Empty Program', () => {
  const source = ``;

  const parser = new CDLParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.doctrines.length, 0);
});
