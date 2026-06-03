/**
 * CPL-P Parser Tests
 * Cognitive Processing Language Parser Tests
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { CPLPParser } from '../cpl-p/src/parser.js';

test('CPL-P Parser - Basic Pipeline', () => {
  const source = `
    PIPELINE TEST_PIPELINE {
      VERSION "1.0.0"
    }
  `;

  const parser = new CPLPParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.language, 'CPL-P');
  assert.strictEqual(ast.pipelines.length, 1);
  assert.strictEqual(ast.pipelines[0].name, 'TEST_PIPELINE');
  assert.strictEqual(ast.pipelines[0].metadata.version, '1.0.0');
});

test('CPL-P Parser - Pipeline with Metadata', () => {
  const source = `
    PIPELINE FULL_META {
      VERSION "1.0.0"
      ENCODED_ID "CPL-P.PIPELINE.001"
      DETERMINISTIC: TRUE
      IDEMPOTENT: TRUE
    }
  `;

  const parser = new CPLPParser();
  const ast = parser.parse(source);

  const pipeline = ast.pipelines[0];
  assert.strictEqual(pipeline.metadata.version, '1.0.0');
  assert.strictEqual(pipeline.metadata.encodedId, 'CPL-P.PIPELINE.001');
  assert.strictEqual(pipeline.metadata.deterministic, true);
  assert.strictEqual(pipeline.metadata.idempotent, true);
});

test('CPL-P Parser - Pipeline with Input', () => {
  const source = `
    PIPELINE INPUT_PIPELINE {
      VERSION "1.0.0"

      INPUT {
        REQUIRED: id, name
      }
    }
  `;

  const parser = new CPLPParser();
  const ast = parser.parse(source);

  const pipeline = ast.pipelines[0];
  assert.deepStrictEqual(pipeline.input.required, ['id', 'name']);
});

test('CPL-P Parser - Pipeline with Output', () => {
  const source = `
    PIPELINE OUTPUT_PIPELINE {
      VERSION "1.0.0"

      OUTPUT {
        DESTINATION: "results"
        FORMAT: "json"
      }
    }
  `;

  const parser = new CPLPParser();
  const ast = parser.parse(source);

  const pipeline = ast.pipelines[0];
  assert.strictEqual(pipeline.output.destination, 'results');
  assert.strictEqual(pipeline.output.format, 'json');
});

test('CPL-P Parser - Pipeline with Stages', () => {
  const source = `
    PIPELINE STAGED_PIPELINE {
      VERSION "1.0.0"

      STAGES {
        VALIDATE: {
          TYPE: VALIDATE
        }
        TRANSFORM: {
          TYPE: MAP
        }
        AGGREGATE: {
          TYPE: REDUCE
        }
      }
    }
  `;

  const parser = new CPLPParser();
  const ast = parser.parse(source);

  const pipeline = ast.pipelines[0];
  assert.strictEqual(pipeline.stages.length, 3);
  assert.strictEqual(pipeline.stages[0].name, 'VALIDATE');
  assert.strictEqual(pipeline.stages[0].type, 'VALIDATE');
  assert.strictEqual(pipeline.stages[1].name, 'TRANSFORM');
  assert.strictEqual(pipeline.stages[1].type, 'MAP');
  assert.strictEqual(pipeline.stages[2].name, 'AGGREGATE');
  assert.strictEqual(pipeline.stages[2].type, 'REDUCE');
});

test('CPL-P Parser - Stage with Timeout', () => {
  const source = `
    PIPELINE TIMEOUT_PIPELINE {
      VERSION "1.0.0"

      STAGES {
        SLOW_STAGE: {
          TYPE: VALIDATE
          TIMEOUT: 30000
        }
      }
    }
  `;

  const parser = new CPLPParser();
  const ast = parser.parse(source);

  const stage = ast.pipelines[0].stages[0];
  assert.strictEqual(stage.timeout, 30000);
});

test('CPL-P Parser - Stage with Retry Policy', () => {
  const source = `
    PIPELINE RETRY_PIPELINE {
      VERSION "1.0.0"

      STAGES {
        RETRY_STAGE: {
          TYPE: VALIDATE
          RETRY: {
            MAX_ATTEMPTS: 5
            BACKOFF: EXPONENTIAL
          }
        }
      }
    }
  `;

  const parser = new CPLPParser();
  const ast = parser.parse(source);

  const stage = ast.pipelines[0].stages[0];
  assert.strictEqual(stage.retry.maxAttempts, 5);
  assert.strictEqual(stage.retry.backoff, 'EXPONENTIAL');
});

test('CPL-P Parser - Pipeline with Error Handlers', () => {
  const source = `
    PIPELINE ERROR_PIPELINE {
      VERSION "1.0.0"

      ON_ERROR {
        VALIDATION_ERROR: {
          log_error
        }
        TIMEOUT_ERROR: {
          retry_operation
        }
      }
    }
  `;

  const parser = new CPLPParser();
  const ast = parser.parse(source);

  const pipeline = ast.pipelines[0];
  assert.strictEqual(pipeline.errorHandlers.length, 2);
  assert.strictEqual(pipeline.errorHandlers[0].errorType, 'VALIDATION_ERROR');
  assert.strictEqual(pipeline.errorHandlers[1].errorType, 'TIMEOUT_ERROR');
});

test('CPL-P Parser - Full Pipeline', () => {
  const source = `
    PIPELINE DATA_PROCESSOR {
      VERSION "2.0.0"
      ENCODED_ID "CPL-P.DATA.PROCESSOR"
      DETERMINISTIC: TRUE
      IDEMPOTENT: FALSE

      INPUT {
        REQUIRED: data, config
      }

      STAGES {
        VALIDATE_INPUT: {
          TYPE: VALIDATE
        }
        TRANSFORM_DATA: {
          TYPE: MAP
          PARALLEL: TRUE
        }
        AGGREGATE_RESULTS: {
          TYPE: REDUCE
          TIMEOUT: 60000
        }
      }

      OUTPUT {
        DESTINATION: "processed"
        FORMAT: "json"
      }

      ON_ERROR {
        GENERAL_ERROR: {
          rollback
        }
      }
    }
  `;

  const parser = new CPLPParser();
  const ast = parser.parse(source);

  const pipeline = ast.pipelines[0];
  assert.strictEqual(pipeline.name, 'DATA_PROCESSOR');
  assert.strictEqual(pipeline.metadata.deterministic, true);
  assert.strictEqual(pipeline.metadata.idempotent, false);
  assert.deepStrictEqual(pipeline.input.required, ['data', 'config']);
  assert.strictEqual(pipeline.stages.length, 3);
  assert.strictEqual(pipeline.output.destination, 'processed');
  assert.strictEqual(pipeline.errorHandlers.length, 1);
});

test('CPL-P Parser - Multiple Pipelines', () => {
  const source = `
    PIPELINE PIPELINE_A {
      VERSION "1.0.0"
    }

    PIPELINE PIPELINE_B {
      VERSION "2.0.0"
    }
  `;

  const parser = new CPLPParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.pipelines.length, 2);
  assert.strictEqual(ast.pipelines[0].name, 'PIPELINE_A');
  assert.strictEqual(ast.pipelines[1].name, 'PIPELINE_B');
});

test('CPL-P Parser - Comments', () => {
  const source = `
    // Pipeline comment
    PIPELINE COMMENTED {
      VERSION "1.0.0"
      // Inner comment
    }
  `;

  const parser = new CPLPParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.pipelines.length, 1);
});

test('CPL-P Parser - Empty Program', () => {
  const source = ``;

  const parser = new CPLPParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.pipelines.length, 0);
});
