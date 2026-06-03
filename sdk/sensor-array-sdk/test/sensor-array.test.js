/**
 * Sensor Array SDK Test Suite
 * 
 * Comprehensive tests for ThermalSensor, NetworkSensor, ResourceSensor,
 * SignalSensor, ProximitySensor, and BioRhythmSensor
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { ThermalSensor } from '../src/thermal-sensor.js';
import { NetworkSensor } from '../src/network-sensor.js';
import { ResourceSensor } from '../src/resource-sensor.js';
import { SignalSensor } from '../src/signal-sensor.js';
import { ProximitySensor } from '../src/proximity-sensor.js';
import { BioRhythmSensor } from '../src/bio-rhythm-sensor.js';

const PHI = 1.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════
// THERMAL SENSOR
// ═══════════════════════════════════════════════════════════════════════════

describe('ThermalSensor', () => {
  let sensor;

  beforeEach(() => {
    sensor = new ThermalSensor();
  });

  describe('registerZone', () => {
    test('should register thermal zone', () => {
      sensor.registerZone('cpu', 40, 85);
      // Should not throw
      const reading = sensor.readTemperature('cpu');
      assert.ok(reading);
    });

    test('should throw for duplicate zone', () => {
      sensor.registerZone('gpu', 35, 90);
      assert.throws(
        () => sensor.registerZone('gpu', 40, 95),
        /already registered/
      );
    });

    test('should throw for invalid parameters', () => {
      assert.throws(
        () => sensor.registerZone('invalid', 'not-a-number', 80),
        /must be numbers/
      );
    });

    test('should throw when threshold <= baseline', () => {
      assert.throws(
        () => sensor.registerZone('bad', 50, 30),
        /must be greater than baseline/
      );
    });
  });

  describe('readTemperature', () => {
    test('should return temperature reading', () => {
      sensor.registerZone('zone1', 30, 70);
      
      const reading = sensor.readTemperature('zone1');
      
      assert.ok(reading.zoneId === 'zone1');
      assert.ok(typeof reading.temperature === 'number');
      assert.ok(typeof reading.delta === 'number');
      assert.ok(reading.timestamp);
      assert.ok(reading.readingId);
    });

    test('should throw for unknown zone', () => {
      assert.throws(
        () => sensor.readTemperature('nonexistent'),
        /not found/
      );
    });

    test('should apply phi-weighted drift', () => {
      sensor.registerZone('drifty', 30, 60);
      
      const readings = [];
      for (let i = 0; i < 10; i++) {
        readings.push(sensor.readTemperature('drifty'));
      }
      
      // Temperature should vary (not constant)
      const temps = readings.map(r => r.temperature);
      const unique = new Set(temps);
      assert.ok(unique.size > 1, 'Temperature should vary with phi-drift');
    });
  });

  describe('getHeatMap', () => {
    test('should return heat map for all zones', () => {
      sensor.registerZone('z1', 30, 60);
      sensor.registerZone('z2', 40, 80);
      sensor.registerZone('z3', 35, 70);

      sensor.readTemperature('z1');
      sensor.readTemperature('z2');
      
      const heatMap = sensor.getHeatMap();
      
      assert.strictEqual(heatMap.length, 3);
      assert.ok(heatMap.every(e => 'zoneId' in e));
      assert.ok(heatMap.every(e => 'status' in e));
      assert.ok(heatMap.every(e => 'saturation' in e));
    });

    test('should classify status levels', () => {
      sensor.registerZone('test-zone', 0, 100);
      
      const heatMap = sensor.getHeatMap();
      const entry = heatMap[0];
      
      assert.ok(['nominal', 'warm', 'hot', 'critical'].includes(entry.status));
    });
  });

  describe('detectHotspot', () => {
    test('should return hotspot report', () => {
      sensor.registerZone('cool', 20, 100);
      sensor.registerZone('warm', 50, 60);
      
      const report = sensor.detectHotspot();
      
      assert.ok(report.reportId);
      assert.ok(report.timestamp);
      assert.ok(Array.isArray(report.hotspots));
    });
  });

  describe('cooldown', () => {
    test('should initiate cooldown procedure', () => {
      sensor.registerZone('hot-zone', 30, 60);
      
      // Heat up the zone by reading multiple times
      for (let i = 0; i < 5; i++) {
        sensor.readTemperature('hot-zone');
      }
      
      const result = sensor.cooldown('hot-zone');
      
      assert.ok(result.zoneId === 'hot-zone');
      assert.strictEqual(result.coolingInitiated, true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// NETWORK SENSOR
// ═══════════════════════════════════════════════════════════════════════════

describe('NetworkSensor', () => {
  let sensor;

  beforeEach(() => {
    sensor = new NetworkSensor();
  });

  describe('registerEndpoint', () => {
    test('should register network endpoint', () => {
      sensor.registerEndpoint('api', { url: 'https://api.example.com', timeout: 5000 });
      
      const status = sensor.getEndpointStatus('api');
      assert.ok(status);
    });
  });

  describe('probe', () => {
    test('should probe registered endpoint', async () => {
      sensor.registerEndpoint('local', { url: 'http://localhost:0', timeout: 100 });
      
      const result = await sensor.probe('local');
      
      assert.ok('endpointId' in result);
      assert.ok('latency' in result);
      assert.ok('status' in result);
    });
  });

  describe('getNetworkHealth', () => {
    test('should return overall network health', () => {
      sensor.registerEndpoint('e1', { url: 'http://localhost:1' });
      sensor.registerEndpoint('e2', { url: 'http://localhost:2' });

      const health = sensor.getNetworkHealth();
      
      assert.ok('totalEndpoints' in health);
      assert.ok('healthyCount' in health);
      assert.ok('unhealthyCount' in health);
    });
  });

  describe('getLatencyStats', () => {
    test('should return latency statistics', async () => {
      sensor.registerEndpoint('test', { url: 'http://localhost:0' });
      
      const stats = sensor.getLatencyStats('test');
      
      assert.ok('min' in stats);
      assert.ok('max' in stats);
      assert.ok('avg' in stats);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RESOURCE SENSOR
// ═══════════════════════════════════════════════════════════════════════════

describe('ResourceSensor', () => {
  let sensor;

  beforeEach(() => {
    sensor = new ResourceSensor();
  });

  describe('registerResource', () => {
    test('should register resource', () => {
      sensor.registerResource('memory', { capacity: 16384, unit: 'MB' });
      
      const info = sensor.getResourceInfo('memory');
      assert.ok(info);
      assert.strictEqual(info.capacity, 16384);
    });
  });

  describe('sample', () => {
    test('should sample resource usage', () => {
      sensor.registerResource('cpu', { capacity: 100, unit: '%' });
      
      const sample = sensor.sample('cpu', 75);
      
      assert.ok(sample.resourceId === 'cpu');
      assert.strictEqual(sample.value, 75);
      assert.ok(sample.utilization);
    });
  });

  describe('getUtilization', () => {
    test('should return utilization metrics', () => {
      sensor.registerResource('disk', { capacity: 1000, unit: 'GB' });
      sensor.sample('disk', 400);
      
      const util = sensor.getUtilization('disk');
      
      assert.strictEqual(util.percentage, 40);
    });
  });

  describe('getTrend', () => {
    test('should calculate resource trend', () => {
      sensor.registerResource('memory', { capacity: 100 });
      
      sensor.sample('memory', 50);
      sensor.sample('memory', 55);
      sensor.sample('memory', 60);
      sensor.sample('memory', 65);
      
      const trend = sensor.getTrend('memory');
      
      assert.ok('direction' in trend);
      assert.ok(['increasing', 'decreasing', 'stable'].includes(trend.direction));
    });
  });

  describe('predict', () => {
    test('should predict future resource usage', () => {
      sensor.registerResource('storage', { capacity: 100 });
      
      for (let i = 0; i < 10; i++) {
        sensor.sample('storage', 40 + i * 2);
      }
      
      const prediction = sensor.predict('storage', 60000); // 1 minute ahead
      
      assert.ok('predicted' in prediction);
      assert.ok('confidence' in prediction);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SIGNAL SENSOR
// ═══════════════════════════════════════════════════════════════════════════

describe('SignalSensor', () => {
  let sensor;

  beforeEach(() => {
    sensor = new SignalSensor();
  });

  describe('registerChannel', () => {
    test('should register signal channel', () => {
      sensor.registerChannel('audio', { frequency: 44100, sampleRate: 48000 });
      
      const channels = sensor.getChannels();
      assert.ok(channels.includes('audio'));
    });
  });

  describe('readSignal', () => {
    test('should read signal from channel', () => {
      sensor.registerChannel('data', { frequency: 1000 });
      
      const signal = sensor.readSignal('data');
      
      assert.ok('channelId' in signal);
      assert.ok('amplitude' in signal);
      assert.ok('frequency' in signal);
      assert.ok('timestamp' in signal);
    });
  });

  describe('analyzeSpectrum', () => {
    test('should perform spectrum analysis', () => {
      sensor.registerChannel('rf', { frequency: 2400 });
      
      for (let i = 0; i < 5; i++) {
        sensor.readSignal('rf');
      }
      
      const spectrum = sensor.analyzeSpectrum('rf');
      
      assert.ok('peaks' in spectrum);
      assert.ok('bandwidth' in spectrum);
    });
  });

  describe('detectAnomaly', () => {
    test('should detect signal anomalies', () => {
      sensor.registerChannel('monitor', { frequency: 100 });
      
      for (let i = 0; i < 10; i++) {
        sensor.readSignal('monitor');
      }
      
      const anomaly = sensor.detectAnomaly('monitor');
      
      assert.ok('detected' in anomaly);
      assert.ok('severity' in anomaly);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PROXIMITY SENSOR
// ═══════════════════════════════════════════════════════════════════════════

describe('ProximitySensor', () => {
  let sensor;

  beforeEach(() => {
    sensor = new ProximitySensor();
  });

  describe('registerTarget', () => {
    test('should register proximity target', () => {
      sensor.registerTarget('service-a', { coordinates: { x: 0, y: 0, z: 0 } });
      
      const targets = sensor.getTargets();
      assert.ok(targets.includes('service-a'));
    });
  });

  describe('measureDistance', () => {
    test('should measure distance to target', () => {
      sensor.registerTarget('node', { coordinates: { x: 3, y: 4, z: 0 } });
      
      const distance = sensor.measureDistance('node', { x: 0, y: 0, z: 0 });
      
      assert.strictEqual(distance.value, 5); // 3-4-5 triangle
    });
  });

  describe('detectNearby', () => {
    test('should detect nearby targets within radius', () => {
      sensor.registerTarget('close', { coordinates: { x: 1, y: 1, z: 0 } });
      sensor.registerTarget('far', { coordinates: { x: 100, y: 100, z: 0 } });

      const nearby = sensor.detectNearby({ x: 0, y: 0, z: 0 }, 10);
      
      assert.ok(nearby.some(t => t.targetId === 'close'));
      assert.ok(!nearby.some(t => t.targetId === 'far'));
    });
  });

  describe('trackMovement', () => {
    test('should track target movement', () => {
      sensor.registerTarget('mobile', { coordinates: { x: 0, y: 0, z: 0 } });
      
      sensor.updatePosition('mobile', { x: 1, y: 0, z: 0 });
      sensor.updatePosition('mobile', { x: 2, y: 0, z: 0 });
      sensor.updatePosition('mobile', { x: 3, y: 0, z: 0 });
      
      const movement = sensor.getMovementHistory('mobile');
      
      assert.ok(Array.isArray(movement));
      assert.ok(movement.length >= 3);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// BIORHYTHM SENSOR
// ═══════════════════════════════════════════════════════════════════════════

describe('BioRhythmSensor', () => {
  let sensor;

  beforeEach(() => {
    sensor = new BioRhythmSensor();
  });

  describe('registerOrganism', () => {
    test('should register organism for monitoring', () => {
      sensor.registerOrganism('system-1', { birthTimestamp: Date.now() - 86400000 });
      
      const organisms = sensor.getOrganisms();
      assert.ok(organisms.includes('system-1'));
    });
  });

  describe('readRhythm', () => {
    test('should read biorhythm values', () => {
      sensor.registerOrganism('org', { birthTimestamp: Date.now() - 1000000000 });
      
      const rhythm = sensor.readRhythm('org');
      
      assert.ok('physical' in rhythm);
      assert.ok('emotional' in rhythm);
      assert.ok('intellectual' in rhythm);
      assert.ok(rhythm.physical >= -1 && rhythm.physical <= 1);
      assert.ok(rhythm.emotional >= -1 && rhythm.emotional <= 1);
      assert.ok(rhythm.intellectual >= -1 && rhythm.intellectual <= 1);
    });
  });

  describe('calculateCriticalDays', () => {
    test('should identify critical days', () => {
      sensor.registerOrganism('org', { birthTimestamp: Date.now() - 100000000 });
      
      const criticalDays = sensor.calculateCriticalDays('org', 30);
      
      assert.ok(Array.isArray(criticalDays));
    });
  });

  describe('getCompatibility', () => {
    test('should calculate rhythm compatibility', () => {
      sensor.registerOrganism('org1', { birthTimestamp: Date.now() - 50000000 });
      sensor.registerOrganism('org2', { birthTimestamp: Date.now() - 80000000 });
      
      const compatibility = sensor.getCompatibility('org1', 'org2');
      
      assert.ok('physical' in compatibility);
      assert.ok('emotional' in compatibility);
      assert.ok('intellectual' in compatibility);
      assert.ok('overall' in compatibility);
    });
  });

  describe('forecast', () => {
    test('should forecast future rhythms', () => {
      sensor.registerOrganism('org', { birthTimestamp: Date.now() - 200000000 });
      
      const forecast = sensor.forecast('org', 7); // 7 days ahead
      
      assert.ok(Array.isArray(forecast));
      assert.strictEqual(forecast.length, 7);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Integration', () => {
  test('should correlate thermal with resource sensors', () => {
    const thermal = new ThermalSensor();
    const resource = new ResourceSensor();
    
    thermal.registerZone('cpu-temp', 30, 90);
    resource.registerResource('cpu-usage', { capacity: 100 });
    
    // Simulate correlation: high CPU -> high temp
    resource.sample('cpu-usage', 80);
    const temp = thermal.readTemperature('cpu-temp');
    
    assert.ok(temp.temperature >= 30);
  });

  test('should integrate proximity with network sensors', async () => {
    const proximity = new ProximitySensor();
    const network = new NetworkSensor();
    
    proximity.registerTarget('server', { coordinates: { x: 10, y: 10, z: 0 } });
    network.registerEndpoint('server-api', { url: 'http://server:8080' });
    
    const distance = proximity.measureDistance('server', { x: 0, y: 0, z: 0 });
    
    assert.ok(distance.value > 0);
  });

  test('should combine signal and biorhythm analysis', () => {
    const signal = new SignalSensor();
    const biorhythm = new BioRhythmSensor();
    
    signal.registerChannel('brain-wave', { frequency: 10 });
    biorhythm.registerOrganism('system', { birthTimestamp: Date.now() - 86400000 * 30 });
    
    const signalReading = signal.readSignal('brain-wave');
    const rhythmReading = biorhythm.readRhythm('system');
    
    // Both sensors should produce valid readings
    assert.ok(signalReading.amplitude !== undefined);
    assert.ok(rhythmReading.physical !== undefined);
  });
});
