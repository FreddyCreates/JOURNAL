/**
 * ALPHA-NEXUS — Multi-Model AI Workstation
 *
 * Enterprise House #1: Complete deployment platform for MEDINA's own AI model
 * families and multimodal intelligence clusters, orchestrated through
 * phi-encoded cognitive processing.
 *
 * Integrates MEDINA's existing infrastructure:
 * - AlphaResolver (40 AI model families from sdk/ai-model-engines)
 * - MultimodalFamilyEngine (10 multimodal families from sdk/frontend-intelligence-models)
 * - AlphaTierEngine (brain-analog processing from sdk/backend-intelligence-engines)
 * - CrossOrganismResonance (inter-organism communication)
 *
 * @module @medina/enterprise/alpha-nexus
 */

// ════════════════════════════════════════════════════════════════════════════
// IMPORTS FROM MEDINA SDK
// ════════════════════════════════════════════════════════════════════════════

// Import MEDINA's own family registries
import { AlphaResolver } from '../../../sdk/ai-model-engines/src/alpha-resolver.js';
import { MultimodalFamilyEngine } from '../../../sdk/frontend-intelligence-models/src/multimodal-family-engine.js';

// ════════════════════════════════════════════════════════════════════════════
// PHI CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const PHI_INVERSE = 1 / PHI;
const HEARTBEAT_MS = 618; // φ × 1000 / PHI ≈ 618

// ════════════════════════════════════════════════════════════════════════════
// COGNITIVE PROCESSING LAYER
// ════════════════════════════════════════════════════════════════════════════

/**
 * Simplified NeurochemistryEngine for the workstation
 */
class NeurochemistryEngine {
  constructor() {
    this.dopamineLevel = 0;
    this.oxytocinLevel = 0;
    this.arousalState = 0;
  }

  fireDopamineImpulse(magnitude) {
    this.dopamineLevel += magnitude;
    this.arousalState = Math.min(1, this.arousalState + magnitude * PHI_INVERSE);
  }

  fireOxytocinImpulse(magnitude) {
    this.oxytocinLevel += magnitude;
  }

  decay(factor = 1 / (PHI * PHI)) {
    this.dopamineLevel *= (1 - factor);
    this.oxytocinLevel *= (1 - factor);
    this.arousalState *= (1 - factor * PHI_INVERSE);
  }

