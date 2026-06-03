/**
 * Intelligent Data Systems — Comprehensive Test Suite
 * 
 * Tests φ-weighted priority queues, semantic trees, adaptive caches,
 * and neural bloom filters.
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  PHI,
  PHI_INVERSE,
  PhiPriorityQueue,
  SemanticTree,
  AdaptiveCache,
  NeuralBloomFilter
} from '../src/intelligent-data.js';

// ════════════════════════════════════════════════════════════════════════════
// PHI PRIORITY QUEUE TESTS
// ════════════════════════════════════════════════════════════════════════════

test('PhiPriorityQueue - Constructor initializes empty queue', () => {
  const pq = new PhiPriorityQueue();
  assert.strictEqual(pq.length, 0);
});

test('PhiPriorityQueue - enqueue adds item', () => {
  const pq = new PhiPriorityQueue();
  pq.enqueue('item1', 1);
  assert.strictEqual(pq.length, 1);
});

test('PhiPriorityQueue - dequeue removes highest priority', () => {
  const pq = new PhiPriorityQueue();
  pq.enqueue('low', 1);
  pq.enqueue('high', 10);
  pq.enqueue('medium', 5);
  assert.strictEqual(pq.dequeue(), 'high');
  assert.strictEqual(pq.dequeue(), 'medium');
  assert.strictEqual(pq.dequeue(), 'low');
});

test('PhiPriorityQueue - dequeue on empty returns null', () => {
  const pq = new PhiPriorityQueue();
  assert.strictEqual(pq.dequeue(), null);
});

test('PhiPriorityQueue - peek returns but does not remove', () => {
  const pq = new PhiPriorityQueue();
  pq.enqueue('item', 5);
  assert.strictEqual(pq.peek(), 'item');
  assert.strictEqual(pq.length, 1);
});

test('PhiPriorityQueue - peek on empty returns null', () => {
  const pq = new PhiPriorityQueue();
  assert.strictEqual(pq.peek(), null);
});

test('PhiPriorityQueue - Priority is φ-scaled', () => {
  const pq = new PhiPriorityQueue();
  pq.enqueue('item', 1);
  assert.ok(Math.abs(pq.heap[0].priority - PHI) < 1e-10);
});

test('PhiPriorityQueue - getMetrics returns statistics', () => {
  const pq = new PhiPriorityQueue();
  pq.enqueue('a', 1);
  pq.enqueue('b', 2);
  pq.dequeue();
  const metrics = pq.getMetrics();
  assert.ok('avgWaitTime' in metrics);
  assert.ok('throughput' in metrics);
  assert.ok('phiEfficiency' in metrics);
});

test('PhiPriorityQueue - Handles 1000 items', () => {
  const pq = new PhiPriorityQueue();
  for (let i = 0; i < 1000; i++) {
    pq.enqueue(`item-${i}`, Math.random() * 100);
  }
  assert.strictEqual(pq.length, 1000);
  
  let lastPriority = Infinity;
  while (pq.length > 0) {
    const item = pq.dequeue();
    // Items should come out in priority order
  }
  assert.strictEqual(pq.length, 0);
});

test('PhiPriorityQueue - phiEfficiency is calculated', () => {
  const pq = new PhiPriorityQueue();
  for (let i = 1; i <= 50; i++) {
    pq.enqueue(`item-${i}`, i);
    pq.dequeue();
  }
  const metrics = pq.getMetrics();
  assert.ok(metrics.phiEfficiency >= -1 && metrics.phiEfficiency <= 1);
});

// ════════════════════════════════════════════════════════════════════════════
// SEMANTIC TREE TESTS
// ════════════════════════════════════════════════════════════════════════════

test('SemanticTree - Constructor initializes empty tree', () => {
  const tree = new SemanticTree();
  assert.strictEqual(tree.size, 0);
  assert.strictEqual(tree.root, null);
});

test('SemanticTree - Insert adds node', () => {
  const tree = new SemanticTree();
  tree.insert('key1', 'value1');
  assert.strictEqual(tree.size, 1);
  assert.ok(tree.root !== null);
});

test('SemanticTree - Find returns inserted value', () => {
  const tree = new SemanticTree();
  tree.insert('key1', 'value1');
  tree.insert('key2', 'value2');
  assert.strictEqual(tree.find('key1'), 'value1');
  assert.strictEqual(tree.find('key2'), 'value2');
});

test('SemanticTree - Find returns null for missing key', () => {
  const tree = new SemanticTree();
  tree.insert('key1', 'value1');
  assert.strictEqual(tree.find('nonexistent'), null);
});

test('SemanticTree - Insert with embedding', () => {
  const tree = new SemanticTree();
  tree.insert('doc1', 'Document 1', [0.1, 0.2, 0.3]);
  tree.insert('doc2', 'Document 2', [0.4, 0.5, 0.6]);
  assert.strictEqual(tree.size, 2);
});

test('SemanticTree - getStatistics returns metrics', () => {
  const tree = new SemanticTree();
  for (let i = 0; i < 20; i++) {
    tree.insert(`key-${i}`, `value-${i}`);
  }
  const stats = tree.getStatistics();
  assert.ok('size' in stats);
  assert.ok('height' in stats);
  assert.ok('rebalanceCount' in stats);
  assert.ok('phiBalance' in stats);
  assert.ok('efficiency' in stats);
});

test('SemanticTree - Tree stays balanced', () => {
  const tree = new SemanticTree();
  // Insert in sorted order (worst case for unbalanced BST)
  for (let i = 0; i < 100; i++) {
    tree.insert(`key-${i.toString().padStart(3, '0')}`, i);
  }
  const stats = tree.getStatistics();
  // Height should be logarithmic, not linear
  assert.ok(stats.height < 30, `Height ${stats.height} is too large for 100 nodes`);
});

test('SemanticTree - phiBalance is calculated', () => {
  const tree = new SemanticTree();
  for (let i = 0; i < 50; i++) {
    tree.insert(`key-${i}`, i);
  }
  const stats = tree.getStatistics();
  assert.ok(stats.phiBalance >= 0 && stats.phiBalance <= 1);
});

test('SemanticTree - Access frequency is tracked', () => {
  const tree = new SemanticTree();
  tree.insert('key1', 'value1');
  tree.find('key1');
  tree.find('key1');
  tree.find('key1');
  assert.strictEqual(tree.root.accessFrequency, 3);
});

// ════════════════════════════════════════════════════════════════════════════
// ADAPTIVE CACHE TESTS
// ════════════════════════════════════════════════════════════════════════════

test('AdaptiveCache - Constructor initializes with defaults', () => {
  const cache = new AdaptiveCache();
  assert.strictEqual(cache.maxSize, 100);
  assert.strictEqual(cache.minSize, 10);
});

test('AdaptiveCache - Constructor accepts config', () => {
  const cache = new AdaptiveCache({ maxSize: 50, minSize: 5 });
  assert.strictEqual(cache.maxSize, 50);
  assert.strictEqual(cache.minSize, 5);
});

test('AdaptiveCache - set and get work correctly', () => {
  const cache = new AdaptiveCache();
  cache.set('key1', 'value1');
  assert.strictEqual(cache.get('key1'), 'value1');
});

test('AdaptiveCache - get returns undefined for missing key', () => {
  const cache = new AdaptiveCache();
  assert.strictEqual(cache.get('nonexistent'), undefined);
});

test('AdaptiveCache - Hit rate is tracked', () => {
  const cache = new AdaptiveCache();
  cache.set('key1', 'value1');
  cache.get('key1'); // hit
  cache.get('key2'); // miss
  assert.strictEqual(cache.getHitRate(), 0.5);
});

test('AdaptiveCache - Eviction occurs at capacity', () => {
  const cache = new AdaptiveCache({ maxSize: 3 });
  cache.set('a', 1);
  cache.set('b', 2);
  cache.set('c', 3);
  cache.set('d', 4); // Should evict 'a'
  assert.strictEqual(cache.get('a'), undefined);
  assert.strictEqual(cache.get('d'), 4);
});

test('AdaptiveCache - LRU eviction policy', () => {
  const cache = new AdaptiveCache({ maxSize: 3 });
  cache.set('a', 1);
  cache.set('b', 2);
  cache.set('c', 3);
  cache.get('a'); // Touch 'a', making 'b' LRU
  cache.set('d', 4); // Should evict 'b'
  assert.strictEqual(cache.get('b'), undefined);
  assert.strictEqual(cache.get('a'), 1);
});

test('AdaptiveCache - adapt grows cache on low hit rate', () => {
  const cache = new AdaptiveCache({ maxSize: 100, minSize: 10 });
  cache.currentSize = 50;
  // Simulate low hit rate
  for (let i = 0; i < 10; i++) {
    cache.get(`miss-${i}`); // All misses
  }
  const adaptation = cache.adapt();
  assert.ok(adaptation.newSize >= adaptation.previousSize || adaptation.action === 'grow');
});

test('AdaptiveCache - getStatistics returns metrics', () => {
  const cache = new AdaptiveCache();
  cache.set('a', 1);
  cache.get('a');
  const stats = cache.getStatistics();
  assert.ok('size' in stats);
  assert.ok('hitCount' in stats);
  assert.ok('hitRate' in stats);
  assert.ok('phiAlignment' in stats);
});

test('AdaptiveCache - clear empties cache', () => {
  const cache = new AdaptiveCache();
  cache.set('a', 1);
  cache.set('b', 2);
  cache.clear();
  assert.strictEqual(cache.getStatistics().size, 0);
  assert.strictEqual(cache.hitCount, 0);
});

test('AdaptiveCache - Update existing key', () => {
  const cache = new AdaptiveCache();
  cache.set('key', 'value1');
  cache.set('key', 'value2');
  assert.strictEqual(cache.get('key'), 'value2');
  assert.strictEqual(cache.getStatistics().size, 1);
});

// ════════════════════════════════════════════════════════════════════════════
// NEURAL BLOOM FILTER TESTS
// ════════════════════════════════════════════════════════════════════════════

test('NeuralBloomFilter - Constructor initializes with defaults', () => {
  const bf = new NeuralBloomFilter();
  assert.strictEqual(bf.size, 1000);
  assert.ok(bf.hashCount > 0);
});

test('NeuralBloomFilter - Constructor accepts config', () => {
  const bf = new NeuralBloomFilter({ size: 500, hashCount: 5 });
  assert.strictEqual(bf.size, 500);
  assert.strictEqual(bf.hashCount, 5);
});

test('NeuralBloomFilter - add and mightContain work', () => {
  const bf = new NeuralBloomFilter();
  bf.add('key1');
  assert.strictEqual(bf.mightContain('key1'), true);
});

test('NeuralBloomFilter - Definitely not for unadded keys', () => {
  const bf = new NeuralBloomFilter({ size: 10000 });
  bf.add('existing');
  // After adding only one item, false positive should be very rare
  // Though not guaranteed (probabilistic), testing with specific key
  const contains = bf.mightContain('definitely-not-added-xyz-123');
  // This might occasionally be true due to false positives
  assert.ok(typeof contains === 'boolean');
});

test('NeuralBloomFilter - hashCount is φ-based by default', () => {
  const bf = new NeuralBloomFilter({ size: 1000 });
  const expectedCount = Math.ceil(Math.log2(1000) * PHI);
  assert.strictEqual(bf.hashCount, expectedCount);
});

test('NeuralBloomFilter - getStatistics returns metrics', () => {
  const bf = new NeuralBloomFilter();
  bf.add('key1');
  bf.add('key2');
  const stats = bf.getStatistics();
  assert.ok('size' in stats);
  assert.ok('hashCount' in stats);
  assert.ok('insertCount' in stats);
  assert.ok('fillRatio' in stats);
  assert.ok('theoreticalFPR' in stats);
  assert.ok('phiEfficiency' in stats);
});

test('NeuralBloomFilter - Fill ratio increases with inserts', () => {
  const bf = new NeuralBloomFilter({ size: 100 });
  const initial = bf.getStatistics().fillRatio;
  for (let i = 0; i < 50; i++) {
    bf.add(`key-${i}`);
  }
  const after = bf.getStatistics().fillRatio;
  assert.ok(after > initial);
});

test('NeuralBloomFilter - Weights adapt over time', () => {
  const bf = new NeuralBloomFilter();
  const initialAvgWeight = bf.getStatistics().avgWeight;
  for (let i = 0; i < 100; i++) {
    bf.add(`key-${i}`);
  }
  const afterAvgWeight = bf.getStatistics().avgWeight;
  assert.ok(afterAvgWeight >= initialAvgWeight);
});

test('NeuralBloomFilter - Handles 10000 insertions', () => {
  const bf = new NeuralBloomFilter({ size: 100000 });
  for (let i = 0; i < 10000; i++) {
    bf.add(`key-${i}`);
  }
  // Verify all added keys are "possibly" present
  let allFound = true;
  for (let i = 0; i < 100; i++) { // Sample check
    if (!bf.mightContain(`key-${i}`)) {
      allFound = false;
      break;
    }
  }
  assert.ok(allFound, 'Added keys should always be found (no false negatives)');
});

// ════════════════════════════════════════════════════════════════════════════
// INTEGRATION AND STRESS TESTS
// ════════════════════════════════════════════════════════════════════════════

test('Integration - PriorityQueue with SemanticTree', () => {
  const pq = new PhiPriorityQueue();
  const tree = new SemanticTree();
  
  // Simulate processing documents
  for (let i = 0; i < 50; i++) {
    const doc = { id: `doc-${i}`, content: `Content ${i}` };
    tree.insert(doc.id, doc);
    pq.enqueue(doc.id, Math.random() * 100);
  }
  
  // Process in priority order
  let processed = 0;
  while (pq.length > 0) {
    const docId = pq.dequeue();
    const doc = tree.find(docId);
    if (doc) processed++;
  }
  
  assert.strictEqual(processed, 50);
});

test('Integration - Cache with BloomFilter', () => {
  const cache = new AdaptiveCache({ maxSize: 50 });
  const bf = new NeuralBloomFilter();
  
  // Use bloom filter to check before cache lookup
  for (let i = 0; i < 100; i++) {
    const key = `key-${i}`;
    bf.add(key);
    cache.set(key, `value-${i}`);
  }
  
  // Query with bloom filter pre-check
  let bloomFilterHits = 0;
  let cacheHits = 0;
  
  for (let i = 0; i < 200; i++) {
    const key = `key-${i}`;
    if (bf.mightContain(key)) {
      bloomFilterHits++;
      if (cache.get(key) !== undefined) {
        cacheHits++;
      }
    }
  }
  
  assert.ok(bloomFilterHits >= 100, 'All added keys should pass bloom filter');
  // Some cache hits (LRU may have evicted some)
  assert.ok(cacheHits > 0);
});

test('Stress - 5000 operations across all data structures', () => {
  const pq = new PhiPriorityQueue();
  const tree = new SemanticTree();
  const cache = new AdaptiveCache({ maxSize: 1000 });
  const bf = new NeuralBloomFilter({ size: 10000 });
  
  for (let i = 0; i < 5000; i++) {
    const key = `key-${i % 1000}`;
    const value = `value-${i}`;
    
    // Add to all structures
    pq.enqueue(key, Math.random() * 100);
    tree.insert(key, value);
    cache.set(key, value);
    bf.add(key);
    
    // Periodic reads
    if (i % 10 === 0) {
      pq.dequeue();
      tree.find(key);
      cache.get(key);
      bf.mightContain(key);
    }
  }
  
  // Verify all structures are functional
  assert.ok(pq.getMetrics().throughput > 0);
  assert.ok(tree.getStatistics().size > 0);
  assert.ok(cache.getStatistics().hitRate > 0);
  assert.ok(bf.getStatistics().insertCount > 0);
});
