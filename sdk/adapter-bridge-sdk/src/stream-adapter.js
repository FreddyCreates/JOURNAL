import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {Object} StreamConfig
 * @property {number} [batchSize=64] - Maximum items per batch pull
 * @property {number} [flushInterval=1000] - Auto-flush interval in milliseconds
 * @property {number} [maxBufferSize=4096] - Maximum buffer capacity before backpressure
 */

/**
 * @typedef {Object} StreamRecord
 * @property {string} streamId
 * @property {StreamConfig} config
 * @property {Array<unknown>} buffer
 * @property {number} totalPushed
 * @property {number} totalPulled
 * @property {number} createdAt
 */

/**
 * @typedef {Object} PipeRecord
 * @property {string} pipeId
 * @property {string} sourceStreamId
 * @property {string} targetStreamId
 * @property {function|null} transformFn
 * @property {number} itemsTransferred
 * @property {number} createdAt
 */

/**
 * @typedef {Object} BackpressureMetrics
 * @property {string} streamId
 * @property {number} bufferUtilization - 0–1 ratio of buffer fullness
 * @property {number} phiWeightedPressure - Phi-scaled pressure score
 * @property {number} pendingItems
 * @property {number} maxBufferSize
 * @property {string} status - 'nominal' | 'elevated' | 'critical'
 */

/**
 * StreamAdapter — adapts between streaming and batch processing paradigms.
 *
 * Registers named streams with configurable batch sizes and buffer limits,
 * pushes items for streaming ingestion, pulls batches for batch consumers,
 * pipes streams together with optional transformation, and monitors
 * backpressure using phi-weighted pressure metrics.
 */
export class StreamAdapter {
  /** @type {Map<string, StreamRecord>} */
  #streams;

  /** @type {Map<string, PipeRecord>} */
  #pipes;

  constructor() {
    this.#streams = new Map();
    this.#pipes = new Map();
  }

