import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { TraceCollector } from '../src/trace-collector.js';
import { SpanRecorder } from '../src/span-recorder.js';
import { MetricExporter } from '../src/metric-exporter.js';
import { ContextPropagator } from '../src/context-propagator.js';
import { TelemetryPlugin } from '../src/telemetry-plugin.js';

describe('TraceCollector', () => {
  let tc; beforeEach(() => { tc = new TraceCollector(); });
  test('should start trace', () => { const r = tc.startTrace('req'); assert.ok(r.traceId); });
  test('should end trace', () => { const t = tc.startTrace('r'); const r = tc.endTrace(t.traceId); assert.ok(r.duration >= 0); });
  test('should add span', () => { const t = tc.startTrace('r'); const s = tc.addSpan(t.traceId, 'db-query'); assert.ok(s.spanId); });
  test('should throw on missing trace', () => { assert.throws(() => tc.endTrace('x'), /not found/); });
});
describe('SpanRecorder', () => {
  let sr; beforeEach(() => { sr = new SpanRecorder(); });
  test('should start span', () => { const r = sr.start('http-req'); assert.ok(r.spanId); });
  test('should end span', () => { const s = sr.start('op'); const r = sr.end(s.spanId); assert.ok(r.duration >= 0); });
  test('should set attribute', () => { const s = sr.start('op'); const r = sr.setAttribute(s.spanId, 'method', 'GET'); assert.strictEqual(r.value, 'GET'); });
  test('should throw on missing span', () => { assert.throws(() => sr.end('x'), /not found/); });
});
describe('MetricExporter', () => {
  let me; beforeEach(() => { me = new MetricExporter({ batchSize: 3 }); });
  test('should buffer metric', () => { const r = me.record('cpu', 0.5); assert.strictEqual(r.buffered, 1); });
  test('should auto flush', () => { me.record('a', 1); me.record('b', 2); const r = me.record('c', 3); assert.strictEqual(r.exported, 3); });
  test('should manual flush', () => { me.record('x', 1); const r = me.flush(); assert.strictEqual(r.exported, 1); });
});
describe('ContextPropagator', () => {
  let cp; beforeEach(() => { cp = new ContextPropagator(); });
  test('should inject context', () => { const carrier = {}; cp.inject(carrier, { traceId: '123' }); assert.ok(carrier['x-trace-context']); });
  test('should extract context', () => { const carrier = {}; cp.inject(carrier, { traceId: 'abc' }); const r = cp.extract(carrier); assert.strictEqual(r.context.traceId, 'abc'); });
  test('should handle missing context', () => { const r = cp.extract({}); assert.strictEqual(r.extracted, false); });
});
describe('TelemetryPlugin', () => {
  let tp; beforeEach(() => { tp = new TelemetryPlugin(); });
  test('should register hook', () => { const r = tp.registerHook('request', () => {}); assert.strictEqual(r.hookCount, 1); });
  test('should emit event', () => { let called = false; tp.registerHook('e', () => { called = true; }); tp.emit('e'); assert.strictEqual(called, true); });
  test('should track events', () => { tp.registerHook('x', () => {}); tp.emit('x'); assert.strictEqual(tp.getEvents().length, 1); });
});
