import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { RuleEngine } from '../src/rule-engine.js';
import { SchemaValidator } from '../src/schema-validator.js';
import { FieldValidator } from '../src/field-validator.js';
import { CompositeValidator } from '../src/composite-validator.js';
import { ValidatorPlugin } from '../src/validator-plugin.js';

describe('RuleEngine', () => {
  let re; beforeEach(() => { re = new RuleEngine(); });
  test('should add rule', () => { const r = re.addRule('hasName', d => !!d.name); assert.strictEqual(r.ruleCount, 1); });
  test('should validate passing', () => { re.addRule('hasName', d => !!d.name); const r = re.validate({ name: 'test' }); assert.strictEqual(r.valid, true); });
  test('should validate failing', () => { re.addRule('hasName', d => !!d.name); const r = re.validate({}); assert.strictEqual(r.valid, false); });
  test('should track confidence', () => { re.addRule('a', () => true); re.addRule('b', () => false); const r = re.validate({}); assert.ok(r.confidence > 0 && r.confidence < 1); });
});
describe('SchemaValidator', () => {
  let sv; beforeEach(() => { sv = new SchemaValidator(); sv.register('user', { name: { required: true, type: 'string' }, age: { type: 'number', min: 0 } }); });
  test('should validate valid data', () => { const r = sv.validate('user', { name: 'Alice', age: 30 }); assert.strictEqual(r.valid, true); });
  test('should catch missing required', () => { const r = sv.validate('user', { age: 30 }); assert.strictEqual(r.valid, false); });
  test('should catch type mismatch', () => { const r = sv.validate('user', { name: 123, age: 30 }); assert.strictEqual(r.valid, false); });
  test('should throw on missing schema', () => { assert.throws(() => sv.validate('x', {}), /not found/); });
});
describe('FieldValidator', () => {
  let fv; beforeEach(() => { fv = new FieldValidator(); fv.register('email', v => typeof v === 'string' && v.includes('@')); });
  test('should validate field', () => { const r = fv.validate('email', 'a@b.c'); assert.strictEqual(r.valid, true); });
  test('should reject invalid', () => { const r = fv.validate('email', 'bad'); assert.strictEqual(r.valid, false); });
  test('should validate all', () => { fv.register('age', v => v >= 0); const r = fv.validateAll({ email: 'a@b', age: 5 }); assert.strictEqual(r.allValid, true); });
});
describe('CompositeValidator', () => {
  let cv; beforeEach(() => { cv = new CompositeValidator(); });
  test('should add validator', () => { const r = cv.add('notEmpty', d => Object.keys(d).length > 0); assert.strictEqual(r.position, 0); });
  test('should validate composite', () => { cv.add('hasX', d => !!d.x); cv.add('hasY', d => !!d.y); const r = cv.validate({ x: 1, y: 2 }); assert.strictEqual(r.valid, true); });
  test('should detect failures', () => { cv.add('fail', () => false); const r = cv.validate({}); assert.strictEqual(r.valid, false); });
});
describe('ValidatorPlugin', () => {
  let vp; beforeEach(() => { vp = new ValidatorPlugin(); });
  test('should validate with rules', () => { const r = vp.validate({ x: 1 }, [d => d.x > 0]); assert.strictEqual(r.valid, true); });
  test('should detect failure', () => { const r = vp.validate({ x: -1 }, [d => d.x > 0 || 'x must be positive']); assert.strictEqual(r.valid, false); });
  test('should throw in strict mode', () => { const sp = new ValidatorPlugin({ strict: true }); assert.throws(() => sp.validate({}, [() => 'fail']), /fail/); });
});
