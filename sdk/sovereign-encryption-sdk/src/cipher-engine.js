import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * CipherEngine — multi-algorithm cipher engine with phi-weighted algorithm
 * selection. Registers pluggable cipher algorithms and recommends the best
 * one for a given payload size using golden-ratio scoring.
 */
export class CipherEngine {
  /** @type {Map<string, AlgorithmConfig>} */
  #algorithms;

  /** @type {EncryptionMetrics} */
  #metrics;

  constructor() {
    this.#algorithms = new Map();
    this.#metrics = {
      totalEncryptions: 0,
      totalDecryptions: 0,
      totalBytesEncrypted: 0,
      totalBytesDecrypted: 0,
    };
    this._registerBuiltins();
  }

  /**
   * Registers a cipher algorithm with the engine.
   *
   * @param {string} algId — unique algorithm identifier
   * @param {AlgorithmConfig} config — algorithm configuration
   * @returns {{ algId: string, name: string, blockSize: number, keySize: number }}
   */
  registerAlgorithm(algId, config) {
    if (this.#algorithms.has(algId)) {
      throw new Error(`Algorithm "${algId}" is already registered.`);
    }
    if (typeof config.encryptFn !== 'function' || typeof config.decryptFn !== 'function') {
      throw new Error('Both encryptFn and decryptFn must be functions.');
    }
    this.#algorithms.set(algId, { ...config });
    return { algId, name: config.name, blockSize: config.blockSize, keySize: config.keySize };
  }

  /**
   * Encrypts plaintext using the specified registered algorithm.
   *
   * The plaintext is encoded to bytes, passed through the algorithm's
   * encryptFn, and returned as a hex-encoded ciphertext string.
   *
   * @param {string} algId — algorithm to use
   * @param {string} plaintext — data to encrypt
   * @param {Uint8Array} key — encryption key
   * @returns {{ ciphertext: string, algId: string, timestamp: number, length: number }}
   */
  encrypt(algId, plaintext, key) {
    const alg = this.#algorithms.get(algId);
    if (!alg) throw new Error(`Algorithm "${algId}" not found.`);
    const inputBytes = new TextEncoder().encode(plaintext);
    const outputBytes = alg.encryptFn(inputBytes, key);
    this.#metrics.totalEncryptions++;
    this.#metrics.totalBytesEncrypted += inputBytes.length;
    return {
      ciphertext: this._bytesToHex(outputBytes),
      algId,
      timestamp: Date.now(),
      length: plaintext.length,
    };
  }

  /**
   * Decrypts hex-encoded ciphertext using the specified algorithm.
   *
   * @param {string} algId — algorithm to use
   * @param {string} ciphertext — hex-encoded ciphertext
   * @param {Uint8Array} key — decryption key
   * @returns {{ plaintext: string, algId: string, timestamp: number }}
   */
  decrypt(algId, ciphertext, key) {
    const alg = this.#algorithms.get(algId);
    if (!alg) throw new Error(`Algorithm "${algId}" not found.`);
    const inputBytes = this._hexToBytes(ciphertext);
    const outputBytes = alg.decryptFn(inputBytes, key);
    this.#metrics.totalDecryptions++;
    this.#metrics.totalBytesDecrypted += outputBytes.length;
    return {
      plaintext: new TextDecoder().decode(outputBytes),
      algId,
      timestamp: Date.now(),
    };
  }

  /**
   * Recommends the best algorithm for a given data size.
   *
   * Scoring uses phi-weighted factors: block alignment efficiency,
   * key strength ratio, and throughput estimate.
   *
   * @param {number} dataSize — data size in bytes
   * @returns {{ algId: string, score: number, reason: string }}
   */
  getBestAlgorithm(dataSize) {
    let bestId = null;
    let bestScore = -1;
    let bestReason = '';

    for (const [algId, alg] of this.#algorithms) {
      const alignment = 1 - ((dataSize % alg.blockSize) / alg.blockSize);
      const keyStrength = Math.min(1, alg.keySize / 64);
      const throughput = 1 / (1 + Math.log2(alg.blockSize));
      const score = Math.round((alignment * PHI + keyStrength * PHI * PHI + throughput) * 1000) / 1000;

      if (score > bestScore) {
        bestScore = score;
        bestId = algId;
        bestReason = `alignment=${alignment.toFixed(3)}, keyStrength=${keyStrength.toFixed(3)}, throughput=${throughput.toFixed(3)}`;
      }
    }

    if (!bestId) throw new Error('No algorithms registered.');
    return { algId: bestId, score: bestScore, reason: bestReason };
  }

  /**
   * Benchmarks all registered algorithms against sample data.
   *
   * Each algorithm encrypts and decrypts the sample, and wall-clock
   * time is recorded for comparison.
   *
   * @param {string} sampleData — data to use for benchmarking
   * @returns {Array<{ algId: string, encryptMs: number, decryptMs: number }>}
   */
  benchmarkAll(sampleData) {
    const key = new Uint8Array(64);
    for (let i = 0; i < key.length; i++) key[i] = Math.floor((i * PHI * 137) % 256);
    const results = [];

    for (const [algId] of this.#algorithms) {
      const t0 = performance.now();
      const enc = this.encrypt(algId, sampleData, key);
      const t1 = performance.now();
      this.decrypt(algId, enc.ciphertext, key);
      const t2 = performance.now();
      results.push({
        algId,
        encryptMs: Math.round((t1 - t0) * 1000) / 1000,
        decryptMs: Math.round((t2 - t1) * 1000) / 1000,
      });
    }

    return results;
  }

  /**
   * Returns cumulative encryption and decryption metrics.
   *
   * @returns {EncryptionMetrics}
   */
  getMetrics() {
    return { ...this.#metrics };
  }

  /* ---- built-in algorithms ---- */

  /** @private */
  _registerBuiltins() {
    this.registerAlgorithm('phi-xor', {
      name: 'Phi-XOR Cipher',
      blockSize: 16,
      keySize: 32,
      encryptFn: (data, key) => this._phiXor(data, key),
      decryptFn: (data, key) => this._phiXor(data, key),
    });

    this.registerAlgorithm('phi-shift', {
      name: 'Phi-Shift Cipher',
      blockSize: 32,
      keySize: 32,
      encryptFn: (data, key) => this._phiShift(data, key, 1),
      decryptFn: (data, key) => this._phiShift(data, key, -1),
    });

    this.registerAlgorithm('phi-rotate', {
      name: 'Phi-Rotate Cipher',
      blockSize: 64,
      keySize: 64,
      encryptFn: (data, key) => this._phiRotate(data, key, 1),
      decryptFn: (data, key) => this._phiRotate(data, key, -1),
    });
  }

  /** @private */
  _phiXor(data, key) {
    const out = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const ki = Math.floor((i * PHI) % key.length);
      out[i] = data[i] ^ key[ki];
    }
    return out;
  }

  /** @private */
  _phiShift(data, key, direction) {
    const out = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const ki = Math.floor((i * PHI) % key.length);
      const shift = Math.floor((key[ki] * PHI) % 8);
      out[i] = (data[i] + direction * shift + 256) % 256;
    }
    return out;
  }

  /** @private */
  _phiRotate(data, key, direction) {
    const out = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const ki = Math.floor((i * PHI) % key.length);
      const rotation = Math.floor((key[ki] * PHI) % 7) + 1;
      if (direction > 0) {
        out[i] = ((data[i] << rotation) | (data[i] >>> (8 - rotation))) & 0xff;
      } else {
        out[i] = ((data[i] >>> rotation) | (data[i] << (8 - rotation))) & 0xff;
      }
    }
    return out;
  }

  /** @private */
  _bytesToHex(bytes) {
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /** @private */
  _hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }
}

export default CipherEngine;
