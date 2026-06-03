import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {Object} ModelCapabilities
 * @property {boolean} [textGeneration=false]
 * @property {boolean} [imageGeneration=false]
 * @property {boolean} [embedding=false]
 * @property {boolean} [classification=false]
 * @property {boolean} [summarization=false]
 * @property {boolean} [translation=false]
 * @property {number} [maxTokens=4096]
 * @property {number} [latencyMs=100]
 */

/**
 * @typedef {Object} InterfaceMap
 * @property {function(Object): Object} requestTransform - Maps standard request to model-specific format
 * @property {function(Object): Object} responseTransform - Maps model-specific response to standard format
 * @property {function(Object): Object} [invoke] - Optional direct invocation handler
 */

/**
 * @typedef {Object} ModelEntry
 * @property {string} modelId
 * @property {ModelCapabilities} capabilities
 * @property {InterfaceMap} interfaceMap
 * @property {number} invocationCount
 * @property {number} cumulativeLatency
 * @property {number} registeredAt
 */

/**
 * @typedef {Object} InvocationResult
 * @property {Object} data - Standardized response payload
 * @property {string} modelId
 * @property {number} latencyMs
 * @property {number} normalizationScore - How well the interface mapped (phi-weighted)
 * @property {string} invocationId
 */

/**
 * @typedef {Object} NormalizationReport
 * @property {number} totalModels
 * @property {number} totalInvocations
 * @property {number} averageLatencyMs
 * @property {number} averageNormalizationScore
 * @property {number} phiQualityIndex
 * @property {Array<{modelId: string, invocations: number, avgLatency: number}>} perModel
 */

/**
 * ModelAdapter — adapts heterogeneous AI model interfaces to a unified
 * organism interface. Registers models with capability declarations and
 * interface mappings, invokes them through a standardized request format,
 * and finds optimal models for requirements using phi-weighted scoring.
 */
export class ModelAdapter {
  /** @type {Map<string, ModelEntry>} */
  #models;

  constructor() {
    this.#models = new Map();
  }

