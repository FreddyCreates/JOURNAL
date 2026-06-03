/**
 * CPL-L Parser Tests
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { CPLLParser } from '../src/parser.js';

test('CPL-L Parser - Basic Law', () => {
  const source = `
    LAW TEST_LAW {
      VERSION "1.0.0"
      ENCODED_ID "TEST.LAW"
    }
  `;

  const parser = new CPLLParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.laws.length, 1);
  assert.strictEqual(ast.laws[0].name, 'TEST_LAW');
  assert.strictEqual(ast.laws[0].metadata.version, '1.0.0');
  assert.strictEqual(ast.laws[0].metadata.encodedId, 'TEST.LAW');
});

test('CPL-L Parser - Law with Rule', () => {
  const source = `
    LAW TEST_LAW {
      VERSION "1.0.0"

      RULE TEST_RULE {
        IMMUTABLE: TRUE
        ENFORCEMENT: COMPILE_TIME
      }
    }
  `;

  const parser = new CPLLParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.laws[0].rules.length, 1);
  assert.strictEqual(ast.laws[0].rules[0].name, 'TEST_RULE');
  assert.strictEqual(ast.laws[0].rules[0].enforcement, 'COMPILE_TIME');
  assert.strictEqual(ast.laws[0].rules[0].properties.IMMUTABLE.value, true);
});

test('CPL-L Parser - REQUIRES Constraint', () => {
  const source = `
    LAW TEST_LAW {
      VERSION "1.0.0"

      RULE TEST_RULE {
        ENFORCEMENT: RUNTIME
        REQUIRES terminal_initialized == TRUE
      }
    }
  `;

  const parser = new CPLLParser();
  const ast = parser.parse(source);

  const rule = ast.laws[0].rules[0];
  assert.strictEqual(rule.constraints.length, 1);
  assert.strictEqual(rule.constraints[0].type, 'REQUIRES');
  assert.strictEqual(rule.constraints[0].expression.type, 'BinaryOp');
});

test('CPL-L Parser - PERMITS with IF', () => {
  const source = `
    LAW TEST_LAW {
      VERSION "1.0.0"

      RULE TEST_RULE {
        PERMITS organism.vote
        IF organism.registered == TRUE
        ENFORCEMENT: RUNTIME
      }
    }
  `;

  const parser = new CPLLParser();
  const ast = parser.parse(source);

  const rule = ast.laws[0].rules[0];
  assert.strictEqual(rule.constraints[0].type, 'PERMITS');
  assert(rule.constraints[0].condition);
  assert.strictEqual(rule.constraints[0].conditionType, 'IF');
});

test('CPL-L Parser - FORBIDS', () => {
  const source = `
    LAW TEST_LAW {
      VERSION "1.0.0"

      RULE TEST_RULE {
        FORBIDS modify_terminal
        ENFORCEMENT: RUNTIME
      }
    }
  `;

  const parser = new CPLLParser();
  const ast = parser.parse(source);

  const rule = ast.laws[0].rules[0];
  assert.strictEqual(rule.constraints[0].type, 'FORBIDS');
});

test('CPL-L Parser - Clause with Amendment', () => {
  const source = `
    LAW TEST_LAW {
      VERSION "1.0.0"

      CLAUSE RATIONALE {
        """
        This is the rationale.
        """

        AMENDMENT UPDATE_2026 {
          """
          Amendment text.
          """
        }
      }
    }
  `;

  const parser = new CPLLParser();
  const ast = parser.parse(source);

  const clause = ast.laws[0].clauses[0];
  assert.strictEqual(clause.name, 'RATIONALE');
  assert(clause.text.includes('rationale'));
  assert.strictEqual(clause.amendments.length, 1);
  assert.strictEqual(clause.amendments[0].name, 'UPDATE_2026');
});

test('CPL-L Parser - Complex Expression', () => {
  const source = `
    LAW TEST_LAW {
      VERSION "1.0.0"

      RULE TEST_RULE {
        REQUIRES (user.age >= 18 AND user.verified == TRUE) OR user.admin == TRUE
        ENFORCEMENT: RUNTIME
      }
    }
  `;

  const parser = new CPLLParser();
  const ast = parser.parse(source);

  const expr = ast.laws[0].rules[0].constraints[0].expression;
  assert.strictEqual(expr.type, 'BinaryOp');
  assert.strictEqual(expr.op, 'OR');
});

test('CPL-L Parser - Multiple Laws', () => {
  const source = `
    LAW FIRST_LAW {
      VERSION "1.0.0"
    }

    LAW SECOND_LAW {
      VERSION "2.0.0"
    }
  `;

  const parser = new CPLLParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.laws.length, 2);
  assert.strictEqual(ast.laws[0].name, 'FIRST_LAW');
  assert.strictEqual(ast.laws[1].name, 'SECOND_LAW');
});
