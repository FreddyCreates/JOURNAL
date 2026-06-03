import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AnalyticsPipeline } from '../src/analytics-pipeline.js';
import { MetricsAggregator } from '../src/metrics-aggregator.js';
import { InsightEngine } from '../src/insight-engine.js';
import { DimensionRouter } from '../src/dimension-router.js';
import { TrendDetector } from '../src/trend-detector.js';

const PHI = 1.618033988749895;

describe('AnalyticsPipeline', () => {
  let pipeline;
  beforeEach(() => { pipeline = new AnalyticsPipeline(); });

  test('should add a stage', () => {
    const r = pipeline.addStage('double', d => ({ ...d, value: (d.value ?? 0) * 2 }));
    assert.ok(r.stageId);
    assert.strictEqual(r.name, 'double');
  });

  test('should throw on max stages', () => {
    const p = new AnalyticsPipeline({ maxStages: 1 });
    p.addStage('a', d => d);
    assert.throws(() => p.addStage('b', d => d), /Max stages/);
  });

  test('should ingest event', () => {
    const r = pipeline.ingest({ type: 'click', value: 1 });
    assert.ok(r.eventId);
    assert.strictEqual(r.type, 'click');
  });

  test('should throw on invalid event', () => {
    assert.throws(() => pipeline.ingest(null), /Event must be an object/);
  });

  test('should process events through stages', () => {
    pipeline.addStage('enrich', d => ({ ...d, enriched: true }));
    pipeline.ingest({ value: 42 });
    const r = pipeline.process();
    assert.strictEqual(r.processed, 1);
    assert.strictEqual(r.results[0].data.enriched, true);
  });

  test('should track phi score', () => {
    pipeline.addStage('a', d => d);
    pipeline.ingest({ x: 1 });
    const r = pipeline.process();
    assert.ok(r.results[0].phiScore > 0);
    assert.ok(r.results[0].phiScore <= 1);
  });

  test('should flush results', () => {
    pipeline.ingest({ x: 1 });
    pipeline.flush();
    assert.strictEqual(pipeline.getResults().length, 0);
  });
});

describe('MetricsAggregator', () => {
  let agg;
  beforeEach(() => { agg = new MetricsAggregator(); });

  test('should record a metric', () => {
    const r = agg.record('latency', 42);
    assert.strictEqual(r.name, 'latency');
    assert.strictEqual(r.recorded, true);
  });

  test('should throw on empty name', () => {
    assert.throws(() => agg.record('', 1), /Metric name required/);
  });

  test('should throw on non-number value', () => {
    assert.throws(() => agg.record('x', 'bad'), /Value must be a number/);
  });

  test('should aggregate metrics', () => {
    agg.record('cpu', 10); agg.record('cpu', 20); agg.record('cpu', 30);
    const r = agg.aggregate('cpu');
    assert.strictEqual(r.count, 3);
    assert.strictEqual(r.avg, 20);
    assert.strictEqual(r.min, 10);
    assert.strictEqual(r.max, 30);
  });

  test('should throw on missing metric', () => {
    assert.throws(() => agg.aggregate('missing'), /No data/);
  });

  test('should take snapshot', () => {
    agg.record('mem', 100);
    const s = agg.snapshot();
    assert.ok(s.snapshotId);
    assert.ok(s.metrics.mem);
  });

  test('should reset', () => {
    agg.record('x', 1);
    agg.reset();
    assert.strictEqual(agg.getMetricNames().length, 0);
  });
});

describe('InsightEngine', () => {
  let engine;
  beforeEach(() => { engine = new InsightEngine(); });

  test('should detect pattern', () => {
    const r = engine.detectPattern([1, 2, 3, 4, 5]);
    assert.strictEqual(r.trend, 'increasing');
    assert.ok(r.confidence > 0);
  });

  test('should throw on insufficient points', () => {
    assert.throws(() => engine.detectPattern([1]), /Need at least 2/);
  });

  test('should generate insight', () => {
    const p = engine.detectPattern([10, 8, 6, 4]);
    const i = engine.generateInsight(p, 'test context');
    assert.ok(i.insightId);
    assert.strictEqual(i.trend, 'decreasing');
  });

  test('should filter insights', () => {
    const p = engine.detectPattern([1, 2, 3, 4, 5]);
    engine.generateInsight(p);
    const actionable = engine.getInsights({ actionable: true });
    assert.ok(Array.isArray(actionable));
  });

  test('should throw on max insights', () => {
    const e = new InsightEngine({ maxInsights: 1 });
    const p = e.detectPattern([1, 2, 3]);
    e.generateInsight(p);
    assert.throws(() => e.generateInsight(p), /Max insights/);
  });
});

describe('DimensionRouter', () => {
  let router;
  beforeEach(() => { router = new DimensionRouter(); });

  test('should add dimension', () => {
    const r = router.addDimension('region', e => e.region);
    assert.strictEqual(r.name, 'region');
  });

  test('should throw on max dimensions', () => {
    const r = new DimensionRouter({ maxDimensions: 1 });
    r.addDimension('a', e => e.a);
    assert.throws(() => r.addDimension('b', e => e.b), /Max dimensions/);
  });

  test('should route event', () => {
    router.addDimension('type', e => e.type);
    const r = router.route({ type: 'click' });
    assert.strictEqual(r.dimensions.type, 'click');
    assert.ok(r.phiScore > 0);
  });

  test('should remove dimension', () => {
    router.addDimension('x', e => e.x);
    assert.strictEqual(router.removeDimension('x'), true);
    assert.strictEqual(router.getDimensions().length, 0);
  });
});

describe('TrendDetector', () => {
  let detector;
  beforeEach(() => { detector = new TrendDetector({ windowSize: 5, sensitivity: 0.1 }); });

  test('should add series', () => {
    const r = detector.addSeries('cpu');
    assert.strictEqual(r.name, 'cpu');
  });

  test('should throw on duplicate series', () => {
    detector.addSeries('x');
    assert.throws(() => detector.addSeries('x'), /already exists/);
  });

  test('should add points', () => {
    detector.addSeries('mem');
    const r = detector.addPoint('mem', 50);
    assert.strictEqual(r.pointCount, 1);
  });

  test('should detect rising trend', () => {
    detector.addSeries('load');
    for (let i = 0; i < 5; i++) detector.addPoint('load', i * 10);
    const r = detector.detect('load');
    assert.strictEqual(r.trend, 'rising');
    assert.ok(r.confidence > 0);
  });

  test('should detect falling trend', () => {
    detector.addSeries('stock');
    for (let i = 5; i >= 1; i--) detector.addPoint('stock', i * 10);
    const r = detector.detect('stock');
    assert.strictEqual(r.trend, 'falling');
  });

  test('should return insufficient data', () => {
    detector.addSeries('new');
    detector.addPoint('new', 1);
    const r = detector.detect('new');
    assert.strictEqual(r.trend, 'insufficient_data');
  });
});