  /**
   * Registers an AI model with its capabilities and interface mapping.
   * @param {string} modelId - Unique model identifier
   * @param {ModelCapabilities} capabilities - Declared model capabilities
   * @param {InterfaceMap} interfaceMap - Request/response transformation functions
   * @throws {Error} If modelId is already registered or arguments are invalid
   */
  registerModel(modelId, capabilities, interfaceMap) {
    if (typeof modelId !== 'string' || modelId.length === 0) {
      throw new Error('modelId must be a non-empty string');
    }
    if (this.#models.has(modelId)) {
      throw new Error(`Model "${modelId}" is already registered`);
    }
    if (!interfaceMap || typeof interfaceMap.requestTransform !== 'function') {
      throw new TypeError('interfaceMap.requestTransform must be a function');
    }
    if (typeof interfaceMap.responseTransform !== 'function') {
      throw new TypeError('interfaceMap.responseTransform must be a function');
    }

    this.#models.set(modelId, {
      modelId,
      capabilities: { ...capabilities },
      interfaceMap,
      invocationCount: 0,
      cumulativeLatency: 0,
      registeredAt: Date.now(),
    });
  }

  /**
   * Invokes a registered model using the standardized request interface.
   * Transforms the request to model-specific format, invokes the model,
   * then transforms the response back to the standard format.
   * @param {string} modelId - Model to invoke
   * @param {Object} standardRequest - Standardized request payload
   * @returns {InvocationResult}
   * @throws {Error} If model is not registered
   */
  invoke(modelId, standardRequest) {
    const model = this.#models.get(modelId);
    if (!model) {
      throw new Error(`Model "${modelId}" is not registered. Available: ${[...this.#models.keys()].join(', ')}`);
    }

    const startTime = performance.now();
    const modelRequest = model.interfaceMap.requestTransform(standardRequest);

    let modelResponse;
    if (typeof model.interfaceMap.invoke === 'function') {
      modelResponse = model.interfaceMap.invoke(modelRequest);
    } else {
      modelResponse = modelRequest;
    }

    const standardResponse = model.interfaceMap.responseTransform(modelResponse);
    const latencyMs = performance.now() - startTime;

    const requestKeys = Object.keys(standardRequest).length;
    const responseKeys = Object.keys(standardResponse).length;
    const keyBalance = requestKeys > 0
      ? Math.min(responseKeys, requestKeys) / Math.max(responseKeys, requestKeys)
      : 0;
    const normalizationScore = keyBalance * (PHI / (PHI + (1 - keyBalance)));

    model.invocationCount++;
    model.cumulativeLatency += latencyMs;

    return {
      data: standardResponse,
      modelId,
      latencyMs,
      normalizationScore,
      invocationId: crypto.randomUUID(),
    };
  }

  /**
   * Returns a capability matrix for all registered models.
   * @returns {Array<{modelId: string, capabilities: ModelCapabilities}>}
   */
  getCapabilityMatrix() {
    const matrix = [];
    for (const model of this.#models.values()) {
      matrix.push({
        modelId: model.modelId,
        capabilities: { ...model.capabilities },
      });
    }
    return matrix;
  }

  /**
   * Finds the best model for a given requirement using phi-weighted scoring.
   * Scores each model on capability match, latency, and invocation history.
   * @param {Object} requirement - Required capabilities (e.g., {textGeneration: true, maxTokens: 8192})
   * @returns {{modelId: string, score: number, capabilities: ModelCapabilities} | null}
   */
  findBestAdapter(requirement) {
    if (this.#models.size === 0) return null;

    let bestModel = null;
    let bestScore = -1;

    for (const model of this.#models.values()) {
      let matchCount = 0;
      let totalRequired = 0;

      for (const [key, value] of Object.entries(requirement)) {
        totalRequired++;
        if (typeof value === 'boolean' && model.capabilities[key] === value) {
          matchCount++;
        } else if (typeof value === 'number') {
          const cap = model.capabilities[key] ?? 0;
          if (cap >= value) matchCount++;
        }
      }

      const capabilityRatio = totalRequired > 0 ? matchCount / totalRequired : 0;
      const avgLatency = model.invocationCount > 0
        ? model.cumulativeLatency / model.invocationCount
        : model.capabilities.latencyMs ?? 100;
      const latencyFactor = 1 / (1 + avgLatency / 1000);

      const rawScore = (capabilityRatio * PHI + latencyFactor) / (PHI + 1);
      const phiScore = rawScore * (PHI / (PHI + (1 - rawScore)));

      if (phiScore > bestScore) {
        bestScore = phiScore;
        bestModel = model;
      }
    }

    if (!bestModel) return null;

    return {
      modelId: bestModel.modelId,
      score: bestScore,
      capabilities: { ...bestModel.capabilities },
    };
  }

  /**
   * Returns a normalization quality report across all registered models.
   * @returns {NormalizationReport}
   */
  getNormalizationReport() {
    const perModel = [];
    let totalInvocations = 0;
    let totalLatency = 0;

    for (const model of this.#models.values()) {
      totalInvocations += model.invocationCount;
      totalLatency += model.cumulativeLatency;
      perModel.push({
        modelId: model.modelId,
        invocations: model.invocationCount,
        avgLatency: model.invocationCount > 0
          ? model.cumulativeLatency / model.invocationCount
          : 0,
      });
    }

    const averageLatencyMs = totalInvocations > 0 ? totalLatency / totalInvocations : 0;
    const speedFactor = 1 / (1 + averageLatencyMs / 1000);
    const coverageFactor = Math.min(1, this.#models.size / 10);
    const phiQualityIndex = ((speedFactor * PHI + coverageFactor) / (PHI + 1)) * (PHI / (PHI + 1));

    return {
      totalModels: this.#models.size,
      totalInvocations,
      averageLatencyMs,
      averageNormalizationScore: speedFactor,
      phiQualityIndex,
      perModel,
    };
  }
}

export default ModelAdapter;
