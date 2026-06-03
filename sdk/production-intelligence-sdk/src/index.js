/**
 * @medina/production-intelligence-sdk — Main Entry Point
 * 
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    PRODUCTION INTELLIGENCE SDK                               ║
 * ║                                                                              ║
 * ║  Enterprise-grade unified intelligence platform integrating:                 ║
 * ║  • PROTO-231: Quantum Coherence Protocol                                     ║
 * ║  • PROTO-232: Temporal Reasoning Protocol                                    ║
 * ║  • PROTO-233: Swarm Intelligence Protocol                                    ║
 * ║                                                                              ║
 * ║  Commercial-grade • Scalable Day 1 • Market-leading Architecture             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 * 
 * @module @medina/production-intelligence-sdk
 * @copyright Medina Intelligence Systems — All Rights Reserved
 * @license PROPRIETARY — Commercial Use License Required
 * @version 1.0.0
 */

// ════════════════════════════════════════════════════════════════════════════════
// CORE EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  // PHI Constants
  PHI,
  PHI_INVERSE,
  PHI_COMPLEMENT,
  PHI_SQUARED,
  PHI_CUBED,
  PHI_FOURTH,
  PHI_FIFTH,
  TWO_PI,
  PI_PHI,
  EULER,
  LN_PHI,
  PLANCK_COGNITIVE,
  TIME_SCALES,
  SWARM_CONSTANTS,
  QUANTUM_CONSTANTS,
  fibonacci,
  fibonacciN,
  phiScale,
  phiDecay,
  goldenSection,
  isGoldenRatio,
  
  // Protocol Engine Components
  Complex,
  QuantumCognitiveState,
  TemporalEvent,
  TemporalMemoryBuffer,
  SwarmParticle,
  PheromoneTrailSystem,
  ProtocolUnifiedEngine
} from './core/index.js';

// ════════════════════════════════════════════════════════════════════════════════
// ADAPTER EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  ProtocolAdapter,
  QuantumToTemporalAdapter,
  TemporalToSwarmAdapter,
  SwarmToQuantumAdapter,
  JSONAdapter,
  BinaryAdapter,
  CandidAdapter,
  EventBusAdapter,
  StreamAdapter,
  AdapterRegistry
} from './adapters/index.js';

// ════════════════════════════════════════════════════════════════════════════════
// PLATFORM EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  BasePlatformAdapter,
  ICPAdapter,
  AWSAdapter,
  AzureAdapter,
  GCPAdapter,
  EdgeAdapter,
  PlatformOrchestrator
} from './platforms/index.js';

// ════════════════════════════════════════════════════════════════════════════════
// ASSERTION EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  AssertionResult,
  assertDefined,
  assertEqual,
  assertInRange,
  assertProbability,
  assertLength,
  assertProbabilityDistribution,
  assertQuantumNormalized,
  assertCoherenceLevel,
  assertEntangled,
  assertValidMeasurement,
  assertTemporalOrder,
  assertCausalLink,
  assertBufferIntegrity,
  assertParticleInBounds,
  assertSwarmConvergence,
  assertPheromoneLevels,
  assertPhiRatio,
  assertPhiScaled,
  IntelligenceAssertionSuite,
  validateProductionReadiness
} from './assertions/index.js';

// ════════════════════════════════════════════════════════════════════════════════
// ENTERPRISE EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  DEPLOYMENT_TIERS,
  REGIONS,
  DeploymentManifest,
  MultiRegionOrchestrator
} from './enterprise/index.js';

// ════════════════════════════════════════════════════════════════════════════════
// SDK FACTORY
// ════════════════════════════════════════════════════════════════════════════════