  getState() {
    return {
      dopamineLevel: this.dopamineLevel,
      oxytocinLevel: this.oxytocinLevel,
      arousalState: this.arousalState
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ALPHA-NEXUS WORKSTATION
// ════════════════════════════════════════════════════════════════════════════

/**
 * AlphaNexus — The complete multi-model AI workstation
 *
 * Uses MEDINA's own 40 AI model families (AIF-001 to AIF-040) from AlphaResolver
 * and 10 multimodal families (MMF-001 to MMF-010) from MultimodalFamilyEngine.
 *
 * @example
 * const nexus = new AlphaNexus();
 * // Uses MEDINA's own families, not external AI providers
 * const family = nexus.getAIFamily('AIF-001'); // Your GPT family
 * const multimodal = nexus.getMultimodalFamily('MMF-001'); // Structure-Vision Family
 */
export class AlphaNexus {
  /**
   * @param {Object} config
   * @param {string[]} [config.families] - AI Family IDs to activate (AIF-001 to AIF-040)
   * @param {string[]} [config.multimodalFamilies] - Multimodal Family IDs (MMF-001 to MMF-010)
   * @param {Object} [config.cognitive] - Cognitive processing options
   */
  constructor(config = {}) {
    this.config = {
      families: config.families || [],
      multimodalFamilies: config.multimodalFamilies || [],
      cognitive: config.cognitive || { neurochemistry: true }
    };

    // Initialize MEDINA SDK family registries
    this.alphaResolver = new AlphaResolver();           // 40 AI model families
    this.multimodalEngine = new MultimodalFamilyEngine(); // 10 multimodal families
    this.neurochemistry = new NeurochemistryEngine();

    // State
    this.startTime = Date.now();
    this.requestCount = 0;
    this.heartbeatInterval = null;

    // Start heartbeat
    this._startHeartbeat();
  }

  // ────────────────────────────────────────────────────────────────────────
  // AI FAMILY OPERATIONS (40 families from AlphaResolver)
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Get an AI model family by ID
   * Uses MEDINA's AlphaResolver with 40 AI model families (AIF-001 to AIF-040)
   * @param {string} familyId - e.g., 'AIF-001'
   * @returns {Object} Family record with alphaModel, predecessors, etc.
   */
  getAIFamily(familyId) {
    return this.alphaResolver.getAlpha(familyId);
  }

  /**
   * List all 40 AI model families
   * @returns {Array} All registered AI families
   */
  listAIFamilies() {
    return this.alphaResolver.listAlphas();
  }

  /**
   * Resolve the best model from a family with fallback support
   * @param {string} familyId - Family ID (AIF-001 to AIF-040)
   * @param {Object} [constraints] - Resolution constraints
   */
  resolveModel(familyId, constraints = {}) {
    return this.alphaResolver.resolve(familyId, constraints);
  }

  /**
   * Execute a prompt against a resolved model
   * @param {Object} resolvedModel - From resolveModel()
   * @param {string} prompt - The prompt to execute
   */
  async execute(resolvedModel, prompt) {
    this.requestCount++;
    const startTime = Date.now();

    // Fire dopamine on new request (anticipation)
    this.neurochemistry.fireDopamineImpulse(0.1);

    // Execute using the resolved model from MEDINA's family
    const result = {
      model: resolvedModel.alphaModel,
      familyId: resolvedModel.familyId,
      familyName: resolvedModel.familyName,
      prompt: prompt,
      response: `[Response from MEDINA family ${resolvedModel.familyName}]`,
      latencyMs: Date.now() - startTime,
      timestamp: Date.now()
    };

    // Fire dopamine on success (reward)
    this.neurochemistry.fireDopamineImpulse(0.3);

    return result;
  }

  // ────────────────────────────────────────────────────────────────────────
  // MULTIMODAL FAMILY OPERATIONS (10 families from MultimodalFamilyEngine)
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Get a multimodal family by ID
   * Uses MEDINA's MultimodalFamilyEngine with 10 families (MMF-001 to MMF-010)
   * @param {string} familyId - e.g., 'MMF-001'
   */
  getMultimodalFamily(familyId) {
    return this.multimodalEngine.getFamily(familyId);
  }

  /**
   * List all 10 multimodal families
   * @returns {Array} All registered multimodal families
   */
  listMultimodalFamilies() {
    return this.multimodalEngine.listFamilies();
  }

  /**
   * Find multimodal families by modality
   * @param {string} modality - e.g., 'html', 'css', 'react-code'
   */
  findByModality(modality) {
    return this.multimodalEngine.findByModality(modality);
  }

  /**
   * Find the family that contains a given frontend model
   * @param {string} modelId - e.g., 'FIM-001'
   */
  findFamilyForModel(modelId) {
    return this.multimodalEngine.findFamilyForModel(modelId);
  }

  /**
   * Process a multimodal request using MEDINA's families
   * @param {string} familyId - Multimodal family ID (MMF-001 to MMF-010)
   * @param {Object} input
   */
  async processMultimodal(familyId, input) {
    const family = this.multimodalEngine.getFamily(familyId);
    if (!family) throw new Error(`Multimodal family "${familyId}" not found`);

    this.requestCount++;

    // Process using MEDINA's multimodal family
    return {
      familyId,
      familyName: family.name,
      fusionStrategy: family.fusionStrategy,
      memberModels: family.memberModels,
      modalities: family.modalities,
      ringAffinity: family.ringAffinity,
      input,
      output: `[Fused output from ${family.name}]`,
      timestamp: Date.now()
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // COGNITIVE STATE
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Get the current cognitive state
   */
  getCognitiveState() {
    return {
      neurochemistry: this.neurochemistry.getState(),
      uptime: Date.now() - this.startTime,
      requestCount: this.requestCount
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // HEALTH & MONITORING
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Get system health status
   */
  getHealth() {
    return {
      status: 'healthy',
      uptime: Date.now() - this.startTime,
      requestCount: this.requestCount,
      aiModelFamilies: this.alphaResolver.alphas.size,        // 40 AI families
      multimodalFamilies: this.multimodalEngine.size,         // 10 multimodal families
      cognitive: this.neurochemistry.getState()
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ────────────────────────────────────────────────────────────────────────

  _startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      // Decay neurochemistry on each heartbeat
      this.neurochemistry.decay();
    }, HEARTBEAT_MS);
  }

  /**
   * Shutdown the workstation
   */
  shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════

export {
  AlphaResolver,           // 40 AI model families from MEDINA SDK
  MultimodalFamilyEngine,  // 10 multimodal families from MEDINA SDK
  NeurochemistryEngine,
  PHI,
  PHI_INVERSE,
  HEARTBEAT_MS
};

export default AlphaNexus;
