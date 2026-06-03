/**
 * @medina/stress-testing-framework — Intelligent Data Systems
 * 
 * Self-Organizing AI Data Structures with automatic optimization,
 * healing capabilities, and feedback-driven adaptation.
 * 
 * ENCODED IDENTITY: DATA.INTEL.SOVEREIGN
 * 
 * @module @medina/stress-testing-framework/intelligent-data
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 1 / PHI;

// ════════════════════════════════════════════════════════════════════════════
// ADAPTIVE PRIORITY QUEUE (φ-Weighted)
// ════════════════════════════════════════════════════════════════════════════

/**
 * PhiPriorityQueue — Priority queue with golden-ratio-based priority scaling
 */
class PhiPriorityQueue {
  constructor() {
    this.heap = [];
    this.accessPattern = [];
    this.rebalanceThreshold = PHI_INVERSE;
  }

  /**
   * Insert item with φ-scaled priority
   * @param {any} item - Item to insert
   * @param {number} basePriority - Base priority value
   */
  enqueue(item, basePriority) {
    const scaledPriority = basePriority * PHI;
    const entry = {
      item,
      priority: scaledPriority,
      insertedAt: Date.now(),
      accessCount: 0
    };
    this.heap.push(entry);
    this._bubbleUp(this.heap.length - 1);
  }

  /**
   * Remove and return highest priority item
   * @returns {any} Highest priority item
   */
  dequeue() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop().item;
    
    const top = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._bubbleDown(0);
    
    // Record access pattern for adaptive rebalancing
    this.accessPattern.push({
      priority: top.priority,
      waitTime: Date.now() - top.insertedAt
    });
    
