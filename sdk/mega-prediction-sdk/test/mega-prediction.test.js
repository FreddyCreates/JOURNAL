import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { TemporalPredictor } from '../src/temporal-predictor.js';
import { ProbabilityEngine } from '../src/probability-engine.js';
import { TrendAnalyzer } from '../src/trend-analyzer.js';
import { AnomalyForecaster } from '../src/anomaly-forecaster.js';
import { ConfidenceCalibrator } from '../src/confidence-calibrator.js';

const PHI = 1.618033988749895;

describe('TemporalPredictor', () => {
  let predictor;
  beforeEach(() => { predictor = new TemporalPredictor(); });

  test('should create with defaults', () => {
    assert.strictEqual(predictor.horizon, 12);
    assert.strictEqual(predictor.method, 'phi-exponential');
  });

  test('should add observation', () => {
    const r = predictor.addObservation(5.0);
    assert.ok(r.observationId);
    assert.strictEqual(r.value, 5.0);
    assert.strictEqual(r.index, 0);
  });

  test('should predict with data', () => {
    for (let i = 0; i < 5; i++) predictor.addObservation(i * 2);
    const r = predictor.predict(3);
    assert.strictEqual(r.predictions.length, 3);
    assert.ok(r.predictions[0].confidence > 0);
  });

  test('should predict empty with no data', () => {
    const r = predictor.predict(5);
    assert.strictEqual(r.predictions.length, 0);
  });

  test('should get history', () => {
    predictor.addObservation(1);
    predictor.addObservation(2);
    assert.strictEqual(predictor.getHistory().length, 2);
  });

  test('should get accuracy', () => {
    for (let i = 0; i < 5; i++) predictor.addObservation(i);
    const a = predictor.getAccuracy();
    assert.ok(a.sampleSize === 5);
  });

  test('should reset', () => {
    predictor.addObservation(1);
    predictor.reset();
    assert.strictEqual(predictor.getHistory().length, 0);
  });
});

describe('ProbabilityEngine', () => {
  let engine;
  beforeEach(() => { engine = new ProbabilityEngine(); });

  test('should create with uniform distribution', () => {
    const dist = engine.getDistribution();
    assert.strictEqual(Object.keys(dist).length, 10);
  });

  test('should set prior', () => {
    engine.setPrior({ a: 0.6, b: 0.4 });
    const dist = engine.getDistribution();
    assert.strictEqual(dist.a, 0.6);
  });

  test('should update with evidence', () => {
    engine.setPrior({ a: 0.5, b: 0.5 });
    const r = engine.update('a');
    assert.ok(r.posterior.a > 0);
    assert.ok(r.confidence >= 0);
  });

  test('should sample', () => {
    const samples = engine.sample(10);
    assert.strictEqual(samples.length, 10);
  });

  test('should compute entropy', () => {
    const h = engine.entropy();
    assert.ok(h > 0);
  });

  test('should reset', () => {
    engine.update('state_0');
    engine.reset();
    const dist = engine.getDistribution();
    assert.ok(Math.abs(dist.state_0 - 0.1) < 0.001);
  });
});

describe('TrendAnalyzer', () => {
  let analyzer;
  beforeEach(() => { analyzer = new TrendAnalyzer(); });

  test('should create with defaults', () => {
    assert.strictEqual(analyzer.sensitivity, 0.618);
    assert.strictEqual(analyzer.minDataPoints, 5);
  });

  test('should add data point', () => {
    const r = analyzer.addDataPoint(5.0, 'test');
    assert.strictEqual(r.value, 5.0);
    assert.strictEqual(r.index, 0);
  });

  test('should detect upward trend', () => {
    for (let i = 0; i < 10; i++) analyzer.addDataPoint(i * 2);
    const r = analyzer.detectTrend();
    assert.strictEqual(r.direction, 'upward');
    assert.ok(r.strength > 0);
  });

  test('should return insufficient for few points', () => {
    analyzer.addDataPoint(1);
    const r = analyzer.detectTrend();
    assert.strictEqual(r.direction, 'insufficient');
  });

  test('should compute moving average', () => {
    for (let i = 0; i < 10; i++) analyzer.addDataPoint(i);
    const ma = analyzer.getMovingAverage(3);
    assert.ok(ma.length > 0);
  });

  test('should detect seasonality', () => {
    for (let i = 0; i < 20; i++) analyzer.addDataPoint(Math.sin(i * Math.PI / 4));
    const s = analyzer.getSeasonality();
    assert.ok(typeof s.detected === 'boolean');
  });

  test('should get data points', () => {
    analyzer.addDataPoint(1);
    assert.strictEqual(analyzer.getDataPoints().length, 1);
  });
});

describe('AnomalyForecaster', () => {
  let forecaster;
  beforeEach(() => { forecaster = new AnomalyForecaster(); });

  test('should create with defaults', () => {
    assert.strictEqual(forecaster.baselineWindow, 32);
    assert.strictEqual(forecaster.deviationThreshold, PHI);
  });

  test('should train on data', () => {
    const r = forecaster.train([1, 2, 3, 4, 5]);
    assert.ok(r.trained);
    assert.strictEqual(r.baselineSize, 5);
    assert.ok(r.mean > 0);
  });

  test('should detect anomaly', () => {
    forecaster.train([10, 10, 10, 10, 10]);
    const r = forecaster.detect(100);
    assert.ok(r.isAnomaly);
  });

  test('should detect normal', () => {
    forecaster.train([10, 10, 10, 10, 10]);
    const r = forecaster.detect(10);
    assert.strictEqual(r.isAnomaly, false);
  });

  test('should forecast', () => {
    forecaster.train([1, 2, 3, 4, 5]);
    const r = forecaster.forecast(3);
    assert.strictEqual(r.forecasts.length, 3);
    assert.ok(r.riskLevel);
  });

  test('should throw when not trained', () => {
    assert.throws(() => forecaster.detect(5), /not trained/);
  });

  test('should reset', () => {
    forecaster.train([1, 2, 3]);
    forecaster.reset();
    assert.strictEqual(forecaster.getBaseline(), null);
  });
});

describe('ConfidenceCalibrator', () => {
  let cal;
  beforeEach(() => { cal = new ConfidenceCalibrator(); });

  test('should create with defaults', () => {
    assert.strictEqual(cal.calibrationBins, 10);
    assert.strictEqual(cal.minSamples, 20);
  });

  test('should record prediction', () => {
    const r = cal.record(0.8, true);
    assert.ok(r.recorded);
    assert.strictEqual(r.totalRecords, 1);
  });

  test('should calibrate', () => {
    for (let i = 0; i < 25; i++) cal.record(0.7, Math.random() > 0.3);
    const r = cal.calibrate();
    assert.ok(r.bins.length > 0);
    assert.ok(r.brierScore >= 0);
  });

  test('should adjust confidence', () => {
    for (let i = 0; i < 25; i++) cal.record(0.8, true);
    const adjusted = cal.adjustConfidence(0.8);
    assert.ok(adjusted >= 0 && adjusted <= 1.5);
  });

  test('should return raw if not enough samples', () => {
    cal.record(0.5, true);
    const r = cal.adjustConfidence(0.5);
    assert.strictEqual(r, 0.5);
  });

  test('should get stats', () => {
    cal.record(0.5, true);
    const s = cal.getStats();
    assert.strictEqual(s.totalRecords, 1);
  });
});
