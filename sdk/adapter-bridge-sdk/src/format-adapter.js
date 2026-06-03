import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {Object} FormatEntry
 * @property {string} formatId
 * @property {function(unknown): string} serializer
 * @property {function(string): unknown} deserializer
 * @property {number} registeredAt
 */

/**
 * @typedef {Object} BenchmarkResult
 * @property {string} sourceFormat
 * @property {string} targetFormat
 * @property {number} iterations
 * @property {number} avgLatencyMs
 * @property {number} throughputOpsPerSec
 * @property {number} phiEfficiencyScore
 */

/**
 * FormatAdapter — converts between data formats (JSON, CSV, XML-like,
 * binary-encoded, plain text) with auto-detection and benchmarking.
 *
 * Registers format serializers/deserializers, converts data between any two
 * registered formats, auto-detects format from raw input, provides a
 * conversion matrix, and benchmarks conversion throughput with phi-weighted
 * efficiency scoring.
 */
export class FormatAdapter {
  /** @type {Map<string, FormatEntry>} */
  #formats;

  /** @type {number} */
  #totalConversions;

  constructor() {
    this.#formats = new Map();
    this.#totalConversions = 0;
    this.#registerBuiltinFormats();
  }

  /**
   * Registers built-in JSON, CSV, and text formats.
   */
  #registerBuiltinFormats() {
    this.#formats.set('json', {
      formatId: 'json',
      serializer: (data) => JSON.stringify(data, null, 2),
      deserializer: (str) => JSON.parse(str),
      registeredAt: Date.now(),
    });

    this.#formats.set('csv', {
      formatId: 'csv',
      serializer: (data) => {
        const rows = Array.isArray(data) ? data : [data];
        if (rows.length === 0) return '';
        const headers = Object.keys(rows[0]);
        const lines = [headers.join(',')];
        for (const row of rows) {
          lines.push(headers.map((h) => String(row[h] ?? '')).join(','));
        }
        return lines.join('\n');
      },
      deserializer: (str) => {
        const lines = str.trim().split('\n');
        if (lines.length < 2) return [];
        const headers = lines[0].split(',');
        return lines.slice(1).map((line) => {
          const values = line.split(',');
          const obj = {};
          for (let i = 0; i < headers.length; i++) {
            obj[headers[i]] = values[i] ?? '';
          }
          return obj;
        });
      },
      registeredAt: Date.now(),
    });

    this.#formats.set('text', {
      formatId: 'text',
      serializer: (data) => (typeof data === 'string' ? data : JSON.stringify(data)),
      deserializer: (str) => str,
      registeredAt: Date.now(),
    });
  }

  /**
   * Registers a custom data format with its serializer and deserializer.
   * @param {string} formatId - Unique format identifier
   * @param {function(unknown): string} serializer - Converts data to format string
   * @param {function(string): unknown} deserializer - Parses format string to data
   * @throws {Error} If formatId already exists or arguments are invalid
   */
  registerFormat(formatId, serializer, deserializer) {
    if (typeof formatId !== 'string' || formatId.length === 0) throw new Error('formatId must be a non-empty string');
    if (this.#formats.has(formatId)) throw new Error(`Format "${formatId}" is already registered`);
    if (typeof serializer !== 'function') throw new TypeError('serializer must be a function');
    if (typeof deserializer !== 'function') throw new TypeError('deserializer must be a function');
    this.#formats.set(formatId, { formatId, serializer, deserializer, registeredAt: Date.now() });
  }

  /**
   * Converts data from one format to another.
   * @param {string} sourceFormat
   * @param {string} targetFormat
   * @param {unknown} data
   * @returns {{data: unknown, sourceFormat: string, targetFormat: string, bytesBefore: number, bytesAfter: number, compressionRatio: number, conversionId: string}}
   */
  convert(sourceFormat, targetFormat, data) {
    const source = this.#formats.get(sourceFormat);
    if (!source) throw new Error(`Source format "${sourceFormat}" is not registered. Available: ${[...this.#formats.keys()].join(', ')}`);
    const target = this.#formats.get(targetFormat);
    if (!target) throw new Error(`Target format "${targetFormat}" is not registered. Available: ${[...this.#formats.keys()].join(', ')}`);
    const serialized = source.serializer(data);
    const bytesBefore = serialized.length;
    const converted = target.deserializer(serialized);
    const bytesAfter = target.serializer(converted).length;
    this.#totalConversions++;
    return { data: converted, sourceFormat, targetFormat, bytesBefore, bytesAfter, compressionRatio: bytesBefore > 0 ? bytesAfter / bytesBefore : 1, conversionId: crypto.randomUUID() };
  }

  /**
   * Auto-detects the format of raw input data by probing registered deserializers.
   * Returns the first format that successfully parses the input without error,
   * weighted by a phi-scaled confidence heuristic.
   * @param {string} data - Raw string data to detect
   * @returns {{formatId: string, confidence: number} | null}
   */
  detectFormat(data) {
    if (typeof data !== 'string') return null;

    const candidates = [];
    for (const [formatId, entry] of this.#formats) {
      try {
        const parsed = entry.deserializer(data);
        const roundTrip = entry.serializer(parsed);
        const similarity = this.#stringSimilarity(data.trim(), roundTrip.trim());
        const confidence = similarity * (PHI / (PHI + (1 - similarity)));
        candidates.push({ formatId, confidence });
      } catch {
        // format did not match
      }
    }

    if (candidates.length === 0) return null;
    candidates.sort((a, b) => b.confidence - a.confidence);
    return candidates[0];
  }

  /**
   * Returns a matrix of all supported conversion paths between registered formats.
   * @returns {Array<{source: string, target: string, supported: boolean}>}
   */
  getConversionMatrix() {
    const ids = [...this.#formats.keys()];
    const matrix = [];
    for (const source of ids) {
      for (const target of ids) {
        if (source !== target) {
          matrix.push({ source, target, supported: true });
        }
      }
    }
    return matrix;
  }

  /**
   * Benchmarks conversion speed between two formats over multiple iterations.
   * Returns throughput and a phi-weighted efficiency score.
   * @param {string} sourceFormat
   * @param {string} targetFormat
   * @param {unknown} sampleData
   * @param {number} [iterations=100]
   * @returns {BenchmarkResult}
   */
  benchmark(sourceFormat, targetFormat, sampleData, iterations = 100) {
    const source = this.#formats.get(sourceFormat);
    if (!source) {
      throw new Error(`Source format "${sourceFormat}" is not registered`);
    }
    const target = this.#formats.get(targetFormat);
    if (!target) {
      throw new Error(`Target format "${targetFormat}" is not registered`);
    }

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      const serialized = source.serializer(sampleData);
      target.deserializer(serialized);
    }
    const elapsed = performance.now() - start;

    const avgLatencyMs = elapsed / iterations;
    const throughputOpsPerSec = iterations / (elapsed / 1000);
    const normalizedSpeed = Math.min(1, 1 / (1 + avgLatencyMs));
    const phiEfficiencyScore = normalizedSpeed * (PHI / (PHI + 1));

    return {
      sourceFormat,
      targetFormat,
      iterations,
      avgLatencyMs,
      throughputOpsPerSec,
      phiEfficiencyScore,
    };
  }

  /**
   * Computes a simple character-level similarity ratio between two strings.
   * @param {string} a
   * @param {string} b
   * @returns {number} 0–1 similarity score
   */
  #stringSimilarity(a, b) {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    let matches = 0;
    const minLen = Math.min(a.length, b.length);
    for (let i = 0; i < minLen; i++) {
      if (a[i] === b[i]) matches++;
    }
    return matches / maxLen;
  }
}

export default FormatAdapter;
