import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DataMapper } from '../src/data-mapper.js';
import { SchemaConverter } from '../src/schema-converter.js';
import { PipelineComposer } from '../src/pipeline-composer.js';
import { TypeCoercer } from '../src/type-coercer.js';
import { TransformerPlugin } from '../src/transformer-plugin.js';

describe('DataMapper', () => {
  let dm; beforeEach(() => { dm = new DataMapper(); });
  test('should define mapping', () => { const r = dm.define('name', 'fullName'); assert.strictEqual(r.mappingCount, 1); });
  test('should map data', () => { dm.define('user.name', 'displayName'); const r = dm.map({ user: { name: 'Alice' } }); assert.strictEqual(r.result.displayName, 'Alice'); });
  test('should apply transform', () => { dm.define('x', 'y', v => v * 2); const r = dm.map({ x: 5 }); assert.strictEqual(r.result.y, 10); });
  test('should clear', () => { dm.define('a', 'b'); dm.clear(); assert.strictEqual(dm.getMappings().length, 0); });
});
describe('SchemaConverter', () => {
  let sc; beforeEach(() => { sc = new SchemaConverter(); });
  test('should register converter', () => { const r = sc.register('json', 'csv', d => d); assert.strictEqual(r.from, 'json'); });
  test('should convert', () => { sc.register('a', 'b', d => ({ ...d, converted: true })); const r = sc.convert('a', 'b', { x: 1 }); assert.strictEqual(r.result.converted, true); });
  test('should throw on missing converter', () => { assert.throws(() => sc.convert('x', 'y', {}), /No converter/); });
});
describe('PipelineComposer', () => {
  let pc; beforeEach(() => { pc = new PipelineComposer(); });
  test('should add step', () => { const r = pc.add('double', x => x * 2); assert.strictEqual(r.position, 0); });
  test('should compose pipeline', () => { pc.add('double', x => x * 2); pc.add('add1', x => x + 1); const pipeline = pc.compose(); const r = pipeline(5); assert.strictEqual(r.result, 11); });
  test('should clear', () => { pc.add('a', x => x); pc.clear(); assert.strictEqual(pc.getSteps().length, 0); });
});
describe('TypeCoercer', () => {
  let tc; beforeEach(() => { tc = new TypeCoercer(); tc.addRule('number', v => Number(v)); tc.addRule('string', v => String(v)); });
  test('should coerce to number', () => { const r = tc.coerce('42', 'number'); assert.strictEqual(r.coerced, 42); });
  test('should coerce to string', () => { const r = tc.coerce(123, 'string'); assert.strictEqual(r.coerced, '123'); });
  test('should throw on missing rule', () => { assert.throws(() => tc.coerce(1, 'unknown'), /No coercion rule/); });
});
describe('TransformerPlugin', () => {
  let tp; beforeEach(() => { tp = new TransformerPlugin(); });
  test('should register', () => { const r = tp.register('upper', s => s.toUpperCase()); assert.strictEqual(r.registered, true); });
  test('should transform', () => { tp.register('upper', s => s.toUpperCase()); const r = tp.transform('upper', 'hello'); assert.strictEqual(r.result, 'HELLO'); });
  test('should throw on missing', () => { assert.throws(() => tp.transform('x', ''), /not found/); });
});
