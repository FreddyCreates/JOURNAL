/**
 * Adapter Bridge SDK Test Suite
 * 
 * Comprehensive tests for ProtocolAdapter, FormatAdapter, ModelAdapter,
 * StorageAdapter, StreamAdapter, and EventAdapter
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { ProtocolAdapter } from '../src/protocol-adapter.js';
import { FormatAdapter } from '../src/format-adapter.js';
import { ModelAdapter } from '../src/model-adapter.js';
import { StorageAdapter } from '../src/storage-adapter.js';
import { StreamAdapter } from '../src/stream-adapter.js';
import { EventAdapter } from '../src/event-adapter.js';

const PHI = 1.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════
// PROTOCOL ADAPTER
// ═══════════════════════════════════════════════════════════════════════════

describe('ProtocolAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new ProtocolAdapter();
  });

  describe('registerProtocol', () => {
    test('should register protocol with encoder/decoder', () => {
      adapter.registerProtocol(
        'json',
        (data) => JSON.stringify(data),
        (str) => JSON.parse(str)
      );

      const protocols = adapter.getRegisteredProtocols();
      assert.ok(protocols.includes('json'));
    });

    test('should throw for duplicate protocol', () => {
      adapter.registerProtocol('p1', (d) => d, (d) => d);
      assert.throws(
        () => adapter.registerProtocol('p1', (d) => d, (d) => d),
        /already registered/
      );
    });

    test('should throw for invalid encoder', () => {
      assert.throws(
        () => adapter.registerProtocol('bad', 'not-a-function', (d) => d),
        /encoder must be a function/
      );
    });

    test('should throw for invalid decoder', () => {
      assert.throws(
        () => adapter.registerProtocol('bad', (d) => d, null),
        /decoder must be a function/
      );
    });
  });

  describe('translate', () => {
    test('should translate between protocols', () => {
      adapter.registerProtocol(
        'json',
        (data) => JSON.stringify(data),
        (str) => JSON.parse(str)
      );
      adapter.registerProtocol(
        'base64json',
        (data) => Buffer.from(JSON.stringify(data)).toString('base64'),
        (str) => JSON.parse(Buffer.from(str, 'base64').toString())
      );

      const result = adapter.translate('json', 'base64json', { hello: 'world' });

      assert.ok(result.data);
      assert.strictEqual(result.sourceProtocol, 'json');
      assert.strictEqual(result.targetProtocol, 'base64json');
    });

    test('should calculate fidelity score', () => {
      adapter.registerProtocol('p1', (d) => JSON.stringify(d), (s) => JSON.parse(s));
      adapter.registerProtocol('p2', (d) => JSON.stringify(d), (s) => JSON.parse(s));

      const result = adapter.translate('p1', 'p2', { test: 'data' });

      assert.ok(result.fidelityScore >= 0);
      assert.ok(result.fidelityScore <= 1);
    });

    test('should throw for unknown source protocol', () => {
      adapter.registerProtocol('known', (d) => d, (d) => d);
      
      assert.throws(
        () => adapter.translate('unknown', 'known', {}),
        /not registered/
      );
    });
  });

  describe('createBridge', () => {
    test('should create bidirectional bridge', () => {
      adapter.registerProtocol('a', (d) => JSON.stringify(d), (s) => JSON.parse(s));
      adapter.registerProtocol('b', (d) => JSON.stringify(d), (s) => JSON.parse(s));

      const bridge = adapter.createBridge('a', 'b');

      assert.ok(bridge.bridgeId);
      assert.strictEqual(bridge.protocolA, 'a');
      assert.strictEqual(bridge.protocolB, 'b');
    });
  });

  describe('getQualityMetrics', () => {
    test('should return quality metrics', () => {
      adapter.registerProtocol('m1', (d) => JSON.stringify(d), (s) => JSON.parse(s));
      adapter.registerProtocol('m2', (d) => JSON.stringify(d), (s) => JSON.parse(s));

      adapter.translate('m1', 'm2', { key: 'value' });
      adapter.translate('m1', 'm2', { another: 'test' });

      const metrics = adapter.getQualityMetrics();

      assert.ok('totalTranslations' in metrics);
      assert.ok('averageFidelity' in metrics);
      assert.ok('phiWeightedScore' in metrics);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// FORMAT ADAPTER
// ═══════════════════════════════════════════════════════════════════════════

describe('FormatAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new FormatAdapter();
  });

  describe('registerFormat', () => {
    test('should register data format', () => {
      adapter.registerFormat('csv', {
        serialize: (data) => data.map(row => row.join(',')).join('\n'),
        deserialize: (str) => str.split('\n').map(row => row.split(','))
      });

      const formats = adapter.getFormats();
      assert.ok(formats.includes('csv'));
    });
  });

  describe('convert', () => {
    test('should convert between formats', () => {
      adapter.registerFormat('json', {
        serialize: JSON.stringify,
        deserialize: JSON.parse
      });
      adapter.registerFormat('yaml-like', {
        serialize: (d) => Object.entries(d).map(([k, v]) => `${k}: ${v}`).join('\n'),
        deserialize: (s) => Object.fromEntries(s.split('\n').map(l => l.split(': ')))
      });

      const result = adapter.convert({ name: 'test', value: '42' }, 'json', 'yaml-like');

      assert.ok(result.data);
    });
  });

  describe('detect', () => {
    test('should detect data format', () => {
      adapter.registerFormat('json', {
        serialize: JSON.stringify,
        deserialize: JSON.parse,
        detect: (data) => {
          try {
            JSON.parse(data);
            return true;
          } catch { return false; }
        }
      });

      const detected = adapter.detect('{"valid": "json"}');
      assert.strictEqual(detected, 'json');
    });
  });

  describe('validate', () => {
    test('should validate data against format schema', () => {
      adapter.registerFormat('numbered', {
        serialize: (d) => d,
        deserialize: (d) => d,
        validate: (data) => typeof data === 'number'
      });

      assert.strictEqual(adapter.validate(42, 'numbered'), true);
      assert.strictEqual(adapter.validate('text', 'numbered'), false);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// MODEL ADAPTER
// ═══════════════════════════════════════════════════════════════════════════

describe('ModelAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new ModelAdapter();
  });

  describe('registerModel', () => {
    test('should register model schema', () => {
      adapter.registerModel('User', {
        fields: {
          id: { type: 'string', required: true },
          name: { type: 'string', required: true },
          email: { type: 'string' }
        }
      });

      const models = adapter.getModels();
      assert.ok(models.includes('User'));
    });
  });

  describe('transform', () => {
    test('should transform between model schemas', () => {
      adapter.registerModel('UserV1', {
        fields: { firstName: 'string', lastName: 'string' }
      });
      adapter.registerModel('UserV2', {
        fields: { fullName: 'string' }
      });
      adapter.registerTransform('UserV1', 'UserV2', (v1) => ({
        fullName: `${v1.firstName} ${v1.lastName}`
      }));

      const result = adapter.transform(
        { firstName: 'John', lastName: 'Doe' },
        'UserV1',
        'UserV2'
      );

      assert.strictEqual(result.data.fullName, 'John Doe');
    });
  });

  describe('validate', () => {
    test('should validate data against model', () => {
      adapter.registerModel('Product', {
        fields: {
          id: { type: 'string', required: true },
          price: { type: 'number', required: true }
        }
      });

      const valid = adapter.validate({ id: 'p1', price: 100 }, 'Product');
      const invalid = adapter.validate({ id: 'p2' }, 'Product');

      assert.strictEqual(valid.valid, true);
      assert.strictEqual(invalid.valid, false);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE ADAPTER
// ═══════════════════════════════════════════════════════════════════════════

describe('StorageAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new StorageAdapter();
  });

  describe('registerBackend', () => {
    test('should register storage backend', () => {
      const memoryStore = new Map();
      adapter.registerBackend('memory', {
        get: (key) => memoryStore.get(key),
        set: (key, value) => memoryStore.set(key, value),
        delete: (key) => memoryStore.delete(key),
        has: (key) => memoryStore.has(key)
      });

      const backends = adapter.getBackends();
      assert.ok(backends.includes('memory'));
    });
  });

  describe('store/retrieve', () => {
    test('should store and retrieve data', async () => {
      const store = new Map();
      adapter.registerBackend('test', {
        get: (k) => store.get(k),
        set: (k, v) => store.set(k, v),
        delete: (k) => store.delete(k),
        has: (k) => store.has(k)
      });

      await adapter.store('test', 'my-key', { data: 'value' });
      const retrieved = await adapter.retrieve('test', 'my-key');

      assert.deepStrictEqual(retrieved.data, { data: 'value' });
    });
  });

  describe('migrate', () => {
    test('should migrate data between backends', async () => {
      const store1 = new Map();
      const store2 = new Map();

      adapter.registerBackend('source', {
        get: (k) => store1.get(k),
        set: (k, v) => store1.set(k, v),
        delete: (k) => store1.delete(k),
        has: (k) => store1.has(k),
        keys: () => Array.from(store1.keys())
      });

      adapter.registerBackend('dest', {
        get: (k) => store2.get(k),
        set: (k, v) => store2.set(k, v),
        delete: (k) => store2.delete(k),
        has: (k) => store2.has(k)
      });

      store1.set('k1', 'v1');
      store1.set('k2', 'v2');

      const result = await adapter.migrate('source', 'dest', ['k1', 'k2']);

      assert.strictEqual(result.migrated, 2);
      assert.strictEqual(store2.get('k1'), 'v1');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// STREAM ADAPTER
// ═══════════════════════════════════════════════════════════════════════════

describe('StreamAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new StreamAdapter();
  });

  describe('createStream', () => {
    test('should create data stream', () => {
      const stream = adapter.createStream('my-stream', { bufferSize: 100 });

      assert.ok(stream.streamId === 'my-stream');
    });
  });

  describe('push/pull', () => {
    test('should push and pull from stream', async () => {
      adapter.createStream('data-stream');

      adapter.push('data-stream', { item: 1 });
      adapter.push('data-stream', { item: 2 });
      adapter.push('data-stream', { item: 3 });

      const pulled = await adapter.pull('data-stream', 2);

      assert.strictEqual(pulled.items.length, 2);
    });
  });

  describe('transform', () => {
    test('should transform stream data', async () => {
      adapter.createStream('transform-stream');
      adapter.registerTransform('double', (item) => item * 2);

      adapter.push('transform-stream', 5);
      adapter.push('transform-stream', 10);

      const result = await adapter.transformStream('transform-stream', 'double');

      assert.ok(result.transformed);
    });
  });

  describe('pipe', () => {
    test('should pipe between streams', () => {
      adapter.createStream('source-stream');
      adapter.createStream('dest-stream');

      adapter.push('source-stream', 'data1');
      adapter.push('source-stream', 'data2');

      const pipe = adapter.pipe('source-stream', 'dest-stream');

      assert.ok(pipe.pipeId);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// EVENT ADAPTER
// ═══════════════════════════════════════════════════════════════════════════

describe('EventAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new EventAdapter();
  });

  describe('registerEventType', () => {
    test('should register event type', () => {
      adapter.registerEventType('user.created', {
        schema: { userId: 'string', timestamp: 'number' }
      });

      const types = adapter.getEventTypes();
      assert.ok(types.includes('user.created'));
    });
  });

  describe('emit/subscribe', () => {
    test('should emit and receive events', async () => {
      adapter.registerEventType('test.event');

      let received = null;
      adapter.subscribe('test.event', (event) => {
        received = event;
      });

      adapter.emit('test.event', { data: 'test-data' });

      // Give async handlers time to run
      await new Promise(r => setTimeout(r, 10));

      assert.ok(received);
      assert.strictEqual(received.data, 'test-data');
    });
  });

  describe('transform', () => {
    test('should transform event between systems', () => {
      adapter.registerEventType('system-a.event');
      adapter.registerEventType('system-b.event');
      adapter.registerTransform('system-a.event', 'system-b.event', (event) => ({
        ...event,
        transformed: true
      }));

      const result = adapter.transform(
        { original: true },
        'system-a.event',
        'system-b.event'
      );

      assert.strictEqual(result.data.transformed, true);
      assert.strictEqual(result.data.original, true);
    });
  });

  describe('replay', () => {
    test('should replay events', async () => {
      adapter.registerEventType('replayable');

      adapter.emit('replayable', { seq: 1 });
      adapter.emit('replayable', { seq: 2 });
      adapter.emit('replayable', { seq: 3 });

      const replayed = await adapter.replay('replayable', { limit: 2 });

      assert.ok(Array.isArray(replayed.events));
    });
  });

  describe('getMetrics', () => {
    test('should return event metrics', () => {
      adapter.registerEventType('counted');
      adapter.emit('counted', {});
      adapter.emit('counted', {});

      const metrics = adapter.getMetrics();

      assert.ok('totalEmitted' in metrics);
      assert.ok('byType' in metrics);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Integration', () => {
  test('should combine protocol and format adapters', () => {
    const protocol = new ProtocolAdapter();
    const format = new FormatAdapter();

    protocol.registerProtocol(
      'json-proto',
      (d) => JSON.stringify(d),
      (s) => JSON.parse(s)
    );

    format.registerFormat('json-format', {
      serialize: JSON.stringify,
      deserialize: JSON.parse
    });

    const data = { test: 'integration' };
    const encoded = protocol.translate('json-proto', 'json-proto', data);
    
    assert.ok(encoded.data);
  });

  test('should combine storage and event adapters', async () => {
    const storage = new StorageAdapter();
    const events = new EventAdapter();

    const store = new Map();
    storage.registerBackend('events', {
      get: (k) => store.get(k),
      set: (k, v) => store.set(k, v),
      delete: (k) => store.delete(k),
      has: (k) => store.has(k)
    });

    events.registerEventType('data.saved');

    events.subscribe('data.saved', async (event) => {
      await storage.store('events', `event-${event.id}`, event);
    });

    events.emit('data.saved', { id: '123', data: 'saved' });

    await new Promise(r => setTimeout(r, 50));

    const stored = await storage.retrieve('events', 'event-123');
    assert.ok(stored);
  });

  test('should combine stream and model adapters', () => {
    const stream = new StreamAdapter();
    const model = new ModelAdapter();

    model.registerModel('Message', {
      fields: { id: 'string', content: 'string' }
    });

    stream.createStream('messages');

    const message = { id: 'm1', content: 'Hello' };
    const validation = model.validate(message, 'Message');

    if (validation.valid) {
      stream.push('messages', message);
    }

    assert.strictEqual(validation.valid, true);
  });
});