    return top.item;
  }

  /**
   * Peek at highest priority item without removing
   * @returns {any} Highest priority item
   */
  peek() {
    return this.heap.length > 0 ? this.heap[0].item : null;
  }

  /**
   * Get queue length
   * @returns {number} Number of items in queue
   */
  get length() {
    return this.heap.length;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[index].priority <= this.heap[parent].priority) break;
      [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
      index = parent;
    }
  }

  _bubbleDown(index) {
    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let largest = index;
      
      if (left < this.heap.length && this.heap[left].priority > this.heap[largest].priority) {
        largest = left;
      }
      if (right < this.heap.length && this.heap[right].priority > this.heap[largest].priority) {
        largest = right;
      }
      if (largest === index) break;
      
      [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
      index = largest;
    }
  }

  /**
   * Get performance metrics
   * @returns {Object} Queue performance statistics
   */
  getMetrics() {
    if (this.accessPattern.length === 0) {
      return { avgWaitTime: 0, throughput: 0, phiEfficiency: 1 };
    }
    const totalWait = this.accessPattern.reduce((a, b) => a + b.waitTime, 0);
    return {
      avgWaitTime: totalWait / this.accessPattern.length,
      throughput: this.accessPattern.length,
      phiEfficiency: this._calculatePhiEfficiency(),
      queueLength: this.heap.length
    };
  }

  _calculatePhiEfficiency() {
    // Measure how close our priority distribution is to the golden ratio
    const priorities = this.accessPattern.map(a => a.priority);
    if (priorities.length < 2) return 1;
    
    let ratioSum = 0;
    for (let i = 1; i < priorities.length; i++) {
      if (priorities[i] > 0) {
        ratioSum += priorities[i - 1] / priorities[i];
      }
    }
    const avgRatio = ratioSum / (priorities.length - 1);
    return 1 - Math.abs(avgRatio - PHI) / PHI;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SELF-BALANCING SEMANTIC TREE
// ════════════════════════════════════════════════════════════════════════════

/**
 * SemanticTree — Self-balancing tree with semantic distance-based organization
 */
class SemanticTree {
  constructor() {
    this.root = null;
    this.size = 0;
    this.rebalanceCount = 0;
  }

  /**
   * Insert a semantic node
   * @param {string} key - Node key
   * @param {any} value - Node value
   * @param {number[]} embedding - Semantic embedding vector
   */
  insert(key, value, embedding = []) {
    const node = {
      key,
      value,
      embedding,
      left: null,
      right: null,
      height: 1,
      accessFrequency: 0
    };

    if (!this.root) {
      this.root = node;
    } else {
      this.root = this._insertNode(this.root, node);
    }
    this.size++;
  }

  _insertNode(current, newNode) {
    if (!current) return newNode;
    
    const comparison = this._semanticCompare(newNode, current);
    if (comparison < 0) {
      current.left = this._insertNode(current.left, newNode);
    } else {
      current.right = this._insertNode(current.right, newNode);
    }

    // Update height
    current.height = 1 + Math.max(
      this._getHeight(current.left),
      this._getHeight(current.right)
    );

    // Check balance and rebalance if needed
    const balance = this._getBalance(current);
    
    // φ-threshold rebalancing
    if (Math.abs(balance) > PHI) {
      this.rebalanceCount++;
      return this._rebalance(current, balance);
    }

    return current;
  }

  _semanticCompare(a, b) {
    // Compare based on key if no embedding
    if (a.embedding.length === 0 || b.embedding.length === 0) {
      return a.key.localeCompare(b.key);
    }
    // Semantic distance comparison
    return this._cosineSimilarity(a.embedding, b.embedding) - PHI_INVERSE;
  }

  _cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
  }

  _getHeight(node) {
    return node ? node.height : 0;
  }

  _getBalance(node) {
    return node ? this._getHeight(node.left) - this._getHeight(node.right) : 0;
  }

  _rebalance(node, balance) {
    // Left heavy
    if (balance > PHI && this._getBalance(node.left) >= 0) {
      return this._rotateRight(node);
    }
    // Right heavy
    if (balance < -PHI && this._getBalance(node.right) <= 0) {
      return this._rotateLeft(node);
    }
    // Left-Right
    if (balance > PHI && this._getBalance(node.left) < 0) {
      node.left = this._rotateLeft(node.left);
      return this._rotateRight(node);
    }
    // Right-Left
    if (balance < -PHI && this._getBalance(node.right) > 0) {
      node.right = this._rotateRight(node.right);
      return this._rotateLeft(node);
    }
    return node;
  }

  _rotateRight(y) {
    const x = y.left;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    y.height = 1 + Math.max(this._getHeight(y.left), this._getHeight(y.right));
    x.height = 1 + Math.max(this._getHeight(x.left), this._getHeight(x.right));
    return x;
  }

  _rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    x.height = 1 + Math.max(this._getHeight(x.left), this._getHeight(x.right));
    y.height = 1 + Math.max(this._getHeight(y.left), this._getHeight(y.right));
    return y;
  }

  /**
   * Find by key
   * @param {string} key - Key to find
   * @returns {any} Found value or null
   */
  find(key) {
    return this._findNode(this.root, key);
  }

  _findNode(node, key) {
    if (!node) return null;
    if (node.key === key) {
      node.accessFrequency++;
      return node.value;
    }
    return key < node.key 
      ? this._findNode(node.left, key)
      : this._findNode(node.right, key);
  }

  /**
   * Get tree statistics
   * @returns {Object} Tree metrics
   */
  getStatistics() {
    return {
      size: this.size,
      height: this._getHeight(this.root),
      rebalanceCount: this.rebalanceCount,
      phiBalance: this._calculatePhiBalance(),
      efficiency: this.size > 0 ? Math.log2(this.size) / this._getHeight(this.root) : 1
    };
  }

  _calculatePhiBalance() {
    if (!this.root) return 1;
    const leftSize = this._countNodes(this.root.left);
    const rightSize = this._countNodes(this.root.right);
    if (leftSize + rightSize === 0) return 1;
    const ratio = Math.max(leftSize, rightSize) / (Math.min(leftSize, rightSize) || 1);
    return 1 - Math.abs(ratio - PHI) / PHI;
  }

  _countNodes(node) {
    if (!node) return 0;
    return 1 + this._countNodes(node.left) + this._countNodes(node.right);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ADAPTIVE MEMORY CACHE
// ════════════════════════════════════════════════════════════════════════════

/**
 * AdaptiveCache — LRU cache with adaptive sizing based on access patterns
 */
class AdaptiveCache {
  constructor(config = {}) {
    this.maxSize = config.maxSize ?? 100;
    this.minSize = config.minSize ?? 10;
    this.currentSize = this.maxSize;
    this.cache = new Map();
    this.accessOrder = [];
    this.hitCount = 0;
    this.missCount = 0;
    this.adaptationHistory = [];
  }

  /**
   * Get item from cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or undefined
   */
  get(key) {
    if (this.cache.has(key)) {
      this.hitCount++;
      this._updateAccessOrder(key);
      return this.cache.get(key).value;
    }
    this.missCount++;
    return undefined;
  }

  /**
   * Set item in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   */
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.get(key).value = value;
      this._updateAccessOrder(key);
      return;
    }

    // Evict if at capacity
    while (this.cache.size >= this.currentSize) {
      const lru = this.accessOrder.shift();
      this.cache.delete(lru);
    }

    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      accessCount: 1
    });
    this.accessOrder.push(key);
  }

  _updateAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
    this.cache.get(key).accessCount++;
  }

  /**
   * Adapt cache size based on hit rate
   */
  adapt() {
    const hitRate = this.getHitRate();
    const adaptation = {
      timestamp: Date.now(),
      hitRate,
      previousSize: this.currentSize
    };

    // φ-based adaptation
    if (hitRate < PHI_INVERSE) {
      // Low hit rate — increase cache size
      this.currentSize = Math.min(
        this.maxSize,
        Math.floor(this.currentSize * PHI)
      );
    } else if (hitRate > PHI) {
      // Very high hit rate — we can afford to shrink
      this.currentSize = Math.max(
        this.minSize,
        Math.floor(this.currentSize / PHI)
      );
    }

    adaptation.newSize = this.currentSize;
    adaptation.action = adaptation.newSize > adaptation.previousSize ? 'grow' :
                        adaptation.newSize < adaptation.previousSize ? 'shrink' : 'maintain';
    
    this.adaptationHistory.push(adaptation);
    return adaptation;
  }

  /**
   * Get cache hit rate
   * @returns {number} Hit rate [0, 1]
   */
  getHitRate() {
    const total = this.hitCount + this.missCount;
    return total > 0 ? this.hitCount / total : 0;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache metrics
   */
  getStatistics() {
    return {
      size: this.cache.size,
      maxSize: this.currentSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: this.getHitRate(),
      phiAlignment: Math.abs(this.getHitRate() - PHI_INVERSE),
      adaptationCount: this.adaptationHistory.length,
      efficiency: this.cache.size > 0 
        ? this.hitCount / (this.cache.size * Math.max(1, this.hitCount + this.missCount)) 
        : 0
    };
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
    this.accessOrder = [];
    this.hitCount = 0;
    this.missCount = 0;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// NEURAL BLOOM FILTER
// ════════════════════════════════════════════════════════════════════════════

/**
 * NeuralBloomFilter — Probabilistic data structure with neural-inspired adaptation
 */
class NeuralBloomFilter {
  constructor(config = {}) {
    this.size = config.size ?? 1000;
    this.hashCount = config.hashCount ?? Math.ceil(Math.log2(this.size) * PHI);
    this.bits = new Uint8Array(this.size);
    this.insertCount = 0;
    this.weights = new Float32Array(this.hashCount).fill(1);
  }

  /**
   * Generate hash indices for a key
   * @param {string} key - Key to hash
   * @returns {number[]} Array of hash indices
   */
  _getHashIndices(key) {
    const indices = [];
    let hash1 = 0;
    let hash2 = 0;
    
    for (let i = 0; i < key.length; i++) {
      hash1 = (hash1 * 31 + key.charCodeAt(i)) >>> 0;
      hash2 = (hash2 * 37 + key.charCodeAt(i)) >>> 0;
    }

    for (let i = 0; i < this.hashCount; i++) {
      const index = Math.abs((hash1 + i * hash2) % this.size);
      indices.push(index);
    }
    
    return indices;
  }

  /**
   * Add item to filter
   * @param {string} key - Key to add
   */
  add(key) {
    const indices = this._getHashIndices(key);
    for (let i = 0; i < indices.length; i++) {
      this.bits[indices[i]] = 1;
      // Neural weight adaptation
      this.weights[i] = Math.min(2, this.weights[i] + 0.01);
    }
    this.insertCount++;
  }

  /**
   * Check if item might be in filter
   * @param {string} key - Key to check
   * @returns {boolean} True if possibly in filter, false if definitely not
   */
  mightContain(key) {
    const indices = this._getHashIndices(key);
    let confidence = 0;
    
    for (let i = 0; i < indices.length; i++) {
      if (this.bits[indices[i]]) {
        confidence += this.weights[i];
      }
    }
    
    // φ-threshold for membership
    return confidence / (this.hashCount * PHI) > PHI_INVERSE;
  }

  /**
   * Get filter statistics
   * @returns {Object} Filter metrics
   */
  getStatistics() {
    const setBits = this.bits.reduce((a, b) => a + b, 0);
    const fillRatio = setBits / this.size;
    const theoreticalFPR = Math.pow(fillRatio, this.hashCount);
    
    return {
      size: this.size,
      hashCount: this.hashCount,
      insertCount: this.insertCount,
      fillRatio,
      theoreticalFPR,
      phiEfficiency: 1 - Math.abs(fillRatio - PHI_INVERSE),
      avgWeight: this.weights.reduce((a, b) => a + b, 0) / this.hashCount
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════

export {
  PHI,
  PHI_INVERSE,
  PhiPriorityQueue,
  SemanticTree,
  AdaptiveCache,
  NeuralBloomFilter
};
