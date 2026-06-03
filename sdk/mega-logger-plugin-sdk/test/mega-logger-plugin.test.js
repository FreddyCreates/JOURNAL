import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { StructuredLogger } from '../src/structured-logger.js';
import { LogAggregator } from '../src/log-aggregator.js';
import { TransportManager } from '../src/transport-manager.js';
import { LogFilter } from '../src/log-filter.js';
import { LoggerPlugin } from '../src/logger-plugin.js';

describe('StructuredLogger', () => {
  let logger; beforeEach(() => { logger = new StructuredLogger(); });
  test('should log info', () => { const r = logger.info('hello'); assert.strictEqual(r.level, 'info'); });
  test('should skip below level', () => { const r = logger.debug('skip'); assert.strictEqual(r, null); });
  test('should log error', () => { const r = logger.error('fail', { code: 500 }); assert.strictEqual(r.meta.code, 500); });
  test('should throw on invalid level', () => { assert.throws(() => logger.log('bad', 'x'), /Invalid log level/); });
  test('should clear', () => { logger.info('x'); logger.clear(); assert.strictEqual(logger.getLogs().length, 0); });
});
describe('LogAggregator', () => {
  let agg; beforeEach(() => { agg = new LogAggregator(); });
  test('should add log', () => { const r = agg.add({ level: 'info', message: 'hi' }); assert.strictEqual(r.count, 1); });
  test('should get summary', () => { agg.add({ level: 'error' }); agg.add({ level: 'error' }); const s = agg.getSummary(); assert.strictEqual(s.error.count, 2); });
  test('should get by level', () => { agg.add({ level: 'warn', msg: 'x' }); assert.strictEqual(agg.getByLevel('warn').length, 1); });
  test('should get total', () => { agg.add({ level: 'info' }); agg.add({ level: 'warn' }); assert.strictEqual(agg.getTotal(), 2); });
});
describe('TransportManager', () => {
  let tm; beforeEach(() => { tm = new TransportManager(); });
  test('should register transport', () => { const r = tm.register('console', () => {}); assert.strictEqual(r.registered, true); });
  test('should send to transports', () => { let received = false; tm.register('t', () => { received = true; }); tm.send({ level: 'info' }); assert.strictEqual(received, true); });
  test('should disable transport', () => { tm.register('t', () => {}); tm.disable('t'); const r = tm.send({}); assert.strictEqual(r.delivered, 0); });
});
describe('LogFilter', () => {
  let lf; beforeEach(() => { lf = new LogFilter({ minLevel: 'warn' }); });
  test('should pass above min level', () => { const r = lf.filter({ level: 'error', message: '' }); assert.strictEqual(r.passed, true); });
  test('should filter below min level', () => { const r = lf.filter({ level: 'debug', message: '' }); assert.strictEqual(r.passed, false); });
  test('should filter by pattern', () => { lf.addPattern('secret'); const r = lf.filter({ level: 'error', message: 'contains secret data' }); assert.strictEqual(r.passed, false); });
});
describe('LoggerPlugin', () => {
  let lp; beforeEach(() => { lp = new LoggerPlugin(); });
  test('should add interceptor', () => { const r = lp.addInterceptor(l => l); assert.strictEqual(r.interceptorCount, 1); });
  test('should process log', () => { lp.addInterceptor(l => ({ ...l, enriched: true })); const r = lp.process({ level: 'info' }); assert.strictEqual(r.enriched, true); });
  test('should count logs', () => { lp.process({}); lp.process({}); assert.strictEqual(lp.getLogCount(), 2); });
});