import { ProtocolUnifiedEngine } from './core/index.js';
import { AdapterRegistry, QuantumToTemporalAdapter, TemporalToSwarmAdapter, SwarmToQuantumAdapter, EventBusAdapter } from './adapters/index.js';
import { PlatformOrchestrator, ICPAdapter, AWSAdapter, AzureAdapter, GCPAdapter, EdgeAdapter } from './platforms/index.js';
import { IntelligenceAssertionSuite, validateProductionReadiness } from './assertions/index.js';
import { DeploymentManifest, MultiRegionOrchestrator, DEPLOYMENT_TIERS } from './enterprise/index.js';
import { PHI, PHI_INVERSE } from './core/phi-constants.js';

/**
 * ProductionIntelligenceSDK — Complete unified SDK factory
 */
export class ProductionIntelligenceSDK {
  constructor(config = {}) {
    this.sdkId = `sdk_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.version = '1.0.0';
    this.config = {
      tier: config.tier || 'PRODUCTION',
      regions: config.regions || ['us-east-1'],
      protocols: config.protocols || ['PROTO-231', 'PROTO-232', 'PROTO-233'],
      enableQuantum: config.enableQuantum !== false,
      enableTemporal: config.enableTemporal !== false,
      enableSwarm: config.enableSwarm !== false,
      ...config
    };

    // Initialize core engine
    this.engine = new ProtocolUnifiedEngine(this.config);

    // Initialize adapter registry
    this.adapters = new AdapterRegistry();
    this._initializeAdapters();

    // Initialize platform orchestrator
    this.platforms = new PlatformOrchestrator();
    this._initializePlatforms();

    // Initialize assertion suite
    this.assertions = new IntelligenceAssertionSuite('ProductionSDK');

    // Initialize event bus
    this.events = new EventBusAdapter();

    // Initialize deployment
    this.deployment = new MultiRegionOrchestrator({
      primaryRegion: this.config.regions[0],
      failoverRegions: this.config.regions.slice(1)
    });

    // SDK metrics
    this.metrics = {
      initialized: Date.now(),
      operations: 0,
      decisions: 0,
      deployments: 0
    };
  }

  _initializeAdapters() {
    this.adapters
      .register('quantum-to-temporal', new QuantumToTemporalAdapter())
      .register('temporal-to-swarm', new TemporalToSwarmAdapter())
      .register('swarm-to-quantum', new SwarmToQuantumAdapter())
      .createChain('full-cycle', ['quantum-to-temporal', 'temporal-to-swarm', 'swarm-to-quantum']);
  }

  _initializePlatforms() {
    this.platforms
      .registerAdapter('icp', new ICPAdapter({ network: this.config.icpNetwork || 'ic' }))
      .registerAdapter('aws', new AWSAdapter({ region: this.config.regions[0] }))
      .registerAdapter('azure', new AzureAdapter())
      .registerAdapter('gcp', new GCPAdapter())
      .registerAdapter('edge', new EdgeAdapter());
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUICK START METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Quick unified decision — single method for complete intelligence decision
   */
  async decide(options, context = {}) {
    this.metrics.operations++;
    this.metrics.decisions++;
    
    const result = this.engine.unifiedDecision(options, context);
    
    this.events.emit('decision', {
      decisionId: result.decisionId,
      selectedIndex: result.selectedIndex,
      confidence: result.confidence
    });

    return result;
  }

  /**
   * Quick optimization — single method for swarm optimization
   */
  async optimize(dimensions, bounds, fitnessFunction, iterations = 100) {
    this.metrics.operations++;
    
    this.engine.initializeSwarm(dimensions, bounds);
    const result = this.engine.optimizeWithSwarm(fitnessFunction, iterations);
    
    this.events.emit('optimization', {
      fitness: result.fitness,
      iterations: result.iterations,
      converged: result.converged
    });

    return result;
  }

  /**
   * Quick event recording — single method for temporal event capture
   */
  record(data) {
    this.metrics.operations++;
    return this.engine.recordEvent(data);
  }

  /**
   * Quick quantum measurement — single method for quantum decision
   */
  measure(stateId, options = null) {
    this.metrics.operations++;
    
    if (options) {
      this.engine.prepareSuperposition(stateId, options);
    }
    
    return this.engine.measureQuantumState(stateId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DEPLOYMENT METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create deployment manifest for production
   */
  createManifest(name, tierName = this.config.tier) {
    return this.deployment.createManifest(
      name,
      tierName,
      this.config.regions
    );
  }

  /**
   * Deploy globally across configured regions
   */
  async deployGlobal(manifestId, dryRun = false) {
    this.metrics.deployments++;
    const result = await this.deployment.deployGlobal(manifestId, dryRun);
    
    this.events.emit('deployment', {
      deploymentId: result.deploymentId,
      regions: Object.keys(result.regions),
      dryRun
    });

    return result;
  }

  /**
   * Connect all platforms
   */
  async connectPlatforms() {
    return this.platforms.connectAll();
  }

  /**
   * Deploy to specific platform
   */
  async deployToPlatform(platformName, artifact) {
    const adapter = this.platforms.getAdapter(platformName);
    if (!adapter) throw new Error(`Platform ${platformName} not found`);
    
    if (!adapter.connected) {
      await adapter.connect();
    }
    
    return adapter.deploy(artifact);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VALIDATION METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Validate production readiness
   */
  validate() {
    return validateProductionReadiness(this.engine);
  }

  /**
   * Run custom assertion suite
   */
  runAssertions(assertions) {
    return this.assertions.runAll(assertions);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // METRICS & STATE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get comprehensive SDK metrics
   */
  getMetrics() {
    return {
      sdkId: this.sdkId,
      version: this.version,
      config: this.config,
      uptime: Date.now() - this.metrics.initialized,
      ...this.metrics,
      engine: this.engine.getMetrics(),
      platforms: this.platforms.getMetricsAll(),
      adapters: this.adapters.listAdapters()
    };
  }

  /**
   * Export SDK state for persistence
   */
  exportState() {
    return {
      sdkId: this.sdkId,
      version: this.version,
      config: this.config,
      metrics: this.getMetrics(),
      engineState: this.engine.exportState()
    };
  }

  /**
   * Reset SDK state
   */
  reset() {
    this.engine.reset();
    this.assertions.reset();
    this.metrics = {
      initialized: Date.now(),
      operations: 0,
      decisions: 0,
      deployments: 0
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Create a new Production Intelligence SDK instance
 * @param {Object} config - SDK configuration
 * @returns {ProductionIntelligenceSDK} SDK instance
 */
export function createSDK(config = {}) {
  return new ProductionIntelligenceSDK(config);
}

/**
 * Create a development SDK instance (simplified configuration)
 */
export function createDevSDK() {
  return new ProductionIntelligenceSDK({
    tier: 'DEVELOPMENT',
    regions: ['local'],
    icpNetwork: 'local'
  });
}

/**
 * Create an enterprise SDK instance (full configuration)
 */
export function createEnterpriseSDK(config = {}) {
  return new ProductionIntelligenceSDK({
    tier: 'ENTERPRISE',
    regions: ['us-east-1', 'eu-west-1', 'ap-northeast-1'],
    ...config
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ════════════════════════════════════════════════════════════════════════════════

export default ProductionIntelligenceSDK;

// ════════════════════════════════════════════════════════════════════════════════
// SDK METADATA
// ════════════════════════════════════════════════════════════════════════════════

export const SDK_METADATA = Object.freeze({
  name: '@medina/production-intelligence-sdk',
  version: '1.0.0',
  protocols: ['PROTO-231', 'PROTO-232', 'PROTO-233'],
  platforms: ['icp', 'aws', 'azure', 'gcp', 'edge'],
  phi: PHI,
  phiInverse: PHI_INVERSE,
  license: 'PROPRIETARY',
  copyright: 'Medina Intelligence Systems',
  commercial: true,
  scalable: true,
  enterpriseReady: true
});
