import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {Object} ProtocolEntry
 * @property {string} protocolId
 * @property {function(unknown): string} encoder - Encodes data into protocol wire format
 * @property {function(string): unknown} decoder - Decodes protocol wire format into data
 * @property {number} registeredAt
 */

/**
 * @typedef {Object} TranslationResult
 * @property {unknown} data - Translated payload
 * @property {string} sourceProtocol
 * @property {string} targetProtocol
 * @property {number} fidelityScore - 0–1 phi-weighted quality score
 * @property {number} latencyMs
 * @property {string} translationId
 */

/**
 * @typedef {Object} BridgeRecord
 * @property {string} bridgeId
 * @property {string} protocolA
 * @property {string} protocolB
 * @property {number} translationCount
 * @property {number} cumulativeFidelity
 * @property {number} createdAt
 */

/**
 * @typedef {Object} QualityMetrics
 * @property {number} totalTranslations
 * @property {number} averageFidelity
 * @property {number} phiWeightedScore
 * @property {number} activeBridges
 * @property {number} registeredProtocols
 */

/**
 * ProtocolAdapter — translates between different AI communication protocols.
 *
 * Registers protocol encoders/decoders, translates messages between any two
 * registered protocols, creates persistent bidirectional bridges, and tracks
 * phi-weighted translation fidelity across all routes.
 */
export class ProtocolAdapter {
  /** @type {Map<string, ProtocolEntry>} */
  #protocols;

  /** @type {Map<string, BridgeRecord>} */
  #bridges;

  /** @type {number} */
  #totalTranslations;

  /** @type {number} */
  #cumulativeFidelity;

  constructor() {
    this.#protocols = new Map();
    this.#bridges = new Map();
    this.#totalTranslations = 0;
    this.#cumulativeFidelity = 0;
  }

  /**
   * Registers a protocol with its encode and decode functions.
   * @param {string} protocolId - Unique protocol identifier
   * @param {function(unknown): string} encoder - Serializes data to wire format
   * @param {function(string): unknown} decoder - Deserializes wire format to data
   * @throws {Error} If protocolId is already registered or arguments are invalid
   */
  registerProtocol(protocolId, encoder, decoder) {
    if (typeof protocolId !== 'string' || protocolId.length === 0) {
      throw new Error('protocolId must be a non-empty string');
    }
    if (this.#protocols.has(protocolId)) {
      throw new Error(`Protocol "${protocolId}" is already registered`);
    }
    if (typeof encoder !== 'function') {
      throw new TypeError('encoder must be a function');
    }
    if (typeof decoder !== 'function') {
      throw new TypeError('decoder must be a function');
    }

    this.#protocols.set(protocolId, {
      protocolId,
      encoder,
      decoder,
      registeredAt: Date.now(),
    });
  }

  /**
   * Translates a message from one protocol to another.
   * Encodes with the source protocol, then decodes with the target protocol.
   * Measures translation fidelity using phi-weighted byte-length comparison.
   * @param {string} sourceProtocol - Source protocol identifier
   * @param {string} targetProtocol - Target protocol identifier
   * @param {unknown} message - The message payload to translate
   * @returns {TranslationResult}
   * @throws {Error} If either protocol is not registered
   */
  translate(sourceProtocol, targetProtocol, message) {
    const source = this.#protocols.get(sourceProtocol);
    if (!source) {
      throw new Error(`Source protocol "${sourceProtocol}" is not registered`);
    }
    const target = this.#protocols.get(targetProtocol);
    if (!target) {
      throw new Error(`Target protocol "${targetProtocol}" is not registered`);
    }

    const startTime = performance.now();
    const encoded = source.encoder(message);
    const decoded = target.decoder(encoded);
    const latencyMs = performance.now() - startTime;

    const originalStr = JSON.stringify(message);
    const resultStr = JSON.stringify(decoded);
    const lengthRatio = originalStr.length > 0
      ? Math.min(resultStr.length, originalStr.length) / Math.max(resultStr.length, originalStr.length)
      : 0;

    const fidelityScore = Math.min(1, lengthRatio * (PHI / (PHI + (1 - lengthRatio))));

    this.#totalTranslations++;
    this.#cumulativeFidelity += fidelityScore;

    const bridgeKey = this.#bridgeKey(sourceProtocol, targetProtocol);
    const bridge = this.#bridges.get(bridgeKey);
    if (bridge) {
      bridge.translationCount++;
      bridge.cumulativeFidelity += fidelityScore;
    }

    return {
      data: decoded,
      sourceProtocol,
      targetProtocol,
      fidelityScore,
      latencyMs,
      translationId: crypto.randomUUID(),
    };
  }

  /**
   * Returns phi-weighted quality metrics for all translations performed.
   * @returns {QualityMetrics}
   */
  getTranslationQuality() {
    const averageFidelity = this.#totalTranslations > 0
      ? this.#cumulativeFidelity / this.#totalTranslations
      : 0;

    const phiWeightedScore = averageFidelity * (PHI / (PHI + 1));

    return {
      totalTranslations: this.#totalTranslations,
      averageFidelity,
      phiWeightedScore,
      activeBridges: this.#bridges.size,
      registeredProtocols: this.#protocols.size,
    };
  }

  /**
   * Creates a persistent bidirectional bridge between two protocols.
   * @param {string} protocolA - First protocol identifier
   * @param {string} protocolB - Second protocol identifier
   * @returns {BridgeRecord}
   * @throws {Error} If either protocol is not registered or bridge already exists
   */
  createBridge(protocolA, protocolB) {
    if (!this.#protocols.has(protocolA)) {
      throw new Error(`Protocol "${protocolA}" is not registered`);
    }
    if (!this.#protocols.has(protocolB)) {
      throw new Error(`Protocol "${protocolB}" is not registered`);
    }

    const key = this.#bridgeKey(protocolA, protocolB);
    if (this.#bridges.has(key)) {
      throw new Error(`Bridge between "${protocolA}" and "${protocolB}" already exists`);
    }

    const record = {
      bridgeId: crypto.randomUUID(),
      protocolA,
      protocolB,
      translationCount: 0,
      cumulativeFidelity: 0,
      createdAt: Date.now(),
    };

    this.#bridges.set(key, record);
    return structuredClone(record);
  }

  /**
   * Returns all active translation routes (bridges and ad-hoc protocol pairs).
   * @returns {Array<{protocolA: string, protocolB: string, bridgeId: string|null, translationCount: number}>}
   */
  getActiveRoutes() {
    const routes = [];
    for (const bridge of this.#bridges.values()) {
      routes.push({
        protocolA: bridge.protocolA,
        protocolB: bridge.protocolB,
        bridgeId: bridge.bridgeId,
        translationCount: bridge.translationCount,
      });
    }
    return routes;
  }

  /**
   * Generates a canonical bridge key for two protocols regardless of order.
   * @param {string} a
   * @param {string} b
   * @returns {string}
   */
  #bridgeKey(a, b) {
    return [a, b].sort().join('<->');
  }
}

export default ProtocolAdapter;