  /**
   * Registers a named stream with configuration.
   * @param {string} streamId - Unique stream identifier
   * @param {StreamConfig} [config={}]
   * @throws {Error} If streamId is already registered
   */
  registerStream(streamId, config = {}) {
    if (typeof streamId !== 'string' || streamId.length === 0) {
      throw new Error('streamId must be a non-empty string');
    }
    if (this.#streams.has(streamId)) {
      throw new Error(`Stream "${streamId}" is already registered`);
    }

    this.#streams.set(streamId, {
      streamId,
      config: {
        batchSize: config.batchSize ?? 64,
        flushInterval: config.flushInterval ?? 1000,
        maxBufferSize: config.maxBufferSize ?? 4096,
      },
      buffer: [],
      totalPushed: 0,
      totalPulled: 0,
      createdAt: Date.now(),
    });
  }

  /**
   * Pushes an item into a stream's buffer.
   * Automatically forwards items through any connected pipes.
   * @param {string} streamId - Target stream identifier
   * @param {unknown} item - Item to push
   * @throws {Error} If stream is not registered or buffer is at max capacity
   */
  pushToStream(streamId, item) {
    const stream = this.#streams.get(streamId);
    if (!stream) {
      throw new Error(`Stream "${streamId}" is not registered`);
    }

    if (stream.buffer.length >= stream.config.maxBufferSize) {
      throw new Error(
        `Stream "${streamId}" buffer is full (${stream.config.maxBufferSize} items). ` +
        'Pull items or increase maxBufferSize to relieve backpressure.'
      );
    }

    stream.buffer.push(item);
    stream.totalPushed++;

    this.#propagatePipes(streamId, item);
  }

  /**
   * Pulls a batch of items from a stream's buffer.
   * @param {string} streamId - Source stream identifier
   * @param {number} [size] - Number of items to pull (defaults to stream batchSize)
   * @returns {Array<unknown>} Batch of items removed from the buffer
   * @throws {Error} If stream is not registered
   */
  pullBatch(streamId, size) {
    const stream = this.#streams.get(streamId);
    if (!stream) {
      throw new Error(`Stream "${streamId}" is not registered`);
    }

    const pullSize = size ?? stream.config.batchSize;
    const actualSize = Math.min(pullSize, stream.buffer.length);
    const batch = stream.buffer.splice(0, actualSize);
    stream.totalPulled += batch.length;

    return batch;
  }

  /**
   * Creates a pipe from one stream to another with an optional transform function.
   * Items pushed to the source stream are automatically forwarded to the target.
   * @param {string} sourceStreamId - Source stream identifier
   * @param {string} targetStreamId - Target stream identifier
   * @param {function} [transformFn=null] - Optional transformation applied to each item
   * @returns {PipeRecord}
   * @throws {Error} If either stream is not registered or pipe already exists
   */
  pipe(sourceStreamId, targetStreamId, transformFn = null) {
    if (!this.#streams.has(sourceStreamId)) {
      throw new Error(`Source stream "${sourceStreamId}" is not registered`);
    }
    if (!this.#streams.has(targetStreamId)) {
      throw new Error(`Target stream "${targetStreamId}" is not registered`);
    }

    const pipeKey = `${sourceStreamId}->${targetStreamId}`;
    if (this.#pipes.has(pipeKey)) {
      throw new Error(`Pipe from "${sourceStreamId}" to "${targetStreamId}" already exists`);
    }

    if (transformFn !== null && typeof transformFn !== 'function') {
      throw new TypeError('transformFn must be a function or null');
    }

    const record = {
      pipeId: crypto.randomUUID(),
      sourceStreamId,
      targetStreamId,
      transformFn,
      itemsTransferred: 0,
      createdAt: Date.now(),
    };

    this.#pipes.set(pipeKey, record);
    return structuredClone({ ...record, transformFn: null });
  }

  /**
   * Returns backpressure metrics for a stream using phi-weighted scoring.
   * @param {string} streamId
   * @returns {BackpressureMetrics}
   * @throws {Error} If stream is not registered
   */
  getBackpressure(streamId) {
    const stream = this.#streams.get(streamId);
    if (!stream) {
      throw new Error(`Stream "${streamId}" is not registered`);
    }

    const pendingItems = stream.buffer.length;
    const maxBuf = stream.config.maxBufferSize;
    const bufferUtilization = maxBuf > 0 ? pendingItems / maxBuf : 0;

    const phiWeightedPressure = bufferUtilization * (PHI / (PHI + (1 - bufferUtilization)));

    let status = 'nominal';
    if (bufferUtilization > 1 / PHI) {
      status = 'critical';
    } else if (bufferUtilization > 1 / (PHI * PHI)) {
      status = 'elevated';
    }

    return {
      streamId,
      bufferUtilization,
      phiWeightedPressure,
      pendingItems,
      maxBufferSize: maxBuf,
      status,
    };
  }

  /**
   * Drains all items from a stream's buffer and returns them.
   * @param {string} streamId
   * @returns {Array<unknown>} All items that were in the buffer
   * @throws {Error} If stream is not registered
   */
  drain(streamId) {
    const stream = this.#streams.get(streamId);
    if (!stream) {
      throw new Error(`Stream "${streamId}" is not registered`);
    }

    const items = stream.buffer.splice(0, stream.buffer.length);
    stream.totalPulled += items.length;
    return items;
  }

  /**
   * Propagates an item through all pipes originating from the given stream.
   * @param {string} sourceStreamId
   * @param {unknown} item
   */
  #propagatePipes(sourceStreamId, item) {
    for (const pipe of this.#pipes.values()) {
      if (pipe.sourceStreamId !== sourceStreamId) continue;

      const target = this.#streams.get(pipe.targetStreamId);
      if (!target) continue;

      if (target.buffer.length >= target.config.maxBufferSize) continue;

      const transformed = pipe.transformFn ? pipe.transformFn(item) : item;
      target.buffer.push(transformed);
      target.totalPushed++;
      pipe.itemsTransferred++;
    }
  }
}

export default StreamAdapter;
