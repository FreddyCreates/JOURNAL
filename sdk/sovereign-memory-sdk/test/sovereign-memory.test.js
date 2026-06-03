/**
 * Sovereign Memory SDK Test Suite
 * 
 * Comprehensive tests for SpatialMemoryStore, DualLayerSearch, MemoryLineage,
 * LivingDocument, and PhiCoordinateGenerator
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { SpatialMemoryStore } from '../src/spatial-memory-store.js';
import { DualLayerSearch } from '../src/dual-layer-search.js';
import { MemoryLineage } from '../src/memory-lineage.js';
import { LivingDocument } from '../src/living-document.js';
import { PhiCoordinateGenerator } from '../src/phi-coordinate-generator.js';

const PHI = 1.618033988749;

// ═══════════════════════════════════════════════════════════════════════════
// SPATIAL MEMORY STORE
// ═══════════════════════════════════════════════════════════════════════════

describe('SpatialMemoryStore', () => {
  let store;

  beforeEach(() => {
    store = new SpatialMemoryStore();
  });

  describe('constructor', () => {
    test('should create with default config', () => {
      assert.strictEqual(store.ringCount, 7);
      assert.strictEqual(store.beatResolution, 64);
      assert.ok(Math.abs(store.phiBase - PHI) < 0.0001);
    });

    test('should create with custom config', () => {
      const custom = new SpatialMemoryStore({
        ringCount: 10,
        beatResolution: 128,
        phiBase: 2.0
      });
      assert.strictEqual(custom.ringCount, 10);
      assert.strictEqual(custom.beatResolution, 128);
      assert.strictEqual(custom.phiBase, 2.0);
    });
  });

  describe('store', () => {
    test('should store a value with coordinates', () => {
      const coords = { theta: 0.5, phi: 1.0, rho: 2.0, ring: 3, beat: 10 };
      const result = store.store('test-key', { data: 'value' }, coords);

      assert.ok(result.id);
      assert.strictEqual(result.key, 'test-key');
      assert.ok(result.timestamp);
      assert.deepStrictEqual(result.coordinates, coords);
      assert.ok(result.hash);
    });

    test('should overwrite existing key', () => {
      const coords = { theta: 0, phi: 0, rho: 0, ring: 1, beat: 1 };
      store.store('key1', 'value1', coords);
      store.store('key1', 'value2', coords);

      const retrieved = store.retrieve('key1');
      assert.strictEqual(retrieved.value, 'value2');
    });

    test('should generate unique hashes', () => {
      const coords1 = { theta: 0, phi: 0, rho: 0, ring: 1, beat: 1 };
      const coords2 = { theta: 0, phi: 0, rho: 0, ring: 2, beat: 2 };
      
      const r1 = store.store('k1', 'v1', coords1);
      const r2 = store.store('k2', 'v2', coords2);

      assert.notStrictEqual(r1.hash, r2.hash);
    });
  });

  describe('retrieve', () => {
    test('should retrieve stored value', () => {
      const coords = { theta: 1.0, phi: 2.0, rho: 3.0, ring: 4, beat: 5 };
      store.store('my-key', { nested: { data: 123 } }, coords);

      const retrieved = store.retrieve('my-key');
      
      assert.ok(retrieved);
      assert.strictEqual(retrieved.key, 'my-key');
      assert.deepStrictEqual(retrieved.value, { nested: { data: 123 } });
      assert.deepStrictEqual(retrieved.coordinates, coords);
    });

    test('should return undefined for unknown key', () => {
      const result = store.retrieve('nonexistent');
      assert.strictEqual(result, undefined);
    });

    test('should return a copy, not reference', () => {
      const coords = { theta: 0, phi: 0, rho: 0, ring: 1, beat: 1 };
      store.store('key', { mutable: true }, coords);

      const r1 = store.retrieve('key');
      const r2 = store.retrieve('key');

      assert.notStrictEqual(r1, r2);
    });
  });

  describe('listByRing', () => {
    test('should list memories on specific ring', () => {
      store.store('r1-1', 'a', { theta: 0, phi: 0, rho: 0, ring: 1, beat: 0 });
      store.store('r1-2', 'b', { theta: 0, phi: 0, rho: 0, ring: 1, beat: 1 });
      store.store('r2-1', 'c', { theta: 0, phi: 0, rho: 0, ring: 2, beat: 0 });

      const ring1 = store.listByRing(1);
      
      assert.strictEqual(ring1.length, 2);
      assert.ok(ring1.every(r => r.coordinates.ring === 1));
    });

    test('should return empty array for empty ring', () => {
      const results = store.listByRing(99);
      assert.deepStrictEqual(results, []);
    });
  });

  describe('listByBeat', () => {
    test('should list memories at specific beat', () => {
      store.store('b0-1', 'a', { theta: 0, phi: 0, rho: 0, ring: 1, beat: 0 });
      store.store('b0-2', 'b', { theta: 0, phi: 0, rho: 0, ring: 2, beat: 0 });
      store.store('b1-1', 'c', { theta: 0, phi: 0, rho: 0, ring: 1, beat: 1 });

      const beat0 = store.listByBeat(0);
      
      assert.strictEqual(beat0.length, 2);
      assert.ok(beat0.every(r => r.coordinates.beat === 0));
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// DUAL LAYER SEARCH
// ═══════════════════════════════════════════════════════════════════════════

describe('DualLayerSearch', () => {
  let search;

  beforeEach(() => {
    search = new DualLayerSearch();
  });

  describe('constructor', () => {
    test('should initialize', () => {
      assert.ok(search);
    });
  });

  describe('searchSemantic', () => {
    test('should search corpus by semantic similarity', () => {
      const corpus = [
        { id: 'doc1', text: 'The quick brown fox jumps over the lazy dog' },
        { id: 'doc2', text: 'A slow blue cat sits under the active hound' },
        { id: 'doc3', text: 'The quick fox is fast and agile' }
      ];

      const results = search.searchSemantic('quick fox', corpus);
      
      assert.ok(Array.isArray(results));
      assert.ok(results.length > 0);
      // Results should be sorted by score descending
      if (results.length > 1) {
        assert.ok(results[0].score >= results[1].score);
      }
    });

    test('should return empty for no matches', () => {
      const corpus = [
        { id: 'doc1', text: 'hello world' }
      ];

      const results = search.searchSemantic('xyzzyx', corpus);
      assert.strictEqual(results.length, 0);
    });
  });

  describe('searchResonance', () => {
    test('should search by coordinate proximity', () => {
      const corpus = [
        { id: 'close', coordinates: { theta: 0.1, phi: 0.1, rho: 0.1, ring: 1, beat: 1 } },
        { id: 'far', coordinates: { theta: 5.0, phi: 5.0, rho: 5.0, ring: 5, beat: 50 } }
      ];

      const query = { theta: 0, phi: 0, rho: 0, ring: 1, beat: 1 };
      const results = search.searchResonance(query, corpus, 1.0);
      
      assert.ok(Array.isArray(results));
    });
  });

  describe('dualRead', () => {
    test('should combine semantic and resonance search', () => {
      const corpus = [
        { 
          id: 'doc1', 
          text: 'hello world',
          coordinates: { theta: 0.1, phi: 0.1, rho: 0.1, ring: 1, beat: 1 }
        }
      ];

      const query = {
        text: 'hello',
        coordinates: { theta: 0, phi: 0, rho: 0, ring: 1, beat: 1 }
      };

      const results = search.dualRead(query, corpus);
      
      assert.ok(Array.isArray(results));
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// MEMORY LINEAGE
// ═══════════════════════════════════════════════════════════════════════════

describe('MemoryLineage', () => {
  let lineage;

  beforeEach(() => {
    lineage = new MemoryLineage();
  });

  describe('constructor', () => {
    test('should initialize empty lineage', () => {
      assert.ok(lineage);
    });
  });

  describe('recordAncestor', () => {
    test('should record parent-child relationship', () => {
      const result = lineage.recordAncestor('child-1', 'parent-1');
      
      assert.strictEqual(result.childId, 'child-1');
      assert.strictEqual(result.parentId, 'parent-1');
      assert.ok(result.recorded);
    });

    test('should support multiple ancestors', () => {
      lineage.recordAncestor('child', 'parent-a');
      lineage.recordAncestor('child', 'parent-b');

      const lineageChain = lineage.getLineage('child');
      assert.ok(lineageChain.length >= 2);
    });
  });

  describe('getLineage', () => {
    test('should return ancestor chain', () => {
      lineage.recordAncestor('g1', 'g0');
      lineage.recordAncestor('g2', 'g1');
      lineage.recordAncestor('g3', 'g2');

      const chain = lineage.getLineage('g3');
      
      assert.ok(chain.length >= 2);
      assert.ok(chain.includes('g2'));
      assert.ok(chain.includes('g1'));
    });

    test('should return empty for root node', () => {
      const chain = lineage.getLineage('orphan');
      assert.deepStrictEqual(chain, []);
    });
  });

  describe('fork', () => {
    test('should fork a memory', () => {
      lineage.recordAncestor('original', 'root');
      
      const fork = lineage.fork('original', 'feature-branch');
      
      assert.ok(fork.forkId);
      assert.strictEqual(fork.sourceId, 'original');
      assert.strictEqual(fork.branch, 'feature-branch');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// LIVING DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════

describe('LivingDocument', () => {
  let doc;

  beforeEach(() => {
    doc = new LivingDocument();
  });

  describe('constructor', () => {
    test('should create LivingDocument manager', () => {
      assert.ok(doc);
    });
  });

  describe('create', () => {
    test('should create a new document', () => {
      const result = doc.create('My Title', 'Initial content here');
      
      assert.ok(result.id);
      assert.strictEqual(result.title, 'My Title');
      assert.strictEqual(result.content, 'Initial content here');
      assert.strictEqual(result.version, 1);
    });
  });

  describe('evolve', () => {
    test('should evolve document content', () => {
      const created = doc.create('Test', 'v1 content');
      
      const evolved = doc.evolve(created.id, { type: 'update', content: 'v2 content' });
      
      assert.strictEqual(evolved.version, 2);
    });

    test('should throw for unknown document', () => {
      assert.throws(
        () => doc.evolve('nonexistent', { content: 'new' }),
        /not found/
      );
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PHI COORDINATE GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

describe('PhiCoordinateGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new PhiCoordinateGenerator();
  });

  describe('constructor', () => {
    test('should create with defaults', () => {
      assert.ok(generator);
    });
  });

  describe('generate', () => {
    test('should generate valid coordinates from seed', () => {
      const coords = generator.generate(42);
      
      assert.ok('theta' in coords);
      assert.ok('phi' in coords);
      assert.ok('rho' in coords);
      assert.ok('ring' in coords);
      assert.ok('beat' in coords);
    });

    test('should generate deterministic coordinates', () => {
      const c1 = generator.generate(100);
      const c2 = generator.generate(100);

      assert.strictEqual(c1.theta, c2.theta);
      assert.strictEqual(c1.phi, c2.phi);
      assert.strictEqual(c1.ring, c2.ring);
    });

    test('should generate different coordinates for different seeds', () => {
      const c1 = generator.generate(1);
      const c2 = generator.generate(2);

      // At least one coordinate should differ
      const allSame = c1.theta === c2.theta && c1.phi === c2.phi && 
                      c1.rho === c2.rho && c1.ring === c2.ring && c1.beat === c2.beat;
      assert.strictEqual(allSame, false);
    });
  });

  describe('encode/decode', () => {
    test('should encode coordinates to string', () => {
      const coords = { theta: 1.5, phi: 2.5, rho: 0.5, ring: 3, beat: 32 };
      const encoded = generator.encode(coords);
      
      assert.ok(typeof encoded === 'string');
      assert.ok(encoded.includes(':'));
    });

    test('should decode string to coordinates', () => {
      const original = { theta: 1.5, phi: 2.5, rho: 0.5, ring: 3, beat: 32 };
      const encoded = generator.encode(original);
      const decoded = generator.decode(encoded);
      
      assert.ok(Math.abs(decoded.theta - original.theta) < 0.0001);
      assert.ok(Math.abs(decoded.phi - original.phi) < 0.0001);
    });

    test('should round-trip correctly', () => {
      const coords = generator.generate(777);
      const encoded = generator.encode(coords);
      const decoded = generator.decode(encoded);
      
      assert.ok(Math.abs(decoded.theta - coords.theta) < 0.0001);
      assert.ok(Math.abs(decoded.ring - coords.ring) < 0.0001);
    });
  });

  describe('distance', () => {
    test('should calculate distance between coordinates', () => {
      const c1 = { theta: 0, phi: 0, rho: 0, ring: 0, beat: 0 };
      const c2 = { theta: 1, phi: 1, rho: 1, ring: 1, beat: 1 };

      const dist = generator.distance(c1, c2);
      
      assert.ok(typeof dist === 'number');
      assert.ok(dist > 0);
    });

    test('should return 0 for same coordinates', () => {
      const c = { theta: 1, phi: 1, rho: 1, ring: 1, beat: 1 };
      const dist = generator.distance(c, c);
      assert.strictEqual(dist, 0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Integration', () => {
  test('should integrate spatial store with coordinate generator', () => {
    const store = new SpatialMemoryStore();
    const generator = new PhiCoordinateGenerator();

    const coords = generator.generate(12345);
    const result = store.store('integrated-memory', { value: 'test' }, coords);

    const retrieved = store.retrieve('integrated-memory');
    assert.strictEqual(retrieved.value.value, 'test');
    assert.ok(Math.abs(retrieved.coordinates.theta - coords.theta) < 0.0001);
  });
});
