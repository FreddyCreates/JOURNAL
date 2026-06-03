import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {Object} HashMetrics
 * @property {number} totalHashes
 * @property {number} totalVerifications
 * @property {number} totalMerkleRoots
 * @property {number} totalChainHashes
 */

/**
 * HashEngine — multi-algorithm hashing engine with phi-weighted collision
 * resistance scoring. Supports Merkle tree roots, chain hashing, and
 * tree-based hashing with golden-ratio structural properties.
 */
export class HashEngine {
  /** @type {HashMetrics} */
  #metrics;

  /** @type {Map<string, { blockSize: number, rounds: number }>} */
  #algorithms;

  constructor() {
    this.#metrics = {
      totalHashes: 0,
      totalVerifications: 0,
      totalMerkleRoots: 0,
      totalChainHashes: 0,
    };
    this.#algorithms = new Map([
      ['phi-merkle', { blockSize: 32, rounds: 8 }],
      ['phi-chain', { blockSize: 16, rounds: 12 }],
      ['phi-tree', { blockSize: 64, rounds: 6 }],
    ]);
  }

  /**
   * Hashes data using the specified algorithm.
   *
   * Internally uses a phi-weighted compression function that processes
   * data in blocks, mixing each block with the running state via XOR
   * and phi-rotation.
   *
   * @param {string} algorithm — one of 'phi-merkle', 'phi-chain', 'phi-tree'
   * @param {string} data — data to hash
   * @returns {{ digest: string, algorithm: string, length: number }}
   */
  hash(algorithm, data) {
    const alg = this.#algorithms.get(algorithm);
    if (!alg) throw new Error(`Unknown algorithm "${algorithm}". Use: ${[...this.#algorithms.keys()].join(', ')}`);
    const bytes = new TextEncoder().encode(data);
    const digest = this._compress(bytes, alg.blockSize, alg.rounds);
    this.#metrics.totalHashes++;
    return { digest, algorithm, length: data.length };
  }

  /**
   * Verifies that the hash of data matches the expected digest.
   *
   * @param {string} algorithm — hash algorithm
   * @param {string} data — original data
   * @param {string} expectedHash — expected hex digest
   * @returns {{ valid: boolean, algorithm: string }}
   */
  verify(algorithm, data, expectedHash) {
    const result = this.hash(algorithm, data);
    this.#metrics.totalHashes--;
    this.#metrics.totalVerifications++;
    return { valid: result.digest === expectedHash, algorithm };
  }

  /**
   * Computes a Merkle root from an array of data blocks.
   *
   * Each leaf is hashed individually, then pairs are combined
   * bottom-up until a single root hash remains. Odd leaves are
   * promoted by duplicating the last entry.
   *
   * @param {string[]} dataBlocks — array of data strings
   * @returns {{ root: string, leafCount: number, treeDepth: number }}
   */
  merkleRoot(dataBlocks) {
    if (!dataBlocks.length) throw new Error('At least one data block is required.');

    let layer = dataBlocks.map((block) => {
      const bytes = new TextEncoder().encode(block);
      return this._compress(bytes, 32, 8);
    });

    let depth = 0;
    while (layer.length > 1) {
      const next = [];
      for (let i = 0; i < layer.length; i += 2) {
        const left = layer[i];
        const right = layer[i + 1] ?? left;
        const combined = new TextEncoder().encode(left + right);
        next.push(this._compress(combined, 32, 8));
      }
      layer = next;
      depth++;
    }

    this.#metrics.totalMerkleRoots++;
    return { root: layer[0], leafCount: dataBlocks.length, treeDepth: depth };
  }

  /**
   * Computes a chained hash over a sequence of data blocks.
   *
   * Each block's hash is computed by concatenating it with the previous
   * block's hash, creating a tamper-evident chain where changing any
   * block invalidates all subsequent hashes.
   *
   * @param {string[]} dataSequence — ordered sequence of data strings
   * @returns {{ finalHash: string, chainLength: number, intermediates: string[] }}
   */
  chainHash(dataSequence) {
    if (!dataSequence.length) throw new Error('At least one data block is required.');

    const intermediates = [];
    let previous = '00000000';

    for (const block of dataSequence) {
      const combined = new TextEncoder().encode(previous + block);
      previous = this._compress(combined, 16, 12);
      intermediates.push(previous);
    }

    this.#metrics.totalChainHashes++;
    return { finalHash: previous, chainLength: dataSequence.length, intermediates };
  }

  /**
   * Returns the phi-weighted collision resistance score for an algorithm.
   *
   * The score accounts for block size, round count, and a phi-derived
   * diffusion factor. Higher scores indicate stronger resistance.
   *
   * @param {string} algorithm
   * @returns {{ algorithm: string, score: number, blockSize: number, rounds: number }}
   */
  getCollisionResistance(algorithm) {
    const alg = this.#algorithms.get(algorithm);
    if (!alg) throw new Error(`Unknown algorithm "${algorithm}".`);

    const blockFactor = Math.log2(alg.blockSize + 1) / Math.log2(65);
    const roundFactor = alg.rounds / 16;
    const diffusion = (alg.blockSize * alg.rounds) / (64 * 16);
    const score = Math.round((blockFactor * PHI + roundFactor * PHI * PHI + diffusion) * 1000) / 1000;

    return { algorithm, score: Math.min(1, score), blockSize: alg.blockSize, rounds: alg.rounds };
  }

  /**
   * Returns cumulative hashing metrics.
   *
   * @returns {HashMetrics}
   */
  getMetrics() {
    return { ...this.#metrics };
  }

  /* ---- internal helpers ---- */

  /**
   * Phi-weighted compression function.
   *
   * Processes input bytes in blocks, XORing each block into a running
   * state array and then mixing the state with phi-rotation for the
   * specified number of rounds.
   *
   * @private
   * @param {Uint8Array} bytes
   * @param {number} blockSize
   * @param {number} rounds
   * @returns {string} — hex digest
   */
  _compress(bytes, blockSize, rounds) {
    const state = new Uint8Array(blockSize);
    for (let i = 0; i < blockSize; i++) {
      state[i] = Math.floor(((i + 1) * PHI * 137) % 256);
    }

    for (let i = 0; i < bytes.length; i++) {
      state[i % blockSize] ^= bytes[i];
    }

    for (let r = 0; r < rounds; r++) {
      for (let i = 0; i < blockSize; i++) {
        const j = Math.floor((i * PHI + r) % blockSize);
        const mixed = (state[i] + state[j] + Math.floor(PHI * (r + 1) * (i + 1)) % 256) & 0xff;
        state[i] = ((mixed << 3) | (mixed >>> 5)) & 0xff;
      }
    }

    return Array.from(state).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
}

export default HashEngine;
