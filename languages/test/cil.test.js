/**
 * CIL Parser Tests
 * Cognitive Internal Language Parser Tests
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { CILParser } from '../cil/src/parser.js';

test('CIL Parser - Basic Cognitive Space', () => {
  const source = `
    COGNITIVE_SPACE TEST_SPACE {
      VERSION "1.0.0"
    }
  `;

  const parser = new CILParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.language, 'CIL');
  assert.strictEqual(ast.cognitiveSpaces.length, 1);
  assert.strictEqual(ast.cognitiveSpaces[0].name, 'TEST_SPACE');
  assert.strictEqual(ast.cognitiveSpaces[0].metadata.version, '1.0.0');
});

test('CIL Parser - Space with Topology', () => {
  const source = `
    COGNITIVE_SPACE EUCLIDEAN_SPACE {
      VERSION "1.0.0"
      TOPOLOGY: EUCLIDEAN
      DIMENSIONALITY: 3
    }
  `;

  const parser = new CILParser();
  const ast = parser.parse(source);

  const space = ast.cognitiveSpaces[0];
  assert.strictEqual(space.metadata.topology, 'EUCLIDEAN');
  assert.strictEqual(space.metadata.dimensionality, 3);
});

test('CIL Parser - Space with Dimensions', () => {
  const source = `
    COGNITIVE_SPACE DIM_SPACE {
      VERSION "1.0.0"

      DIMENSIONS {
        X_AXIS: {
          TYPE: CONTINUOUS
        }
        Y_AXIS: {
          TYPE: CONTINUOUS
        }
        TIME: {
          TYPE: TEMPORAL
        }
      }
    }
  `;

  const parser = new CILParser();
  const ast = parser.parse(source);

  const space = ast.cognitiveSpaces[0];
  assert.strictEqual(space.dimensions.length, 3);
  assert.strictEqual(space.dimensions[0].name, 'X_AXIS');
  assert.strictEqual(space.dimensions[0].type, 'CONTINUOUS');
  assert.strictEqual(space.dimensions[2].name, 'TIME');
  assert.strictEqual(space.dimensions[2].type, 'TEMPORAL');
});

test('CIL Parser - Space with Concepts', () => {
  const source = `
    COGNITIVE_SPACE CONCEPT_SPACE {
      VERSION "1.0.0"

      CONCEPTS {
        THOUGHT: {
          COORDINATES: [0.5, 0.3, 0.2]
          ACTIVATION: 0.8
          DECAY_RATE: 0.1
        }
        IDEA: {
          COORDINATES: [0.1, 0.9, 0.4]
          ACTIVATION: 0.5
        }
      }
    }
  `;

  const parser = new CILParser();
  const ast = parser.parse(source);

  const space = ast.cognitiveSpaces[0];
  assert.strictEqual(space.concepts.length, 2);
  assert.strictEqual(space.concepts[0].name, 'THOUGHT');
  assert.deepStrictEqual(space.concepts[0].coordinates, [0.5, 0.3, 0.2]);
  assert.strictEqual(space.concepts[0].activation, 0.8);
  assert.strictEqual(space.concepts[0].decayRate, 0.1);
});

test('CIL Parser - Space with Relations', () => {
  const source = `
    COGNITIVE_SPACE RELATION_SPACE {
      VERSION "1.0.0"

      RELATIONS {
        CONCEPT_A -> CONCEPT_B: {
          TYPE: IS_A
          STRENGTH: 0.9
          BIDIRECTIONAL: FALSE
        }
        CONCEPT_B -> CONCEPT_C: {
          TYPE: CAUSES
          STRENGTH: 0.7
          TRANSITIVE: TRUE
        }
      }
    }
  `;

  const parser = new CILParser();
  const ast = parser.parse(source);

  const space = ast.cognitiveSpaces[0];
  assert.strictEqual(space.relations.length, 2);
  
  const rel1 = space.relations[0];
  assert.strictEqual(rel1.from, 'CONCEPT_A');
  assert.strictEqual(rel1.to, 'CONCEPT_B');
  assert.strictEqual(rel1.type, 'IS_A');
  assert.strictEqual(rel1.strength, 0.9);
  assert.strictEqual(rel1.bidirectional, false);
  
  const rel2 = space.relations[1];
  assert.strictEqual(rel2.type, 'CAUSES');
  assert.strictEqual(rel2.transitive, true);
});

test('CIL Parser - Space with Operations', () => {
  const source = `
    COGNITIVE_SPACE OP_SPACE {
      VERSION "1.0.0"

      OPERATIONS {
        ACTIVATE_CONCEPT: {
          FUNCTION: ACTIVATE
        }
        SPREAD_ACTIVATION: {
          FUNCTION: PROPAGATE
        }
      }
    }
  `;

  const parser = new CILParser();
  const ast = parser.parse(source);

  const space = ast.cognitiveSpaces[0];
  assert.strictEqual(space.operations.length, 2);
  assert.strictEqual(space.operations[0].name, 'ACTIVATE_CONCEPT');
  assert.strictEqual(space.operations[0].function, 'ACTIVATE');
  assert.strictEqual(space.operations[1].name, 'SPREAD_ACTIVATION');
  assert.strictEqual(space.operations[1].function, 'PROPAGATE');
});

test('CIL Parser - Full Cognitive Space', () => {
  const source = `
    COGNITIVE_SPACE MIND_MODEL {
      VERSION "1.0.0"
      ENCODED_ID "CIL.MIND.MODEL"
      TOPOLOGY: HYPERBOLIC
      DIMENSIONALITY: 128

      DIMENSIONS {
        SEMANTIC: {
          TYPE: CONTINUOUS
        }
        EMOTIONAL: {
          TYPE: CONTINUOUS
        }
      }

      CONCEPTS {
        KNOWLEDGE: {
          COORDINATES: [0.5, 0.5]
          ACTIVATION: 1.0
        }
      }

      RELATIONS {
        KNOWLEDGE -> UNDERSTANDING: {
          TYPE: IMPLIES
          STRENGTH: 0.95
        }
      }

      OPERATIONS {
        REASON: {
          FUNCTION: REASON
        }
      }
    }
  `;

  const parser = new CILParser();
  const ast = parser.parse(source);

  const space = ast.cognitiveSpaces[0];
  assert.strictEqual(space.name, 'MIND_MODEL');
  assert.strictEqual(space.metadata.topology, 'HYPERBOLIC');
  assert.strictEqual(space.metadata.dimensionality, 128);
  assert.strictEqual(space.dimensions.length, 2);
  assert.strictEqual(space.concepts.length, 1);
  assert.strictEqual(space.relations.length, 1);
  assert.strictEqual(space.operations.length, 1);
});

test('CIL Parser - Multiple Spaces', () => {
  const source = `
    COGNITIVE_SPACE SPACE_A {
      VERSION "1.0.0"
    }

    COGNITIVE_SPACE SPACE_B {
      VERSION "2.0.0"
    }
  `;

  const parser = new CILParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.cognitiveSpaces.length, 2);
  assert.strictEqual(ast.cognitiveSpaces[0].name, 'SPACE_A');
  assert.strictEqual(ast.cognitiveSpaces[1].name, 'SPACE_B');
});

test('CIL Parser - Concept with Embedding', () => {
  const source = `
    COGNITIVE_SPACE EMBED_SPACE {
      VERSION "1.0.0"

      CONCEPTS {
        WORD: {
          EMBEDDING: [0.1, 0.2, 0.3, 0.4]
        }
      }
    }
  `;

  const parser = new CILParser();
  const ast = parser.parse(source);

  const space = ast.cognitiveSpaces[0];
  assert.deepStrictEqual(space.concepts[0].embedding, [0.1, 0.2, 0.3, 0.4]);
});

test('CIL Parser - Comments', () => {
  const source = `
    // Space comment
    COGNITIVE_SPACE COMMENTED {
      VERSION "1.0.0"
      // Inner comment
    }
  `;

  const parser = new CILParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.cognitiveSpaces.length, 1);
});

test('CIL Parser - Empty Program', () => {
  const source = ``;

  const parser = new CILParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.cognitiveSpaces.length, 0);
});
