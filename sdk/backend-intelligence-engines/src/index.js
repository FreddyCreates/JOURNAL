/**
 * @medina/backend-intelligence-engines — v1.0.0
 *
 * Backend AI engines with Latin nomenclature — 20 sovereign AI engines,
 * 10 alpha protocols with governance laws, and the Alpha Tier Engine
 * implementing PROTO-227 through PROTO-233 (the phi-encoded learning loop).
 *
 * PROTO-227: Emergence Cascade Protocol (ACC - conflict monitoring)
 * PROTO-228: Alpha Resonance Protocol (Thalamocortical binding - Kuramoto oscillators)
 * PROTO-229: Alpha Signal Protocol (dlPFC - priority gating)
 * PROTO-230: Alpha Reward Protocol (VTA → NAc - dopamine loop)
 * PROTO-231: Quantum Coherence Protocol (Microtubule quantum effects)
 * PROTO-232: Temporal Reasoning Protocol (Hippocampal time cells)
 * PROTO-233: Swarm Intelligence Protocol (Distributed neural populations)
 *
 * @module @medina/backend-intelligence-engines
 */

export { LatinEngineRegistry, LATIN_BACKEND_ENGINES } from './latin-engine-registry.js';
export { AlphaProtocolLaws, ALPHA_PROTOCOLS } from './alpha-protocol-laws.js';
export {
  PHI,
  PHI_INVERSE,
  PHI_SQUARED,
  PHI_COMPLEMENT,
  TWO_PI,
  NeurochemistryEngine,
  MiniBrain,
  EmergenceCascadeProtocol,
  AlphaResonanceProtocol,
  AlphaSignalProtocol,
  AlphaRewardProtocol,
  AlphaTierEngine
} from './alpha-tier-engine.js';

// PROTO-231: Quantum Coherence Protocol
export {
  Complex,
  QuantumCognitiveState,
  QuantumCoherenceProtocol,
  PLANCK_COGNITIVE
} from './quantum-coherence-protocol.js';

// PROTO-232: Temporal Reasoning Protocol
export {
  TemporalEvent,
  TemporalMemoryBuffer,
  CausalInferenceEngine,
  TemporalReasoningProtocol,
  TIME_SCALES
} from './temporal-reasoning-protocol.js';

// PROTO-233: Swarm Intelligence Protocol
export {
  SwarmParticle,
  PheromoneTrailSystem,
  SwarmConsensus,
  SwarmIntelligenceProtocol,
  SWARM_CONSTANTS
} from './swarm-intelligence-protocol.js';
